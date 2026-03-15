import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { EventTimeline } from './event-timeline';
import type { TimelineItem, QuietMarkerProps, BusyHeaderProps, TrendRenderProps } from './event-timeline';
import { EventCard, EventCardSummary, EventCardDetail } from './event-card';
import { FanOutStack } from './fan-out-stack';
import { ClusterSummary } from './cluster-summary';
import { TrendIndicator } from './trend-indicator';
import type { TrendDirection, TrendSeverity } from './trend-indicator';

const meta = {
  title: 'Components/EventTimeline',
  tags: ['autodocs', 'lifecycle:prototype'],
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

// --- Helpers ---

const HOUR = 60 * 60 * 1000;
const MIN = 60 * 1000;

type EventKind = 'chat' | 'eval' | 'cost';

interface DemoEvent extends TimelineItem {
  id: string;
  label: string;
  color: string;
  kind?: EventKind;
  provider?: string;
  model?: string;
  tokens?: number;
  cost?: string;
  interface?: string;
  // Eval fields
  tier?: number;
  passed?: number;
  total?: number;
  // Cost fields
  multiplier?: number;
  significance?: 'high' | 'medium' | 'low';
}

function makeEvent(id: string, timestamp: number, label: string, color = '#D97757'): DemoEvent {
  return { id, timestamp, label, color };
}

function makeChatEvent(id: string, timestamp: number, opts: {
  provider: string; color: string; model: string;
  tokens: number; cost: string; iface?: string;
  significance?: 'high' | 'medium' | 'low';
}): DemoEvent {
  return {
    id, timestamp, label: opts.model, color: opts.color,
    kind: 'chat', provider: opts.provider, model: opts.model,
    tokens: opts.tokens, cost: opts.cost, interface: opts.iface ?? 'Discord',
    significance: opts.significance,
  };
}

function makeEvalEvent(id: string, timestamp: number, opts: {
  tier: number; passed: number; total: number;
}): DemoEvent {
  const hasFails = opts.passed < opts.total;
  return {
    id, timestamp, label: `T${opts.tier} eval`, color: hasFails ? '#ef4444' : '#22c55e',
    kind: 'eval', tier: opts.tier, passed: opts.passed, total: opts.total,
    significance: hasFails ? 'high' : 'medium',
  };
}

function makeCostEvent(id: string, timestamp: number, opts: {
  multiplier: number; cost: string;
}): DemoEvent {
  return {
    id, timestamp, label: `${opts.multiplier}x spike`, color: '#eab308',
    kind: 'cost', multiplier: opts.multiplier, cost: opts.cost,
    significance: 'medium',
  };
}

// ── Provider brand icons (full inline SVGs matching event-card.stories) ──

function AnthropicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.827 3.52h3.603L24 20.48h-3.603l-6.57-16.96zm-7.258 0H10.172L16.74 20.48H13.14L11.7 16.56H5.48L4.04 20.48H.44L6.569 3.52zm4.132 10.24L8.588 7.93 6.475 13.76h4.226z" />
    </svg>
  );
}

function OpenAIIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function ClaudeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" fillRule="nonzero" />
    </svg>
  );
}

function ChatGPTIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd">
      <path d="M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z" />
    </svg>
  );
}

function GeminiIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" />
    </svg>
  );
}

function FlaskIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" />
      <path d="M8.5 2h7" /><path d="M7 16h10" />
    </svg>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

function TerminalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" /><line x1="12" x2="20" y1="19" y2="19" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
    </svg>
  );
}

// ── Helpers ──

const PROVIDER_ICONS: Record<string, (p: { className?: string }) => React.JSX.Element> = {
  Anthropic: AnthropicIcon,
  OpenAI: OpenAIIcon,
  Google: GoogleIcon,
};

/** Product-level icons for model names */
function modelIconFor(modelId: string): ((p: { className?: string }) => React.JSX.Element) | null {
  if (modelId.startsWith('claude-')) return ClaudeIcon;
  if (modelId.startsWith('gpt-') || modelId.startsWith('o3') || modelId.startsWith('o4')) return ChatGPTIcon;
  if (modelId.startsWith('gemini-')) return GeminiIcon;
  return null;
}

const MODEL_DISPLAY_NAMES: Record<string, string> = {
  'claude-opus-4-6': 'Opus 4.6',
  'claude-sonnet-4-6': 'Sonnet 4.6',
  'claude-haiku-4-5': 'Haiku 4.5',
  'gpt-4o': 'GPT-4o',
  'gpt-4o-mini': 'GPT-4o Mini',
  'gpt-4-turbo': 'GPT-4 Turbo',
  'o3-mini': 'o3 Mini',
  'gemini-2.5-pro': 'Gemini 2.5 Pro',
  'gemini-2.5-flash': 'Gemini 2.5 Flash',
};

function friendlyModelName(rawId: string): string {
  if (MODEL_DISPLAY_NAMES[rawId]) return MODEL_DISPLAY_NAMES[rawId];
  const stripped = rawId.replace(/-\d{4}-\d{2}-\d{2}$/, '').replace(/-\d{8,}$/, '');
  if (MODEL_DISPLAY_NAMES[stripped]) return MODEL_DISPLAY_NAMES[stripped];
  return stripped.replace(/^claude-/, '').replace(/^gpt-/, 'GPT-').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

const INTERFACE_CONFIG: Record<string, { Icon: (p: { className?: string }) => React.JSX.Element; color: string }> = {
  Discord: { Icon: MessageIcon, color: '#5865F2' },
  KeroHub: { Icon: GlobeIcon, color: '#10b981' },
  CLI: { Icon: TerminalIcon, color: '#a3a3a3' },
};

function ProviderBadge({ label, color, status }: { label: string; color: string; status?: 'healthy' | 'degraded' | 'down' }) {
  const BrandIcon = PROVIDER_ICONS[label];
  const statusColors = { healthy: '#22c55e', degraded: '#eab308', down: '#ef4444' };
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
      style={{ backgroundColor: `${color}18`, color }}>
      {BrandIcon && <BrandIcon className="h-2.5 w-2.5" />}
      {label}
      {status && (
        <span className="relative flex h-1.5 w-1.5">
          {status === 'healthy' && <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50" style={{ backgroundColor: statusColors[status] }} />}
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColors[status] }} />
        </span>
      )}
    </span>
  );
}

function InterfaceBadge({ iface }: { iface: string }) {
  const config = INTERFACE_CONFIG[iface];
  if (!config) return <span className="rounded-full bg-white/8 px-1 py-0.5 text-[9px] text-white/40">{iface}</span>;
  const { Icon, color } = config;
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full px-1 py-0.5 text-[9px]"
      style={{ backgroundColor: `${color}15`, color }}
      title={`via ${iface}`}>
      <Icon className="h-2.5 w-2.5" />
      <span>{iface}</span>
    </span>
  );
}

function TokenBar({ tokens, color }: { tokens: number; color: string }) {
  // Approximate 60/40 input/output split for demo
  const inputRatio = 60;
  return (
    <div className="flex items-center gap-1.5 w-full">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full" style={{ width: `${inputRatio}%`, backgroundColor: `${color}50` }} />
      </div>
      <span className="text-[8px] text-white/40 tabular-nums">
        {formatTokens(Math.round(tokens * 0.6))}↑ {formatTokens(Math.round(tokens * 0.4))}↓
      </span>
    </div>
  );
}

function renderRichItem(item: DemoEvent) {
  if (item.kind === 'eval') {
    const hasFails = (item.passed ?? 0) < (item.total ?? 0);
    const pct = item.total ? Math.round(((item.passed ?? 0) / item.total) * 100) : 100;
    return (
      <EventCard accentColor={item.color} significance={item.significance}>
        <EventCardSummary>
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${hasFails ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
              <FlaskIcon className="h-2.5 w-2.5" />
              T{item.tier}
            </span>
          </div>
          <p className={`mt-1 text-lg font-semibold tabular-nums ${hasFails ? 'text-red-400' : 'text-emerald-400'}`}>
            {item.passed}/{item.total}
          </p>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className={`h-full rounded-full ${hasFails ? 'bg-red-500/50' : 'bg-emerald-500/50'}`} style={{ width: `${pct}%` }} />
          </div>
        </EventCardSummary>
        <EventCardDetail>
          <div className="space-y-1.5 text-[10px]">
            <div className="flex justify-between"><span className="text-white/40">Pass rate</span><span className={hasFails ? 'text-red-400' : 'text-emerald-400'}>{pct}%</span></div>
            <div className="flex justify-between"><span className="text-white/40">Duration</span><span className="text-white/70">12.4s</span></div>
            {hasFails && <div className="rounded bg-red-500/10 px-2 py-1 text-red-400/80">{(item.total ?? 0) - (item.passed ?? 0)} failed</div>}
          </div>
        </EventCardDetail>
      </EventCard>
    );
  }

  if (item.kind === 'cost') {
    return (
      <EventCard accentColor="#eab308" significance={item.significance} className="border-amber-500/30 bg-amber-950/15">
        <EventCardSummary>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
            ↑ {item.multiplier}x spike
          </span>
          <p className="mt-1 text-sm font-semibold text-amber-400 tabular-nums">{item.cost}</p>
          <p className="text-[10px] text-white/40">day-over-day</p>
        </EventCardSummary>
        <EventCardDetail>
          <div className="space-y-1.5 text-[10px]">
            <div className="flex justify-between"><span className="text-white/40">Previous</span><span className="text-white/70">${(parseFloat(item.cost?.replace('$','') ?? '0') / (item.multiplier ?? 1)).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Current</span><span className="text-amber-400">{item.cost}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Top model</span><span className="text-white/70">Sonnet 4.6</span></div>
          </div>
        </EventCardDetail>
      </EventCard>
    );
  }

  // Default: chat event — full brand icons, model icons, interface badges, token bars
  const ModelIcon = item.model ? modelIconFor(item.model) : null;
  const displayModel = item.model ? friendlyModelName(item.model) : item.label;
  return (
    <EventCard accentColor={item.color} significance={item.significance ?? 'medium'}>
      <EventCardSummary>
        <div className="flex items-center gap-1.5">
          {item.provider && (
            <ProviderBadge label={item.provider} color={item.color} status="healthy" />
          )}
          {item.interface && (
            <InterfaceBadge iface={item.interface} />
          )}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          {ModelIcon && <span style={{ color: item.color }}><ModelIcon className="h-3 w-3" /></span>}
          <p className="truncate text-[11px] font-medium text-white/80">{displayModel}</p>
        </div>
        {item.tokens && (
          <div className="mt-1">
            <TokenBar tokens={item.tokens} color={item.color} />
          </div>
        )}
        <div className="mt-0.5 flex items-center gap-2 text-[10px] text-white/50 tabular-nums">
          {item.tokens && <span>{formatTokens(item.tokens)} tok</span>}
          {item.tokens && item.cost && <span className="text-white/20">·</span>}
          {item.cost && <span>{item.cost}</span>}
        </div>
      </EventCardSummary>
      <EventCardDetail>
        <div className="space-y-1.5 text-[10px]">
          {item.model && <div className="flex justify-between"><span className="text-white/40">Model</span><span className="text-white/70 font-mono text-[9px]">{item.model}</span></div>}
          {item.tokens && <div className="flex justify-between"><span className="text-white/40">Tokens</span><span className="text-white/70 tabular-nums">{item.tokens.toLocaleString()}</span></div>}
          {item.cost && <div className="flex justify-between"><span className="text-white/40">Cost</span><span className="text-white/70">{item.cost}</span></div>}
          {item.interface && <div className="flex justify-between"><span className="text-white/40">Interface</span><span className="text-white/70">{item.interface}</span></div>}
        </div>
      </EventCardDetail>
    </EventCard>
  );
}

// Simple renderer for basic stories (backwards compat)
function renderDemoItem(item: DemoEvent) {
  if (item.kind) return renderRichItem(item);
  return (
    <EventCard accentColor={item.color} significance="medium">
      <EventCardSummary>
        <div className="text-xs font-medium text-white/80">{item.label}</div>
        <div className="mt-1 text-xs text-white/40">
          {new Date(item.timestamp).toLocaleTimeString()}
        </div>
      </EventCardSummary>
      <EventCardDetail>
        <div className="text-xs text-white/60">ID: {item.id}</div>
      </EventCardDetail>
    </EventCard>
  );
}

function QuietMarker({ duration, onToggle, expanded }: QuietMarkerProps) {
  return (
    <button
      className="flex items-center gap-2 px-3 py-1 rounded border border-dashed border-white/20 text-xs text-white/40 hover:text-white/60 hover:border-white/30 transition-colors"
      onClick={onToggle}
      data-testid="quiet-marker"
    >
      <span className="w-8 border-t border-dashed border-white/20" />
      <span>{duration} quiet {expanded ? '(collapse)' : '(expand)'}</span>
      <span className="w-8 border-t border-dashed border-white/20" />
    </button>
  );
}

function BusyHeader({ eventCount, startTime, endTime }: BusyHeaderProps) {
  return (
    <div className="text-[10px] text-amber-400/70 font-medium" data-testid="busy-header">
      Burst: {eventCount} events ({new Date(startTime).toLocaleTimeString()} – {new Date(endTime).toLocaleTimeString()})
    </div>
  );
}

// --- Stories ---

export const Default: Story = {
  render: () => {
    const base = Date.now();
    const items: DemoEvent[] = [
      makeEvent('1', base, 'Chat completion', '#D97757'),
      makeEvent('2', base + 15 * MIN, 'Chat completion', '#10A37F'),
      makeEvent('3', base + 30 * MIN, 'Eval run', '#22c55e'),
      makeEvent('4', base + 45 * MIN, 'Chat completion', '#D97757'),
      makeEvent('5', base + 60 * MIN, 'Chat completion', '#4285F4'),
      makeEvent('6', base + 75 * MIN, 'Cost spike', '#eab308'),
      makeEvent('7', base + 90 * MIN, 'Chat completion', '#D97757'),
      makeEvent('8', base + 105 * MIN, 'Eval run', '#22c55e'),
    ];
    return <EventTimeline items={items} renderItem={renderDemoItem} />;
  },
};

export const WithQuietPeriods: Story = {
  render: () => {
    const base = Date.now();
    const items: DemoEvent[] = [
      makeEvent('1', base, 'Morning chat', '#D97757'),
      makeEvent('2', base + 10 * MIN, 'Morning eval', '#22c55e'),
      // 4h quiet gap
      makeEvent('3', base + 4 * HOUR, 'Afternoon chat', '#10A37F'),
      makeEvent('4', base + 4 * HOUR + 15 * MIN, 'Afternoon eval', '#22c55e'),
    ];
    return (
      <EventTimeline
        items={items}
        renderItem={renderDemoItem}
        renderQuietMarker={(props) => <QuietMarker {...props} />}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const quietMarker = canvasElement.querySelector('[data-testid="quiet-marker"]');
    await expect(quietMarker).toBeInTheDocument();
  },
};

export const ExpandQuietPeriod: Story = {
  render: () => {
    const base = Date.now();
    const items: DemoEvent[] = [
      makeEvent('1', base, 'Before quiet', '#D97757'),
      // 5h gap
      makeEvent('2', base + 5 * HOUR, 'After quiet', '#10A37F'),
    ];
    return (
      <EventTimeline
        items={items}
        renderItem={renderDemoItem}
        renderQuietMarker={(props) => <QuietMarker {...props} />}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const quietMarker = canvasElement.querySelector('[data-testid="quiet-marker"]');
    await expect(quietMarker).toBeInTheDocument();
    // Click to expand
    if (quietMarker) {
      await userEvent.click(quietMarker);
    }
  },
};

export const WithBusyClusters: Story = {
  render: () => {
    const base = Date.now();
    // 8 events in 10 minutes = busy
    const items: DemoEvent[] = [
      makeEvent('1', base, 'Burst 1', '#D97757'),
      makeEvent('2', base + 1 * MIN, 'Burst 2', '#D97757'),
      makeEvent('3', base + 2 * MIN, 'Burst 3', '#10A37F'),
      makeEvent('4', base + 3 * MIN, 'Burst 4', '#D97757'),
      makeEvent('5', base + 5 * MIN, 'Burst 5', '#22c55e'),
      makeEvent('6', base + 7 * MIN, 'Burst 6', '#D97757'),
      makeEvent('7', base + 8 * MIN, 'Burst 7', '#4285F4'),
      makeEvent('8', base + 10 * MIN, 'Burst 8', '#D97757'),
    ];
    return (
      <EventTimeline
        items={items}
        renderItem={renderDemoItem}
        renderBusyHeader={(props) => <BusyHeader {...props} />}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const busyHeader = canvasElement.querySelector('[data-testid="busy-header"]');
    await expect(busyHeader).toBeInTheDocument();
  },
};

export const MixedActivity: Story = {
  render: () => {
    const base = Date.now();
    const items: DemoEvent[] = [
      // Morning normal activity
      makeEvent('1', base, 'Morning check', '#D97757'),
      makeEvent('2', base + 20 * MIN, 'Quick chat', '#10A37F'),
      // 3h quiet gap
      // Afternoon busy cluster
      makeEvent('3', base + 3 * HOUR, 'Deploy check', '#D97757'),
      makeEvent('4', base + 3 * HOUR + 1 * MIN, 'Eval T1', '#22c55e'),
      makeEvent('5', base + 3 * HOUR + 2 * MIN, 'Eval T2', '#22c55e'),
      makeEvent('6', base + 3 * HOUR + 3 * MIN, 'Cost alert', '#eab308'),
      makeEvent('7', base + 3 * HOUR + 5 * MIN, 'Fix chat', '#D97757'),
      // Normal evening
      makeEvent('8', base + 4 * HOUR, 'Evening chat', '#4285F4'),
    ];
    return (
      <EventTimeline
        items={items}
        renderItem={renderDemoItem}
        renderQuietMarker={(props) => <QuietMarker {...props} />}
        renderBusyHeader={(props) => <BusyHeader {...props} />}
      />
    );
  },
};

export const Empty: Story = {
  render: () => (
    <EventTimeline items={[]} renderItem={() => null} />
  ),
  play: async ({ canvasElement }) => {
    const timeline = canvasElement.querySelector('[data-slot="event-timeline"]');
    await expect(timeline).toBeInTheDocument();
    await expect(timeline?.textContent).toContain('No events');
  },
};

export const ScrollIndicators: Story = {
  render: () => {
    const base = Date.now();
    // 25 events to ensure horizontal scroll
    const items: DemoEvent[] = Array.from({ length: 25 }, (_, i) =>
      makeEvent(`${i}`, base + i * 10 * MIN, `Event ${i + 1}`, [
        '#D97757', '#10A37F', '#4285F4', '#22c55e', '#eab308',
      ][i % 5])
    );
    return (
      <div style={{ maxWidth: 800 }}>
        <EventTimeline items={items} renderItem={renderDemoItem} />
      </div>
    );
  },
};

// ── Phase 4: River Intelligence Stories ──

function DemoCard({ label, color = '#D97757' }: { label: string; color?: string }) {
  return (
    <EventCard accentColor={color} significance="medium">
      <EventCardSummary>
        <div className="text-xs font-medium text-white/80">{label}</div>
      </EventCardSummary>
      <EventCardDetail>
        <div className="text-xs text-white/60">Detail for {label}</div>
      </EventCardDetail>
    </EventCard>
  );
}

/** FanOutStack: click to fan/collapse grouped cards */
export const SessionFanOut: Story = {
  render: () => (
    <div className="flex items-end gap-3 p-4" style={{ background: '#0a0a0f' }}>
      <FanOutStack accentColor="#D97757">
        <DemoCard label="Chat 1" color="#D97757" />
        <DemoCard label="Chat 2" color="#D97757" />
        <DemoCard label="Chat 3" color="#D97757" />
      </FanOutStack>

      <DemoCard label="Solo event" color="#22c55e" />

      <FanOutStack accentColor="#10A37F">
        <DemoCard label="Deploy check" color="#10A37F" />
        <DemoCard label="Eval run" color="#10A37F" />
      </FanOutStack>

      <FanOutStack accentColor="#4285F4">
        <DemoCard label="Compare GPT-4o" color="#4285F4" />
        <DemoCard label="Compare Gemini" color="#4285F4" />
        <DemoCard label="Compare Claude" color="#D97757" />
        <DemoCard label="Cost analysis" color="#eab308" />
        <DemoCard label="Final pick" color="#22c55e" />
      </FanOutStack>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Verify stacked state
    const stacks = canvasElement.querySelectorAll('[data-slot="fan-out-stack"]');
    await expect(stacks.length).toBe(3);
    await expect(stacks[0].getAttribute('data-state')).toBe('stacked');

    // Click first stack to fan out
    const stackButton = stacks[0].querySelector('[role="button"]');
    if (stackButton) {
      await userEvent.click(stackButton);
    }
    await expect(stacks[0].getAttribute('data-state')).toBe('fanned');
  },
};

/** ClusterSummary: collapsible busy period header */
export const BusyClusterWithSummary: Story = {
  render: () => {
    const base = Date.now();
    // 8 events in 10 minutes = busy cluster
    const items: DemoEvent[] = [
      makeEvent('1', base, 'Burst chat 1', '#D97757'),
      makeEvent('2', base + 1 * MIN, 'Burst chat 2', '#10A37F'),
      makeEvent('3', base + 2 * MIN, 'Eval T1', '#22c55e'),
      makeEvent('4', base + 3 * MIN, 'Burst chat 3', '#D97757'),
      makeEvent('5', base + 5 * MIN, 'Cost spike', '#eab308'),
      makeEvent('6', base + 7 * MIN, 'Burst chat 4', '#4285F4'),
      makeEvent('7', base + 8 * MIN, 'Eval T2', '#22c55e'),
      makeEvent('8', base + 10 * MIN, 'Burst chat 5', '#D97757'),
    ];
    return (
      <div style={{ maxWidth: 900, background: '#0a0a0f', padding: 16 }}>
        <EventTimeline
          items={items}
          renderItem={renderDemoItem}
          renderClusterSummary={({ eventCount, startTime, endTime, collapsed, onToggle }) => (
            <ClusterSummary
              eventCount={eventCount}
              startTime={startTime}
              endTime={endTime}
              collapsed={collapsed}
              onToggle={onToggle}
              renderStats={() => (
                <div className="flex items-center gap-2">
                  <span>3 providers</span>
                  <span>·</span>
                  <span>2 evals</span>
                </div>
              )}
            />
          )}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const summary = canvasElement.querySelector('[data-slot="cluster-summary"]');
    await expect(summary).toBeInTheDocument();
    // Initially shows items (not collapsed by default in the timeline)
    const busySection = canvasElement.querySelector('[data-slot="event-timeline-busy"]');
    await expect(busySection).toBeInTheDocument();
  },
};

/** TrendIndicator: signals between time periods */
export const TrendIndicators: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-4 flex-wrap" style={{ background: '#0a0a0f' }}>
      <TrendIndicator direction="up" label="cost +32%" severity="negative" />
      <TrendIndicator direction="down" label="latency -18%" severity="positive" />
      <TrendIndicator direction="flat" label="tokens stable" severity="neutral" />
      <TrendIndicator direction="new" label="new: Gemini" severity="info" />
      <TrendIndicator
        direction="up"
        label="usage +55%"
        severity="negative"
        sparkData={[2, 3, 5, 4, 8, 12, 15]}
      />
      <TrendIndicator
        direction="down"
        label="errors -40%"
        severity="positive"
        sparkData={[10, 8, 6, 7, 4, 3, 2]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const indicators = canvasElement.querySelectorAll('[data-slot="trend-indicator"]');
    await expect(indicators.length).toBe(6);
    await expect(indicators[0].getAttribute('data-direction')).toBe('up');
    await expect(indicators[0].getAttribute('data-severity')).toBe('negative');
  },
};

/** ScrollBob: cards bob up/down as you scroll horizontally */
export const ScrollBobEffect: Story = {
  render: () => {
    const base = Date.now();
    const items: DemoEvent[] = Array.from({ length: 20 }, (_, i) =>
      makeEvent(`${i}`, base + i * 8 * MIN, `Event ${i + 1}`, [
        '#D97757', '#10A37F', '#4285F4', '#22c55e', '#eab308',
      ][i % 5])
    );
    return (
      <div style={{ maxWidth: 700, background: '#0a0a0f', padding: 16 }}>
        <p className="text-xs text-white/40 mb-3">Scroll horizontally — cards bob up near center, down at edges</p>
        <EventTimeline
          items={items}
          renderItem={renderDemoItem}
          enableScrollBob
        />
      </div>
    );
  },
};

/** Keyboard navigation: arrow keys, Enter, Escape */
export const KeyboardNavigation: Story = {
  render: () => {
    const base = Date.now();
    const items: DemoEvent[] = Array.from({ length: 8 }, (_, i) =>
      makeEvent(`${i}`, base + i * 15 * MIN, `Card ${i + 1}`, [
        '#D97757', '#10A37F', '#4285F4', '#22c55e',
      ][i % 4])
    );
    return (
      <div style={{ maxWidth: 700, background: '#0a0a0f', padding: 16 }}>
        <p className="text-xs text-white/40 mb-3">
          Click the timeline, then use Arrow keys to navigate, Enter to activate, Escape to clear focus
        </p>
        <EventTimeline
          items={items}
          renderItem={renderDemoItem}
          enableKeyboardNav
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    // Focus the scroll container (it has tabIndex from keyboard nav)
    const container = canvasElement.querySelector('[role="listbox"]');
    await expect(container).toBeInTheDocument();
    if (container) {
      (container as HTMLElement).focus();
      // Press ArrowRight to focus first item
      await userEvent.keyboard('{ArrowRight}');
      const focused = canvasElement.querySelector('[data-focused="true"]');
      await expect(focused).toBeInTheDocument();
      // Press Escape to clear
      await userEvent.keyboard('{Escape}');
      const stillFocused = canvasElement.querySelector('[data-focused="true"]');
      await expect(stillFocused).toBeNull();
    }
  },
};

/** Scroll snap: gentle snapping to card boundaries */
export const ScrollSnap: Story = {
  render: () => {
    const base = Date.now();
    const items: DemoEvent[] = Array.from({ length: 15 }, (_, i) =>
      makeEvent(`${i}`, base + i * 12 * MIN, `Event ${i + 1}`, [
        '#D97757', '#10A37F', '#4285F4', '#22c55e', '#eab308',
      ][i % 5])
    );
    return (
      <div style={{ maxWidth: 600, background: '#0a0a0f', padding: 16 }}>
        <p className="text-xs text-white/40 mb-3">Scroll snap proximity — cards settle naturally at boundaries</p>
        <EventTimeline
          items={items}
          renderItem={renderDemoItem}
          scrollSnapType="proximity"
        />
      </div>
    );
  },
};

/** Trend rendering between periods in a full timeline */
export const TimelineWithTrends: Story = {
  render: () => {
    const base = Date.now();
    const items: DemoEvent[] = [
      // Morning batch
      makeEvent('1', base, 'Morning chat', '#D97757'),
      makeEvent('2', base + 10 * MIN, 'Morning eval', '#22c55e'),
      // 3h quiet gap
      // Afternoon burst
      makeEvent('3', base + 3 * HOUR, 'Afternoon chat 1', '#10A37F'),
      makeEvent('4', base + 3 * HOUR + 1 * MIN, 'Afternoon chat 2', '#D97757'),
      makeEvent('5', base + 3 * HOUR + 2 * MIN, 'Afternoon eval', '#22c55e'),
      makeEvent('6', base + 3 * HOUR + 4 * MIN, 'Cost alert', '#eab308'),
      makeEvent('7', base + 3 * HOUR + 6 * MIN, 'Fix chat', '#D97757'),
      // Normal evening
      makeEvent('8', base + 5 * HOUR, 'Evening chat', '#4285F4'),
      makeEvent('9', base + 5 * HOUR + 20 * MIN, 'Evening wrap', '#D97757'),
    ];

    const trendSignals: Array<{ direction: TrendDirection; label: string; severity: TrendSeverity; spark?: number[] }> = [
      { direction: 'up', label: 'cost +22%', severity: 'negative', spark: [3, 4, 5, 7, 9] },
      { direction: 'down', label: 'latency -15%', severity: 'positive' },
      { direction: 'new', label: 'new: Gemini', severity: 'info' },
    ];

    return (
      <div style={{ maxWidth: 900, background: '#0a0a0f', padding: 16 }}>
        <EventTimeline
          items={items}
          renderItem={renderDemoItem}
          renderQuietMarker={(props) => <QuietMarker {...props} />}
          renderTrend={({ index }) => {
            const t = trendSignals[index % trendSignals.length];
            return <TrendIndicator direction={t.direction} label={t.label} severity={t.severity} sparkData={t.spark} />;
          }}
        />
      </div>
    );
  },
};

/** FullRiver: everything together — clusters, trends, scroll bob, keyboard nav */
export const FullRiver: Story = {
  render: () => {
    const base = Date.now();
    const items: DemoEvent[] = [
      // Morning normal — varied providers and interfaces
      makeChatEvent('m1', base, {
        provider: 'Anthropic', color: '#D97757', model: 'claude-sonnet-4-6',
        tokens: 2100, cost: '$0.003', iface: 'Discord',
      }),
      makeChatEvent('m2', base + 8 * MIN, {
        provider: 'OpenAI', color: '#00A67E', model: 'gpt-4o',
        tokens: 8200, cost: '$0.042', iface: 'KeroHub', significance: 'high',
      }),
      makeEvalEvent('m3', base + 15 * MIN, { tier: 1, passed: 25, total: 25 }),
      // 3h quiet gap
      // Afternoon busy burst (7 events in 12min → busy cluster)
      makeChatEvent('a1', base + 3 * HOUR, {
        provider: 'Anthropic', color: '#D97757', model: 'claude-haiku-4-5',
        tokens: 1500, cost: '$0.002', iface: 'CLI',
      }),
      makeEvalEvent('a2', base + 3 * HOUR + 2 * MIN, { tier: 1, passed: 24, total: 25 }),
      makeEvalEvent('a3', base + 3 * HOUR + 4 * MIN, { tier: 2, passed: 18, total: 20 }),
      makeCostEvent('a4', base + 3 * HOUR + 6 * MIN, { multiplier: 3.2, cost: '$4.80' }),
      makeChatEvent('a5', base + 3 * HOUR + 8 * MIN, {
        provider: 'Anthropic', color: '#D97757', model: 'claude-sonnet-4-6',
        tokens: 4200, cost: '$0.018', iface: 'Discord',
      }),
      makeEvalEvent('a6', base + 3 * HOUR + 10 * MIN, { tier: 1, passed: 25, total: 25 }),
      makeChatEvent('a7', base + 3 * HOUR + 12 * MIN, {
        provider: 'OpenAI', color: '#00A67E', model: 'gpt-4o-mini',
        tokens: 950, cost: '$0.001', iface: 'KeroHub',
      }),
      // Evening normal
      makeChatEvent('e1', base + 5 * HOUR, {
        provider: 'Anthropic', color: '#D97757', model: 'claude-haiku-4-5',
        tokens: 3100, cost: '$0.005', iface: 'Discord',
      }),
      makeChatEvent('e2', base + 5 * HOUR + 10 * MIN, {
        provider: 'OpenAI', color: '#00A67E', model: 'gpt-4o',
        tokens: 6400, cost: '$0.032', iface: 'CLI',
      }),
      makeChatEvent('e3', base + 5 * HOUR + 25 * MIN, {
        provider: 'Anthropic', color: '#D97757', model: 'claude-sonnet-4-6',
        tokens: 1800, cost: '$0.008', iface: 'KeroHub',
      }),
    ];

    const trendSignals: Array<{ direction: TrendDirection; label: string; severity: TrendSeverity }> = [
      { direction: 'up', label: 'cost +32%', severity: 'negative' },
      { direction: 'down', label: 'errors -40%', severity: 'positive' },
      { direction: 'flat', label: 'latency stable', severity: 'neutral' },
    ];

    return (
      <div style={{ maxWidth: 900, background: '#0a0a0f', padding: 16 }}>
        <EventTimeline
          items={items}
          renderItem={renderDemoItem}
          renderQuietMarker={(props) => <QuietMarker {...props} />}
          renderClusterSummary={({ eventCount, startTime, endTime, peakDensity, collapsed, onToggle }) => (
            <ClusterSummary
              eventCount={eventCount}
              startTime={startTime}
              endTime={endTime}
              collapsed={collapsed}
              onToggle={onToggle}
              renderStats={() => (
                <div className="flex items-center gap-2">
                  <span>Peak: {peakDensity}/5min</span>
                  <span>·</span>
                  <span>3 evals</span>
                </div>
              )}
            />
          )}
          renderTrend={({ index }) => {
            const t = trendSignals[index % trendSignals.length];
            return <TrendIndicator direction={t.direction} label={t.label} severity={t.severity} />;
          }}
          enableScrollBob
          enableKeyboardNav
          scrollSnapType="mandatory"
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const timeline = canvasElement.querySelector('[data-slot="event-timeline"]');
    await expect(timeline).toBeInTheDocument();

    // Verify cluster summary is rendered
    const summary = canvasElement.querySelector('[data-slot="cluster-summary"]');
    await expect(summary).toBeInTheDocument();

    // Verify trend indicators between periods
    const trends = canvasElement.querySelectorAll('[data-slot="trend-indicator"]');
    await expect(trends.length).toBeGreaterThan(0);

    // Verify keyboard nav is active (role="listbox")
    const listbox = canvasElement.querySelector('[role="listbox"]');
    await expect(listbox).toBeInTheDocument();
  },
};
