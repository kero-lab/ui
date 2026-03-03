import { describe, expect, it } from 'vitest';
import {
  computeSparklinePoints,
  pointsToPolyline,
  pointsToGradientPath,
} from './sparkline';

describe('computeSparklinePoints', () => {
  it('returns empty array for empty data', () => {
    expect(computeSparklinePoints([], 100, 32)).toEqual([]);
  });

  it('returns empty array for single data point', () => {
    expect(computeSparklinePoints([5], 100, 32)).toEqual([]);
  });

  it('returns correct number of points', () => {
    const points = computeSparklinePoints([1, 2, 3], 100, 32);
    expect(points).toHaveLength(3);
  });

  it('maps x across the width', () => {
    const points = computeSparklinePoints([0, 10], 100, 32, 2);
    expect(points[0].x).toBe(2); // left padding
    expect(points[1].x).toBe(98); // width - padding
  });

  it('maps highest value to top (lowest y)', () => {
    const points = computeSparklinePoints([0, 10, 5], 100, 32, 2);
    const minY = Math.min(...points.map((p) => p.y));
    const maxVal = points.find((p) => p.value === 10)!;
    expect(maxVal.y).toBe(minY);
  });

  it('maps lowest value to bottom (highest y)', () => {
    const points = computeSparklinePoints([0, 10, 5], 100, 32, 2);
    const maxY = Math.max(...points.map((p) => p.y));
    const minVal = points.find((p) => p.value === 0)!;
    expect(minVal.y).toBe(maxY);
  });

  it('handles flat data without division by zero', () => {
    const points = computeSparklinePoints([5, 5, 5], 100, 32, 2);
    expect(points).toHaveLength(3);
    // All y values should be equal (midpoint)
    expect(points[0].y).toBe(points[1].y);
    expect(points[1].y).toBe(points[2].y);
  });

  it('handles negative values', () => {
    const points = computeSparklinePoints([-10, -5, 0, 5], 100, 32);
    expect(points).toHaveLength(4);
    // -10 should be at bottom, 5 at top
    expect(points[0].y).toBeGreaterThan(points[3].y);
  });

  it('preserves original values and indices', () => {
    const data = [3, 7, 1];
    const points = computeSparklinePoints(data, 100, 32);
    expect(points[0].value).toBe(3);
    expect(points[1].value).toBe(7);
    expect(points[2].value).toBe(1);
    expect(points[0].index).toBe(0);
    expect(points[1].index).toBe(1);
    expect(points[2].index).toBe(2);
  });

  it('respects custom padding', () => {
    const points = computeSparklinePoints([0, 10], 100, 32, 10);
    expect(points[0].x).toBe(10);
    expect(points[1].x).toBe(90);
  });
});

describe('pointsToPolyline', () => {
  it('formats points as space-separated coordinate pairs', () => {
    const points = [
      { x: 2, y: 30, value: 0, index: 0 },
      { x: 98, y: 2, value: 10, index: 1 },
    ];
    expect(pointsToPolyline(points)).toBe('2.0,30.0 98.0,2.0');
  });

  it('returns empty string for no points', () => {
    expect(pointsToPolyline([])).toBe('');
  });
});

describe('pointsToGradientPath', () => {
  it('returns empty string for no points', () => {
    expect(pointsToGradientPath([], 100, 32)).toBe('');
  });

  it('creates closed SVG path with bottom-right and bottom-left corners', () => {
    const points = [
      { x: 2, y: 30, value: 0, index: 0 },
      { x: 98, y: 2, value: 10, index: 1 },
    ];
    const path = pointsToGradientPath(points, 100, 32);
    expect(path).toContain('M2.0,30.0');
    expect(path).toContain('L98.0,2.0');
    expect(path).toContain('L100,32');
    expect(path).toContain('L0,32');
    expect(path).toContain('Z');
  });
});
