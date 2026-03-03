import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Badge } from './badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from './table';
const meta = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs', 'lifecycle:stable'],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const services = [
  { name: 'Traefik', host: 'Core (200)', port: 443, status: 'Running' },
  { name: 'Pi-hole', host: 'Core (200)', port: 53, status: 'Running' },
  { name: 'Jellyfin', host: 'Media (201)', port: 8096, status: 'Running' },
  { name: 'Grafana', host: 'Monitoring (202)', port: 3000, status: 'Running' },
  { name: 'Pterodactyl', host: 'Gaming (203)', port: 80, status: 'Stopped' },
];

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Service</TableHead>
          <TableHead>Host</TableHead>
          <TableHead>Port</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {services.map((svc) => (
          <TableRow key={svc.name}>
            <TableCell className="font-medium">{svc.name}</TableCell>
            <TableCell>{svc.host}</TableCell>
            <TableCell>{svc.port}</TableCell>
            <TableCell>
              <Badge variant={svc.status === 'Running' ? 'success' : 'destructive'}>
                {svc.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithCaption: Story = {
  render: () => (
    <Table>
      <TableCaption>Lab services as of last deploy</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Service</TableHead>
          <TableHead>Host</TableHead>
          <TableHead className="text-right">Port</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {services.slice(0, 3).map((svc) => (
          <TableRow key={svc.name}>
            <TableCell className="font-medium">{svc.name}</TableCell>
            <TableCell>{svc.host}</TableCell>
            <TableCell className="text-right">{svc.port}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Service</TableHead>
          <TableHead>Host</TableHead>
          <TableHead className="text-right">Port</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {services.map((svc) => (
          <TableRow key={svc.name}>
            <TableCell className="font-medium">{svc.name}</TableCell>
            <TableCell>{svc.host}</TableCell>
            <TableCell className="text-right">{svc.port}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total services</TableCell>
          <TableCell className="text-right">{services.length}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const SelectedRow: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Service</TableHead>
          <TableHead>Host</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {services.map((svc, i) => (
          <TableRow key={svc.name} data-state={i === 2 ? 'selected' : undefined}>
            <TableCell className="font-medium">{svc.name}</TableCell>
            <TableCell>{svc.host}</TableCell>
            <TableCell>
              <Badge variant={svc.status === 'Running' ? 'success' : 'destructive'}>
                {svc.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const DataAttributes: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Test</TableCell>
          <TableCell>Data</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole('table');

    await expect(table).toBeInTheDocument();
    await expect(table).toHaveAttribute('data-slot', 'table');

    const headers = canvas.getAllByRole('columnheader');
    await expect(headers[0]).toHaveAttribute('data-slot', 'table-head');

    const cells = canvas.getAllByRole('cell');
    await expect(cells[0]).toHaveAttribute('data-slot', 'table-cell');
  },
};
