import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse, delay } from 'msw';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';

/**
 * Demo story showing MSW per-story API mocking patterns.
 * Each story variant provides different mock handlers to simulate
 * empty, error, loading, and loaded states.
 */

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: string;
}

/** Example component that fetches data from an API */
function ServiceStatusCard() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/services')
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Card className="w-80">
        <CardHeader>
          <CardTitle className="text-sm">Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-80 border-destructive">
        <CardHeader>
          <CardTitle className="text-sm">Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (services.length === 0) {
    return (
      <Card className="w-80">
        <CardHeader>
          <CardTitle className="text-sm">Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No services found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="text-sm">Service Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {services.map((svc) => (
            <li key={svc.name} className="flex items-center justify-between text-sm">
              <span>{svc.name}</span>
              <Badge
                variant={
                  svc.status === 'healthy'
                    ? 'default'
                    : svc.status === 'degraded'
                      ? 'secondary'
                      : 'destructive'
                }
              >
                {svc.status}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

const meta: Meta<typeof ServiceStatusCard> = {
  title: 'Recipes/MSW Mocking',
  component: ServiceStatusCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Loaded state — API returns service data */
export const Loaded: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/services', () =>
          HttpResponse.json([
            { name: 'Traefik', status: 'healthy', uptime: '14d 3h' },
            { name: 'Jellyfin', status: 'healthy', uptime: '7d 12h' },
            { name: 'Grafana', status: 'degraded', uptime: '2h 15m' },
            { name: 'Ollama', status: 'down', uptime: '0m' },
          ] satisfies ServiceStatus[]),
        ),
      ],
    },
  },
};

/** Empty state — API returns empty array */
export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/services', () => HttpResponse.json([])),
      ],
    },
  },
};

/** Error state — API returns 500 */
export const ServerError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/services', () =>
          HttpResponse.json({ error: 'Internal server error' }, { status: 500 }),
        ),
      ],
    },
  },
};

/** Loading state — API responds after a long delay */
export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/services', async () => {
          await delay('infinite');
          return HttpResponse.json([]);
        }),
      ],
    },
  },
};
