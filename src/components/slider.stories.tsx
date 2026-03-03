import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Slider } from './slider';
const meta = {
  title: 'Components/Slider',
  component: Slider,
  tags: ['autodocs', 'lifecycle:stable'],
  argTypes: {
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    disabled: { control: 'boolean' },
  },
  args: {
    min: 0,
    max: 100,
    disabled: false,
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { defaultValue: [50] },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};

export const Range: Story = {
  args: { defaultValue: [25, 75] },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};

export const WithStep: Story = {
  args: { defaultValue: [20], step: 10 },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};

export const Disabled: Story = {
  args: { defaultValue: [50], disabled: true },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};

export const CustomRange: Story = {
  args: { defaultValue: [5], min: 0, max: 10, step: 1 },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-64">
      <div>
        <p className="text-xs text-muted-foreground mb-2">Single value</p>
        <Slider defaultValue={[50]} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-2">Range (two thumbs)</p>
        <Slider defaultValue={[25, 75]} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-2">With step (10)</p>
        <Slider defaultValue={[30]} step={10} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-2">Disabled</p>
        <Slider defaultValue={[50]} disabled />
      </div>
    </div>
  ),
};

export const DataAttributes: Story = {
  args: { defaultValue: [50] },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole('slider');

    await expect(slider).toBeInTheDocument();
    await expect(slider).toHaveAttribute('aria-valuemin', '0');
    await expect(slider).toHaveAttribute('aria-valuemax', '100');
    await expect(slider).toHaveAttribute('aria-valuenow', '50');
  },
};
