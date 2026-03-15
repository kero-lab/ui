// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { TrendIndicator, MiniSparkline } from './trend-indicator';

describe('TrendIndicator', () => {
  it('renders with up direction', () => {
    const { container } = render(<TrendIndicator direction="up" label="cost +10%" />);
    const indicator = container.querySelector('[data-slot="trend-indicator"]');
    expect(indicator?.getAttribute('data-direction')).toBe('up');
  });

  it('renders with down direction', () => {
    const { container } = render(<TrendIndicator direction="down" label="latency -5%" />);
    const indicator = container.querySelector('[data-slot="trend-indicator"]');
    expect(indicator?.getAttribute('data-direction')).toBe('down');
  });

  it('renders with flat direction', () => {
    const { container } = render(<TrendIndicator direction="flat" label="stable" />);
    const indicator = container.querySelector('[data-slot="trend-indicator"]');
    expect(indicator?.getAttribute('data-direction')).toBe('flat');
  });

  it('renders with new direction', () => {
    const { container } = render(<TrendIndicator direction="new" label="new: Gemini" />);
    const indicator = container.querySelector('[data-slot="trend-indicator"]');
    expect(indicator?.getAttribute('data-direction')).toBe('new');
  });

  it('maps severity to data attribute', () => {
    const { container } = render(<TrendIndicator direction="up" label="test" severity="negative" />);
    const indicator = container.querySelector('[data-slot="trend-indicator"]');
    expect(indicator?.getAttribute('data-severity')).toBe('negative');
  });

  it('renders label text', () => {
    const { container } = render(<TrendIndicator direction="up" label="cost +32%" />);
    expect(container.textContent).toContain('cost +32%');
  });

  it('renders sparkline when sparkData provided', () => {
    const { container } = render(
      <TrendIndicator direction="up" label="trend" sparkData={[1, 3, 2, 5, 4]} />
    );
    const svg = container.querySelectorAll('svg');
    // Should have at least 2 SVGs: arrow icon + sparkline
    expect(svg.length).toBeGreaterThanOrEqual(2);
  });

  it('does not render sparkline when sparkData has < 2 points', () => {
    const { container } = render(
      <TrendIndicator direction="up" label="trend" sparkData={[1]} />
    );
    // Only the arrow icon SVG
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(1);
  });
});

describe('MiniSparkline', () => {
  it('renders polyline for valid data', () => {
    const { container } = render(<MiniSparkline data={[1, 3, 2]} />);
    const polyline = container.querySelector('polyline');
    expect(polyline).toBeTruthy();
  });

  it('returns null for < 2 data points', () => {
    const { container } = render(<MiniSparkline data={[5]} />);
    expect(container.innerHTML).toBe('');
  });
});
