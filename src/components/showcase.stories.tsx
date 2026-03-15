import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';

// Base components
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './card';
import { Checkbox } from './checkbox';
import { Input } from './input';
import { Label } from './label';
import { Separator } from './separator';
import { Skeleton } from './skeleton';
import { Slider } from './slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from './table';

// Prototype components
import { Sparkline, SparklineGrid } from './sparkline';
import {
  ExpandableRow,
  ExpandableRowTrigger,
  ExpandableRowContent,
} from './expandable-row';
import { ResponsiveCard } from './responsive-card';

// Stress-test components
import {
  StepWizard,
  StepWizardIndicator,
  StepWizardContent,
  StepWizardActions,
} from './step-wizard';
import { DataPanel } from './data-panel';
import { EventCard, EventCardSummary, EventCardDetail } from './event-card';
import { EventTimeline } from './event-timeline';
import type { TimelineItem } from './event-timeline';
faker.seed(42);

const meta = {
  title: 'Overview/Showcase',
  tags: ['autodocs', 'lifecycle:stable'],
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        http.get('/api/showcase/items', () =>
          HttpResponse.json([
            { id: '1', name: 'Traefik', category: 'Core', value: 42 },
            { id: '2', name: 'Jellyfin', category: 'Media', value: 38 },
            { id: '3', name: 'Grafana', category: 'Monitoring', value: 67 },
          ])
        ),
        http.post('/api/showcase/items', async ({ request }) => {
          const body = await request.json() as Record<string, string>;
          return HttpResponse.json(
            { id: 'new', name: body.name, category: body.category || 'Other', value: 0 },
            { status: 201 },
          );
        }),
      ],
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
      <Separator />
      <div>{children}</div>
    </div>
  );
}

/** All @remlab/ui components at a glance */
export const AllComponents: Story = {
  render: function ShowcaseStory() {
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    return (
      <div className="p-8 max-w-5xl mx-auto space-y-10">
        <div>
          <h1 className="text-2xl font-bold">@remlab/ui Component Showcase</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {new Date().toLocaleDateString()} — 25 components, 135 unit tests, 12 visual regression baselines
          </p>
        </div>

        {/* --- Primitives --- */}
        <Section title="Buttons & Badges">
          <div className="flex flex-wrap gap-3 items-center">
            <Button>Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button size="sm">Small</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </Section>

        {/* --- Form controls --- */}
        <Section title="Form Controls">
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="showcase-input">Email</Label>
              <Input id="showcase-input" placeholder="user@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Volume</Label>
              <Slider defaultValue={[65]} className="mt-3" />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <Checkbox id="showcase-check" defaultChecked />
              <Label htmlFor="showcase-check">Accept terms</Label>
            </div>
          </div>
        </Section>

        {/* --- Cards & Layout --- */}
        <Section title="Cards & Tabs">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
                <CardDescription>Current infrastructure status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span>CPU Usage</span>
                  <Badge variant="secondary">45%</Badge>
                </div>
              </CardContent>
            </Card>
            <Tabs defaultValue="metrics">
              <TabsList>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
              </TabsList>
              <TabsContent value="metrics" className="border rounded-lg p-4 mt-2">
                <p className="text-sm text-muted-foreground">Metrics dashboard content</p>
              </TabsContent>
              <TabsContent value="logs" className="border rounded-lg p-4 mt-2">
                <p className="text-sm text-muted-foreground">Log viewer content</p>
              </TabsContent>
            </Tabs>
          </div>
        </Section>

        {/* --- Skeletons & Tooltips --- */}
        <Section title="Feedback">
          <div className="flex items-center gap-6">
            <div className="space-y-2 w-48">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover me</Button>
                </TooltipTrigger>
                <TooltipContent>Tooltip content here</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </Section>

        <Separator className="my-2" />

        {/* --- Sparklines --- */}
        <Section title="Sparkline (Prototype)">
          <div className="flex items-end gap-6">
            <div>
              <span className="text-xs text-muted-foreground">Default</span>
              <Sparkline data={[30, 40, 35, 50, 49, 60, 70, 55, 65]} width={140} height={36} />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Success</span>
              <Sparkline data={[10, 20, 30, 40, 50, 55, 60, 65, 70]} variant="success" width={140} height={36} />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Warning</span>
              <Sparkline data={[50, 45, 55, 40, 60, 35, 65, 30, 70]} variant="warning" width={140} height={36} />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Danger</span>
              <Sparkline data={[70, 65, 75, 80, 85, 90, 88, 92, 95]} variant="danger" width={140} height={36} />
            </div>
          </div>
          <div className="mt-4">
            <SparklineGrid
              items={[
                { label: 'CPU', data: [30, 40, 35, 50, 45, 55, 60], variant: 'default' },
                { label: 'Memory', data: [60, 62, 58, 65, 63, 67, 70], variant: 'warning' },
                { label: 'Disk I/O', data: [10, 15, 12, 18, 14, 20, 16], variant: 'success' },
              ]}
              columns={3}
            />
          </div>
        </Section>

        {/* --- ExpandableRow --- */}
        <Section title="ExpandableRow (Prototype)">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Uptime</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { id: 'traefik', name: 'Traefik', status: 'healthy', uptime: '14d 3h' },
                { id: 'jellyfin', name: 'Jellyfin', status: 'degraded', uptime: '2h 15m' },
              ].map((svc) => (
                <ExpandableRow
                  key={svc.id}
                  open={expandedRow === svc.id}
                  onOpenChange={(open) => setExpandedRow(open ? svc.id : null)}
                >
                  <ExpandableRowTrigger>
                    <TableCell className="font-medium">{svc.name}</TableCell>
                    <TableCell>
                      <Badge variant={svc.status === 'healthy' ? 'default' : 'secondary'}>
                        {svc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{svc.uptime}</TableCell>
                  </ExpandableRowTrigger>
                  <ExpandableRowContent colSpan={3}>
                    <div className="grid grid-cols-3 gap-3">
                      <ResponsiveCard title="CPU" value="45%" icon={<span>⚡</span>}
                        detail={<Sparkline data={[30, 40, 35, 45, 42, 48, 45]} width={100} height={24} />}
                      />
                      <ResponsiveCard title="Memory" value="1.2G" icon={<span>💾</span>}
                        detail={<Sparkline data={[60, 61, 59, 62, 63, 61, 62]} width={100} height={24} variant="warning" />}
                      />
                      <ResponsiveCard title="Latency" value="12ms" icon={<span>⏱</span>}
                        detail={<Sparkline data={[10, 11, 9, 14, 12, 13, 12]} width={100} height={24} variant="success" />}
                      />
                    </div>
                  </ExpandableRowContent>
                </ExpandableRow>
              ))}
            </TableBody>
          </Table>
        </Section>

        {/* --- ResponsiveCard at different sizes --- */}
        <Section title="ResponsiveCard (Prototype)">
          <div className="grid grid-cols-4 gap-4">
            <div style={{ width: 60 }}>
              <ResponsiveCard title="CPU" value="45%" icon={<span>⚡</span>} />
            </div>
            <div style={{ width: 140 }}>
              <ResponsiveCard title="CPU" value="45%" icon={<span>⚡</span>} />
            </div>
            <div style={{ width: 220 }}>
              <ResponsiveCard title="CPU" value="45%" icon={<span>⚡</span>} />
            </div>
            <div style={{ width: 320 }}>
              <ResponsiveCard title="CPU" value="45%" icon={<span>⚡</span>}
                detail={<Sparkline data={[30, 40, 35, 50, 45, 55]} width={100} height={24} />}
              />
            </div>
          </div>
        </Section>

        <Separator className="my-2" />

        {/* --- StepWizard --- */}
        <Section title="StepWizard (Stress Test)">
          <StepWizard steps={[
            { id: 'select', label: 'Select' },
            { id: 'configure', label: 'Configure' },
            { id: 'review', label: 'Review' },
          ]}>
            <StepWizardIndicator />
            <StepWizardContent>
              <Card><CardContent className="pt-4"><p className="text-sm">Select services to deploy.</p></CardContent></Card>
              <Card><CardContent className="pt-4"><p className="text-sm">Configure deployment settings.</p></CardContent></Card>
              <Card><CardContent className="pt-4"><p className="text-sm">Review and confirm.</p></CardContent></Card>
            </StepWizardContent>
            <StepWizardActions />
          </StepWizard>
        </Section>

        {/* --- DataPanel --- */}
        <Section title="DataPanel (Stress Test — MSW-backed)">
          <div className="max-w-md">
            <DataPanel apiBase="/api/showcase" searchDebounceMs={150} />
          </div>
        </Section>

        <Separator className="my-2" />

        {/* --- EventCard --- */}
        <Section title="EventCard (Prototype — Activity River Phase 3)">
          <div className="flex gap-3 flex-wrap">
            {[
              { name: 'Anthropic', color: '#D97757', model: 'claude-haiku-4.5', sig: 'high' as const },
              { name: 'OpenAI', color: '#10A37F', model: 'gpt-4o', sig: 'medium' as const },
              { name: 'Ollama', color: '#888888', model: 'andy-4', sig: 'low' as const },
            ].map((p) => (
              <EventCard key={p.name} accentColor={p.color} significance={p.sig}>
                <EventCardSummary>
                  <div className="text-xs font-medium text-white/80">{p.name}</div>
                  <div className="mt-1 text-xs text-white/50">{p.model}</div>
                </EventCardSummary>
                <EventCardDetail>
                  <div className="text-xs text-white/60">Token details, cost, tools...</div>
                </EventCardDetail>
              </EventCard>
            ))}
          </div>
        </Section>

        <Separator className="my-2" />

        {/* --- EventTimeline --- */}
        <Section title="EventTimeline (Prototype — Activity River Phase 3)">
          {(() => {
            const base = Date.now();
            const HOUR = 60 * 60 * 1000;
            const MIN = 60 * 1000;
            const items: (TimelineItem & { id: string; label: string; color: string })[] = [
              { id: '1', timestamp: base, label: 'Chat', color: '#D97757' },
              { id: '2', timestamp: base + 15 * MIN, label: 'Eval', color: '#22c55e' },
              { id: '3', timestamp: base + 30 * MIN, label: 'Chat', color: '#10A37F' },
              { id: '4', timestamp: base + 4 * HOUR, label: 'Chat', color: '#D97757' },
              { id: '5', timestamp: base + 4 * HOUR + 10 * MIN, label: 'Eval', color: '#22c55e' },
            ];
            return (
              <EventTimeline
                items={items}
                renderItem={(item) => (
                  <EventCard accentColor={item.color} significance="medium">
                    <EventCardSummary>
                      <div className="text-xs font-medium text-white/80">{item.label}</div>
                      <div className="text-[10px] text-white/40">{new Date(item.timestamp).toLocaleTimeString()}</div>
                    </EventCardSummary>
                  </EventCard>
                )}
              />
            );
          })()}
        </Section>
      </div>
    );
  },
};
