// Components
export { Button, buttonVariants } from './components/button';
export { Badge, badgeVariants } from './components/badge';
export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent } from './components/card';
export { Checkbox } from './components/checkbox';
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from './components/collapsible';
export { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './components/dialog';
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup } from './components/dropdown-menu';
export { Input } from './components/input';
export { Label } from './components/label';
export { ScrollArea, ScrollBar } from './components/scroll-area';
export { Select, SelectContent, SelectGroup, SelectItem, SelectScrollDownButton, SelectScrollUpButton, SelectTrigger, SelectValue } from './components/select';
export { Separator } from './components/separator';
export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from './components/sheet';
export { Skeleton } from './components/skeleton';
export { Slider } from './components/slider';
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from './components/table';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/tabs';
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './components/tooltip';

// Wave visualization components
export { AudioWave } from './components/audio-wave';
export { NoiseWave } from './components/noise-wave';
export { EnvelopeWave } from './components/envelope-wave';
export { VoiceWave } from './components/voice-wave';
export { sampleEnvelope, REM_ENVELOPE, ENVELOPE_FRAMES, ENVELOPE_DURATION } from './components/rem-envelope';

// Prototype components
export { Sparkline, SparklineGrid, computeSparklinePoints, pointsToPolyline, pointsToGradientPath } from './components/sparkline';
export { ExpandableRow, ExpandableRowTrigger, ExpandableRowContent, useExpandableRow } from './components/expandable-row';
export { ResponsiveCard } from './components/responsive-card';

// Event components (Activity River Phase 3)
export { EventCard, EventCardSummary, EventCardDetail, EventCardAction, useEventCard } from './components/event-card';
export type { EventCardProps, Significance } from './components/event-card';
export { EventTimeline, classifyPeriods, computePeakDensity, formatTimelineDuration } from './components/event-timeline';
export type { TimelineItem, Period, NormalPeriod, QuietPeriod, BusyPeriod, PeriodType, QuietMarkerProps, BusyHeaderProps, ClusterSummaryRenderProps, TrendRenderProps, EventTimelineProps } from './components/event-timeline';

// River Intelligence (Activity River Phase 4)
export { FanOutStack } from './components/fan-out-stack';
export type { FanOutStackProps } from './components/fan-out-stack';
export { ClusterSummary, formatClusterDuration } from './components/cluster-summary';
export type { ClusterSummaryProps } from './components/cluster-summary';
export { TrendIndicator, MiniSparkline } from './components/trend-indicator';
export type { TrendIndicatorProps, TrendDirection, TrendSeverity } from './components/trend-indicator';

// River hooks
export { useScrollBob } from './hooks/use-scroll-bob';
export { useTimelineKeyboard } from './hooks/use-timeline-keyboard';

// Stress-test components
export { StepWizard, StepWizardIndicator, StepWizardContent, StepWizardActions, useStepWizard, wizardReducer, createInitialWizardState, stepIndicatorVariants } from './components/step-wizard';
export type { WizardStep, WizardState, WizardAction, WizardStatus, StepStatus } from './components/step-wizard';
export { DataPanel, filterItems, groupByCategory, sortByValue } from './components/data-panel';
export type { DataItem, DataPanelProps } from './components/data-panel';

// Admin Toolbar
export { AdminToolbar, AdminToolbarProvider, useAdminToolbar } from './components/admin-toolbar';
export type { AdminToolbarConfig, ToolbarPanel } from './components/admin-toolbar';

// Icons
export { RemIcon } from './icons/rem-icon';

// Utilities
export { cn, formatBytes, formatBytesIEC, formatBytesNumeric, formatBytesUnit, formatMemory, formatMemoryCompact, formatCurrency, formatNumber, formatDuration, formatDurationMs, usageColor, usageBgColor } from './lib/utils';

// Hooks
export { useDebounce } from './hooks/use-debounce';
export { useMediaQuery, useMobile } from './hooks/use-media-query';
export { useReducedMotion } from './hooks/use-reduced-motion';
