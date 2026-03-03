import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Input } from './input';
import { Label } from './label';

const meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number', 'search', 'file'],
    },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  args: {
    placeholder: 'Type something...',
    type: 'text',
    disabled: false,
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPlaceholder: Story = {
  args: { placeholder: 'Enter your email' },
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: 'Disabled input' },
};

export const ErrorState: Story = {
  args: { 'aria-invalid': true, defaultValue: 'invalid value' },
};

export const FileInput: Story = {
  args: { type: 'file' },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="you@example.com" />
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-72">
      <Input placeholder="Default" />
      <Input placeholder="Disabled" disabled />
      <Input placeholder="With value" defaultValue="Hello world" />
      <Input aria-invalid={true} defaultValue="Invalid" />
      <Input type="password" placeholder="Password" />
      <Input type="file" />
    </div>
  ),
};

export const TypeInteraction: Story = {
  args: { placeholder: 'Type here' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Type here');

    await expect(input).toBeInTheDocument();
    await expect(input).not.toBeDisabled();
    await expect(input).toHaveAttribute('data-slot', 'input');

    await userEvent.click(input);
    await userEvent.type(input, 'Hello');
    await expect(input).toHaveValue('Hello');
  },
};
