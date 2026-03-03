'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { AdminToolbarConfig, AdminToolbarContextValue } from './types';

const STORAGE_KEY = 'remlab-admin-toolbar';

interface StoredState {
  isOpen: boolean;
  activePanel: string | null;
}

function readStoredState(): StoredState {
  if (typeof window === 'undefined') return { isOpen: false, activePanel: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { isOpen: false, activePanel: null };
}

function writeStoredState(state: StoredState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

const AdminToolbarContext = createContext<AdminToolbarContextValue | null>(null);

interface AdminToolbarProviderProps {
  children: ReactNode;
  config: AdminToolbarConfig;
}

export function AdminToolbarProvider({ children, config }: AdminToolbarProviderProps) {
  const [isOpen, setIsOpen] = useState(() => readStoredState().isOpen);
  const [activePanel, setActivePanel] = useState<string | null>(
    () => readStoredState().activePanel
  );
  const panels = config.panels ?? [];

  // Persist state changes
  useEffect(() => {
    writeStoredState({ isOpen, activePanel });
  }, [isOpen, activePanel]);

  // Keyboard shortcut (Cmd+. / Ctrl+.)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === '.') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const openPanel = useCallback(
    (id: string) => {
      if (panels.some((p) => p.id === id)) {
        setActivePanel(id);
        setIsOpen(true);
      }
    },
    [panels]
  );

  const closePanel = useCallback(() => setActivePanel(null), []);

  return (
    <AdminToolbarContext.Provider
      value={{ isOpen, toggle, activePanel, openPanel, closePanel, panels, config }}
    >
      {children}
    </AdminToolbarContext.Provider>
  );
}

export function useAdminToolbar(): AdminToolbarContextValue {
  const ctx = useContext(AdminToolbarContext);
  if (!ctx) throw new Error('useAdminToolbar must be used within AdminToolbarProvider');
  return ctx;
}
