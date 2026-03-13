import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { http, HttpResponse, delay } from 'msw';
import { DataPanel } from './data-panel';
import type { DataItem } from './data-panel';
const MOCK_ITEMS: DataItem[] = [
  { id: '1', name: 'API Gateway', category: 'Services', value: 42 },
  { id: '2', name: 'Auth Service', category: 'Services', value: 38 },
  { id: '3', name: 'Widget Factory', category: 'Tools', value: 15 },
  { id: '4', name: 'Data Pipeline', category: 'Services', value: 67 },
  { id: '5', name: 'Log Aggregator', category: 'Monitoring', value: 23 },
];

const meta = {
  title: 'Components/DataPanel',
  component: DataPanel,
  tags: ['autodocs', 'lifecycle:stress-test'],
  args: {
    searchDebounceMs: 0, // Disable debounce by default for fast play() tests
  },
} satisfies Meta<typeof DataPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Standard loaded state — GET returns 5 items */
export const Loaded: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/data-panel/items', () => HttpResponse.json(MOCK_ITEMS)),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const items = canvasElement.querySelectorAll('[data-slot="data-panel-item"]');
      expect(items.length).toBe(5);
    });
    const status = canvasElement.querySelector('[data-slot="data-panel-status"]')!;
    await expect(status.textContent).toBe('5 items');
  },
};

/** Search filter — GET handler inspects query param, debounce is real (300ms) */
export const SearchFilter: Story = {
  args: {
    searchDebounceMs: 100, // Short debounce for testing
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/api/data-panel/items', ({ request }) => {
          const url = new URL(request.url);
          const q = url.searchParams.get('q')?.toLowerCase() ?? '';
          if (!q) return HttpResponse.json(MOCK_ITEMS);
          const filtered = MOCK_ITEMS.filter(
            (i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
          );
          return HttpResponse.json(filtered);
        }),
      ],
    },
  },
  play: async ({ canvasElement, step }) => {
    await step('Wait for initial load', async () => {
      await waitFor(() => {
        const items = canvasElement.querySelectorAll('[data-slot="data-panel-item"]');
        expect(items.length).toBe(5);
      });
    });

    await step('Type search term and verify filter', async () => {
      const search = canvasElement.querySelector('[data-slot="data-panel-search"] input')!;
      await userEvent.clear(search);
      await userEvent.type(search, 'gateway');

      await waitFor(() => {
        const items = canvasElement.querySelectorAll('[data-slot="data-panel-item"]');
        expect(items.length).toBe(1);
      }, { timeout: 3000 });

      const item = canvasElement.querySelector('[data-slot="data-panel-item"]')!;
      await expect(item.textContent).toContain('API Gateway');
    });

    await step('Clear search and verify all items return', async () => {
      const search = canvasElement.querySelector('[data-slot="data-panel-search"] input')!;
      await userEvent.clear(search);
      await waitFor(() => {
        const items = canvasElement.querySelectorAll('[data-slot="data-panel-item"]');
        expect(items.length).toBe(5);
      }, { timeout: 3000 });
    });
  },
};

/** Optimistic create — POST with delay, item appears immediately */
export const OptimisticCreate: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/data-panel/items', () => HttpResponse.json(MOCK_ITEMS.slice(0, 3))),
        http.post('/api/data-panel/items', async ({ request }) => {
          const body = await request.json() as Record<string, string>;
          await delay(200);
          return HttpResponse.json(
            { id: 'new-1', name: body.name, category: body.category || 'Uncategorized', value: 0 },
            { status: 201 },
          );
        }),
      ],
    },
  },
  play: async ({ canvasElement, step }) => {
    await step('Wait for initial 3 items', async () => {
      await waitFor(() => {
        const items = canvasElement.querySelectorAll('[data-slot="data-panel-item"]');
        expect(items.length).toBe(3);
      });
    });

    await step('Fill create form and submit', async () => {
      const nameInput = canvasElement.querySelector('[data-slot="data-panel-create-name"]')! as HTMLInputElement;
      const categoryInput = canvasElement.querySelector('[data-slot="data-panel-create-category"]')! as HTMLInputElement;
      const submit = canvasElement.querySelector('[data-slot="data-panel-submit"]')!;

      await userEvent.type(nameInput, 'New Service');
      await userEvent.type(categoryInput, 'Custom');
      await userEvent.click(submit);
    });

    await step('Verify optimistic item appears immediately', async () => {
      await waitFor(() => {
        const items = canvasElement.querySelectorAll('[data-slot="data-panel-item"]');
        expect(items.length).toBe(4);
      });

      const optimistic = canvasElement.querySelector('[data-optimistic="true"]');
      await expect(optimistic).not.toBeNull();
    });

    await step('Wait for POST to resolve — optimistic flag removed', async () => {
      await waitFor(() => {
        const opt = canvasElement.querySelector('[data-optimistic="true"]');
        expect(opt).toBeNull();
      }, { timeout: 3000 });

      const items = canvasElement.querySelectorAll('[data-slot="data-panel-item"]');
      await expect(items.length).toBe(4);
    });
  },
};

/** Optimistic revert — POST returns 500, optimistic item is removed */
export const OptimisticRevert: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/data-panel/items', () => HttpResponse.json(MOCK_ITEMS.slice(0, 3))),
        http.post('/api/data-panel/items', async () => {
          await delay(100);
          return HttpResponse.json({ error: 'Conflict' }, { status: 409 });
        }),
      ],
    },
  },
  play: async ({ canvasElement, step }) => {
    await step('Wait for initial 3 items', async () => {
      await waitFor(() => {
        const items = canvasElement.querySelectorAll('[data-slot="data-panel-item"]');
        expect(items.length).toBe(3);
      });
    });

    await step('Create item that will fail', async () => {
      const nameInput = canvasElement.querySelector('[data-slot="data-panel-create-name"]')! as HTMLInputElement;
      const submit = canvasElement.querySelector('[data-slot="data-panel-submit"]')!;

      await userEvent.type(nameInput, 'Doomed Item');
      await userEvent.click(submit);
    });

    await step('Verify optimistic item appears then reverts on error', async () => {
      await waitFor(() => {
        expect(canvasElement.querySelectorAll('[data-slot="data-panel-item"]').length).toBe(4);
      });

      await waitFor(() => {
        expect(canvasElement.querySelectorAll('[data-slot="data-panel-item"]').length).toBe(3);
      }, { timeout: 3000 });
    });

    await step('Verify error status shown', async () => {
      const submitBtn = canvasElement.querySelector('[data-slot="data-panel-submit"]')!;
      await expect(submitBtn.getAttribute('data-status')).toBe('error');
    });
  },
};

/** Network error — POST returns HttpResponse.error() */
export const NetworkError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/data-panel/items', () => HttpResponse.json(MOCK_ITEMS.slice(0, 2))),
        http.post('/api/data-panel/items', () => HttpResponse.error()),
      ],
    },
  },
  play: async ({ canvasElement, step }) => {
    await step('Wait for initial 2 items', async () => {
      await waitFor(() => {
        expect(canvasElement.querySelectorAll('[data-slot="data-panel-item"]').length).toBe(2);
      });
    });

    await step('Submit item that triggers network error', async () => {
      const nameInput = canvasElement.querySelector('[data-slot="data-panel-create-name"]')! as HTMLInputElement;
      const submit = canvasElement.querySelector('[data-slot="data-panel-submit"]')!;

      await userEvent.type(nameInput, 'Network Fail');
      await userEvent.click(submit);
    });

    await step('Verify optimistic item reverts after network error', async () => {
      await waitFor(() => {
        expect(canvasElement.querySelectorAll('[data-slot="data-panel-item"]').length).toBe(2);
      }, { timeout: 3000 });

      const errorMsg = canvasElement.querySelector('[data-slot="data-panel-error"]');
      await expect(errorMsg).not.toBeNull();
    });
  },
};

/** Sequential responses — first GET returns empty, Refresh returns full */
export const SequentialResponses: Story = {
  parameters: {
    msw: {
      handlers: (() => {
        let requestCount = 0;
        return [
          http.get('/api/data-panel/items', () => {
            requestCount++;
            if (requestCount === 1) return HttpResponse.json([]);
            return HttpResponse.json(MOCK_ITEMS);
          }),
        ];
      })(),
    },
  },
  play: async ({ canvasElement, step }) => {
    await step('Verify first load returns empty', async () => {
      await waitFor(() => {
        const status = canvasElement.querySelector('[data-slot="data-panel-status"]')!;
        expect(status.textContent).toBe('0 items');
      });
    });

    await step('Click refresh and verify full data loads', async () => {
      const refresh = canvasElement.querySelector('[data-slot="data-panel-refresh"]')!;
      await userEvent.click(refresh);

      await waitFor(() => {
        expect(canvasElement.querySelectorAll('[data-slot="data-panel-item"]').length).toBe(5);
      }, { timeout: 3000 });
    });
  },
};

/** POST body inspection — handler validates fields, rejects empty name */
export const PostBodyInspection: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/data-panel/items', () => HttpResponse.json(MOCK_ITEMS.slice(0, 2))),
        http.post('/api/data-panel/items', async ({ request }) => {
          const body = await request.json() as Record<string, string>;
          if (!body.name?.trim()) {
            return HttpResponse.json({ error: 'Name is required' }, { status: 400 });
          }
          return HttpResponse.json(
            { id: 'new-1', name: body.name, category: body.category || 'Uncategorized', value: 0 },
            { status: 201 },
          );
        }),
      ],
    },
  },
};

/** Loading state — GET responds with infinite delay */
export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/data-panel/items', async () => {
          await delay('infinite');
          return HttpResponse.json([]);
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const status = canvasElement.querySelector('[data-slot="data-panel-status"]')!;
    await expect(status.textContent).toBe('Loading…');
  },
};
