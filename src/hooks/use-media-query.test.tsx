import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery, useMobile } from './use-media-query';

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

describe('useMediaQuery', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('returns initial match state', () => {
    const { mql } = createMockMatchMedia(true);
    window.matchMedia = vi.fn(() => mql as unknown as MediaQueryList);

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('returns false when query does not match', () => {
    const { mql } = createMockMatchMedia(false);
    window.matchMedia = vi.fn(() => mql as unknown as MediaQueryList);

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
  });

  it('updates when media query changes', () => {
    const { mql, fireChange } = createMockMatchMedia(false);
    window.matchMedia = vi.fn(() => mql as unknown as MediaQueryList);

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);

    fireChange(true);
    expect(result.current).toBe(true);
  });

  it('registers and cleans up event listener', () => {
    const { mql } = createMockMatchMedia(false);
    window.matchMedia = vi.fn(() => mql as unknown as MediaQueryList);

    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(mql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    unmount();
    expect(mql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});

describe('useMobile', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('queries max-width 768px', () => {
    const { mql } = createMockMatchMedia(true);
    window.matchMedia = vi.fn(() => mql as unknown as MediaQueryList);

    renderHook(() => useMobile());
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 768px)');
  });
});
