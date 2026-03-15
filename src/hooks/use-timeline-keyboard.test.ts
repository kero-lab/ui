// @vitest-environment jsdom
import { describe, expect, it, vi, beforeAll } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimelineKeyboard } from './use-timeline-keyboard';

// Mock matchMedia
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

function createContainer(itemCount: number) {
  const container = document.createElement('div');
  for (let i = 0; i < itemCount; i++) {
    const item = document.createElement('div');
    item.setAttribute('data-slot', 'event-card');
    item.scrollIntoView = vi.fn();
    container.appendChild(item);
  }
  return container;
}

function createKeyEvent(key: string): React.KeyboardEvent {
  return {
    key,
    preventDefault: vi.fn(),
  } as unknown as React.KeyboardEvent;
}

describe('useTimelineKeyboard', () => {
  it('starts with no focused item', () => {
    const ref = { current: createContainer(3) };
    const { result } = renderHook(() => useTimelineKeyboard(ref));
    expect(result.current.focusedIndex).toBeNull();
  });

  it('ArrowRight focuses first item from null', () => {
    const ref = { current: createContainer(3) };
    const { result } = renderHook(() => useTimelineKeyboard(ref));

    act(() => {
      result.current.containerProps.onKeyDown(createKeyEvent('ArrowRight'));
    });
    expect(result.current.focusedIndex).toBe(0);
  });

  it('ArrowRight increments focus', () => {
    const ref = { current: createContainer(3) };
    const { result } = renderHook(() => useTimelineKeyboard(ref));

    act(() => {
      result.current.containerProps.onKeyDown(createKeyEvent('ArrowRight'));
    });
    act(() => {
      result.current.containerProps.onKeyDown(createKeyEvent('ArrowRight'));
    });
    expect(result.current.focusedIndex).toBe(1);
  });

  it('ArrowLeft decrements focus', () => {
    const ref = { current: createContainer(3) };
    const { result } = renderHook(() => useTimelineKeyboard(ref));

    // Move right twice
    act(() => {
      result.current.containerProps.onKeyDown(createKeyEvent('ArrowRight'));
    });
    act(() => {
      result.current.containerProps.onKeyDown(createKeyEvent('ArrowRight'));
    });
    // Move left once
    act(() => {
      result.current.containerProps.onKeyDown(createKeyEvent('ArrowLeft'));
    });
    expect(result.current.focusedIndex).toBe(0);
  });

  it('ArrowRight clamps at last item', () => {
    const ref = { current: createContainer(2) };
    const { result } = renderHook(() => useTimelineKeyboard(ref));

    act(() => {
      result.current.containerProps.onKeyDown(createKeyEvent('ArrowRight'));
    });
    act(() => {
      result.current.containerProps.onKeyDown(createKeyEvent('ArrowRight'));
    });
    act(() => {
      result.current.containerProps.onKeyDown(createKeyEvent('ArrowRight'));
    });
    expect(result.current.focusedIndex).toBe(1);
  });

  it('Escape clears focus', () => {
    const ref = { current: createContainer(3) };
    const { result } = renderHook(() => useTimelineKeyboard(ref));

    act(() => {
      result.current.containerProps.onKeyDown(createKeyEvent('ArrowRight'));
    });
    expect(result.current.focusedIndex).toBe(0);

    act(() => {
      result.current.containerProps.onKeyDown(createKeyEvent('Escape'));
    });
    expect(result.current.focusedIndex).toBeNull();
  });

  it('Enter fires onSelect', () => {
    const onSelect = vi.fn();
    const ref = { current: createContainer(3) };
    const { result } = renderHook(() => useTimelineKeyboard(ref, { onSelect }));

    act(() => {
      result.current.containerProps.onKeyDown(createKeyEvent('ArrowRight'));
    });
    act(() => {
      result.current.containerProps.onKeyDown(createKeyEvent('Enter'));
    });
    expect(onSelect).toHaveBeenCalledWith(0);
  });

  it('containerProps has correct ARIA attributes', () => {
    const ref = { current: createContainer(3) };
    const { result } = renderHook(() => useTimelineKeyboard(ref));

    expect(result.current.containerProps.role).toBe('listbox');
    expect(result.current.containerProps.tabIndex).toBe(0);
    expect(result.current.containerProps['aria-label']).toBe('Event timeline');
  });
});
