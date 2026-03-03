import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Checkbox } from './checkbox';
import { Label } from './label';
const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs', 'lifecycle:stable'],
  argTypes: {
    checked: {
      control: 'select',
      options: [true, false, 'indeterminate'],
    },
    disabled: { control: 'boolean' },
  },
  args: {
    disabled: false,
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Indeterminate: Story = {
  args: { checked: 'indeterminate' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Checkbox id="unchecked" />
        <Label htmlFor="unchecked">Unchecked</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="checked" defaultChecked />
        <Label htmlFor="checked">Checked</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="indeterminate" checked="indeterminate" />
        <Label htmlFor="indeterminate">Indeterminate</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="disabled" disabled />
        <Label htmlFor="disabled">Disabled</Label>
      </div>
    </div>
  ),
};

export const ToggleInteraction: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="toggle-test" />
      <Label htmlFor="toggle-test">Click to toggle</Label>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox');

    await expect(checkbox).toBeInTheDocument();
    await expect(checkbox).not.toBeDisabled();
    await expect(checkbox).toHaveAttribute('data-state', 'unchecked');

    await userEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute('data-state', 'checked');

    await userEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute('data-state', 'unchecked');
  },
};
