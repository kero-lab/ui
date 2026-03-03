'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAdminToolbar } from './admin-toolbar-provider';
import { cn } from '../../lib/utils';

const ENV_COLORS: Record<string, string> = {
  development: 'bg-amber-500',
  staging: 'bg-blue-500',
  production: 'bg-emerald-500',
};

const ENV_LABELS: Record<string, string> = {
  development: 'DEV',
  staging: 'STG',
  production: 'PROD',
};

function EnvironmentBadge({ environment }: { environment: string }) {
  return (
    <span
      data-slot="env-badge"
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white',
        ENV_COLORS[environment] ?? 'bg-gray-500'
      )}
    >
      {ENV_LABELS[environment] ?? environment.toUpperCase()}
    </span>
  );
}

function ToolbarBar() {
  const { toggle, activePanel, openPanel, closePanel, panels, config } =
    useAdminToolbar();

  return (
    <div data-slot="toolbar-bar" className="flex h-8 items-center gap-2 px-3">
      {/* App name + environment */}
      <button
        onClick={toggle}
        className="flex items-center gap-2 text-xs font-medium text-zinc-300 hover:text-white cursor-pointer transition-colors"
      >
        <EnvironmentBadge environment={config.environment} />
        <span>{config.appName}</span>
        {config.commitHash && (
          <span className="font-mono text-[10px] text-zinc-500">{config.commitHash}</span>
        )}
      </button>

      {/* Separator */}
      <div className="h-3 w-px bg-zinc-700" />

      {/* Panel tabs */}
      <div className="flex items-center gap-1">
        {panels.map((panel) => (
          <button
            key={panel.id}
            onClick={() =>
              activePanel === panel.id ? closePanel() : openPanel(panel.id)
            }
            className={cn(
              'flex items-center gap-1 rounded px-2 py-1 text-[11px] cursor-pointer transition-colors',
              activePanel === panel.id
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
            )}
          >
            <span className="[&_svg]:size-3">{panel.icon}</span>
            <span>{panel.label}</span>
          </button>
        ))}
      </div>

      {/* Right side: toggle hint */}
      <div className="ml-auto flex items-center gap-2">
        <kbd className="rounded bg-zinc-800 px-1 py-0.5 text-[9px] font-mono text-zinc-500">
          ⌘.
        </kbd>
      </div>
    </div>
  );
}

function ToolbarPanel() {
  const { activePanel, panels, closePanel } = useAdminToolbar();
  const panel = panels.find((p) => p.id === activePanel);
  if (!panel) return null;

  const PanelComponent = panel.component;

  return (
    <div
      data-slot="toolbar-panel"
      className="border-b border-zinc-800 bg-zinc-950 px-3 py-3"
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="[&_svg]:size-3.5 text-zinc-400">{panel.icon}</span>
          <span className="text-xs font-medium text-zinc-200">{panel.label}</span>
        </div>
        <button
          onClick={closePanel}
          className="rounded p-0.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 cursor-pointer transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M9 3L3 9M3 3l6 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <PanelComponent />
    </div>
  );
}

/** Small tab visible when the toolbar is collapsed — click to expand */
function CollapsedTab() {
  const { toggle, config } = useAdminToolbar();

  return (
    <button
      data-slot="admin-toolbar-tab"
      onClick={toggle}
      className="flex items-center gap-1.5 rounded-t border border-b-0 border-zinc-800 bg-zinc-950/95 px-2 py-1 text-zinc-400 backdrop-blur-sm cursor-pointer transition-colors hover:text-zinc-200"
    >
      <EnvironmentBadge environment={config.environment} />
      <span className="text-[10px] font-medium">{config.appName}</span>
    </button>
  );
}

/** Floating admin toolbar — renders via portal, fixed at bottom of viewport */
export function AdminToolbar() {
  const { isOpen } = useAdminToolbar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <div
      data-slot="admin-toolbar"
      data-html2canvas-ignore
      className="print:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: isOpen ? 0 : 'auto',
        zIndex: 2147483647,
        contain: 'layout style paint',
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {isOpen ? (
        <div className="border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-sm text-zinc-300">
          <ToolbarPanel />
          <ToolbarBar />
        </div>
      ) : (
        <CollapsedTab />
      )}
    </div>,
    document.body
  );
}

