import { describe, expect, it } from 'vitest';
import { classifyPeriods, computePeakDensity, formatTimelineDuration } from './event-timeline';

const HOUR = 60 * 60 * 1000;
const MIN = 60 * 1000;

function makeItem(timestamp: number) {
  return { timestamp };
}

function makeItems(timestamps: number[]) {
  return timestamps.map(makeItem);
}

describe('classifyPeriods', () => {
  it('returns empty array for empty input', () => {
    expect(classifyPeriods([])).toEqual([]);
  });

  it('returns single normal period for one item', () => {
    const items = makeItems([1000]);
    const result = classifyPeriods(items);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('normal');
  });

  it('classifies closely spaced items as normal', () => {
    const base = Date.now();
    const items = makeItems([base, base + 10 * MIN, base + 20 * MIN]);
    const result = classifyPeriods(items);
    expect(result.every((p) => p.type === 'normal')).toBe(true);
    expect(result).toHaveLength(3);
  });

  it('detects quiet gaps between events', () => {
    const base = Date.now();
    const items = makeItems([base, base + 5 * HOUR]);
    const result = classifyPeriods(items);

    expect(result).toHaveLength(3); // normal, quiet, normal
    expect(result[0].type).toBe('normal');
    expect(result[1].type).toBe('quiet');
    expect(result[2].type).toBe('normal');
  });

  it('quiet period has correct start and end', () => {
    const base = Date.now();
    const items = makeItems([base, base + 5 * HOUR]);
    const result = classifyPeriods(items);

    const quiet = result[1];
    if (quiet.type !== 'quiet') throw new Error('Expected quiet');
    expect(quiet.start).toBe(base);
    expect(quiet.end).toBe(base + 5 * HOUR);
  });

  it('detects busy clusters', () => {
    const base = Date.now();
    // 6 events in 10 minutes = busy cluster
    const items = makeItems([
      base,
      base + 2 * MIN,
      base + 4 * MIN,
      base + 6 * MIN,
      base + 8 * MIN,
      base + 10 * MIN,
    ]);
    const result = classifyPeriods(items, 2 * HOUR, 5);

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('busy');
    if (result[0].type !== 'busy') throw new Error('Expected busy');
    expect(result[0].items).toHaveLength(6);
  });

  it('respects custom quiet threshold', () => {
    const base = Date.now();
    const items = makeItems([base, base + 90 * MIN]); // 1.5h gap

    // Default 2h threshold → no quiet
    const defaultResult = classifyPeriods(items, 2 * HOUR);
    expect(defaultResult.every((p) => p.type === 'normal')).toBe(true);

    // Custom 1h threshold → quiet gap
    const customResult = classifyPeriods(items, 1 * HOUR);
    expect(customResult.some((p) => p.type === 'quiet')).toBe(true);
  });

  it('respects custom busy threshold', () => {
    const base = Date.now();
    const items = makeItems([
      base,
      base + 2 * MIN,
      base + 4 * MIN,
    ]);

    // Default threshold of 5 → all normal
    const defaultResult = classifyPeriods(items, 2 * HOUR, 5);
    expect(defaultResult.every((p) => p.type === 'normal')).toBe(true);

    // Custom threshold of 3 → busy
    const customResult = classifyPeriods(items, 2 * HOUR, 3);
    expect(customResult.some((p) => p.type === 'busy')).toBe(true);
  });

  it('handles mixed quiet and busy periods', () => {
    const base = Date.now();
    const items = makeItems([
      // Normal event
      base,
      // 4h quiet gap
      // Busy cluster
      base + 4 * HOUR,
      base + 4 * HOUR + 2 * MIN,
      base + 4 * HOUR + 4 * MIN,
      base + 4 * HOUR + 6 * MIN,
      base + 4 * HOUR + 8 * MIN,
    ]);
    const result = classifyPeriods(items, 2 * HOUR, 5);

    expect(result[0].type).toBe('normal'); // first event
    expect(result[1].type).toBe('quiet');  // 4h gap
    expect(result[2].type).toBe('busy');   // 5 events in 8 min
  });

  it('merges overlapping busy ranges', () => {
    const base = Date.now();
    // Two overlapping windows of 5+ events
    const items = makeItems([
      base,
      base + 1 * MIN,
      base + 2 * MIN,
      base + 3 * MIN,
      base + 4 * MIN,
      base + 5 * MIN,
      base + 6 * MIN,
      base + 7 * MIN,
      base + 8 * MIN,
      base + 9 * MIN,
    ]);
    const result = classifyPeriods(items, 2 * HOUR, 5);

    // Should be a single busy period, not multiple
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('busy');
    if (result[0].type !== 'busy') throw new Error('Expected busy');
    expect(result[0].items).toHaveLength(10);
  });

  it('handles all events in quiet (only 2 events far apart)', () => {
    const base = Date.now();
    const items = makeItems([base, base + 24 * HOUR]);
    const result = classifyPeriods(items);

    const types = result.map((p) => p.type);
    expect(types).toContain('quiet');
    expect(types.filter((t) => t === 'normal')).toHaveLength(2);
  });

  it('boundary: exactly at quiet threshold is not quiet', () => {
    const base = Date.now();
    const items = makeItems([base, base + 2 * HOUR]); // exactly 2h
    const result = classifyPeriods(items, 2 * HOUR);
    // Gap must be > threshold, not >=
    expect(result.every((p) => p.type === 'normal')).toBe(true);
  });

  it('busy periods include peakDensity', () => {
    const base = Date.now();
    const items = makeItems([
      base,
      base + 1 * MIN,
      base + 2 * MIN,
      base + 3 * MIN,
      base + 4 * MIN,
      // Gap of 20 min then more
      base + 25 * MIN,
      base + 26 * MIN,
    ]);
    const result = classifyPeriods(items, 2 * HOUR, 5);
    const busy = result.find((p) => p.type === 'busy');
    expect(busy).toBeTruthy();
    if (busy?.type === 'busy') {
      expect(busy.peakDensity).toBeGreaterThan(0);
    }
  });

  it('quiet periods include hiddenCount field', () => {
    const base = Date.now();
    const items = makeItems([base, base + 5 * HOUR]);
    const result = classifyPeriods(items);
    const quiet = result.find((p) => p.type === 'quiet');
    expect(quiet).toBeTruthy();
    if (quiet?.type === 'quiet') {
      expect(quiet.hiddenCount).toBe(0);
    }
  });
});

describe('computePeakDensity', () => {
  it('returns 0 for empty input', () => {
    expect(computePeakDensity([])).toBe(0);
  });

  it('returns 1 for single item', () => {
    expect(computePeakDensity([makeItem(1000)])).toBe(1);
  });

  it('counts items in a 5-minute window', () => {
    const base = Date.now();
    const items = makeItems([
      base,
      base + 1 * MIN,
      base + 2 * MIN,
      base + 3 * MIN,
      base + 4 * MIN,
    ]);
    expect(computePeakDensity(items)).toBe(5);
  });

  it('finds peak across multiple windows', () => {
    const base = Date.now();
    const items = makeItems([
      // Sparse start: 2 events in first 5 min
      base,
      base + 4 * MIN,
      // Dense window: 4 events in 3 min
      base + 10 * MIN,
      base + 11 * MIN,
      base + 12 * MIN,
      base + 13 * MIN,
    ]);
    expect(computePeakDensity(items)).toBe(4);
  });
});

describe('formatTimelineDuration', () => {
  it('formats seconds', () => {
    expect(formatTimelineDuration(5000)).toBe('5s');
    expect(formatTimelineDuration(59000)).toBe('59s');
  });

  it('formats minutes', () => {
    expect(formatTimelineDuration(60000)).toBe('1m');
    expect(formatTimelineDuration(30 * 60 * 1000)).toBe('30m');
  });

  it('formats hours', () => {
    expect(formatTimelineDuration(2 * HOUR)).toBe('2h');
    expect(formatTimelineDuration(23 * HOUR)).toBe('23h');
  });

  it('formats days', () => {
    expect(formatTimelineDuration(24 * HOUR)).toBe('1d');
    expect(formatTimelineDuration(72 * HOUR)).toBe('3d');
  });

  it('formats zero', () => {
    expect(formatTimelineDuration(0)).toBe('0s');
  });
});
