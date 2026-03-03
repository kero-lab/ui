import { describe, expect, it } from 'vitest';
import {
  cn,
  formatBytes,
  formatBytesIEC,
  formatBytesNumeric,
  formatBytesUnit,
  formatMemory,
  formatMemoryCompact,
  formatCurrency,
  formatNumber,
  usageColor,
  usageBgColor,
  formatDuration,
  formatDurationMs,
} from './utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('deduplicates tailwind classes', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
  });
});

describe('formatBytes', () => {
  it('formats 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('formats bytes', () => {
    expect(formatBytes(500)).toBe('500 B');
  });

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('formats megabytes', () => {
    expect(formatBytes(1048576)).toBe('1 MB');
  });

  it('formats gigabytes', () => {
    expect(formatBytes(1073741824)).toBe('1 GB');
  });

  it('respects decimal parameter', () => {
    expect(formatBytes(1536, 2)).toBe('1.5 KB');
    expect(formatBytes(1234567, 0)).toBe('1 MB');
  });
});

describe('formatBytesIEC', () => {
  it('formats 0 bytes', () => {
    expect(formatBytesIEC(0)).toBe('0 B');
  });

  it('uses IEC labels', () => {
    expect(formatBytesIEC(1024)).toBe('1.0 KiB');
    expect(formatBytesIEC(1048576)).toBe('1.0 MiB');
  });

  it('rounds large values', () => {
    expect(formatBytesIEC(10240)).toBe('10 KiB');
  });
});

describe('formatBytesNumeric', () => {
  it('returns 0 for 0 bytes', () => {
    expect(formatBytesNumeric(0)).toBe(0);
  });

  it('returns numeric part only', () => {
    expect(formatBytesNumeric(1024)).toBe(1);
    expect(formatBytesNumeric(1536)).toBe(1.5);
  });

  it('respects decimal parameter', () => {
    expect(formatBytesNumeric(1234567, 2)).toBe(1.18);
  });
});

describe('formatBytesUnit', () => {
  it('returns B for 0', () => {
    expect(formatBytesUnit(0)).toBe('B');
  });

  it('returns correct unit', () => {
    expect(formatBytesUnit(500)).toBe('B');
    expect(formatBytesUnit(1024)).toBe('KB');
    expect(formatBytesUnit(1048576)).toBe('MB');
    expect(formatBytesUnit(1073741824)).toBe('GB');
    expect(formatBytesUnit(1099511627776)).toBe('TB');
  });
});

describe('formatMemory', () => {
  it('formats MB values', () => {
    expect(formatMemory(512)).toBe('512 MB');
    expect(formatMemory(256)).toBe('256 MB');
  });

  it('formats whole GB values', () => {
    expect(formatMemory(1024)).toBe('1 GB');
    expect(formatMemory(2048)).toBe('2 GB');
  });

  it('formats fractional GB values', () => {
    expect(formatMemory(1536)).toBe('1.5 GB');
  });
});

describe('formatMemoryCompact', () => {
  it('formats MB values compactly', () => {
    expect(formatMemoryCompact(512)).toBe('512M');
  });

  it('formats whole GB values compactly', () => {
    expect(formatMemoryCompact(1024)).toBe('1G');
    expect(formatMemoryCompact(2048)).toBe('2G');
  });

  it('formats fractional GB values compactly', () => {
    expect(formatMemoryCompact(1536)).toBe('1.5G');
  });
});

describe('formatCurrency', () => {
  it('formats EUR with nl-NL locale', () => {
    const result = formatCurrency(100);
    // nl-NL uses € symbol and comma as decimal separator
    expect(result).toContain('€');
    expect(result).toContain('100');
  });

  it('includes two decimal places', () => {
    const result = formatCurrency(9.5);
    // Should have .50 or ,50 depending on locale formatting
    expect(result).toMatch(/9[.,]50/);
  });
});

describe('formatNumber', () => {
  it('formats small numbers', () => {
    expect(formatNumber(42)).toBe('42');
  });

  it('formats large numbers with separators', () => {
    const result = formatNumber(1234567);
    // Locale-dependent separator, but should contain digits
    expect(result).toMatch(/1.?234.?567/);
  });
});

describe('usageColor', () => {
  it('returns success below 70%', () => {
    expect(usageColor(0)).toBe('text-success');
    expect(usageColor(50)).toBe('text-success');
    expect(usageColor(69)).toBe('text-success');
  });

  it('returns warning between 70-84%', () => {
    expect(usageColor(70)).toBe('text-warning');
    expect(usageColor(84)).toBe('text-warning');
  });

  it('returns danger at 85%+', () => {
    expect(usageColor(85)).toBe('text-danger');
    expect(usageColor(100)).toBe('text-danger');
  });
});

describe('usageBgColor', () => {
  it('returns success below 70%', () => {
    expect(usageBgColor(0)).toBe('bg-success');
    expect(usageBgColor(69)).toBe('bg-success');
  });

  it('returns warning between 70-84%', () => {
    expect(usageBgColor(70)).toBe('bg-warning');
    expect(usageBgColor(84)).toBe('bg-warning');
  });

  it('returns danger at 85%+', () => {
    expect(usageBgColor(85)).toBe('bg-danger');
    expect(usageBgColor(100)).toBe('bg-danger');
  });
});

describe('formatDuration', () => {
  it('formats seconds', () => {
    expect(formatDuration(5)).toBe('5s');
    expect(formatDuration(59)).toBe('59s');
  });

  it('formats minutes', () => {
    expect(formatDuration(60)).toBe('1m');
    expect(formatDuration(300)).toBe('5m');
    expect(formatDuration(3599)).toBe('59m');
  });

  it('formats hours', () => {
    expect(formatDuration(3600)).toBe('1h');
    expect(formatDuration(7200)).toBe('2h');
    expect(formatDuration(86399)).toBe('23h');
  });

  it('formats days', () => {
    expect(formatDuration(86400)).toBe('1d');
    expect(formatDuration(172800)).toBe('2d');
  });
});

describe('formatDurationMs', () => {
  it('formats milliseconds', () => {
    expect(formatDurationMs(500)).toBe('500ms');
    expect(formatDurationMs(999)).toBe('999ms');
  });

  it('formats seconds', () => {
    expect(formatDurationMs(1000)).toBe('1s');
    expect(formatDurationMs(5000)).toBe('5s');
  });

  it('formats minutes and seconds', () => {
    expect(formatDurationMs(135000)).toBe('2m 15s');
  });

  it('formats exact minutes without remainder', () => {
    expect(formatDurationMs(120000)).toBe('2m');
  });
});
