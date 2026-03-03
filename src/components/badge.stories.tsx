import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Badge } from './badge';
const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs', 'lifecycle:stable'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'secondary',
        'destructive',
        'outline',
        'ghost',
        'link',
        'success',
        'warning',
        'danger',
      ],
    },
    children: { control: 'text' },
  },
  args: {
    children: 'Badge',
    variant: 'default',
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary' },
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Destructive' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Outline' },
};

export const Success: Story = {
  args: { variant: 'success', children: 'Online' },
};

export const Warning: Story = {
  args: { variant: 'warning', children: 'Degraded' },
};

export const Danger: Story = {
  args: { variant: 'danger', children: 'Offline' },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="link">Link</Badge>
      <Badge variant="success">Online</Badge>
      <Badge variant="warning">Degraded</Badge>
      <Badge variant="danger">Offline</Badge>
    </div>
  ),
};

export const StatusGroup: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge variant="success">Healthy</Badge>
      <Badge variant="warning">Degraded</Badge>
      <Badge variant="danger">Down</Badge>
    </div>
  ),
};

export const DataAttributes: Story = {
  args: { children: 'Test Badge' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Test Badge');

    await expect(badge).toBeInTheDocument();
    await expect(badge).toHaveAttribute('data-slot', 'badge');
    await expect(badge).toHaveAttribute('data-variant', 'default');
  },
};
