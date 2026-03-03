import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from './button';
const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs', 'lifecycle:stable'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
        'glass',
        'glass-secondary',
        'neon',
        'minimal',
      ],
    },
    size: {
      control: 'select',
      options: [
        'default',
        'xs',
        'sm',
        'lg',
        'icon',
        'icon-xs',
        'icon-sm',
        'icon-lg',
      ],
    },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
  args: {
    children: 'Button',
    variant: 'default',
    size: 'default',
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Delete' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Outline' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Ghost' },
};

export const Link: Story = {
  args: { variant: 'link', children: 'Link' },
};

export const Glass: Story = {
  args: { variant: 'glass', children: 'Glass' },
};

export const Neon: Story = {
  args: { variant: 'neon', children: 'Neon' },
};

export const Minimal: Story = {
  args: { variant: 'minimal', children: 'Minimal' },
};

export const Small: Story = {
  args: { size: 'sm', children: 'Small' },
};

export const Large: Story = {
  args: { size: 'lg', children: 'Large' },
};

export const ExtraSmall: Story = {
  args: { size: 'xs', children: 'XS' },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Disabled' },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="glass">Glass</Button>
      <Button variant="glass-secondary">Glass Secondary</Button>
      <Button variant="neon">Neon</Button>
      <Button variant="minimal">Minimal</Button>
    </div>
  ),
};

/** Demonstrates a11y testing — addon-a11y runs axe-core checks in Vitest */
export const A11yChecked: Story = {
  args: { children: 'Accessible Button' },
  parameters: {
    a11y: { test: 'error' },
  },
};

export const ClickInteraction: Story = {
  args: { children: 'Click me' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Click me' });

    await expect(button).toBeInTheDocument();
    await expect(button).not.toBeDisabled();
    await userEvent.click(button);
    await expect(button).toHaveAttribute('data-slot', 'button');
    await expect(button).toHaveAttribute('data-variant', 'default');
    await expect(button).toHaveAttribute('data-size', 'default');
  },
};
