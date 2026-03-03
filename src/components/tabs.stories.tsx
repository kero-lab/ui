import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs', 'lifecycle:stable'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="metrics">Metrics</TabsTrigger>
        <TabsTrigger value="logs">Logs</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-sm text-muted-foreground p-2">Service overview and health status.</p>
      </TabsContent>
      <TabsContent value="metrics">
        <p className="text-sm text-muted-foreground p-2">Performance metrics and graphs.</p>
      </TabsContent>
      <TabsContent value="logs">
        <p className="text-sm text-muted-foreground p-2">Recent log entries.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const TwoTabs: Story = {
  render: () => (
    <Tabs defaultValue="active" className="w-[300px]">
      <TabsList>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="archived">Archived</TabsTrigger>
      </TabsList>
      <TabsContent value="active">
        <p className="text-sm text-muted-foreground p-2">Active items here.</p>
      </TabsContent>
      <TabsContent value="archived">
        <p className="text-sm text-muted-foreground p-2">Archived items here.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const WithDisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="general" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="advanced" disabled>Advanced</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <p className="text-sm text-muted-foreground p-2">General settings.</p>
      </TabsContent>
      <TabsContent value="security">
        <p className="text-sm text-muted-foreground p-2">Security settings.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const SwitchInteraction: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="tab1">First</TabsTrigger>
        <TabsTrigger value="tab2">Second</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p className="p-2">First tab content</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p className="p-2">Second tab content</p>
      </TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('First tab content')).toBeVisible();

    const secondTab = canvas.getByRole('tab', { name: 'Second' });
    await userEvent.click(secondTab);

    await expect(canvas.getByText('Second tab content')).toBeVisible();
  },
};
