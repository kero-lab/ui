import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import {
  ExpandableRow,
  ExpandableRowTrigger,
  ExpandableRowContent,
  useExpandableRow,
} from './expandable-row';

function renderRow(props: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  return render(
    <table>
      <tbody>
        <ExpandableRow {...props}>
          <ExpandableRowTrigger>
            <td>Row</td>
          </ExpandableRowTrigger>
          <ExpandableRowContent colSpan={1}>Detail</ExpandableRowContent>
        </ExpandableRow>
      </tbody>
    </table>
  );
}

describe('ExpandableRow', () => {
  it('renders closed by default', () => {
    const { container } = renderRow();
    const row = container.querySelector('[data-slot="expandable-row"]');
    expect(row?.getAttribute('data-state')).toBe('closed');
    expect(row?.getAttribute('aria-expanded')).toBe('false');
  });

  it('respects defaultOpen', () => {
    const { container } = renderRow({ defaultOpen: true });
    const row = container.querySelector('[data-slot="expandable-row"]');
    expect(row?.getAttribute('data-state')).toBe('open');
    expect(row?.getAttribute('aria-expanded')).toBe('true');
  });

  it('toggles on click', () => {
    const { container } = renderRow();
    const row = container.querySelector('[data-slot="expandable-row"]')!;

    fireEvent.click(row);
    expect(row.getAttribute('data-state')).toBe('open');

    fireEvent.click(row);
    expect(row.getAttribute('data-state')).toBe('closed');
  });

  it('fires onOpenChange callback', () => {
    const onOpenChange = vi.fn();
    const { container } = renderRow({ onOpenChange });
    const row = container.querySelector('[data-slot="expandable-row"]')!;

    fireEvent.click(row);
    expect(onOpenChange).toHaveBeenCalledWith(true);

    fireEvent.click(row);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('works in controlled mode', () => {
    const { container, rerender } = render(
      <table>
        <tbody>
          <ExpandableRow open={false}>
            <ExpandableRowTrigger>
              <td>Row</td>
            </ExpandableRowTrigger>
            <ExpandableRowContent colSpan={1}>Detail</ExpandableRowContent>
          </ExpandableRow>
        </tbody>
      </table>
    );
    const row = container.querySelector('[data-slot="expandable-row"]')!;
    expect(row.getAttribute('data-state')).toBe('closed');

    // Clicking doesn't change state in controlled mode without updating prop
    fireEvent.click(row);
    expect(row.getAttribute('data-state')).toBe('closed');

    rerender(
      <table>
        <tbody>
          <ExpandableRow open={true}>
            <ExpandableRowTrigger>
              <td>Row</td>
            </ExpandableRowTrigger>
            <ExpandableRowContent colSpan={1}>Detail</ExpandableRowContent>
          </ExpandableRow>
        </tbody>
      </table>
    );
    expect(row.getAttribute('data-state')).toBe('open');
  });

  it('toggles with Enter key', () => {
    const { container } = renderRow();
    const row = container.querySelector('[data-slot="expandable-row"]')!;

    fireEvent.keyDown(row, { key: 'Enter' });
    expect(row.getAttribute('data-state')).toBe('open');
  });

  it('toggles with Space key', () => {
    const { container } = renderRow();
    const row = container.querySelector('[data-slot="expandable-row"]')!;

    fireEvent.keyDown(row, { key: ' ' });
    expect(row.getAttribute('data-state')).toBe('open');
  });

  it('ignores other keys', () => {
    const { container } = renderRow();
    const row = container.querySelector('[data-slot="expandable-row"]')!;

    fireEvent.keyDown(row, { key: 'a' });
    expect(row.getAttribute('data-state')).toBe('closed');
  });
});

describe('ExpandableRowContent', () => {
  it('sets aria-hidden based on open state', () => {
    const { container } = renderRow();
    const content = container.querySelector('[data-slot="expandable-row-content"]')!;
    expect(content.getAttribute('aria-hidden')).toBe('true');

    const row = container.querySelector('[data-slot="expandable-row"]')!;
    fireEvent.click(row);
    expect(content.getAttribute('aria-hidden')).toBe('false');
  });

  it('syncs data-state with parent', () => {
    const { container } = renderRow({ defaultOpen: true });
    const content = container.querySelector('[data-slot="expandable-row-content"]')!;
    expect(content.getAttribute('data-state')).toBe('open');
  });
});

describe('useExpandableRow', () => {
  it('throws when used outside ExpandableRow', () => {
    function Bad() {
      useExpandableRow();
      return null;
    }

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Bad />)).toThrow(
      'useExpandableRow must be used within an ExpandableRow'
    );
    spy.mockRestore();
  });
});
