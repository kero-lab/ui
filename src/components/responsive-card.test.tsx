import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ResponsiveCard } from './responsive-card';

describe('ResponsiveCard', () => {
  it('renders all structural elements', () => {
    const { container } = render(
      <ResponsiveCard
        icon={<span>I</span>}
        title="CPU"
        value="73%"
        detail={<span>Detail</span>}
      />
    );
    expect(container.querySelector('[data-slot="responsive-card"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="responsive-card-layout"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="responsive-card-icon"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="responsive-card-value"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="responsive-card-title"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="responsive-card-detail"]')).toBeTruthy();
  });

  it('omits detail slot when detail prop not provided', () => {
    const { container } = render(
      <ResponsiveCard icon={<span>I</span>} title="CPU" value="73%" />
    );
    expect(container.querySelector('[data-slot="responsive-card-detail"]')).toBeNull();
  });

  it('renders title and value content', () => {
    const { container } = render(
      <ResponsiveCard icon={<span>I</span>} title="Memory" value="2.4 GB" />
    );
    expect(container.textContent).toContain('Memory');
    expect(container.textContent).toContain('2.4 GB');
  });

  it('handles click events', () => {
    const onClick = vi.fn();
    const { container } = render(
      <ResponsiveCard icon={<span>I</span>} title="CPU" value="73%" onClick={onClick} />
    );
    const card = container.querySelector('[data-slot="responsive-card"]')!;

    fireEvent.click(card);
    expect(onClick).toHaveBeenCalledOnce();
    expect(card.getAttribute('role')).toBe('button');
    expect(card.getAttribute('tabindex')).toBe('0');
  });

  it('toggles with Enter key when clickable', () => {
    const onClick = vi.fn();
    const { container } = render(
      <ResponsiveCard icon={<span>I</span>} title="CPU" value="73%" onClick={onClick} />
    );
    const card = container.querySelector('[data-slot="responsive-card"]')!;

    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('toggles with Space key when clickable', () => {
    const onClick = vi.fn();
    const { container } = render(
      <ResponsiveCard icon={<span>I</span>} title="CPU" value="73%" onClick={onClick} />
    );
    const card = container.querySelector('[data-slot="responsive-card"]')!;

    fireEvent.keyDown(card, { key: ' ' });
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('has no role or tabindex when not clickable', () => {
    const { container } = render(
      <ResponsiveCard icon={<span>I</span>} title="CPU" value="73%" />
    );
    const card = container.querySelector('[data-slot="responsive-card"]')!;
    expect(card.getAttribute('role')).toBeNull();
    expect(card.getAttribute('tabindex')).toBeNull();
  });

  it('applies @container class for container queries', () => {
    const { container } = render(
      <ResponsiveCard icon={<span>I</span>} title="CPU" value="73%" />
    );
    const card = container.querySelector('[data-slot="responsive-card"]')!;
    expect(card.className).toContain('@container');
  });
});
