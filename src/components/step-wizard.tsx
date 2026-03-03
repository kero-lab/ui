"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// --- State machine types ---

type StepStatus = "pending" | "current" | "completed" | "error"

interface WizardStep {
  id: string
  label: string
  status: StepStatus
}

type WizardStatus = "idle" | "active" | "submitting" | "success" | "error"

interface WizardState {
  steps: WizardStep[]
  currentIndex: number
  status: WizardStatus
  errorMessage: string | null
}

type WizardAction =
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "GOTO"; index: number }
  | { type: "SET_ERROR"; message: string }
  | { type: "CLEAR_ERROR" }
  | { type: "SUBMIT" }
  | { type: "SUBMIT_SUCCESS" }
  | { type: "SUBMIT_ERROR"; message: string }
  | { type: "RESET" }

// --- Pure functions (exported for testing) ---

function createInitialWizardState(
  steps: Array<{ id: string; label: string }>,
  startIndex = 0
): WizardState {
  return {
    steps: steps.map((s, i) => ({
      ...s,
      status: i === startIndex ? "current" : ("pending" as StepStatus),
    })),
    currentIndex: startIndex,
    status: "idle",
    errorMessage: null,
  }
}

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "NEXT": {
      if (state.currentIndex >= state.steps.length - 1) return state
      const next = state.currentIndex + 1
      const steps = state.steps.map((s, i) => {
        if (i === state.currentIndex) return { ...s, status: "completed" as const }
        if (i === next) return { ...s, status: "current" as const }
        return s
      })
      return { ...state, steps, currentIndex: next, status: "active", errorMessage: null }
    }
    case "PREV": {
      if (state.currentIndex <= 0) return state
      const prev = state.currentIndex - 1
      const steps = state.steps.map((s, i) => {
        if (i === state.currentIndex) return { ...s, status: "pending" as const }
        if (i === prev) return { ...s, status: "current" as const }
        return s
      })
      return { ...state, steps, currentIndex: prev, status: "active", errorMessage: null }
    }
    case "GOTO": {
      if (action.index < 0 || action.index >= state.steps.length) return state
      if (action.index === state.currentIndex) return state
      const steps = state.steps.map((s, i) => {
        if (i < action.index) return { ...s, status: "completed" as const }
        if (i === action.index) return { ...s, status: "current" as const }
        if (i > action.index) return { ...s, status: "pending" as const }
        return s
      })
      return { ...state, steps, currentIndex: action.index, status: "active", errorMessage: null }
    }
    case "SET_ERROR": {
      const steps = state.steps.map((s, i) =>
        i === state.currentIndex ? { ...s, status: "error" as const } : s
      )
      return { ...state, steps, status: "error", errorMessage: action.message }
    }
    case "CLEAR_ERROR": {
      const steps = state.steps.map((s, i) =>
        i === state.currentIndex ? { ...s, status: "current" as const } : s
      )
      return { ...state, steps, status: "active", errorMessage: null }
    }
    case "SUBMIT": {
      return { ...state, status: "submitting" }
    }
    case "SUBMIT_SUCCESS": {
      const steps = state.steps.map((s) => ({ ...s, status: "completed" as const }))
      return { ...state, steps, status: "success", errorMessage: null }
    }
    case "SUBMIT_ERROR": {
      return { ...state, status: "error", errorMessage: action.message }
    }
    case "RESET": {
      return createInitialWizardState(
        state.steps.map((s) => ({ id: s.id, label: s.label }))
      )
    }
    default:
      return state
  }
}

// --- Context ---

interface StepWizardContextValue {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
  canGoNext: boolean
  canGoPrev: boolean
  isLastStep: boolean
  currentStep: WizardStep | null
}

const StepWizardContext = React.createContext<StepWizardContextValue | null>(null)

function useStepWizard() {
  const ctx = React.useContext(StepWizardContext)
  if (!ctx) {
    throw new Error("useStepWizard must be used within a StepWizard")
  }
  return ctx
}

// --- CVA variants ---

const stepIndicatorVariants = cva(
  "flex items-center justify-center rounded-full border-2 font-medium transition-all",
  {
    variants: {
      status: {
        pending: "border-muted-foreground/30 bg-background text-muted-foreground",
        current: "border-primary bg-primary text-primary-foreground",
        completed: "border-primary bg-primary/10 text-primary",
        error: "border-destructive bg-destructive text-destructive-foreground",
      },
      size: {
        sm: "size-6 text-xs",
        md: "size-8 text-sm",
      },
    },
    defaultVariants: {
      status: "pending",
      size: "md",
    },
  }
)

// --- Components ---

interface StepWizardProps {
  steps: Array<{ id: string; label: string }>
  currentIndex?: number
  onStepChange?: (index: number) => void
  onSubmit?: () => void | Promise<void>
  defaultIndex?: number
  children: React.ReactNode
  className?: string
}

function StepWizard({
  steps,
  currentIndex: controlledIndex,
  onStepChange,
  onSubmit,
  defaultIndex = 0,
  children,
  className,
}: StepWizardProps) {
  const [state, dispatch] = React.useReducer(
    wizardReducer,
    createInitialWizardState(steps, controlledIndex ?? defaultIndex)
  )

  // Sync controlled index
  const isControlled = controlledIndex !== undefined
  React.useEffect(() => {
    if (isControlled && controlledIndex !== state.currentIndex) {
      dispatch({ type: "GOTO", index: controlledIndex })
    }
  }, [isControlled, controlledIndex, state.currentIndex])

  // Notify on step change
  const prevIndex = React.useRef(state.currentIndex)
  React.useEffect(() => {
    if (state.currentIndex !== prevIndex.current) {
      onStepChange?.(state.currentIndex)
      prevIndex.current = state.currentIndex
    }
  }, [state.currentIndex, onStepChange])

  const ctxValue = React.useMemo<StepWizardContextValue>(() => ({
    state,
    dispatch,
    canGoNext: state.currentIndex < state.steps.length - 1,
    canGoPrev: state.currentIndex > 0,
    isLastStep: state.currentIndex === state.steps.length - 1,
    currentStep: state.steps[state.currentIndex] ?? null,
  }), [state])

  return (
    <StepWizardContext.Provider value={ctxValue}>
      <div
        data-slot="step-wizard"
        data-status={state.status}
        className={cn("flex flex-col gap-6", className)}
      >
        {children}
      </div>
    </StepWizardContext.Provider>
  )
}

interface StepWizardIndicatorProps extends VariantProps<typeof stepIndicatorVariants> {
  className?: string
}

function StepWizardIndicator({
  size,
  className,
}: StepWizardIndicatorProps) {
  const { state, dispatch } = useStepWizard()

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault()
      dispatch({ type: "NEXT" })
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault()
      dispatch({ type: "PREV" })
    }
  }

  return (
    <div
      data-slot="step-wizard-indicator"
      role="group"
      aria-label="Progress steps"
      className={cn("flex items-center gap-0", className)}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {state.steps.map((step, i) => (
        <React.Fragment key={step.id}>
          {i > 0 && (
            <div
              data-slot="step-wizard-connector"
              data-filled={i <= state.currentIndex ? "true" : "false"}
              className={cn(
                "h-0.5 w-8 transition-colors",
                i <= state.currentIndex ? "bg-primary" : "bg-muted-foreground/30"
              )}
            />
          )}
          <div className="flex flex-col items-center gap-1">
            <div
              data-slot="step-wizard-step"
              data-status={step.status}
              aria-current={step.status === "current" ? "step" : undefined}
              className={stepIndicatorVariants({ status: step.status, size })}
            >
              {step.status === "completed" ? "✓" : i + 1}
            </div>
            <span
              className={cn(
                "text-xs transition-colors",
                step.status === "current"
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}

interface StepWizardContentProps {
  children: React.ReactNode[]
  className?: string
}

function StepWizardContent({ children, className }: StepWizardContentProps) {
  const { state } = useStepWizard()
  const current = children[state.currentIndex]

  return (
    <div data-slot="step-wizard-content" className={cn("min-h-[100px]", className)}>
      {current}
    </div>
  )
}

interface StepWizardActionsProps {
  className?: string
}

function StepWizardActions({ className }: StepWizardActionsProps) {
  const { state, dispatch, canGoNext, canGoPrev, isLastStep } = useStepWizard()

  return (
    <div data-slot="step-wizard-actions" className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        data-slot="step-wizard-back"
        disabled={!canGoPrev || state.status === "submitting"}
        onClick={() => dispatch({ type: "PREV" })}
        className={cn(
          "rounded-md px-4 py-2 text-sm font-medium transition-colors",
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          "disabled:pointer-events-none disabled:opacity-50"
        )}
      >
        Back
      </button>
      {isLastStep ? (
        <button
          type="button"
          data-slot="step-wizard-submit"
          data-status={state.status}
          disabled={state.status === "submitting" || state.status === "success"}
          onClick={() => dispatch({ type: "SUBMIT" })}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
        >
          {state.status === "submitting" ? "Submitting…" : state.status === "success" ? "Done" : "Submit"}
        </button>
      ) : (
        <button
          type="button"
          data-slot="step-wizard-next"
          disabled={!canGoNext || state.status === "submitting"}
          onClick={() => dispatch({ type: "NEXT" })}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
        >
          Next
        </button>
      )}
    </div>
  )
}

export {
  StepWizard,
  StepWizardIndicator,
  StepWizardContent,
  StepWizardActions,
  useStepWizard,
  wizardReducer,
  createInitialWizardState,
  stepIndicatorVariants,
}

export type {
  WizardStep,
  WizardState,
  WizardAction,
  WizardStatus,
  StepStatus,
}
