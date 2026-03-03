import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { useState } from 'react';
import {
  ExpandableRow,
  ExpandableRowTrigger,
  ExpandableRowContent,
} from './expandable-row';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
import { Skeleton } from './skeleton';
import { Badge } from './badge';
const meta = {
  title: 'Components/ExpandableRow',
  tags: ['autodocs', 'lifecycle:prototype'],
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const sampleData = [
  { name: 'api-gateway', status: 'healthy', uptime: '99.9%', detail: 'Last restarted 3 days ago. Handling 1.2k req/s.' },
  { name: 'postgres', status: 'warning', uptime: '99.5%', detail: 'High connection count (85/100). Consider pooling.' },
  { name: 'redis', status: 'healthy', uptime: '100%', detail: 'Memory usage 45%. No evictions.' },
];

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Service</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Uptime</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleData.map((row) => (
          <ExpandableRow key={row.name}>
            <ExpandableRowTrigger>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell>
                <Badge variant={row.status === 'healthy' ? 'default' : 'secondary'}>
                  {row.status}
                </Badge>
              </TableCell>
              <TableCell>{row.uptime}</TableCell>
            </ExpandableRowTrigger>
            <ExpandableRowContent colSpan={3}>
              <p className="text-sm text-muted-foreground">{row.detail}</p>
            </ExpandableRowContent>
          </ExpandableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const DefaultOpen: Story = {
  render: () => (
    <Table>
      <TableBody>
        <ExpandableRow defaultOpen>
          <ExpandableRowTrigger>
            <TableCell className="font-medium">api-gateway</TableCell>
            <TableCell>healthy</TableCell>
          </ExpandableRowTrigger>
          <ExpandableRowContent colSpan={2}>
            <p className="text-sm text-muted-foreground">
              Last restarted 3 days ago. Handling 1.2k req/s.
            </p>
          </ExpandableRowContent>
        </ExpandableRow>
      </TableBody>
    </Table>
  ),
};

export const WithSkeleton: Story = {
  render: () => (
    <Table>
      <TableBody>
        <ExpandableRow defaultOpen>
          <ExpandableRowTrigger>
            <TableCell className="font-medium">Loading service...</TableCell>
            <TableCell>—</TableCell>
          </ExpandableRowTrigger>
          <ExpandableRowContent colSpan={2}>
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </ExpandableRowContent>
        </ExpandableRow>
      </TableBody>
    </Table>
  ),
};

export const Accordion: Story = {
  render: function AccordionStory() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Uptime</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sampleData.map((row, i) => (
            <ExpandableRow
              key={row.name}
              open={openIndex === i}
              onOpenChange={(open) => setOpenIndex(open ? i : null)}
            >
              <ExpandableRowTrigger>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.uptime}</TableCell>
              </ExpandableRowTrigger>
              <ExpandableRowContent colSpan={3}>
                <p className="text-sm text-muted-foreground">{row.detail}</p>
              </ExpandableRowContent>
            </ExpandableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
};

export const ToggleInteraction: Story = {
  render: () => (
    <Table>
      <TableBody>
        <ExpandableRow>
          <ExpandableRowTrigger>
            <TableCell>Click me</TableCell>
          </ExpandableRowTrigger>
          <ExpandableRowContent colSpan={1}>
            <p>Detail content</p>
          </ExpandableRowContent>
        </ExpandableRow>
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector('[data-slot="expandable-row"]')!;
    const content = canvasElement.querySelector('[data-slot="expandable-row-content"]')!;

    await expect(row).toHaveAttribute('data-state', 'closed');
    await expect(content).toHaveAttribute('aria-hidden', 'true');

    await userEvent.click(row);

    await expect(row).toHaveAttribute('data-state', 'open');
    await expect(row).toHaveAttribute('aria-expanded', 'true');
    await expect(content).toHaveAttribute('aria-hidden', 'false');

    await userEvent.click(row);

    await expect(row).toHaveAttribute('data-state', 'closed');
  },
};

export const KeyboardNavigation: Story = {
  render: () => (
    <Table>
      <TableBody>
        <ExpandableRow>
          <ExpandableRowTrigger>
            <TableCell>Press Enter or Space</TableCell>
          </ExpandableRowTrigger>
          <ExpandableRowContent colSpan={1}>
            <p>Keyboard-opened content</p>
          </ExpandableRowContent>
        </ExpandableRow>
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector('[data-slot="expandable-row"]') as HTMLElement;

    row.focus();
    await userEvent.keyboard('{Enter}');
    await expect(row).toHaveAttribute('data-state', 'open');

    await userEvent.keyboard(' ');
    await expect(row).toHaveAttribute('data-state', 'closed');
  },
};

export const DataAttributes: Story = {
  render: () => (
    <Table>
      <TableBody>
        <ExpandableRow>
          <ExpandableRowTrigger>
            <TableCell>Row</TableCell>
          </ExpandableRowTrigger>
          <ExpandableRowContent colSpan={1}>
            <p>Detail</p>
          </ExpandableRowContent>
        </ExpandableRow>
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector('[data-slot="expandable-row"]');
    const content = canvasElement.querySelector('[data-slot="expandable-row-content"]');
    const panel = canvasElement.querySelector('[data-slot="expandable-row-panel"]');

    await expect(row).toBeInTheDocument();
    await expect(content).toBeInTheDocument();
    await expect(panel).toBeInTheDocument();
  },
};
