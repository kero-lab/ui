import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format bytes with KB/MB/GB labels (base 1024, SI-ish labels) */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/** Format bytes with IEC labels (KiB, MiB, GiB) */
export function formatBytesIEC(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[i]}`;
}

/** Get the numeric part of formatted bytes */
export function formatBytesNumeric(bytes: number, decimals = 1): number {
  if (bytes === 0) return 0;
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals));
}

/** Get just the unit label for a byte value */
export function formatBytesUnit(bytes: number): string {
  if (bytes === 0) return 'B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return sizes[i];
}

/**
 * Format memory in MB to a human-readable string.
 * Displays as GB if >= 1024 MB, otherwise as MB.
 * Examples: 512 -> "512 MB", 1024 -> "1 GB", 2048 -> "2 GB", 1536 -> "1.5 GB"
 */
export function formatMemory(mb: number): string {
  if (mb < 1024) {
    return `${mb} MB`;
  }
  const gb = mb / 1024;
  // Show decimal only if not a whole number
  if (gb % 1 === 0) {
    return `${gb} GB`;
  }
  return `${gb.toFixed(1)} GB`;
}

/**
 * Format memory in MB to a compact string for tight spaces.
 * Examples: 512 -> "512M", 1024 -> "1G", 2048 -> "2G"
 */
export function formatMemoryCompact(mb: number): string {
  if (mb < 1024) {
    return `${mb}M`;
  }
  const gb = mb / 1024;
  if (gb % 1 === 0) {
    return `${gb}G`;
  }
  return `${gb.toFixed(1)}G`;
}

/**
 * Format a number as EUR currency.
 * Examples: 100 -> "€100.00", 1234.5 -> "€1,234.50"
 */
export function formatCurrency(amount: number, locale = 'nl-NL'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/** Format a number with locale-aware separators */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(n);
}

/** Usage percentage to text color class */
export function usageColor(percent: number): string {
  if (percent < 70) return 'text-success';
  if (percent < 85) return 'text-warning';
  return 'text-danger';
}

/** Usage percentage to background color class */
export function usageBgColor(percent: number): string {
  if (percent < 70) return 'bg-success';
  if (percent < 85) return 'bg-warning';
  return 'bg-danger';
}

/** Format a duration given in seconds (compact: "5m", "2h", "1d") */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

/** Format a duration given in milliseconds (verbose: "2m 15s") */
export function formatDurationMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return remaining > 0 ? `${minutes}m ${remaining}s` : `${minutes}m`;
}
