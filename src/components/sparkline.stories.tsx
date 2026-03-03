import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Sparkline, SparklineGrid } from './sparkline';
import { Card, CardContent, CardHeader, CardTitle } from './card';

const meta = {
  title: 'Components/Sparkline',
  component: Sparkline,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    data: [4, 7, 3, 8, 5, 9, 2, 6],
    width: 120,
    height: 32,
  },
} satisfies Meta<typeof Sparkline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {(["default", "success", "warning", "danger"] as const).map((variant) => (
        <div key={variant} className="flex flex-col items-center gap-1">
          <Sparkline
            data={[4, 7, 3, 8, 5, 9, 2, 6]}
            variant={variant}
            width={120}
            height={32}
          />
          <span className="text-xs text-muted-foreground">{variant}</span>
        </div>
      ))}
    </div>
  ),
};

export const EmptyData: Story = {
  args: { data: [] },
};

export const SinglePoint: Story = {
  args: { data: [42] },
};

export const FlatData: Story = {
  args: { data: [5, 5, 5, 5, 5] },
};

export const TrendingUp: Story = {
  args: {
    data: [2, 3, 4, 5, 7, 8, 10, 12],
    variant: 'success',
  },
};

export const TrendingDown: Story = {
  args: {
    data: [12, 10, 8, 7, 5, 4, 3, 2],
    variant: 'danger',
  },
};

export const Volatile: Story = {
  args: {
    data: [2, 9, 1, 8, 3, 10, 2, 7],
    variant: 'warning',
  },
};

export const Grid: Story = {
  render: () => (
    <SparklineGrid
      items={[
        { label: 'CPU', data: [30, 45, 60, 55, 70, 65, 80], variant: 'warning' },
        { label: 'Memory', data: [60, 62, 61, 63, 65, 64, 66], variant: 'success' },
        { label: 'Disk I/O', data: [10, 15, 50, 20, 15, 10, 12], variant: 'default' },
        { label: 'Network', data: [80, 85, 90, 95, 92, 88, 85], variant: 'danger' },
        { label: 'Latency', data: [5, 4, 6, 3, 5, 4, 3], variant: 'success' },
        { label: 'Errors', data: [0, 0, 1, 0, 2, 0, 0], variant: 'default' },
      ]}
      columns={3}
    />
  ),
};

export const InsideCard: Story = {
  render: () => (
    <Card className="w-64">
      <CardHeader>
        <CardTitle className="text-sm">Server Load</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">73%</span>
          <Sparkline
            data={[30, 45, 60, 55, 70, 65, 73]}
            variant="warning"
            width={100}
            height={24}
          />
        </div>
      </CardContent>
    </Card>
  ),
};

export const DataAttributes: Story = {
  play: async ({ canvasElement }) => {
    const sparkline = canvasElement.querySelector('[data-slot="sparkline"]');
    await expect(sparkline).toBeInTheDocument();
    await expect(sparkline).toHaveAttribute('data-variant', 'default');

    const svg = sparkline?.querySelector('svg');
    await expect(svg).toBeInTheDocument();
    await expect(svg).toHaveAttribute('role', 'img');
  },
};
