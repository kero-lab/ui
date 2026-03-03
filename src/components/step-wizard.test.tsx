import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, fireEvent } from "@testing-library/react"
import {
  wizardReducer,
  createInitialWizardState,
  StepWizard,
  StepWizardIndicator,
  StepWizardContent,
  StepWizardActions,
  useStepWizard,
} from "./step-wizard"
import type { WizardState, WizardAction } from "./step-wizard"

const STEPS = [
  { id: "account", label: "Account" },
  { id: "details", label: "Details" },
  { id: "review", label: "Review" },
]

// --- createInitialWizardState ---

describe("createInitialWizardState", () => {
  it("creates state with first step current by default", () => {
    const state = createInitialWizardState(STEPS)
    expect(state.currentIndex).toBe(0)
    expect(state.steps[0].status).toBe("current")
    expect(state.steps[1].status).toBe("pending")
    expect(state.steps[2].status).toBe("pending")
    expect(state.status).toBe("idle")
    expect(state.errorMessage).toBeNull()
  })

  it("respects startIndex parameter", () => {
    const state = createInitialWizardState(STEPS, 2)
    expect(state.currentIndex).toBe(2)
    expect(state.steps[0].status).toBe("pending")
    expect(state.steps[2].status).toBe("current")
  })
})

// --- wizardReducer ---

describe("wizardReducer", () => {
  let initial: WizardState

  function reduce(action: WizardAction, state?: WizardState) {
    return wizardReducer(state ?? initial, action)
  }

  beforeEach(() => {
    initial = createInitialWizardState(STEPS)
  })

  describe("NEXT", () => {
    it("advances currentIndex and marks previous completed", () => {
      const state = reduce({ type: "NEXT" })
      expect(state.currentIndex).toBe(1)
      expect(state.steps[0].status).toBe("completed")
      expect(state.steps[1].status).toBe("current")
    })

    it("is a no-op at the last step", () => {
      const atEnd = createInitialWizardState(STEPS, 2)
      const state = wizardReducer(atEnd, { type: "NEXT" })
      expect(state).toBe(atEnd)
    })

    it("clears error on advance", () => {
      const errored = reduce({ type: "SET_ERROR", message: "fail" })
      // NEXT from error clears it (after clearing error, step is still current, but NEXT should work)
      const cleared = wizardReducer(
        { ...errored, steps: errored.steps.map((s, i) => i === 0 ? { ...s, status: "current" as const } : s) },
        { type: "NEXT" }
      )
      expect(cleared.errorMessage).toBeNull()
    })
  })

  describe("PREV", () => {
    it("decrements and marks current step pending", () => {
      const atOne = reduce({ type: "NEXT" })
      const state = wizardReducer(atOne, { type: "PREV" })
      expect(state.currentIndex).toBe(0)
      expect(state.steps[0].status).toBe("current")
      expect(state.steps[1].status).toBe("pending")
    })

    it("is a no-op at step 0", () => {
      const state = reduce({ type: "PREV" })
      expect(state).toBe(initial)
    })
  })

  describe("GOTO", () => {
    it("jumps to index, marking intermediates completed", () => {
      const state = reduce({ type: "GOTO", index: 2 })
      expect(state.currentIndex).toBe(2)
      expect(state.steps[0].status).toBe("completed")
      expect(state.steps[1].status).toBe("completed")
      expect(state.steps[2].status).toBe("current")
    })

    it("going backward marks later steps pending", () => {
      const atEnd = reduce({ type: "GOTO", index: 2 })
      const state = wizardReducer(atEnd, { type: "GOTO", index: 0 })
      expect(state.steps[0].status).toBe("current")
      expect(state.steps[1].status).toBe("pending")
      expect(state.steps[2].status).toBe("pending")
    })

    it("is a no-op for out-of-range index", () => {
      const state = reduce({ type: "GOTO", index: 99 })
      expect(state).toBe(initial)
    })

    it("is a no-op for negative index", () => {
      const state = reduce({ type: "GOTO", index: -1 })
      expect(state).toBe(initial)
    })

    it("is a no-op for same index", () => {
      const state = reduce({ type: "GOTO", index: 0 })
      expect(state).toBe(initial)
    })
  })

  describe("SET_ERROR / CLEAR_ERROR", () => {
    it("SET_ERROR sets error on current step and wizard", () => {
      const state = reduce({ type: "SET_ERROR", message: "Invalid email" })
      expect(state.steps[0].status).toBe("error")
      expect(state.status).toBe("error")
      expect(state.errorMessage).toBe("Invalid email")
    })

    it("CLEAR_ERROR restores current step and clears message", () => {
      const errored = reduce({ type: "SET_ERROR", message: "fail" })
      const state = wizardReducer(errored, { type: "CLEAR_ERROR" })
      expect(state.steps[0].status).toBe("current")
      expect(state.status).toBe("active")
      expect(state.errorMessage).toBeNull()
    })
  })

  describe("SUBMIT flow", () => {
    it("SUBMIT sets status to submitting", () => {
      const state = reduce({ type: "SUBMIT" })
      expect(state.status).toBe("submitting")
    })

    it("SUBMIT_SUCCESS marks all steps completed", () => {
      const submitting = reduce({ type: "SUBMIT" })
      const state = wizardReducer(submitting, { type: "SUBMIT_SUCCESS" })
      expect(state.status).toBe("success")
      expect(state.steps.every((s) => s.status === "completed")).toBe(true)
      expect(state.errorMessage).toBeNull()
    })

    it("SUBMIT_ERROR sets error state", () => {
      const submitting = reduce({ type: "SUBMIT" })
      const state = wizardReducer(submitting, { type: "SUBMIT_ERROR", message: "Server error" })
      expect(state.status).toBe("error")
      expect(state.errorMessage).toBe("Server error")
    })
  })

  describe("RESET", () => {
    it("returns to initial state", () => {
      const advanced = reduce({ type: "GOTO", index: 2 })
      const state = wizardReducer(advanced, { type: "RESET" })
      expect(state.currentIndex).toBe(0)
      expect(state.steps[0].status).toBe("current")
      expect(state.steps[1].status).toBe("pending")
      expect(state.steps[2].status).toBe("pending")
      expect(state.status).toBe("idle")
    })
  })
})

// --- StepWizard component ---

describe("StepWizard", () => {
  function renderWizard(props: Partial<React.ComponentProps<typeof StepWizard>> = {}) {
    return render(
      <StepWizard steps={STEPS} {...props}>
        <StepWizardIndicator />
        <StepWizardContent>
          <div>Step 1 content</div>
          <div>Step 2 content</div>
          <div>Step 3 content</div>
        </StepWizardContent>
        <StepWizardActions />
      </StepWizard>
    )
  }

  it("renders with first step current", () => {
    const { container } = renderWizard()
    const steps = container.querySelectorAll('[data-slot="step-wizard-step"]')
    expect(steps[0].getAttribute("data-status")).toBe("current")
    expect(steps[0].getAttribute("aria-current")).toBe("step")
    expect(steps[1].getAttribute("data-status")).toBe("pending")
  })

  it("respects defaultIndex", () => {
    const { container } = renderWizard({ defaultIndex: 1 })
    const steps = container.querySelectorAll('[data-slot="step-wizard-step"]')
    expect(steps[1].getAttribute("data-status")).toBe("current")
  })

  it("shows current step content only", () => {
    const { container } = renderWizard()
    const content = container.querySelector('[data-slot="step-wizard-content"]')
    expect(content?.textContent).toBe("Step 1 content")
  })

  it("advances on Next click", () => {
    const { container } = renderWizard()
    const next = container.querySelector('[data-slot="step-wizard-next"]')!
    fireEvent.click(next)
    const content = container.querySelector('[data-slot="step-wizard-content"]')
    expect(content?.textContent).toBe("Step 2 content")
  })

  it("goes back on Back click", () => {
    const { container } = renderWizard({ defaultIndex: 1 })
    const back = container.querySelector('[data-slot="step-wizard-back"]')!
    fireEvent.click(back)
    const content = container.querySelector('[data-slot="step-wizard-content"]')
    expect(content?.textContent).toBe("Step 1 content")
  })

  it("shows Submit button on last step", () => {
    const { container } = renderWizard({ defaultIndex: 2 })
    const submit = container.querySelector('[data-slot="step-wizard-submit"]')
    expect(submit).not.toBeNull()
    expect(container.querySelector('[data-slot="step-wizard-next"]')).toBeNull()
  })

  it("fires onStepChange when navigating", () => {
    const spy = vi.fn()
    const { container } = renderWizard({ onStepChange: spy })
    const next = container.querySelector('[data-slot="step-wizard-next"]')!
    fireEvent.click(next)
    expect(spy).toHaveBeenCalledWith(1)
  })

  it("navigates with ArrowRight/ArrowLeft on indicator", () => {
    const { container } = renderWizard()
    const indicator = container.querySelector('[data-slot="step-wizard-indicator"]')!
    fireEvent.keyDown(indicator, { key: "ArrowRight" })
    expect(container.querySelector('[data-slot="step-wizard-content"]')?.textContent).toBe("Step 2 content")
    fireEvent.keyDown(indicator, { key: "ArrowLeft" })
    expect(container.querySelector('[data-slot="step-wizard-content"]')?.textContent).toBe("Step 1 content")
  })

  it("disables Back on first step", () => {
    const { container } = renderWizard()
    const back = container.querySelector('[data-slot="step-wizard-back"]') as HTMLButtonElement
    expect(back.disabled).toBe(true)
  })

  it("renders connectors between steps", () => {
    const { container } = renderWizard()
    const connectors = container.querySelectorAll('[data-slot="step-wizard-connector"]')
    expect(connectors).toHaveLength(2) // 3 steps = 2 connectors
  })
})

// --- useStepWizard outside provider ---

describe("useStepWizard", () => {
  it("throws when used outside StepWizard", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    function Orphan() {
      useStepWizard()
      return null
    }
    expect(() => render(<Orphan />)).toThrow(
      "useStepWizard must be used within a StepWizard"
    )
    spy.mockRestore()
  })
})
