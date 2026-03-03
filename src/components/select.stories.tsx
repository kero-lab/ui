import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { Label } from './label';
const meta = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs', 'lifecycle:stable'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select a service" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="traefik">Traefik</SelectItem>
        <SelectItem value="pihole">Pi-hole</SelectItem>
        <SelectItem value="jellyfin">Jellyfin</SelectItem>
        <SelectItem value="grafana">Grafana</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select a host" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <Label className="px-2 py-1.5 text-xs text-muted-foreground">Core</Label>
          <SelectItem value="core">Core (LXC 200)</SelectItem>
          <SelectItem value="media">Media (LXC 201)</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <Label className="px-2 py-1.5 text-xs text-muted-foreground">Services</Label>
          <SelectItem value="monitoring">Monitoring (LXC 202)</SelectItem>
          <SelectItem value="gaming">Gaming (LXC 203)</SelectItem>
          <SelectItem value="ci">CI (LXC 204)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const Small: Story = {
  render: () => (
    <Select>
      <SelectTrigger size="sm" className="w-36">
        <SelectValue placeholder="Size" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="sm">Small</SelectItem>
        <SelectItem value="md">Medium</SelectItem>
        <SelectItem value="lg">Large</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Disabled" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">Item A</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="lxc">Target LXC</Label>
      <Select>
        <SelectTrigger id="lxc" className="w-full">
          <SelectValue placeholder="Choose deployment target" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="200">Core (200)</SelectItem>
          <SelectItem value="201">Media (201)</SelectItem>
          <SelectItem value="202">Monitoring (202)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const OpenInteraction: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Pick one" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="alpha">Alpha</SelectItem>
        <SelectItem value="beta">Beta</SelectItem>
        <SelectItem value="gamma">Gamma</SelectItem>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');

    await expect(trigger).toBeInTheDocument();
    await expect(trigger).toHaveAttribute('data-slot', 'select-trigger');

    await userEvent.click(trigger);

    // Select content renders in a portal
    const option = await within(document.body).findByText('Alpha');
    await expect(option).toBeVisible();
  },
};
