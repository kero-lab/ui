import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Skeleton } from './skeleton';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Skeleton className="h-4 w-48" />,
};

export const TextBlock: Story = {
  render: () => (
    <div className="flex flex-col gap-2 w-64">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  ),
};

export const CardShaped: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-72">
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  ),
};

export const Avatar: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  ),
};

export const AllShapes: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-80">
      <div>
        <p className="text-xs text-muted-foreground mb-2">Text lines</p>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-2">Card</p>
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-2">Circle + text</p>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  ),
};

export const DataAttributes: Story = {
  render: () => <Skeleton className="h-4 w-48" />,
  play: async ({ canvasElement }) => {
    const skeleton = canvasElement.querySelector('[data-slot="skeleton"]');

    await expect(skeleton).toBeInTheDocument();
    await expect(skeleton).toHaveAttribute('data-slot', 'skeleton');
  },
};
