import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Separator } from './separator';
const meta = {
  title: 'Components/Separator',
  component: Separator,
  tags: ['autodocs', 'lifecycle:stable'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
  args: {
    orientation: 'horizontal',
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-64">
      <div className="text-sm">Above</div>
      <Separator className="my-2" />
      <div className="text-sm">Below</div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-8 items-center gap-4">
      <span className="text-sm">Left</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Right</span>
    </div>
  ),
};

export const BothOrientations: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-64">
      <div>
        <p className="text-xs text-muted-foreground mb-1">Horizontal</p>
        <div className="text-sm">Section A</div>
        <Separator className="my-2" />
        <div className="text-sm">Section B</div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">Vertical</p>
        <div className="flex h-8 items-center gap-4">
          <span className="text-sm">Item 1</span>
          <Separator orientation="vertical" />
          <span className="text-sm">Item 2</span>
          <Separator orientation="vertical" />
          <span className="text-sm">Item 3</span>
        </div>
      </div>
    </div>
  ),
};

export const DataAttributes: Story = {
  render: () => <Separator />,
  play: async ({ canvasElement }) => {
    const separator = canvasElement.querySelector('[data-slot="separator"]');

    await expect(separator).toBeInTheDocument();
    await expect(separator).toHaveAttribute('data-slot', 'separator');
    await expect(separator).toHaveAttribute('data-orientation', 'horizontal');
  },
};
