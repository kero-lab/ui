import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Button } from './button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from './card';
const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs', 'lifecycle:stable'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This is the card content area. It can contain any elements.
        </p>
      </CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Service Status</CardTitle>
        <CardDescription>Current health of the service.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">All systems operational.</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" size="sm">Details</Button>
        <Button size="sm">Restart</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm">Mark all read</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Latest notification content here.
        </p>
      </CardContent>
    </Card>
  ),
};

export const CardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 max-w-[800px]">
      {['Traefik', 'Pi-hole', 'Grafana', 'Jellyfin'].map((service) => (
        <Card key={service}>
          <CardHeader>
            <CardTitle>{service}</CardTitle>
            <CardDescription>LXC service</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-success">Healthy</p>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};

export const DataAttributes: Story = {
  render: () => (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Test</CardTitle>
      </CardHeader>
      <CardContent>Content</CardContent>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvasElement.querySelector('[data-slot="card"]');
    const header = canvasElement.querySelector('[data-slot="card-header"]');
    const title = canvasElement.querySelector('[data-slot="card-title"]');
    const content = canvasElement.querySelector('[data-slot="card-content"]');

    await expect(card).toBeInTheDocument();
    await expect(header).toBeInTheDocument();
    await expect(title).toBeInTheDocument();
    await expect(content).toBeInTheDocument();
    await expect(canvas.getByText('Test')).toBeInTheDocument();
  },
};
