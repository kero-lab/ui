// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ClusterSummary, formatClusterDuration } from './cluster-summary';

describe('ClusterSummary', () => {
  const base = Date.now();
  const defaultProps = {
    eventCount: 12,
    startTime: base,
    endTime: base + 30 * 60 * 1000, // 30 minutes
  };

  it('renders event count', () => {
    const { container } = render(<ClusterSummary {...defaultProps} />);
    expect(container.textContent).toContain('12 events');
  });

  it('renders time duration', () => {
    const { container } = render(<ClusterSummary {...defaultProps} />);
    expect(container.textContent).toContain('30m');
  });

  it('defaults to collapsed state', () => {
    const { container } = render(<ClusterSummary {...defaultProps} />);
    const summary = container.querySelector('[data-slot="cluster-summary"]');
    expect(summary?.getAttribute('data-state')).toBe('collapsed');
  });

  it('toggles collapsed/expanded on button click', () => {
    const { container } = render(<ClusterSummary {...defaultProps} />);
    const summary = container.querySelector('[data-slot="cluster-summary"]');
    const button = summary?.querySelector('button');

    expect(summary?.getAttribute('data-state')).toBe('collapsed');
    fireEvent.click(button!);
    expect(summary?.getAttribute('data-state')).toBe('expanded');
  });

  it('fires onToggle callback', () => {
    const onToggle = vi.fn();
    const { container } = render(<ClusterSummary {...defaultProps} onToggle={onToggle} />);
    const button = container.querySelector('button');

    fireEvent.click(button!);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders renderStats slot', () => {
    const { container } = render(
      <ClusterSummary
        {...defaultProps}
        renderStats={() => <span data-testid="stats">3 providers</span>}
      />
    );
    expect(container.textContent).toContain('3 providers');
  });
});

describe('formatClusterDuration', () => {
  it('formats minutes', () => {
    expect(formatClusterDuration(10 * 60_000)).toBe('10m');
  });

  it('formats hours', () => {
    expect(formatClusterDuration(3 * 60 * 60_000)).toBe('3h');
  });

  it('formats days', () => {
    expect(formatClusterDuration(48 * 60 * 60_000)).toBe('2d');
  });
});
