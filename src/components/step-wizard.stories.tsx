import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { useState } from 'react';
import { http, HttpResponse, delay } from 'msw';
import {
  StepWizard,
  StepWizardIndicator,
  StepWizardContent,
  StepWizardActions,
  useStepWizard,
} from './step-wizard';
import { Badge } from './badge';
const STEPS = [
  { id: 'account', label: 'Account' },
  { id: 'details', label: 'Details' },
  { id: 'review', label: 'Review' },
];

const meta = {
  title: 'Components/StepWizard',
  tags: ['autodocs', 'lifecycle:stress-test'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Basic 3-step wizard, uncontrolled */
export const Default: Story = {
  render: () => (
    <StepWizard steps={STEPS}>
      <StepWizardIndicator />
      <StepWizardContent>
        <div className="rounded-lg border p-4">
          <h3 className="font-medium">Account Setup</h3>
          <p className="text-sm text-muted-foreground">Create your account credentials.</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-medium">Personal Details</h3>
          <p className="text-sm text-muted-foreground">Tell us about yourself.</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-medium">Review</h3>
          <p className="text-sm text-muted-foreground">Confirm your information.</p>
        </div>
      </StepWizardContent>
      <StepWizardActions />
    </StepWizard>
  ),
};

/** Controlled mode — external state drives the wizard */
export const Controlled: Story = {
  render: function ControlledStory() {
    const [index, setIndex] = useState(0);

    return (
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIndex(i)}
              className={`rounded px-3 py-1 text-sm ${i === index ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
            >
              Go to {s.label}
            </button>
          ))}
        </div>
        <StepWizard steps={STEPS} currentIndex={index} onStepChange={setIndex}>
          <StepWizardIndicator />
          <StepWizardContent>
            <div className="rounded-lg border p-4">Step 1: Account</div>
            <div className="rounded-lg border p-4">Step 2: Details</div>
            <div className="rounded-lg border p-4">Step 3: Review</div>
          </StepWizardContent>
          <StepWizardActions />
        </StepWizard>
      </div>
    );
  },
};

/** Step with error state — dispatches SET_ERROR on step 2 */
export const WithError: Story = {
  render: function ErrorStory() {
    return (
      <StepWizard steps={STEPS} defaultIndex={1}>
        <StepWizardIndicator />
        <StepWizardContent>
          <div>Step 1</div>
          <ErrorStep />
          <div>Step 3</div>
        </StepWizardContent>
        <StepWizardActions />
      </StepWizard>
    );
  },
};

function ErrorStep() {
  const { state, dispatch } = useStepWizard();
  return (
    <div className="space-y-3">
      <div className="rounded-lg border p-4">
        <h3 className="font-medium">Details</h3>
        {state.errorMessage && (
          <p className="text-sm text-destructive mt-2">{state.errorMessage}</p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          className="rounded bg-destructive px-3 py-1 text-sm text-destructive-foreground"
          onClick={() => dispatch({ type: 'SET_ERROR', message: 'Email already taken' })}
        >
          Trigger Error
        </button>
        <button
          className="rounded bg-muted px-3 py-1 text-sm"
          onClick={() => dispatch({ type: 'CLEAR_ERROR' })}
        >
          Clear Error
        </button>
      </div>
    </div>
  );
}

/** Submit flow — MSW intercepts POST, returns success after delay */
export const Submitting: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('/api/wizard/submit', async () => {
          await delay(200);
          return HttpResponse.json({ success: true });
        }),
      ],
    },
  },
  render: function SubmitStory() {
    return (
      <StepWizard steps={STEPS} defaultIndex={2}>
        <StepWizardIndicator />
        <StepWizardContent>
          <div>Step 1</div>
          <div>Step 2</div>
          <SubmitStep />
        </StepWizardContent>
        <StepWizardActions />
      </StepWizard>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submit = canvasElement.querySelector('[data-slot="step-wizard-submit"]')!;
    await expect(submit.getAttribute('data-status')).toBe('idle');
    await userEvent.click(submit);
    // After click, the SubmitStep component handles the async flow
    await expect(submit.getAttribute('data-status')).toBe('submitting');
  },
};

function SubmitStep() {
  const { state, dispatch } = useStepWizard();
  // When SUBMIT action is dispatched by StepWizardActions, trigger the API call
  const submitted = state.status === 'submitting';
  const [fetched, setFetched] = useState(false);

  if (submitted && !fetched) {
    setFetched(true);
    fetch('/api/wizard/submit', { method: 'POST' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        dispatch({ type: 'SUBMIT_SUCCESS' });
      })
      .catch((err) => {
        dispatch({ type: 'SUBMIT_ERROR', message: err.message });
      });
  }

  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-medium">Review & Submit</h3>
      {state.status === 'success' && (
        <Badge variant="default" className="mt-2">Submitted!</Badge>
      )}
      {state.status === 'error' && (
        <p className="text-sm text-destructive mt-2">{state.errorMessage}</p>
      )}
    </div>
  );
}

/** Submit error — MSW returns 500, verify error state */
export const SubmitError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('/api/wizard/submit', () =>
          HttpResponse.json({ error: 'Server error' }, { status: 500 }),
        ),
      ],
    },
  },
  render: function SubmitErrorStory() {
    return (
      <StepWizard steps={STEPS} defaultIndex={2}>
        <StepWizardIndicator />
        <StepWizardContent>
          <div>Step 1</div>
          <div>Step 2</div>
          <SubmitStep />
        </StepWizardContent>
        <StepWizardActions />
      </StepWizard>
    );
  },
};

/** Keyboard navigation — ArrowRight/Left on indicator */
export const KeyboardNavigation: Story = {
  render: () => (
    <StepWizard steps={STEPS}>
      <StepWizardIndicator />
      <StepWizardContent>
        <div data-testid="step-1">Account content</div>
        <div data-testid="step-2">Details content</div>
        <div data-testid="step-3">Review content</div>
      </StepWizardContent>
      <StepWizardActions />
    </StepWizard>
  ),
  play: async ({ canvasElement }) => {
    const indicator = canvasElement.querySelector('[data-slot="step-wizard-indicator"]')!;
    const content = canvasElement.querySelector('[data-slot="step-wizard-content"]')!;

    // Start at step 1
    await expect(content.textContent).toBe('Account content');

    // Focus indicator and navigate with arrow keys
    (indicator as HTMLElement).focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(content.textContent).toBe('Details content');

    await userEvent.keyboard('{ArrowRight}');
    await expect(content.textContent).toBe('Review content');

    // ArrowRight at end is no-op
    await userEvent.keyboard('{ArrowRight}');
    await expect(content.textContent).toBe('Review content');

    // Navigate back
    await userEvent.keyboard('{ArrowLeft}');
    await expect(content.textContent).toBe('Details content');
  },
};

/** All step statuses side-by-side for visual inspection */
export const AllStepStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Step 1 (current)</p>
        <StepWizard steps={STEPS} defaultIndex={0}>
          <StepWizardIndicator />
        </StepWizard>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Step 2 (current, step 1 completed)</p>
        <StepWizard steps={STEPS} defaultIndex={1}>
          <StepWizardIndicator />
        </StepWizard>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Step 3 (current, all prior completed)</p>
        <StepWizard steps={STEPS} defaultIndex={2}>
          <StepWizardIndicator />
        </StepWizard>
      </div>
    </div>
  ),
};

/** Data attribute verification */
export const DataAttributes: Story = {
  render: () => (
    <StepWizard steps={STEPS}>
      <StepWizardIndicator />
      <StepWizardContent>
        <div>Step 1</div>
        <div>Step 2</div>
        <div>Step 3</div>
      </StepWizardContent>
      <StepWizardActions />
    </StepWizard>
  ),
  play: async ({ canvasElement }) => {
    // Root
    const root = canvasElement.querySelector('[data-slot="step-wizard"]')!;
    await expect(root).toBeInTheDocument();
    await expect(root.getAttribute('data-status')).toBe('idle');

    // Indicator
    const indicator = canvasElement.querySelector('[data-slot="step-wizard-indicator"]')!;
    await expect(indicator).toBeInTheDocument();
    await expect(indicator.getAttribute('role')).toBe('group');

    // Steps
    const steps = canvasElement.querySelectorAll('[data-slot="step-wizard-step"]');
    await expect(steps).toHaveLength(3);
    await expect(steps[0].getAttribute('data-status')).toBe('current');
    await expect(steps[0].getAttribute('aria-current')).toBe('step');
    await expect(steps[1].getAttribute('data-status')).toBe('pending');
    await expect(steps[1].getAttribute('aria-current')).toBeNull();

    // Connectors
    const connectors = canvasElement.querySelectorAll('[data-slot="step-wizard-connector"]');
    await expect(connectors).toHaveLength(2);
    await expect(connectors[0].getAttribute('data-filled')).toBe('true');
    await expect(connectors[1].getAttribute('data-filled')).toBe('false');

    // Content
    await expect(canvasElement.querySelector('[data-slot="step-wizard-content"]')).toBeInTheDocument();

    // Actions
    await expect(canvasElement.querySelector('[data-slot="step-wizard-actions"]')).toBeInTheDocument();
    await expect(canvasElement.querySelector('[data-slot="step-wizard-back"]')).toBeInTheDocument();
    await expect(canvasElement.querySelector('[data-slot="step-wizard-next"]')).toBeInTheDocument();
  },
};
