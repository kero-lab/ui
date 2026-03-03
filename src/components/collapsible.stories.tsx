import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './collapsible';
import { Button } from './button';
const meta = {
  title: 'Components/Collapsible',
  component: Collapsible,
  tags: ['autodocs', 'lifecycle:stable'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Collapsible className="w-72">
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          Toggle content
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div className="rounded-md border p-3 text-sm">
          This content can be collapsed and expanded.
        </div>
      </CollapsibleContent>
    </Collapsible>
  ),
};

export const DefaultOpen: Story = {
  render: () => (
    <Collapsible defaultOpen className="w-72">
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          Expanded by default
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div className="rounded-md border p-3 text-sm">
          This section starts open.
        </div>
      </CollapsibleContent>
    </Collapsible>
  ),
};

export const MultipleItems: Story = {
  render: () => (
    <Collapsible className="w-72">
      <div className="flex items-center justify-between rounded-md border px-3 py-2">
        <span className="text-sm font-medium">3 items</span>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            Show all
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="mt-1 rounded-md border px-3 py-2 text-sm">
        Item 1 (always visible)
      </div>
      <CollapsibleContent>
        <div className="mt-1 rounded-md border px-3 py-2 text-sm">Item 2</div>
        <div className="mt-1 rounded-md border px-3 py-2 text-sm">Item 3</div>
      </CollapsibleContent>
    </Collapsible>
  ),
};

export const ToggleInteraction: Story = {
  render: () => (
    <Collapsible className="w-72">
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full">
          Toggle
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 rounded-md border p-3 text-sm">
          Hidden content revealed
        </div>
      </CollapsibleContent>
    </Collapsible>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Toggle' });

    await expect(trigger).toBeInTheDocument();
    await expect(trigger).toHaveAttribute('data-state', 'closed');

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('data-state', 'open');

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('data-state', 'closed');
  },
};
