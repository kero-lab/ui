import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { http, HttpResponse, delay } from 'msw';
import { useState } from 'react';
import { faker } from '@faker-js/faker';
import { DataPanel } from './data-panel';
import {
  ExpandableRow,
  ExpandableRowTrigger,
  ExpandableRowContent,
} from './expandable-row';
import { ResponsiveCard } from './responsive-card';
import { Sparkline } from './sparkline';
import {
  StepWizard,
  StepWizardIndicator,
  StepWizardContent,
  StepWizardActions,
} from './step-wizard';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from './table';
import { Badge } from './badge';
// --- Deterministic mock data ---

faker.seed(42);

interface ServiceRow {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  metrics: Array<{
    title: string;
    value: string;
    icon: string;
    sparkline: number[];
  }>;
}

const DASHBOARD_ROWS: ServiceRow[] = [
  {
    id: 'svc-1',
    name: 'API Gateway',
    status: 'healthy',
    metrics: [
      { title: 'CPU', value: '45%', icon: '⚡', sparkline: faker.helpers.multiple(() => faker.number.int({ min: 30, max: 60 }), { count: 12 }) },
      { title: 'Memory', value: '1.2G', icon: '💾', sparkline: faker.helpers.multiple(() => faker.number.int({ min: 50, max: 70 }), { count: 12 }) },
      { title: 'Latency', value: '12ms', icon: '⏱', sparkline: faker.helpers.multiple(() => faker.number.int({ min: 5, max: 20 }), { count: 12 }) },
    ],
  },
  {
    id: 'svc-2',
    name: 'Auth Service',
    status: 'healthy',
    metrics: [
      { title: 'CPU', value: '22%', icon: '⚡', sparkline: faker.helpers.multiple(() => faker.number.int({ min: 15, max: 35 }), { count: 12 }) },
      { title: 'Memory', value: '0.8G', icon: '💾', sparkline: faker.helpers.multiple(() => faker.number.int({ min: 40, max: 55 }), { count: 12 }) },
      { title: 'Latency', value: '8ms', icon: '⏱', sparkline: faker.helpers.multiple(() => faker.number.int({ min: 3, max: 15 }), { count: 12 }) },
    ],
  },
  {
    id: 'svc-3',
    name: 'Media Server',
    status: 'degraded',
    metrics: [
      { title: 'CPU', value: '87%', icon: '⚡', sparkline: faker.helpers.multiple(() => faker.number.int({ min: 70, max: 95 }), { count: 12 }) },
      { title: 'Memory', value: '3.1G', icon: '💾', sparkline: faker.helpers.multiple(() => faker.number.int({ min: 75, max: 90 }), { count: 12 }) },
      { title: 'Latency', value: '145ms', icon: '⏱', sparkline: faker.helpers.multiple(() => faker.number.int({ min: 80, max: 200 }), { count: 12 }) },
    ],
  },
];

const DASHBOARD_ITEMS = [
  { id: 'd-1', name: 'API Gateway', category: 'Services', value: 42 },
  { id: 'd-2', name: 'Auth Service', category: 'Services', value: 38 },
  { id: 'd-3', name: 'Media Server', category: 'Media', value: 67 },
  { id: 'd-4', name: 'DNS Resolver', category: 'Core', value: 12 },
];

const WIZARD_STEPS = [
  { id: 'select', label: 'Select' },
  { id: 'configure', label: 'Configure' },
  { id: 'publish', label: 'Publish' },
];

// --- Shared MSW handlers ---

function dashboardHandlers(opts?: { empty?: boolean }) {
  return [
    http.get('/api/dashboard/items', ({ request }) => {
      if (opts?.empty) return HttpResponse.json([]);
      const url = new URL(request.url);
      const q = url.searchParams.get('q')?.toLowerCase() ?? '';
      if (!q) return HttpResponse.json(DASHBOARD_ITEMS);
      return HttpResponse.json(
        DASHBOARD_ITEMS.filter(
          (i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
        )
      );
    }),
    http.post('/api/dashboard/items', async ({ request }) => {
      const body = await request.json() as Record<string, string>;
      await delay(100);
      return HttpResponse.json(
        { id: 'new-1', name: body.name, category: body.category || 'Uncategorized', value: 0 },
        { status: 201 },
      );
    }),
    http.post('/api/dashboard/publish', async () => {
      await delay(150);
      return HttpResponse.json({ success: true });
    }),
  ];
}

// --- Dashboard layout ---

function ServiceTable({ rows }: { rows: ServiceRow[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Service</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Metrics</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <ExpandableRow
            key={row.id}
            open={openId === row.id}
            onOpenChange={(open) => setOpenId(open ? row.id : null)}
          >
            <ExpandableRowTrigger>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    row.status === 'healthy' ? 'default' :
                    row.status === 'degraded' ? 'secondary' : 'destructive'
                  }
                >
                  {row.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-muted-foreground text-sm">
                {row.metrics.length} metrics
              </TableCell>
            </ExpandableRowTrigger>
            <ExpandableRowContent colSpan={3}>
              <div className="grid grid-cols-3 gap-3">
                {row.metrics.map((m) => (
                  <ResponsiveCard
                    key={m.title}
                    title={m.title}
                    value={m.value}
                    icon={<span className="text-lg">{m.icon}</span>}
                    detail={
                      <Sparkline
                        data={m.sparkline}
                        width={120}
                        height={28}
                        variant={
                          m.title === 'CPU' && parseInt(m.value) > 80 ? 'danger' :
                          m.title === 'Latency' && parseInt(m.value) > 100 ? 'warning' :
                          'default'
                        }
                      />
                    }
                  />
                ))}
              </div>
            </ExpandableRowContent>
          </ExpandableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// --- Meta ---

const meta = {
  title: 'Integration/Dashboard',
  tags: ['autodocs', 'lifecycle:stress-test'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Full dashboard — all three panels composed together */
export const FullDashboard: Story = {
  parameters: {
    msw: { handlers: dashboardHandlers() },
  },
  render: () => (
    <div className="flex flex-col gap-6 max-w-4xl">
      <h2 className="text-lg font-semibold">Service Dashboard</h2>
      <div className="grid grid-cols-[1fr_2fr] gap-6">
        {/* Left: DataPanel */}
        <DataPanel apiBase="/api/dashboard" searchDebounceMs={0} />
        {/* Right: Service table with expandable metrics */}
        <ServiceTable rows={DASHBOARD_ROWS} />
      </div>
      {/* Bottom: Publish wizard */}
      <StepWizard steps={WIZARD_STEPS}>
        <StepWizardIndicator />
        <StepWizardContent>
          <div className="rounded-lg border p-4">Select services to publish.</div>
          <div className="rounded-lg border p-4">Configure deployment settings.</div>
          <div className="rounded-lg border p-4">Review and publish.</div>
        </StepWizardContent>
        <StepWizardActions />
      </StepWizard>
    </div>
  ),
};

/** Search and expand — cross-component play() sequence */
export const SearchAndExpand: Story = {
  parameters: {
    msw: { handlers: dashboardHandlers() },
  },
  render: () => (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="grid grid-cols-[1fr_2fr] gap-6">
        <DataPanel apiBase="/api/dashboard" searchDebounceMs={0} />
        <ServiceTable rows={DASHBOARD_ROWS} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // 1. Wait for DataPanel items to load
    await waitFor(() => {
      const items = canvasElement.querySelectorAll('[data-slot="data-panel-item"]');
      expect(items.length).toBe(4);
    });

    // 2. Search for "gateway" in DataPanel
    const search = canvasElement.querySelector('[data-slot="data-panel-search"] input')!;
    await userEvent.type(search, 'gateway');

    await waitFor(() => {
      const items = canvasElement.querySelectorAll('[data-slot="data-panel-item"]');
      expect(items.length).toBe(1);
    });

    // 3. Click first ExpandableRow trigger in the table
    const trigger = canvasElement.querySelector('[data-slot="expandable-row"]')!;
    await userEvent.click(trigger);

    // 4. Verify expanded — content is open
    await waitFor(() => {
      const content = canvasElement.querySelector('[data-slot="expandable-row-content"]');
      expect(content).not.toBeNull();
      expect(content!.getAttribute('data-state')).toBe('open');
    });

    // 5. Verify ResponsiveCards appear inside expanded row
    const cards = canvasElement.querySelectorAll('[data-slot="responsive-card"]');
    await expect(cards.length).toBeGreaterThanOrEqual(3);

    // 6. Verify Sparkline exists inside a card
    const sparklines = canvasElement.querySelectorAll('[data-slot="sparkline"]');
    await expect(sparklines.length).toBeGreaterThanOrEqual(1);

    // 7. Collapse
    await userEvent.click(trigger);
    await waitFor(() => {
      const content = canvasElement.querySelector('[data-slot="expandable-row-content"]');
      expect(content!.getAttribute('data-state')).toBe('closed');
    });

    // 8. Clear search
    await userEvent.clear(search);
    await waitFor(() => {
      const items = canvasElement.querySelectorAll('[data-slot="data-panel-item"]');
      expect(items.length).toBe(4);
    });
  },
};

/** Wizard flow — advance through all steps and submit */
export const WizardFlow: Story = {
  parameters: {
    msw: { handlers: dashboardHandlers() },
  },
  render: () => (
    <div className="max-w-md">
      <StepWizard steps={WIZARD_STEPS}>
        <StepWizardIndicator />
        <StepWizardContent>
          <div data-testid="step-select">Select services</div>
          <div data-testid="step-configure">Configure settings</div>
          <div data-testid="step-publish">Ready to publish</div>
        </StepWizardContent>
        <StepWizardActions />
      </StepWizard>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const content = canvasElement.querySelector('[data-slot="step-wizard-content"]')!;

    // Step 1
    await expect(content.textContent).toBe('Select services');

    // Advance to step 2
    const next = canvasElement.querySelector('[data-slot="step-wizard-next"]')!;
    await userEvent.click(next);
    await expect(content.textContent).toBe('Configure settings');

    // Advance to step 3
    await userEvent.click(canvasElement.querySelector('[data-slot="step-wizard-next"]')!);
    await expect(content.textContent).toBe('Ready to publish');

    // Submit button should now be visible
    const submit = canvasElement.querySelector('[data-slot="step-wizard-submit"]')!;
    await expect(submit).toBeInTheDocument();

    // All step indicators before current should be completed
    const steps = canvasElement.querySelectorAll('[data-slot="step-wizard-step"]');
    await expect(steps[0].getAttribute('data-status')).toBe('completed');
    await expect(steps[1].getAttribute('data-status')).toBe('completed');
    await expect(steps[2].getAttribute('data-status')).toBe('current');
  },
};

/** Accordion table — only one row open at a time */
export const AccordionTable: Story = {
  parameters: {
    msw: { handlers: dashboardHandlers() },
  },
  render: () => (
    <div className="max-w-3xl">
      <ServiceTable rows={DASHBOARD_ROWS} />
    </div>
  ),
};

/** Empty states — MSW returns empty for all endpoints */
export const EmptyStates: Story = {
  parameters: {
    msw: { handlers: dashboardHandlers({ empty: true }) },
  },
  render: () => (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="grid grid-cols-[1fr_2fr] gap-6">
        <DataPanel apiBase="/api/dashboard" searchDebounceMs={0} />
        <div className="text-sm text-muted-foreground p-4 border rounded-lg">
          No services found.
        </div>
      </div>
      <StepWizard steps={WIZARD_STEPS}>
        <StepWizardIndicator />
        <StepWizardContent>
          <div>Nothing to select.</div>
          <div>Nothing to configure.</div>
          <div>Nothing to publish.</div>
        </StepWizardContent>
        <StepWizardActions />
      </StepWizard>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // DataPanel shows 0 items
    await waitFor(() => {
      const status = canvasElement.querySelector('[data-slot="data-panel-status"]')!;
      expect(status.textContent).toBe('0 items');
    });
  },
};
