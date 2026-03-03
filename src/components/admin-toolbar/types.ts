import type { ComponentType, ReactNode } from 'react';

/** A panel that can be registered with the admin toolbar */
export interface ToolbarPanel {
  id: string;
  label: string;
  icon: ReactNode;
  component: ComponentType;
}

/** Toolbar configuration passed to the provider */
export interface AdminToolbarConfig {
  /** App name shown in the collapsed bar */
  appName: string;
  /** Current environment — drives the badge color */
  environment: 'development' | 'staging' | 'production';
  /** Git commit hash (short) */
  commitHash?: string;
  /** Panels to register */
  panels?: ToolbarPanel[];
  /** Keyboard shortcut to toggle toolbar (default: Cmd+Shift+D) */
  toggleShortcut?: string;
}

/** Context value exposed by AdminToolbarProvider */
export interface AdminToolbarContextValue {
  /** Whether the toolbar is currently visible */
  isOpen: boolean;
  /** Toggle toolbar visibility */
  toggle: () => void;
  /** Currently active panel id, or null if collapsed */
  activePanel: string | null;
  /** Open a specific panel */
  openPanel: (id: string) => void;
  /** Close the panel area (collapse to bar) */
  closePanel: () => void;
  /** All registered panels */
  panels: ToolbarPanel[];
  /** Toolbar configuration */
  config: AdminToolbarConfig;
}
