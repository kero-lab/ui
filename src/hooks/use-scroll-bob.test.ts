// @vitest-environment jsdom
import { describe, expect, it, vi, beforeAll } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useScrollBob } from './use-scroll-bob';

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

// Mock CSS.supports
beforeAll(() => {
  Object.defineProperty(window, 'CSS', {
    writable: true,
    value: { supports: vi.fn(() => false) },
  });
});

describe('useScrollBob', () => {
  it('returns a class name string', () => {
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useScrollBob(ref));
    expect(typeof result.current.bobClass).toBe('string');
    expect(result.current.bobClass.length).toBeGreaterThan(0);
  });

  it('returns empty class when reduced motion is preferred', () => {
    // Override matchMedia to report reduced motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useScrollBob(ref));
    expect(result.current.bobClass).toBe('');

    // Restore
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

  it('handles null ref', () => {
    const ref = { current: null };
    const { result } = renderHook(() => useScrollBob(ref));
    expect(typeof result.current.bobClass).toBe('string');
  });

  it('accepts maxDisplacement option', () => {
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useScrollBob(ref, { maxDisplacement: 5 }));
    expect(typeof result.current.bobClass).toBe('string');
  });
});
