// @vitest-environment jsdom
import { describe, expect, it, vi, beforeAll } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import {
  EventCard,
  EventCardSummary,
  EventCardDetail,
  EventCardAction,
  useEventCard,
} from './event-card';

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

function renderCard(props: {
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  accentColor?: string;
  significance?: 'high' | 'medium' | 'low';
} = {}) {
  return render(
    <EventCard {...props}>
      <EventCardSummary>Summary content</EventCardSummary>
      <EventCardDetail>Detail content</EventCardDetail>
    </EventCard>
  );
}

describe('EventCard', () => {
  it('renders collapsed by default', () => {
    const { container } = renderCard();
    const card = container.querySelector('[data-slot="event-card"]');
    expect(card?.getAttribute('data-state')).toBe('collapsed');
  });

  it('renders summary content', () => {
    const { container } = renderCard();
    const summary = container.querySelector('[data-slot="event-card-summary"]');
    expect(summary?.textContent).toBe('Summary content');
  });

  it('detail is hidden when collapsed', () => {
    const { container } = renderCard();
    const detail = container.querySelector('[data-slot="event-card-detail"]');
    expect(detail?.getAttribute('aria-hidden')).toBe('true');
    expect(detail?.getAttribute('data-state')).toBe('collapsed');
  });

  it('respects defaultExpanded', () => {
    const { container } = renderCard({ defaultExpanded: true });
    const card = container.querySelector('[data-slot="event-card"]');
    const detail = container.querySelector('[data-slot="event-card-detail"]');
    expect(card?.getAttribute('data-state')).toBe('expanded');
    expect(detail?.getAttribute('aria-hidden')).toBe('false');
    expect(detail?.getAttribute('data-state')).toBe('expanded');
  });

  it('works in controlled mode', () => {
    const { container, rerender } = render(
      <EventCard expanded={false}>
        <EventCardSummary>Summary</EventCardSummary>
        <EventCardDetail>Detail</EventCardDetail>
      </EventCard>
    );
    const card = container.querySelector('[data-slot="event-card"]')!;
    expect(card.getAttribute('data-state')).toBe('collapsed');

    rerender(
      <EventCard expanded={true}>
        <EventCardSummary>Summary</EventCardSummary>
        <EventCardDetail>Detail</EventCardDetail>
      </EventCard>
    );
    expect(card.getAttribute('data-state')).toBe('expanded');
  });

  it('fires onExpandedChange on hover after delay', () => {
    vi.useFakeTimers();
    const onExpandedChange = vi.fn();
    const { container } = renderCard({ onExpandedChange });
    const card = container.querySelector('[data-slot="event-card"]')!;

    fireEvent.mouseEnter(card);
    expect(onExpandedChange).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(150); });
    expect(onExpandedChange).toHaveBeenCalledWith(true);

    fireEvent.mouseLeave(card);
    act(() => { vi.advanceTimersByTime(100); });
    expect(onExpandedChange).toHaveBeenCalledWith(false);

    vi.useRealTimers();
  });

  it('cancels enter timer on quick mouse leave', () => {
    vi.useFakeTimers();
    const onExpandedChange = vi.fn();
    const { container } = renderCard({ onExpandedChange });
    const card = container.querySelector('[data-slot="event-card"]')!;

    fireEvent.mouseEnter(card);
    act(() => { vi.advanceTimersByTime(50); });
    fireEvent.mouseLeave(card);
    act(() => { vi.advanceTimersByTime(200); });

    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    expect(onExpandedChange).toHaveBeenCalledWith(false);

    vi.useRealTimers();
  });

  it('renders as a div without role or tabindex', () => {
    const { container } = renderCard();
    const card = container.querySelector('[data-slot="event-card"]')!;
    expect(card.tagName).toBe('DIV');
    expect(card.getAttribute('role')).toBeNull();
    expect(card.getAttribute('tabindex')).toBeNull();
  });

  it('applies accent color as left border', () => {
    const { container } = renderCard({ accentColor: '#D97757' });
    const card = container.querySelector('[data-slot="event-card"]')! as HTMLElement;
    expect(card.style.borderLeftColor).toBe('rgb(217, 119, 87)');
    expect(card.style.borderLeftWidth).toBe('3px');
  });

  it('sets data-significance attribute', () => {
    const { container } = renderCard({ significance: 'high' });
    const card = container.querySelector('[data-slot="event-card"]');
    expect(card?.getAttribute('data-significance')).toBe('high');
  });

  it('defaults significance to medium', () => {
    const { container } = renderCard();
    const card = container.querySelector('[data-slot="event-card"]');
    expect(card?.getAttribute('data-significance')).toBe('medium');
  });
});

describe('EventCardDetail', () => {
  it('syncs data-state with expanded', () => {
    const { container } = renderCard({ defaultExpanded: true });
    const detail = container.querySelector('[data-slot="event-card-detail"]');
    expect(detail?.getAttribute('data-state')).toBe('expanded');
  });
});

describe('EventCardAction', () => {
  it('renders as an anchor with data-slot', () => {
    const { container } = render(
      <EventCard>
        <EventCardSummary>
          <EventCardAction href="/sessions/123">View session</EventCardAction>
        </EventCardSummary>
      </EventCard>
    );
    const action = container.querySelector('[data-slot="event-card-action"]');
    expect(action).toBeTruthy();
    expect(action?.tagName).toBe('A');
    expect(action?.getAttribute('href')).toBe('/sessions/123');
    expect(action?.textContent).toBe('View session');
  });
});

describe('useEventCard', () => {
  it('throws when used outside EventCard', () => {
    function Bad() {
      useEventCard();
      return null;
    }

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Bad />)).toThrow(
      'useEventCard must be used within an EventCard'
    );
    spy.mockRestore();
  });
});
