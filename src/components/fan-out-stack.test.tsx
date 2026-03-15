// @vitest-environment jsdom
import { describe, expect, it, vi, beforeAll } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { FanOutStack } from './fan-out-stack';

// Mock matchMedia for useReducedMotion
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

function renderStack(overrides: {
  label?: string;
  accentColor?: string;
  defaultFanned?: boolean;
  onFanChange?: (fanned: boolean) => void;
} = {}) {
  return render(
    <FanOutStack {...overrides}>
      <div data-testid="child-1">Card 1</div>
      <div data-testid="child-2">Card 2</div>
      <div data-testid="child-3">Card 3</div>
    </FanOutStack>
  );
}

describe('FanOutStack', () => {
  it('renders stacked by default', () => {
    const { container } = renderStack();
    const stack = container.querySelector('[data-slot="fan-out-stack"]');
    expect(stack?.getAttribute('data-state')).toBe('stacked');
  });

  it('shows count badge with child count', () => {
    const { container } = renderStack();
    // Count badge shows "3" for 3 children
    const badge = container.querySelector('[data-slot="fan-out-stack"] span');
    const badges = container.querySelectorAll('span');
    const countBadge = Array.from(badges).find((el) => el.textContent === '3');
    expect(countBadge).toBeTruthy();
  });

  it('toggles to fanned state on click', () => {
    const { container } = renderStack();
    const stack = container.querySelector('[data-slot="fan-out-stack"]');
    const button = stack?.querySelector('[role="button"]');
    expect(button).toBeTruthy();

    fireEvent.click(button!);
    expect(stack?.getAttribute('data-state')).toBe('fanned');
  });

  it('data-state toggles between stacked and fanned', () => {
    const { container } = renderStack();
    const stack = container.querySelector('[data-slot="fan-out-stack"]');
    const button = stack?.querySelector('[role="button"]');

    expect(stack?.getAttribute('data-state')).toBe('stacked');
    fireEvent.click(button!);
    expect(stack?.getAttribute('data-state')).toBe('fanned');
  });

  it('fires onFanChange callback', () => {
    const onFanChange = vi.fn();
    const { container } = renderStack({ onFanChange });
    const button = container.querySelector('[role="button"]');

    fireEvent.click(button!);
    expect(onFanChange).toHaveBeenCalledWith(true);
  });

  it('renders single child without wrapper', () => {
    const { container } = render(
      <FanOutStack>
        <div data-testid="only-child">Solo</div>
      </FanOutStack>
    );
    // Single child → no fan-out-stack wrapper
    const stack = container.querySelector('[data-slot="fan-out-stack"]');
    expect(stack).toBeNull();
  });

  it('respects defaultFanned prop', () => {
    const { container } = renderStack({ defaultFanned: true });
    const stack = container.querySelector('[data-slot="fan-out-stack"]');
    expect(stack?.getAttribute('data-state')).toBe('fanned');
  });

  it('renders sliver edges for behind cards when stacked', () => {
    const { container } = renderStack({ accentColor: '#FF0000' });
    const stack = container.querySelector('[data-slot="fan-out-stack"]');
    // Should have sliver elements for behind cards (2 slivers for 3 children)
    const slivers = stack?.querySelectorAll('.rounded-r-lg');
    expect(slivers?.length).toBe(2);
  });
});
