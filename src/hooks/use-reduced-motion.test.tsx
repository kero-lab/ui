import { describe, expect, it, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReducedMotion } from './use-reduced-motion';

type MediaQueryListener = (e: MediaQueryListEvent) => void;

function createMockMatchMedia(initialMatch: boolean) {
  let listener: MediaQueryListener | null = null;
  const mql = {
    matches: initialMatch,
    addEventListener: vi.fn((_event: string, cb: MediaQueryListener) => {
      listener = cb;
    }),
    removeEventListener: vi.fn(),
  };

  function fireChange(matches: boolean) {
    mql.matches = matches;
    if (listener) {
      act(() => {
        listener!({ matches } as MediaQueryListEvent);
      });
    }
  }

  return { mql, fireChange };
}

describe('useReducedMotion', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('returns false when no motion preference', () => {
    const { mql } = createMockMatchMedia(false);
    window.matchMedia = vi.fn(() => mql as unknown as MediaQueryList);

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns true when reduced motion is preferred', () => {
    const { mql } = createMockMatchMedia(true);
    window.matchMedia = vi.fn(() => mql as unknown as MediaQueryList);

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('queries prefers-reduced-motion', () => {
    const { mql } = createMockMatchMedia(false);
    window.matchMedia = vi.fn(() => mql as unknown as MediaQueryList);

    renderHook(() => useReducedMotion());
    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });

  it('responds to preference changes', () => {
    const { mql, fireChange } = createMockMatchMedia(false);
    window.matchMedia = vi.fn(() => mql as unknown as MediaQueryList);

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    fireChange(true);
    expect(result.current).toBe(true);
  });

  it('cleans up listener on unmount', () => {
    const { mql } = createMockMatchMedia(false);
    window.matchMedia = vi.fn(() => mql as unknown as MediaQueryList);

    const { unmount } = renderHook(() => useReducedMotion());
    expect(mql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    unmount();
    expect(mql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
