import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { useState } from 'react';
import { EventCard, EventCardSummary, EventCardDetail, EventCardAction } from './event-card';

const meta = {
  title: 'Components/EventCard',
  tags: ['autodocs', 'lifecycle:prototype'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#0a0a0f' }] },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

// ── Icon components (inline SVGs to avoid lucide-react dep in packages/ui) ──

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
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

function TrendingUpIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" /><path d="M12 17h.01" />
    </svg>
  );
}

function PickaxeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.531 12.469 6.619 20.38a1 1 0 1 1-3-3l7.912-7.912" />
      <path d="M15.686 4.314A12.5 12.5 0 0 0 5.461 2.958 1 1 0 0 0 5.58 4.71a22 22 0 0 1 6.318 3.393" />
      <path d="M17.7 3.7a1 1 0 0 0-1.4 0l-4.6 4.6a1 1 0 0 0 0 1.4l2.6 2.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4Z" />
      <path d="M19.686 8.314a12.5 12.5 0 0 1 1.356 10.225 1 1 0 0 1-1.751-.119 22 22 0 0 0-3.393-6.318" />
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

// ── Provider brand icons (simplified inline SVGs — real app uses @lobehub/icons) ──

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

function OllamaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd">
      <path d="M7.905 1.09c.216.085.411.225.588.41.295.306.544.744.734 1.263.191.522.315 1.1.362 1.68a5.054 5.054 0 012.049-.636l.051-.004c.87-.07 1.73.087 2.48.474.101.053.2.11.297.17.05-.569.172-1.134.36-1.644.19-.52.439-.957.733-1.264a1.67 1.67 0 01.589-.41c.257-.1.53-.118.796-.042.401.114.745.368 1.016.737.248.337.434.769.561 1.287.23.934.27 2.163.115 3.645l.053.04.026.019c.757.576 1.284 1.397 1.563 2.35.435 1.487.216 3.155-.534 4.088l-.018.021.002.003c.417.762.67 1.567.724 2.4l.002.03c.064 1.065-.2 2.137-.814 3.19l-.007.01.01.024c.472 1.157.62 2.322.438 3.486l-.006.039a.651.651 0 01-.747.536.648.648 0 01-.54-.742c.167-1.033.01-2.069-.48-3.123a.643.643 0 01.04-.617l.004-.006c.604-.924.854-1.83.8-2.72-.046-.779-.325-1.544-.8-2.273a.644.644 0 01.18-.886l.009-.006c.243-.159.467-.565.58-1.12a4.229 4.229 0 00-.095-1.974c-.205-.7-.58-1.284-1.105-1.683-.595-.454-1.383-.673-2.38-.61a.653.653 0 01-.632-.371c-.314-.665-.772-1.141-1.343-1.436a3.288 3.288 0 00-1.772-.332c-1.245.099-2.343.801-2.67 1.686a.652.652 0 01-.61.425c-1.067.002-1.893.252-2.497.703-.522.39-.878.935-1.066 1.588a4.07 4.07 0 00-.068 1.886c.112.558.331 1.02.582 1.269l.008.007c.212.207.257.53.109.785-.36.622-.629 1.549-.673 2.44-.05 1.018.186 1.902.719 2.536l.016.019a.643.643 0 01.095.69c-.576 1.236-.753 2.252-.562 3.052a.652.652 0 01-1.269.298c-.243-1.018-.078-2.184.473-3.498l.014-.035-.008-.012a4.339 4.339 0 01-.598-1.309l-.005-.019a5.764 5.764 0 01-.177-1.785c.044-.91.278-1.842.622-2.59l.012-.026-.002-.002c-.293-.418-.51-.953-.63-1.545l-.005-.024a5.352 5.352 0 01.093-2.49c.262-.915.777-1.701 1.536-2.269.06-.045.123-.09.186-.132-.159-1.493-.119-2.73.112-3.67.127-.518.314-.95.562-1.287.27-.368.614-.622 1.015-.737.266-.076.54-.059.797.042zm4.116 9.09c.936 0 1.8.313 2.446.855.63.527 1.005 1.235 1.005 1.94 0 .888-.406 1.58-1.133 2.022-.62.375-1.451.557-2.403.557-1.009 0-1.871-.259-2.493-.734-.617-.47-.963-1.13-.963-1.845 0-.707.398-1.417 1.056-1.946.668-.537 1.55-.849 2.485-.849zm0 .896a3.07 3.07 0 00-1.916.65c-.461.37-.722.835-.722 1.25 0 .428.21.829.61 1.134.455.347 1.124.548 1.943.548.799 0 1.473-.147 1.932-.426.463-.28.7-.686.7-1.257 0-.423-.246-.89-.683-1.256-.484-.405-1.14-.643-1.864-.643zm.662 1.21l.004.004c.12.151.095.37-.056.49l-.292.23v.446a.375.375 0 01-.376.373.375.375 0 01-.376-.373v-.46l-.271-.218a.347.347 0 01-.052-.49.353.353 0 01.494-.051l.215.172.22-.174a.353.353 0 01.49.051zm-5.04-1.919c.478 0 .867.39.867.871a.87.87 0 01-.868.871.87.87 0 01-.867-.87.87.87 0 01.867-.872zm8.706 0c.48 0 .868.39.868.871a.87.87 0 01-.868.871.87.87 0 01-.867-.87.87.87 0 01.867-.872zM7.44 2.3l-.003.002a.659.659 0 00-.285.238l-.005.006c-.138.189-.258.467-.348.832-.17.692-.216 1.631-.124 2.782.43-.128.899-.208 1.404-.237l.01-.001.019-.034c.046-.082.095-.161.148-.239.123-.771.022-1.692-.253-2.444-.134-.364-.297-.65-.453-.813a.628.628 0 00-.107-.09L7.44 2.3zm9.174.04l-.002.001a.628.628 0 00-.107.09c-.156.163-.32.45-.453.814-.29.794-.387 1.776-.23 2.572l.058.097.008.014h.03a5.184 5.184 0 011.466.212c.086-1.124.038-2.043-.128-2.722-.09-.365-.21-.643-.349-.832l-.004-.006a.659.659 0 00-.285-.239h-.004z" />
    </svg>
  );
}

// ── Product/model icons (real brand marks from @lobehub/icons) ──

/** Claude — organic terra cotta mark */
function ClaudeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" fillRule="nonzero" />
    </svg>
  );
}

/** OpenAI — hexagonal flower mark */
function ChatGPTIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd">
      <path d="M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z" />
    </svg>
  );
}

/** Gemini — four-pointed star */
function GeminiIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" />
    </svg>
  );
}

// ── Helpers ──

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

/** Turn raw model IDs into readable display names. Falls back to cleaned-up ID. */
const MODEL_DISPLAY_NAMES: Record<string, string> = {
  'claude-opus-4-6': 'Opus 4.6',
  'claude-sonnet-4-6': 'Sonnet 4.6',
  'claude-sonnet-4-5': 'Sonnet 4.5',
  'claude-haiku-4-5': 'Haiku 4.5',
  'claude-sonnet-3-5': 'Sonnet 3.5',
  'claude-haiku-3-5': 'Haiku 3.5',
  'gpt-4o': 'GPT-4o',
  'gpt-4o-mini': 'GPT-4o Mini',
  'gpt-4-turbo': 'GPT-4 Turbo',
  'gpt-3.5-turbo': 'GPT-3.5',
  'o3': 'o3',
  'o3-mini': 'o3 Mini',
  'o4-mini': 'o4 Mini',
  'gemini-2.5-pro': 'Gemini 2.5 Pro',
  'gemini-2.5-pro-preview': 'Gemini 2.5 Pro',
  'gemini-2.5-flash': 'Gemini 2.5 Flash',
  'gemini-2.0-flash': 'Gemini 2.0 Flash',
};

function friendlyModelName(rawId: string): string {
  // Direct match
  if (MODEL_DISPLAY_NAMES[rawId]) return MODEL_DISPLAY_NAMES[rawId];
  // Strip date suffixes (e.g., "-20251001", "-2025-03-01", "-preview-0325") and try again
  const stripped = rawId.replace(/-\d{4}-\d{2}-\d{2}$/, '').replace(/-\d{8,}$/, '').replace(/-preview[^"]*$/, '');
  if (MODEL_DISPLAY_NAMES[stripped]) return MODEL_DISPLAY_NAMES[stripped];
  // For slashed models (ollama), use the part after slash
  if (rawId.includes('/')) {
    const afterSlash = rawId.split('/').pop()!;
    // Title-case it: "andy-4" → "Andy 4"
    return afterSlash.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
  // Last resort: strip common prefixes, replace dashes with spaces, title-case
  return stripped
    .replace(/^claude-/, '')
    .replace(/^gpt-/, 'GPT-')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

const PROVIDER_ICONS: Record<string, (p: { className?: string }) => React.JSX.Element> = {
  Anthropic: AnthropicIcon,
  OpenAI: OpenAIIcon,
  Google: GoogleIcon,
  Ollama: OllamaIcon,
};

/** Product-level icons for model names (not company logos) */
function modelIconFor(modelId: string): ((p: { className?: string }) => React.JSX.Element) | null {
  if (modelId.startsWith('claude-')) return ClaudeIcon;
  if (modelId.startsWith('gpt-') || modelId.startsWith('o3') || modelId.startsWith('o4')) return ChatGPTIcon;
  if (modelId.startsWith('gemini-')) return GeminiIcon;
  if (modelId.includes('/')) return OllamaIcon; // ollama format: user/model
  return null;
}

function ProviderBadge({ label, color, status, latencyMs }: { label: string; color: string; status?: 'healthy' | 'degraded' | 'down'; latencyMs?: number }) {
  const BrandIcon = PROVIDER_ICONS[label];
  const statusColors = { healthy: '#22c55e', degraded: '#eab308', down: '#ef4444' };
  const statusLabels = { healthy: 'Healthy', degraded: 'Degraded', down: 'Down' };
  return (
    <span className="group/provider relative">
      <span
        className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium cursor-help transition-all duration-150 hover:brightness-125"
        style={{ backgroundColor: `${color}18`, color }}
      >
        {BrandIcon && <BrandIcon className="h-2.5 w-2.5" />}
        {label}
        {status && (
          <span className="relative flex h-1.5 w-1.5">
            {status === 'healthy' && <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50" style={{ backgroundColor: statusColors[status] }} />}
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColors[status] }} />
          </span>
        )}
      </span>
      {/* Tooltip */}
      {status && (
        <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-[9px] text-white/80 opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity duration-150 group-hover/provider:opacity-100">
          <span className="flex items-center gap-1.5">
            <span className="inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColors[status] }} />
            {statusLabels[status]}
            {latencyMs !== undefined && <span className="text-white/40">· {latencyMs}ms</span>}
          </span>
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-zinc-900" />
        </span>
      )}
    </span>
  );
}

function InterfaceBadge({ Icon, label, color, compact }: { Icon: (p: { className?: string }) => React.JSX.Element; label: string; color: string; compact?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded-full px-1 py-0.5 text-[9px]"
      style={{ backgroundColor: `${color}15`, color }}
      title={`via ${label}`}
    >
      <Icon className="h-2.5 w-2.5" />
      {!compact && <span>{label}</span>}
    </span>
  );
}

/** Lightweight CSS-only tooltip wrapper */
function Tip({ children, label }: { children: React.ReactNode; label: React.ReactNode }) {
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-[9px] text-white/80 opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity duration-150 group-hover/tip:opacity-100">
        {label}
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-zinc-900" />
      </span>
    </span>
  );
}

function TokenBar({ inputTokens, outputTokens, totalTokens, color }: { inputTokens: number; outputTokens: number; totalTokens: number; color: string }) {
  const inputRatio = totalTokens > 0 ? Math.round((inputTokens / totalTokens) * 100) : 50;
  return (
    <Tip label={<span className="flex items-center gap-2"><span>Input {inputRatio}%</span><span className="text-white/40">·</span><span>Output {100 - inputRatio}%</span></span>}>
      <div className="flex items-center gap-1.5 cursor-help w-full">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10 transition-all duration-200 hover:h-2">
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${inputRatio}%`, backgroundColor: `${color}50` }} />
        </div>
        <span className="text-[8px] text-white/40">
          {formatTokens(inputTokens)}↑ {formatTokens(outputTokens)}↓
        </span>
      </div>
    </Tip>
  );
}

const TOOL_DESCRIPTIONS: Record<string, string> = {
  search: 'Web search via Brave/Tavily',
  calculator: 'Math expression evaluator',
  code_interpreter: 'Sandboxed Python execution',
  file_upload: 'File attachment processing',
  browser: 'Headless browser navigation',
  mcp: 'MCP server tool dispatch',
};

function ToolPills({ tools }: { tools: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {tools.slice(0, 3).map((tool) => (
        <Tip key={tool} label={TOOL_DESCRIPTIONS[tool] ?? tool}>
          <span className="rounded bg-white/10 px-1 py-px text-[8px] text-white/50 cursor-help transition-colors duration-150 hover:bg-white/15 hover:text-white/70">
            {tool}
          </span>
        </Tip>
      ))}
      {tools.length > 3 && (
        <Tip label={tools.slice(3).join(', ')}>
          <span className="text-[8px] text-white/30 cursor-help hover:text-white/50 transition-colors">+{tools.length - 3}</span>
        </Tip>
      )}
    </div>
  );
}


// ── Chat Card (matches river ChatEventNode) with drill-down ──

function ChatCard({ provider, color, model, inputTokens, outputTokens, cost, tools, interfaceIcon: IIcon, interfaceLabel, interfaceColor, isDegraded, degradationReason, durationMs, sessionId, significance }: {
  provider: string; color: string; model: string;
  inputTokens: number; outputTokens: number; cost: string;
  tools?: string[]; interfaceIcon: (p: { className?: string }) => React.JSX.Element;
  interfaceLabel: string; interfaceColor: string;
  isDegraded?: boolean; degradationReason?: string;
  durationMs?: number; sessionId?: string;
  significance?: 'high' | 'medium' | 'low';
}) {
  const totalTokens = inputTokens + outputTokens;
  const isHigh = significance === 'high';
  const displayModel = friendlyModelName(model);

  return (
    <EventCard accentColor={color} significance={significance} className="relative">
      <CardWatermark Icon={MessageIcon} color={color} />
      <EventCardSummary className="p-0">
        <div className="flex flex-col flex-1 p-3">
          {/* Provider badge + interface badge + time */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5">
              <ProviderBadge label={provider} color={color} />
              <InterfaceBadge Icon={IIcon} label={interfaceLabel} color={interfaceColor} compact={!isHigh} />
            </div>
            <span className="shrink-0 text-[9px] text-white/30 transition-colors duration-200 group-hover/card:text-white/50">3m ago</span>
          </div>

          {/* Model name + degradation */}
          <div className="mt-1.5 flex items-center gap-1">
            {(() => { const I = modelIconFor(model); return I ? <I className="h-3 w-3 shrink-0 opacity-40 transition-opacity duration-200 group-hover/card:opacity-60" /> : null; })()}
            <p className="truncate text-[11px] text-white/80 transition-colors duration-200 group-hover/card:text-white/95">{displayModel}</p>
            {isDegraded && (
              <span title={degradationReason ?? 'Degraded'}>
                <AlertIcon className="h-2.5 w-2.5 text-amber-400/70" />
              </span>
            )}
          </div>

          {/* Stats line */}
          <div className="mt-1 flex items-center gap-2 text-[10px] text-white/50 transition-colors duration-200 group-hover/card:text-white/65">
            <span>{formatTokens(totalTokens)} tok</span>
            <span className="text-white/20">&middot;</span>
            <span>{cost}</span>
            {tools && tools.length > 0 && (
              <>
                <span className="text-white/20">&middot;</span>
                <span>{tools.length} tools</span>
              </>
            )}
          </div>

          {/* Token split bar (high only) */}
          {isHigh && <div className="mt-1.5"><TokenBar inputTokens={inputTokens} outputTokens={outputTokens} totalTokens={totalTokens} color={color} /></div>}

          {/* Tool pills (high only) */}
          {isHigh && tools && tools.length > 0 && <div className="mt-1"><ToolPills tools={tools} /></div>}
        </div>
        {/* session link as interactive sub-element */}
        {sessionId && (
          <div className="px-3 pb-2">
            <EventCardAction href={`/ai/sessions/${sessionId}`}>View session</EventCardAction>
          </div>
        )}
      </EventCardSummary>

      {/* ── DETAIL: the new stuff — revealed on hover ── */}
      <EventCardDetail className="border-t-0">
        <div className="space-y-0.5 text-[10px]">
          {/* Full model name — friendly name with raw ID underneath */}
          <DetailRow icon={modelIconFor(model) ?? ZapIcon} label="Model" color="#a78bfa">
            <div className="flex flex-col items-end">
              <span className="text-white/80 font-medium">{displayModel}</span>
              <span className="text-white/25 font-mono text-[8px]">{model}</span>
            </div>
          </DetailRow>
          {/* Token breakdown */}
          <DetailRow icon={ArrowUpIcon} label="Input" value={`${inputTokens.toLocaleString()} tokens`} color="#60a5fa" />
          <DetailRow icon={ArrowDownIcon} label="Output" value={`${outputTokens.toLocaleString()} tokens`} color="#34d399" />
          {durationMs && (
            <DetailRow icon={ClockIcon} label="Duration" value={`${(durationMs / 1000).toFixed(1)}s`} color="#fbbf24" />
          )}
          <DetailRow icon={CoinsIcon} label="Cost" value={cost} color="#f97316" />
          {/* All tools */}
          {tools && tools.length > 0 && (
            <div className="pt-1">
              <span className="text-white/40 block mb-1">Tools used</span>
              <div className="flex flex-wrap gap-1">
                {tools.map((t) => (
                  <span key={t} className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] text-white/60">{t}</span>
                ))}
              </div>
            </div>
          )}
          {isDegraded && degradationReason && (
            <div className="flex items-start gap-1.5 rounded bg-amber-500/10 px-2 py-1.5 mt-1">
              <AlertIcon className="h-3 w-3 text-amber-400/70 shrink-0 mt-0.5" />
              <span className="text-amber-400/70">{degradationReason}</span>
            </div>
          )}
          {sessionId && (
            <DetailRow label="Session" value={`#${sessionId.slice(0, 8)}`} color="#60a5fa" mono />
          )}
        </div>
      </EventCardDetail>
    </EventCard>
  );
}

// ── Eval Card (matches river EvalEventNode) ──

function EvalCard({ tier, passed, total, failed, passRate, filter, triggeredBy, description, durationMs, significance }: {
  tier: number; passed: number; total: number; failed: number; passRate: number;
  filter?: string[]; triggeredBy?: string; description?: string; durationMs?: number;
  significance?: 'high' | 'medium' | 'low';
}) {
  const hasFails = failed > 0;
  const fillPercent = Math.round(passRate * 100);
  const accentColor = hasFails ? '#ef4444' : '#22c55e';

  return (
    <EventCard
      accentColor={accentColor}
      significance={significance}
      className={`relative ${hasFails ? 'bg-red-950/20 border-red-500/40' : ''}`}
    >
      <CardWatermark Icon={FlaskIcon} color={accentColor} />
      <EventCardSummary>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${hasFails ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
              <FlaskIcon className="h-2.5 w-2.5" />
              T{tier}
            </span>
            {triggeredBy && (
              <span className="rounded bg-white/10 px-1 py-0.5 text-[8px] text-white/40">{triggeredBy}</span>
            )}
          </div>
          <span className="text-[9px] text-white/30 transition-colors duration-200 group-hover/card:text-white/50">12m ago</span>
        </div>

        {description && <p className="mt-1 truncate text-[10px] text-white/40 transition-colors duration-200 group-hover/card:text-white/55">{description}</p>}

        {/* Pass count */}
        <p className={`mt-1 text-lg font-semibold tabular-nums transition-colors duration-200 ${hasFails ? 'text-red-400 group-hover/card:text-red-300' : 'text-emerald-400 group-hover/card:text-emerald-300'}`}>
          {passed}/{total}
        </p>

        {/* Fill bar */}
        <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
          {hasFails && <div className="h-full bg-red-500/40" style={{ width: `${100 - fillPercent}%`, float: 'right' }} />}
          <div className="h-full bg-emerald-500/50" style={{ width: `${fillPercent}%` }} />
        </div>

        {/* Filter pills */}
        {filter && filter.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {filter.slice(0, 3).map((cat) => (
              <span key={cat} className={`rounded px-1 py-px text-[8px] ${hasFails ? 'bg-red-500/10 text-red-400/60' : 'bg-emerald-500/10 text-emerald-400/60'}`}>
                {cat}
              </span>
            ))}
          </div>
        )}
      </EventCardSummary>

      <EventCardDetail>
        <div className="space-y-2 text-[10px]">
          <div className="flex justify-between">
            <span className="text-white/40">Tier</span>
            <span className="text-white/70">{tier}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Pass rate</span>
            <span className={hasFails ? 'text-red-400' : 'text-emerald-400'}>{fillPercent}%</span>
          </div>
          {durationMs && (
            <div className="flex justify-between">
              <span className="text-white/40">Duration</span>
              <span className="text-white/70">{(durationMs / 1000).toFixed(0)}s</span>
            </div>
          )}
          {filter && filter.length > 0 && (
            <div>
              <span className="text-white/40 block mb-1">Filter categories</span>
              <div className="flex flex-wrap gap-1">
                {filter.map((f) => (
                  <span key={f} className={`rounded px-1.5 py-0.5 text-[9px] ${hasFails ? 'bg-red-500/10 text-red-400/60' : 'bg-emerald-500/10 text-emerald-400/60'}`}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
          {hasFails && (
            <div className="rounded bg-red-500/10 px-2 py-1 text-red-400/80">
              {failed} test{failed > 1 ? 's' : ''} failed — click to view report
            </div>
          )}
        </div>
      </EventCardDetail>
    </EventCard>
  );
}

// ── Cost Spike Card (matches river CostSpikeNode) ──

function CostSpikeCard({ multiplier, costFormatted, previousFormatted, dayLabel }: {
  multiplier: number; costFormatted: string; previousFormatted: string; dayLabel: string;
}) {
  return (
    <EventCard
      accentColor="#eab308"
      significance="medium"
      className="relative border-amber-500/30 bg-amber-950/15"
    >
      <CardWatermark Icon={TrendingUpIcon} color="#eab308" />
      <EventCardSummary>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
            <TrendingUpIcon className="h-2.5 w-2.5" />
            {multiplier}x spike
          </span>
          <span className="text-[9px] text-white/30 transition-colors duration-200 group-hover/card:text-white/50">{dayLabel}</span>
        </div>

        {/* Cost comparison bars */}
        <div className="mt-3 flex items-end gap-2">
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 rounded-sm bg-amber-500/20 transition-colors duration-200 group-hover/card:bg-amber-500/30" style={{ height: 16 }} />
            <span className="text-[8px] text-white/40 transition-colors duration-200 group-hover/card:text-white/55">{previousFormatted}</span>
          </div>
          <TrendingUpIcon className="mb-3 h-3.5 w-3.5 text-amber-400/60 transition-colors duration-200 group-hover/card:text-amber-400/80" />
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 rounded-sm bg-amber-500/50 transition-colors duration-200 group-hover/card:bg-amber-500/65" style={{ height: Math.min(16 * multiplier, 48) }} />
            <span className="text-[9px] font-medium text-amber-400 transition-colors duration-200 group-hover/card:text-amber-300">{costFormatted}</span>
          </div>
        </div>
      </EventCardSummary>

      <EventCardDetail>
        <div className="space-y-2 text-[10px]">
          <div className="flex justify-between">
            <span className="text-white/40">Previous</span>
            <span className="text-white/70">{previousFormatted}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Current</span>
            <span className="text-amber-400 font-medium">{costFormatted}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Increase</span>
            <span className="text-amber-400">{multiplier}x day-over-day</span>
          </div>
          <div className="rounded bg-amber-500/10 px-2 py-1 text-amber-400/80">
            Click to view usage breakdown
          </div>
        </div>
      </EventCardDetail>
    </EventCard>
  );
}

// ── Stories ──

export const Default: Story = {
  name: 'Chat Event — Standard',
  render: () => (
    <ChatCard
      provider="Anthropic" color="#D97757" model="claude-haiku-4-5-20251001"
      inputTokens={2100} outputTokens={350} cost="$0.003"
      interfaceIcon={MessageIcon} interfaceLabel="Discord" interfaceColor="#5865F2"
      durationMs={1200} sessionId="a1b2c3d4-e5f6-7890"
    />
  ),
};

export const ChatHighSignificance: Story = {
  name: 'Chat Event — High Significance (Hover for Details)',
  render: () => (
    <ChatCard
      provider="OpenAI" color="#00A67E" model="gpt-4o-2025-03-01"
      inputTokens={8200} outputTokens={3100} cost="$0.042"
      tools={['search', 'calculator', 'code_interpreter', 'file_upload']}
      interfaceIcon={GlobeIcon} interfaceLabel="KeroHub" interfaceColor="#3B82F6"
      significance="high" durationMs={4500} sessionId="f8e7d6c5-b4a3"
    />
  ),
};

export const ChatDegraded: Story = {
  name: 'Chat Event — Degraded Provider',
  render: () => (
    <ChatCard
      provider="Anthropic" color="#D97757" model="claude-haiku-4-5-20251001"
      inputTokens={1500} outputTokens={200} cost="$0.002"
      interfaceIcon={TerminalIcon} interfaceLabel="CLI" interfaceColor="#22C55E"
      isDegraded degradationReason="Primary model overloaded, fell back from claude-sonnet-4-6"
      durationMs={800}
    />
  ),
};

export const MindcraftEvent: Story = {
  name: 'Chat Event — Mindcraft Bot',
  render: () => (
    <div className="flex gap-3">
      <ChatCard
        provider="Anthropic" color="#D97757" model="claude-haiku-4-5-20251001"
        inputTokens={280} outputTokens={45} cost="$0.0004"
        interfaceIcon={PickaxeIcon} interfaceLabel="Mindcraft" interfaceColor="#10B981"
        significance="low" durationMs={600}
      />
      <ChatCard
        provider="Ollama" color="#888888" model="sweaterdog/andy-4"
        inputTokens={1100} outputTokens={200} cost="free"
        interfaceIcon={PickaxeIcon} interfaceLabel="Mindcraft" interfaceColor="#10B981"
        significance="low" durationMs={2200}
      />
    </div>
  ),
};

export const EvalPassing: Story = {
  name: 'Eval Event — All Passing',
  render: () => (
    <EvalCard
      tier={1} passed={25} total={25} failed={0} passRate={1.0}
      filter={['personality', 'safety', 'tool-use']}
      triggeredBy="CI" description="Full tier 1 regression"
      durationMs={45000} significance="medium"
    />
  ),
};

export const EvalFailing: Story = {
  name: 'Eval Event — With Failures (Hover for Details)',
  render: () => (
    <EvalCard
      tier={2} passed={18} total={20} failed={2} passRate={0.9}
      filter={['multi-turn', 'context-retention', 'tool-chaining', 'personality-drift']}
      triggeredBy="manual" description="Multi-turn regression check"
      durationMs={120000} significance="high"
    />
  ),
};

export const CostSpike: Story = {
  name: 'Cost Spike Event',
  render: () => (
    <CostSpikeCard
      multiplier={3} costFormatted="$1.42" previousFormatted="$0.47" dayLabel="Mon, Mar 10"
    />
  ),
};

export const ControlledState: Story = {
  name: 'Controlled Expansion',
  render: function ControlledStory() {
    const [expanded, setExpanded] = useState(false);
    return (
      <div className="space-y-4">
        <button
          className="px-3 py-1.5 text-xs rounded-md bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
          onClick={() => setExpanded(!expanded)}
          data-testid="toggle-btn"
        >
          {expanded ? 'Collapse detail panel' : 'Expand detail panel'}
        </button>
        <EventCard accentColor="#4285F4" expanded={expanded} onExpandedChange={setExpanded}>
          <EventCardSummary className="p-0">
            <div className="p-3">
              <div className="flex items-center justify-between gap-1">
                <ProviderBadge label="Google" color="#4285F4" />
                <span className="text-[9px] text-white/30">1h ago</span>
              </div>
              <p className="mt-1.5 truncate text-[11px] text-white/80">gemini-2.5-pro</p>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-white/50">
                <span>8.0k tok</span>
                <span className="text-white/20">&middot;</span>
                <span>$0.018</span>
              </div>
            </div>
            <div className="px-3 pb-2">
              <EventCardAction href="/ai/sessions/gemini-001">View session</EventCardAction>
            </div>
          </EventCardSummary>
          <EventCardDetail>
            <div className="space-y-2 text-[10px]">
              <div className="flex justify-between">
                <span className="text-white/40">Model</span>
                <span className="text-white/70 font-mono">gemini-2.5-pro-preview-0325</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Input</span>
                <span className="text-white/70 tabular-nums">6,200 tokens</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Output</span>
                <span className="text-white/70 tabular-nums">1,800 tokens</span>
              </div>
            </div>
          </EventCardDetail>
        </EventCard>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('[data-slot="event-card"]')!;
    const btn = canvasElement.querySelector('[data-testid="toggle-btn"]')!;

    await expect(card).toHaveAttribute('data-state', 'collapsed');
    await userEvent.click(btn);
    await expect(card).toHaveAttribute('data-state', 'expanded');
    await userEvent.click(btn);
    await expect(card).toHaveAttribute('data-state', 'collapsed');
  },
};

export const AllVariants: Story = {
  name: 'All Event Types',
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-white/40">
          Chat Events — hover any card to reveal full details
        </h3>
        <div className="flex items-start gap-3 flex-wrap">
          <ChatCard
            provider="Anthropic" color="#D97757" model="claude-haiku-4-5-20251001"
            inputTokens={2100} outputTokens={350} cost="$0.003"
            interfaceIcon={MessageIcon} interfaceLabel="Discord" interfaceColor="#5865F2"
            durationMs={1200} sessionId="a1b2c3d4-e5f6"
          />
          <ChatCard
            provider="OpenAI" color="#00A67E" model="gpt-4o-2025-03-01"
            inputTokens={8200} outputTokens={3100} cost="$0.042"
            tools={['search', 'calculator', 'code_interpreter', 'file_upload']}
            interfaceIcon={GlobeIcon} interfaceLabel="KeroHub" interfaceColor="#3B82F6"
            significance="high" durationMs={4500} sessionId="f8e7d6c5-b4a3"
          />
          <ChatCard
            provider="Ollama" color="#888888" model="sweaterdog/andy-4"
            inputTokens={1100} outputTokens={200} cost="free"
            interfaceIcon={PickaxeIcon} interfaceLabel="Mindcraft" interfaceColor="#10B981"
            significance="low" durationMs={2200}
          />
          <ChatCard
            provider="Google" color="#4285F4" model="gemini-2.5-pro-preview-0325"
            inputTokens={5200} outputTokens={1800} cost="$0.018"
            interfaceIcon={TerminalIcon} interfaceLabel="CLI" interfaceColor="#22C55E"
            isDegraded degradationReason="Fell back from gemini-2.5-ultra"
            durationMs={3100}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-white/40">
          Eval Events — hover to see filter categories and failure details
        </h3>
        <div className="flex items-start gap-3">
          <EvalCard
            tier={1} passed={25} total={25} failed={0} passRate={1.0}
            filter={['personality', 'safety', 'tool-use']} triggeredBy="CI"
            description="Full tier 1 regression" durationMs={45000}
          />
          <EvalCard
            tier={2} passed={18} total={20} failed={2} passRate={0.9}
            filter={['multi-turn', 'context-retention', 'tool-chaining', 'personality-drift']}
            triggeredBy="manual" description="Multi-turn check" durationMs={120000} significance="high"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-white/40">
          Cost Spike Events — hover for day-over-day breakdown
        </h3>
        <div className="flex items-start gap-3">
          <CostSpikeCard multiplier={3} costFormatted="$1.42" previousFormatted="$0.47" dayLabel="Mon, Mar 10" />
          <CostSpikeCard multiplier={7} costFormatted="$4.89" previousFormatted="$0.70" dayLabel="Fri, Mar 7" />
        </div>
      </div>
    </div>
  ),
};

// ── Interaction Tests ──

export const ActionLinks: Story = {
  name: 'Action Links (Interaction Test)',
  render: () => (
    <EventCard accentColor="#D97757" defaultExpanded>
      <EventCardSummary>
        <div className="flex items-center justify-between gap-1">
          <ProviderBadge label="Anthropic" color="#D97757" />
          <span className="text-[9px] text-white/30">3m ago</span>
        </div>
        <div className="mt-1.5 flex items-center gap-1">
          <ClaudeIcon className="h-3 w-3 text-[#D97757]/60" />
          <p className="truncate text-[11px] text-white/80">Haiku 4.5</p>
        </div>
        <div className="mt-1 flex items-center gap-2 text-[10px] text-white/50">
          <span>2.5k tok</span>
          <span className="text-white/20">&middot;</span>
          <span>$0.003</span>
        </div>
        <div className="mt-2">
          <EventCardAction href="/ai/sessions/test-session">View session</EventCardAction>
        </div>
      </EventCardSummary>
      <EventCardDetail>
        <div className="flex gap-2">
          <EventCardAction href="/ai/research/reports/eval-001">View eval report</EventCardAction>
          <EventCardAction href="/ai/usage">Usage breakdown</EventCardAction>
        </div>
      </EventCardDetail>
    </EventCard>
  ),
  play: async ({ canvasElement }) => {
    const actions = canvasElement.querySelectorAll('[data-slot="event-card-action"]');
    await expect(actions.length).toBe(3);
    await expect(actions[0]).toHaveAttribute('href', '/ai/sessions/test-session');
    await expect(actions[0]!.tagName).toBe('A');
    // Card itself should NOT be a button
    const card = canvasElement.querySelector('[data-slot="event-card"]')!;
    await expect(card.tagName).toBe('DIV');
    await expect(card.getAttribute('role')).toBeNull();
  },
};

export const SignificanceSizing: Story = {
  name: 'Significance Sizing',
  render: () => (
    <div className="flex items-start gap-4">
      {(['high', 'medium', 'low'] as const).map((sig) => (
        <ChatCard
          key={sig}
          provider="Anthropic" color="#D97757" model="claude-haiku-4-5-20251001"
          inputTokens={sig === 'high' ? 12000 : sig === 'medium' ? 3000 : 300}
          outputTokens={sig === 'high' ? 4000 : sig === 'medium' ? 500 : 45}
          cost={sig === 'high' ? '$0.12' : sig === 'medium' ? '$0.003' : '$0.0004'}
          tools={sig === 'high' ? ['search', 'calculator', 'code_interpreter', 'file_upload'] : undefined}
          interfaceIcon={sig === 'low' ? PickaxeIcon : MessageIcon}
          interfaceLabel={sig === 'low' ? 'Mindcraft' : 'Discord'}
          interfaceColor={sig === 'low' ? '#10B981' : '#5865F2'}
          significance={sig}
        />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const cards = canvasElement.querySelectorAll('[data-slot="event-card"]');
    await expect(cards[0]).toHaveAttribute('data-significance', 'high');
    await expect(cards[1]).toHaveAttribute('data-significance', 'medium');
    await expect(cards[2]).toHaveAttribute('data-significance', 'low');
  },
};

// ── Icon Density Variants ──
// Prototype 3 levels: minimal (text-only badges), medium (icon + label badges), maximum (icons everywhere)

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CoinsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" /><path d="M7 6h1v4" /><path d="m16.71 13.88.7.71-2.82 2.82" />
    </svg>
  );
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  );
}

function HashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="20" y1="9" y2="9" /><line x1="4" x2="20" y1="15" y2="15" /><line x1="10" x2="8" y1="3" y2="21" /><line x1="16" x2="14" y1="3" y2="21" />
    </svg>
  );
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 7-7 7 7" /><path d="M12 19V5" />
    </svg>
  );
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" /><path d="m19 12-7 7-7-7" />
    </svg>
  );
}

// ── Micro-visualization helpers ──

/** Cost with one-shot text highlight for high values */
function CostValue({ value, threshold = 0.05 }: { value: string; threshold?: number }) {
  const numericValue = parseFloat(value.replace('$', ''));
  const isHigh = numericValue >= threshold;
  return (
    <span className={isHigh ? 'font-medium animate-[costFlash_1.5s_ease-out] text-white/80' : ''}>
      {value}
    </span>
  );
}

/** Animated fill bar that grows from 0 on mount */
function AnimatedFillBar({ percent, color, bgColor }: { percent: number; color: string; bgColor: string }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: bgColor }}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${percent}%`,
          backgroundColor: color,
          animation: 'growWidth 800ms ease-out',
        }}
      />
    </div>
  );
}

/** Duration text with slow pulse for slow completions */
function DurationValue({ ms, slowThreshold = 5000 }: { ms: number; slowThreshold?: number }) {
  const isSlow = ms >= slowThreshold;
  const formatted = ms >= 60000 ? `${(ms / 60000).toFixed(1)}m` : `${(ms / 1000).toFixed(1)}s`;
  return (
    <span className={isSlow ? 'animate-pulse text-amber-400/70' : ''}>
      {formatted}
    </span>
  );
}

/** Large faded background icon for instant card-type recognition */
function CardWatermark({ Icon, color }: { Icon: (p: { className?: string }) => React.JSX.Element; color?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg" aria-hidden="true">
      <div className="absolute -bottom-3 -right-3 opacity-[0.06]" style={color ? { color } : undefined}>
        <Icon className="h-20 w-20" />
      </div>
    </div>
  );
}

/** Stat value with cursor-help and tooltip */
function StatWithTip({ icon: Icon, value, label, tipText }: { icon?: (p: { className?: string }) => React.JSX.Element; value: string; label: string; tipText: string }) {
  return (
    <Tip label={tipText}>
      <span className="inline-flex items-center gap-0.5 cursor-help transition-colors hover:text-white/70">
        {Icon && <Icon className="h-2.5 w-2.5 text-white/30" />}
        <span>{value}</span>
      </span>
    </Tip>
  );
}

/**
 * Detail row where the icon lights up with its semantic color on hover.
 * Icon starts at muted white, transitions to its `color` on row hover.
 */
/**
 * DetailRow hover modes:
 * - `'icon'` — only icon gains semantic color, text just brightens
 * - `'text'` — only label gains semantic color, icon just brightens
 * - `'both'` — icon + label both gain semantic color
 * Default is `'both'`.
 */
function DetailRow({ icon: Icon, label, value, color, mono, hoverMode = 'both', children }: {
  icon?: (p: { className?: string; style?: React.CSSProperties }) => React.JSX.Element;
  label: string;
  value?: string | React.ReactNode;
  color?: string;
  mono?: boolean;
  hoverMode?: 'icon' | 'text' | 'both';
  children?: React.ReactNode;
}) {
  const iconGainsColor = hoverMode === 'icon' || hoverMode === 'both';
  const textGainsColor = hoverMode === 'text' || hoverMode === 'both';

  return (
    <div
      className="group/row flex justify-between items-baseline rounded-sm px-1.5 -mx-1.5 py-1 transition-colors duration-150 hover:bg-white/[0.04] cursor-default"
    >
      <span className="inline-flex items-center gap-1.5 text-white/40 transition-colors duration-200">
        {Icon && (
          iconGainsColor && color ? (
            /* Icon crossfades from neutral to semantic color — same technique as text */
            <span className="relative inline-flex h-2.5 w-2.5">
              <span className="absolute inset-0 inline-flex transition-opacity duration-200 opacity-30 group-hover/row:opacity-0">
                <Icon className="h-2.5 w-2.5" />
              </span>
              <span className="absolute inset-0 inline-flex transition-opacity duration-200 opacity-0 group-hover/row:opacity-100" style={{ color }}>
                <Icon className="h-2.5 w-2.5" />
              </span>
            </span>
          ) : (
            /* Icon just brightens (white) */
            <Icon className="h-2.5 w-2.5 transition-all duration-200 opacity-30 group-hover/row:opacity-70" />
          )
        )}
        {textGainsColor && color ? (
          /* Label crossfades from white/40 to semantic color */
          <span className="relative">
            <span className="transition-opacity duration-200 opacity-100 group-hover/row:opacity-0">{label}</span>
            <span className="absolute inset-0 transition-opacity duration-200 opacity-0 group-hover/row:opacity-100" style={{ color }}>{label}</span>
          </span>
        ) : (
          /* Label just brightens */
          <span className="transition-colors duration-200 group-hover/row:text-white/70">{label}</span>
        )}
      </span>
      {value !== undefined && (
        <span className={`text-white/60 transition-colors duration-200 group-hover/row:text-white/90 ${mono ? 'font-mono text-[9px]' : ''}`}>
          {value}
        </span>
      )}
      {children}
    </div>
  );
}

export const MicroVisualizations: Story = {
  name: 'Micro-Visualizations (Sub-Element Hover Effects)',
  render: () => (
    <div className="space-y-8">
      {/* Inject keyframes */}
      <style>{`
        @keyframes costFlash {
          0% { color: rgba(255,255,255,0.5); }
          30% { color: rgba(255,255,255,1); }
          100% { color: rgba(255,255,255,0.8); }
        }
        @keyframes growWidth {
          from { width: 0%; }
        }
        @keyframes arrowTrace {
          0% { stroke-dashoffset: 60; opacity: 0.2; }
          15% { stroke-dashoffset: 60; opacity: 0.3; }
          50% { stroke-dashoffset: 0; opacity: 1; }
          70% { stroke-dashoffset: 0; opacity: 0.8; }
          100% { stroke-dashoffset: 60; opacity: 0.2; }
        }
      `}</style>

      <p className="text-[10px] uppercase tracking-widest text-white/30">
        Hover individual elements — badges, bars, pills, costs — for tooltips and micro-interactions
      </p>

      {/* Chat card with all micro-vis */}
      <div>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-white/40">
          Chat Event — provider status dot, token bar tooltip, tool descriptions, cost shimmer
        </h3>
        <div className="flex items-start gap-3">
          {/* High-cost card with shimmer */}
          <EventCard accentColor="#D97757" significance="high" defaultExpanded>
            <EventCardSummary>
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <ProviderBadge label="Anthropic" color="#D97757" status="healthy" latencyMs={142} />
                  <InterfaceBadge Icon={GlobeIcon} label="KeroHub" color="#3B82F6" />
                </div>
                <span className="inline-flex items-center gap-0.5 text-[9px] text-white/30">
                  <ClockIcon className="h-2.5 w-2.5" />3m
                </span>
              </div>
              <p className="mt-1.5 truncate text-[11px] text-white/80">sonnet-4.6</p>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-white/50">
                <StatWithTip icon={HashIcon} value="12.4k" label="tokens" tipText="12,400 total tokens (8,200 in + 4,200 out)" />
                <span className="text-white/20">&middot;</span>
                <Tip label="$0.0031/1k input · $0.015/1k output">
                  <span className="inline-flex items-center gap-0.5 cursor-help transition-colors hover:text-white/70">
                    <CoinsIcon className="h-2.5 w-2.5 text-white/30" />
                    <CostValue value="$0.082" threshold={0.05} />
                  </span>
                </Tip>
                <span className="text-white/20">&middot;</span>
                <Tip label="Time to first token: 380ms">
                  <span className="inline-flex items-center gap-0.5 cursor-help transition-colors hover:text-white/70">
                    <ClockIcon className="h-2.5 w-2.5 text-white/30" />
                    <DurationValue ms={6200} />
                  </span>
                </Tip>
              </div>
              <div className="mt-1.5">
                <TokenBar inputTokens={8200} outputTokens={4200} totalTokens={12400} color="#D97757" />
              </div>
              <div className="mt-1">
                <ToolPills tools={['search', 'calculator', 'code_interpreter', 'file_upload']} />
              </div>
              <div className="mt-2">
                <EventCardAction href="/ai/sessions/abc123">View session</EventCardAction>
              </div>
            </EventCardSummary>
            <EventCardDetail className="border-t-0">
              <div className="space-y-0.5 text-[10px]">
                <DetailRow icon={ClaudeIcon} label="Model" color="#a78bfa">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-white/80 font-medium">Sonnet 4.6</span>
                    <span className="text-white/30 font-mono text-[9px] break-all">claude-sonnet-4-6-20250514</span>
                  </div>
                </DetailRow>
                <DetailRow icon={ArrowUpIcon} label="Input" value="8,200 tokens" color="#60a5fa" />
                <DetailRow icon={ArrowDownIcon} label="Output" value="4,200 tokens" color="#34d399" />
                <DetailRow icon={CoinsIcon} label="Cost" value="$0.082" color="#f97316" />
              </div>
            </EventCardDetail>
          </EventCard>

          {/* Degraded provider card */}
          <EventCard accentColor="#00A67E" significance="medium">
            <EventCardSummary>
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <ProviderBadge label="OpenAI" color="#00A67E" status="degraded" latencyMs={890} />
                  <InterfaceBadge Icon={TerminalIcon} label="CLI" color="#22C55E" compact />
                </div>
                <span className="text-[9px] text-white/30">8m</span>
              </div>
              <div className="mt-1.5 flex items-center gap-1">
                <p className="truncate text-[11px] text-white/80">gpt-4o</p>
                <Tip label="Primary model overloaded — fell back from gpt-4o-0325">
                  <span className="cursor-help"><AlertIcon className="h-2.5 w-2.5 text-amber-400/70" /></span>
                </Tip>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-white/50">
                <StatWithTip value="3.1k tok" label="tokens" tipText="3,100 total tokens" />
                <span className="text-white/20">&middot;</span>
                <span>$0.009</span>
              </div>
            </EventCardSummary>
          </EventCard>

          {/* Down provider */}
          <EventCard accentColor="#888888" significance="low">
            <EventCardSummary>
              <div className="flex items-center justify-between gap-1">
                <ProviderBadge label="Ollama" color="#888888" status="down" />
                <span className="text-[9px] text-white/30">2h</span>
              </div>
              <p className="mt-1.5 truncate text-[11px] text-white/60">andy-4</p>
              <div className="mt-1 text-[10px] text-white/40">280 tok · free</div>
            </EventCardSummary>
          </EventCard>
        </div>
      </div>

      {/* Eval card with animated fill bar */}
      <div>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-white/40">
          Eval Event — animated fill bar, tier glow, hoverable filter pills
        </h3>
        <div className="flex items-start gap-3">
          {/* Passing — green glow */}
          <EventCard accentColor="#22c55e" significance="medium" className="shadow-[0_0_12px_-3px_rgba(34,197,94,0.3)]">
            <EventCardSummary>
              <div className="flex items-center justify-between">
                <Tip label="Tier 1: Core personality + safety regression">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400 cursor-help shadow-[0_0_8px_-2px_rgba(34,197,94,0.4)]">
                    <FlaskIcon className="h-2.5 w-2.5" />T1
                  </span>
                </Tip>
                <span className="text-[9px] text-white/30">12m ago</span>
              </div>
              <p className="mt-1 text-lg font-semibold tabular-nums text-emerald-400">25/25</p>
              <AnimatedFillBar percent={100} color="rgba(34,197,94,0.5)" bgColor="rgba(255,255,255,0.1)" />
              <div className="mt-1 flex flex-wrap gap-1">
                {['personality', 'safety', 'tool-use'].map((f) => (
                  <Tip key={f} label={`Filter: ${f} — ${f === 'personality' ? '8 tests' : f === 'safety' ? '10 tests' : '7 tests'}`}>
                    <span className="rounded bg-emerald-500/10 px-1 py-px text-[8px] text-emerald-400/60 cursor-help hover:bg-emerald-500/20 hover:text-emerald-400/80 transition-colors">{f}</span>
                  </Tip>
                ))}
              </div>
            </EventCardSummary>
          </EventCard>

          {/* Failing — amber glow for T2 */}
          <EventCard accentColor="#ef4444" significance="high" className="bg-red-950/20 border-red-500/40">
            <EventCardSummary>
              <div className="flex items-center justify-between">
                <Tip label="Tier 2: Multi-turn conversation + context retention">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-400 cursor-help shadow-[0_0_8px_-2px_rgba(234,179,8,0.4)]">
                    <FlaskIcon className="h-2.5 w-2.5" />T2
                  </span>
                </Tip>
                <span className="text-[9px] text-white/30">1h ago</span>
              </div>
              <p className="mt-1 text-lg font-semibold tabular-nums text-red-400">18/20</p>
              <AnimatedFillBar percent={90} color="rgba(34,197,94,0.5)" bgColor="rgba(239,68,68,0.2)" />
              <div className="mt-1 flex flex-wrap gap-1">
                {['multi-turn', 'context-retention', 'personality-drift'].map((f) => (
                  <Tip key={f} label={`Filter: ${f}`}>
                    <span className="rounded bg-red-500/10 px-1 py-px text-[8px] text-red-400/60 cursor-help hover:bg-red-500/20 hover:text-red-400/80 transition-colors">{f}</span>
                  </Tip>
                ))}
              </div>
            </EventCardSummary>
          </EventCard>

          {/* Canary — purple glow */}
          <EventCard accentColor="#a855f7" significance="medium" className="shadow-[0_0_12px_-3px_rgba(168,85,247,0.3)]">
            <EventCardSummary>
              <div className="flex items-center justify-between">
                <Tip label="Canary battery: 25 prompts across 10 personality dimensions">
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 px-1.5 py-0.5 text-[10px] font-medium text-purple-400 cursor-help shadow-[0_0_8px_-2px_rgba(168,85,247,0.4)]">
                    <FlaskIcon className="h-2.5 w-2.5" />Canary
                  </span>
                </Tip>
                <span className="text-[9px] text-white/30">3h ago</span>
              </div>
              <p className="mt-1 text-lg font-semibold tabular-nums text-purple-400">24/25</p>
              <AnimatedFillBar percent={96} color="rgba(168,85,247,0.5)" bgColor="rgba(255,255,255,0.1)" />
            </EventCardSummary>
          </EventCard>
        </div>
      </div>

      {/* Cost spike with enhanced delta */}
      <div>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-white/40">
          Cost Spike — animated delta arrow, comparison bars, hoverable cost labels
        </h3>
        <div className="flex items-start gap-3">
          <EventCard accentColor="#eab308" significance="medium" className="border-amber-500/30 bg-amber-950/15">
            <EventCardSummary>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                  <TrendingUpIcon className="h-2.5 w-2.5" />3x spike
                </span>
                <span className="text-[9px] text-white/30">Mon, Mar 10</span>
              </div>
              <div className="mt-3 flex items-end gap-2">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 rounded-sm bg-amber-500/20" style={{ height: 16 }} />
                  <Tip label="Previous day average"><span className="text-[8px] text-white/40 cursor-help">$0.47</span></Tip>
                </div>
                <svg className="mb-3 h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 60, animation: 'arrowTrace 4s ease-in-out infinite', color: 'rgba(251,191,36,0.6)' }}>
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
                </svg>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 rounded-sm bg-amber-500/50" style={{ height: 48 }} />
                  <Tip label="202% increase over 24h"><span className="text-[9px] font-medium text-amber-400 cursor-help">$1.42</span></Tip>
                </div>
              </div>
              <div className="mt-2"><EventCardAction href="/ai/usage">Usage breakdown</EventCardAction></div>
            </EventCardSummary>
          </EventCard>

          {/* Extreme spike */}
          <EventCard accentColor="#ef4444" significance="medium" className="border-red-500/30 bg-red-950/15">
            <EventCardSummary>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-1.5 py-0.5 text-[10px] font-medium text-red-400">
                  <TrendingUpIcon className="h-2.5 w-2.5" />7x spike
                </span>
                <span className="text-[9px] text-white/30">Fri, Mar 7</span>
              </div>
              <div className="mt-3 flex items-end gap-2">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 rounded-sm bg-red-500/20" style={{ height: 10 }} />
                  <Tip label="Previous day average"><span className="text-[8px] text-white/40 cursor-help">$0.70</span></Tip>
                </div>
                <svg className="mb-3 h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 60, animation: 'arrowTrace 3s ease-in-out infinite', color: 'rgba(248,113,113,0.6)' }}>
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
                </svg>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 rounded-sm bg-red-500/50" style={{ height: 56 }} />
                  <Tip label="600% increase — triggered by bulk eval run"><span className="text-[9px] font-medium text-red-400 cursor-help">$4.89</span></Tip>
                </div>
              </div>
              <div className="mt-2"><EventCardAction href="/ai/usage">Investigate spike</EventCardAction></div>
            </EventCardSummary>
          </EventCard>
        </div>
      </div>
    </div>
  ),
};

export const IconDensityMinimal: Story = {
  name: 'Icon Density — Minimal',
  render: () => (
    <div className="space-y-4">
      <p className="text-[10px] uppercase tracking-widest text-white/30">Minimal — text-only badges, no icons in stats or tools</p>
      <div className="flex items-start gap-3">
        {/* Chat card: text-only provider, text-only interface, no stat icons */}
        <EventCard accentColor="#D97757" significance="high" defaultExpanded>
          <EventCardSummary>
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#D97757]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#D97757]"><AnthropicIcon className="h-2.5 w-2.5" />Anthropic</span>
                <span className="rounded-full bg-[#5865F2]/10 px-1 py-0.5 text-[9px] text-[#5865F2]">Discord</span>
              </div>
              <span className="text-[9px] text-white/30">3m ago</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1">
              <ClaudeIcon className="h-3 w-3 text-[#D97757]/60" />
              <p className="truncate text-[11px] text-white/80">Haiku 4.5</p>
            </div>
            <div className="mt-1 text-[10px] text-white/50">8.2k tok · $0.003 · 1.2s</div>
            <div className="mt-1.5"><TokenBar inputTokens={6200} outputTokens={2000} totalTokens={8200} color="#D97757" /></div>
            <div className="mt-1 flex flex-wrap gap-1">
              {['search', 'calculator', 'code_interpreter'].map((t) => (
                <span key={t} className="rounded bg-white/10 px-1 py-px text-[8px] text-white/50">{t}</span>
              ))}
            </div>
            <div className="mt-2"><EventCardAction href="#">View session</EventCardAction></div>
          </EventCardSummary>
          <EventCardDetail>
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between items-start">
                <span className="text-white/40">Model</span>
                <div className="flex flex-col items-end">
                  <span className="text-white/70 font-medium">Haiku 4.5</span>
                  <span className="text-white/25 font-mono text-[8px]">claude-haiku-4-5-20251001</span>
                </div>
              </div>
              <div className="flex justify-between"><span className="text-white/40">Input</span><span className="text-white/70">6,200 tokens</span></div>
              <div className="flex justify-between"><span className="text-white/40">Output</span><span className="text-white/70">2,000 tokens</span></div>
              <div className="flex justify-between"><span className="text-white/40">Cost</span><span className="text-white/70">$0.003</span></div>
            </div>
          </EventCardDetail>
        </EventCard>

        {/* Eval card: text-only tier badge */}
        <EventCard accentColor="#22c55e" significance="medium">
          <EventCardSummary>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">T1</span>
              <span className="text-[9px] text-white/30">12m ago</span>
            </div>
            <p className="mt-1 text-lg font-semibold tabular-nums text-emerald-400">25/25</p>
            <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-emerald-500/50 w-full" />
            </div>
          </EventCardSummary>
        </EventCard>
      </div>
    </div>
  ),
};

export const IconDensityMedium: Story = {
  name: 'Icon Density — Medium',
  render: () => (
    <div className="space-y-4">
      <p className="text-[10px] uppercase tracking-widest text-white/30">Medium — icons in badges and key stats, text tool pills</p>
      <div className="flex items-start gap-3">
        {/* Chat card: icon badges, icon stat hints */}
        <EventCard accentColor="#D97757" significance="high" defaultExpanded>
          <EventCardSummary>
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#D97757]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#D97757]">
                  <AnthropicIcon className="h-2.5 w-2.5" />Anthropic
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#5865F2]/10 px-1 py-0.5 text-[9px] text-[#5865F2]">
                  <MessageIcon className="h-2.5 w-2.5" />Discord
                </span>
              </div>
              <span className="inline-flex items-center gap-0.5 text-[9px] text-white/30"><ClockIcon className="h-2.5 w-2.5" />3m</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1">
              <ClaudeIcon className="h-3 w-3 text-[#D97757]/60" />
              <p className="truncate text-[11px] text-white/80">Haiku 4.5</p>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-white/50">
              <span className="inline-flex items-center gap-0.5"><HashIcon className="h-2.5 w-2.5 text-white/30" />8.2k</span>
              <span className="text-white/20">&middot;</span>
              <span className="inline-flex items-center gap-0.5"><CoinsIcon className="h-2.5 w-2.5 text-white/30" />$0.003</span>
              <span className="text-white/20">&middot;</span>
              <span className="inline-flex items-center gap-0.5"><ZapIcon className="h-2.5 w-2.5 text-white/30" />3 tools</span>
            </div>
            <div className="mt-1.5"><TokenBar inputTokens={6200} outputTokens={2000} totalTokens={8200} color="#D97757" /></div>
            <div className="mt-1 flex flex-wrap gap-1">
              {['search', 'calculator', 'code_interpreter'].map((t) => (
                <span key={t} className="rounded bg-white/10 px-1 py-px text-[8px] text-white/50">{t}</span>
              ))}
            </div>
            <div className="mt-2"><EventCardAction href="#">View session</EventCardAction></div>
          </EventCardSummary>
          <EventCardDetail>
            <div className="space-y-0.5 text-[10px]">
              <DetailRow icon={ClaudeIcon} label="Model" color="#a78bfa">
                <div className="flex flex-col items-end">
                  <span className="text-white/80 font-medium">Haiku 4.5</span>
                  <span className="text-white/25 font-mono text-[8px]">claude-haiku-4-5-20251001</span>
                </div>
              </DetailRow>
              <DetailRow icon={ArrowUpIcon} label="Input" value="6,200 tokens" color="#60a5fa" />
              <DetailRow icon={ArrowDownIcon} label="Output" value="2,000 tokens" color="#34d399" />
              <DetailRow icon={CoinsIcon} label="Cost" value="$0.003" color="#f97316" />
            </div>
          </EventCardDetail>
        </EventCard>

        {/* Eval card: icon in tier badge */}
        <EventCard accentColor="#22c55e" significance="medium">
          <EventCardSummary>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                <FlaskIcon className="h-2.5 w-2.5" />T1
              </span>
              <span className="inline-flex items-center gap-0.5 text-[9px] text-white/30"><ClockIcon className="h-2.5 w-2.5" />12m</span>
            </div>
            <p className="mt-1 text-lg font-semibold tabular-nums text-emerald-400">25/25</p>
            <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-emerald-500/50 w-full" />
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {['personality', 'safety'].map((f) => (
                <span key={f} className="rounded bg-emerald-500/10 px-1 py-px text-[8px] text-emerald-400/60">{f}</span>
              ))}
            </div>
          </EventCardSummary>
        </EventCard>
      </div>
    </div>
  ),
};

export const IconDensityMaximum: Story = {
  name: 'Icon Density — Maximum',
  render: () => (
    <div className="space-y-4">
      <p className="text-[10px] uppercase tracking-widest text-white/30">Maximum — icons on everything: badges, stats, tools, detail rows, actions</p>
      <div className="flex items-start gap-3">
        {/* Chat card: icons everywhere */}
        <EventCard accentColor="#D97757" significance="high" defaultExpanded>
          <EventCardSummary>
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#D97757]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#D97757]">
                  <AnthropicIcon className="h-2.5 w-2.5" />Anthropic
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#5865F2]/10 px-1 py-0.5 text-[9px] text-[#5865F2]">
                  <MessageIcon className="h-2.5 w-2.5" />Discord
                </span>
              </div>
              <span className="inline-flex items-center gap-0.5 text-[9px] text-white/30"><ClockIcon className="h-2.5 w-2.5" />3m</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1">
              <ClaudeIcon className="h-3 w-3 text-[#D97757]/60" />
              <p className="truncate text-[11px] text-white/80">Haiku 4.5</p>
              <span title="Degraded fallback"><AlertIcon className="h-2.5 w-2.5 text-amber-400/70" /></span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-white/50">
              <span className="inline-flex items-center gap-0.5"><ArrowUpIcon className="h-2.5 w-2.5 text-white/30" />6.2k</span>
              <span className="inline-flex items-center gap-0.5"><ArrowDownIcon className="h-2.5 w-2.5 text-white/30" />2.0k</span>
              <span className="text-white/20">&middot;</span>
              <span className="inline-flex items-center gap-0.5"><CoinsIcon className="h-2.5 w-2.5 text-white/30" />$0.003</span>
              <span className="text-white/20">&middot;</span>
              <span className="inline-flex items-center gap-0.5"><ClockIcon className="h-2.5 w-2.5 text-white/30" />1.2s</span>
            </div>
            <div className="mt-1.5"><TokenBar inputTokens={6200} outputTokens={2000} totalTokens={8200} color="#D97757" /></div>
            <div className="mt-1 flex flex-wrap gap-1">
              {[
                { name: 'search', Icon: GlobeIcon },
                { name: 'calculator', Icon: HashIcon },
                { name: 'code', Icon: TerminalIcon },
              ].map(({ name, Icon }) => (
                <span key={name} className="inline-flex items-center gap-0.5 rounded bg-white/10 px-1 py-px text-[8px] text-white/50 cursor-default" title={name}>
                  <Icon className="h-2 w-2" />{name}
                </span>
              ))}
              <span className="text-[8px] text-white/30">+1</span>
            </div>
            <div className="mt-2"><EventCardAction href="#">View session</EventCardAction></div>
          </EventCardSummary>
          <EventCardDetail>
            <div className="space-y-0.5 text-[10px]">
              <DetailRow icon={ClaudeIcon} label="Model" color="#a78bfa">
                <div className="flex flex-col items-end">
                  <span className="text-white/80 font-medium">Haiku 4.5</span>
                  <span className="text-white/25 font-mono text-[8px]">claude-haiku-4-5-20251001</span>
                </div>
              </DetailRow>
              <DetailRow icon={ArrowUpIcon} label="Input" value="6,200 tokens" color="#60a5fa" />
              <DetailRow icon={ArrowDownIcon} label="Output" value="2,000 tokens" color="#34d399" />
              <DetailRow icon={ClockIcon} label="Duration" value="1.2s" color="#fbbf24" />
              <DetailRow icon={CoinsIcon} label="Cost" value="$0.003" color="#f97316" />
              <div className="flex items-start gap-1.5 rounded bg-amber-500/10 px-2 py-1.5 mt-1">
                <AlertIcon className="h-3 w-3 text-amber-400/70 shrink-0 mt-0.5" />
                <span className="text-amber-400/70">Fell back from claude-sonnet-4-6</span>
              </div>
            </div>
          </EventCardDetail>
        </EventCard>

        {/* Eval card: icons on everything */}
        <EventCard accentColor="#22c55e" significance="medium" defaultExpanded>
          <EventCardSummary>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                <FlaskIcon className="h-2.5 w-2.5" />T1
              </span>
              <span className="inline-flex items-center gap-0.5 text-[9px] text-white/30"><ClockIcon className="h-2.5 w-2.5" />12m</span>
            </div>
            <p className="mt-1 text-lg font-semibold tabular-nums text-emerald-400">25/25</p>
            <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-emerald-500/50 w-full" />
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {[
                { name: 'personality', Icon: MessageIcon },
                { name: 'safety', Icon: AlertIcon },
                { name: 'tool-use', Icon: TerminalIcon },
              ].map(({ name, Icon }) => (
                <span key={name} className="inline-flex items-center gap-0.5 rounded bg-emerald-500/10 px-1 py-px text-[8px] text-emerald-400/60 cursor-default" title={name}>
                  <Icon className="h-2 w-2" />{name}
                </span>
              ))}
            </div>
            <div className="mt-2"><EventCardAction href="#">View report</EventCardAction></div>
          </EventCardSummary>
          <EventCardDetail>
            <div className="space-y-0.5 text-[10px]">
              <DetailRow icon={FlaskIcon} label="Tier" value="1" color="#34d399" />
              <DetailRow icon={HashIcon} label="Pass rate" value="100%" color="#22c55e" />
              <DetailRow icon={ClockIcon} label="Duration" value="45s" color="#fbbf24" />
            </div>
          </EventCardDetail>
        </EventCard>

        {/* Cost spike: icons on everything */}
        <EventCard accentColor="#eab308" significance="medium" className="border-amber-500/30 bg-amber-950/15" defaultExpanded>
          <EventCardSummary>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                <TrendingUpIcon className="h-2.5 w-2.5" />3x spike
              </span>
              <span className="inline-flex items-center gap-0.5 text-[9px] text-white/30"><ClockIcon className="h-2.5 w-2.5" />Mon</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[10px]">
              <span className="inline-flex items-center gap-0.5 text-white/40"><CoinsIcon className="h-2.5 w-2.5" />$0.47</span>
              <TrendingUpIcon className="h-3 w-3 text-amber-400/60" />
              <span className="inline-flex items-center gap-0.5 text-amber-400 font-medium"><CoinsIcon className="h-2.5 w-2.5" />$1.42</span>
            </div>
            <div className="mt-2"><EventCardAction href="#">Usage breakdown</EventCardAction></div>
          </EventCardSummary>
          <EventCardDetail>
            <div className="space-y-0.5 text-[10px]">
              <DetailRow icon={CoinsIcon} label="Previous" value="$0.47" color="#94a3b8" />
              <DetailRow icon={CoinsIcon} label="Current" value="$1.42" color="#f97316" />
              <DetailRow icon={TrendingUpIcon} label="Increase" value="3x day-over-day" color="#ef4444" />
            </div>
          </EventCardDetail>
        </EventCard>
      </div>
    </div>
  ),
};

// ── Hover Mode Comparison ──

/** Reusable card shell for hover comparison */
function HoverDemoCard({ title, mode, accentColor = '#D97757', children }: {
  title: string;
  mode: 'icon' | 'text' | 'both';
  accentColor?: string;
  children?: React.ReactNode;
}) {
  return (
    <EventCard accentColor={accentColor} significance="high" defaultExpanded>
      <EventCardSummary>
        <p className="text-[10px] font-medium uppercase tracking-widest text-white/30 mb-1">{title}</p>
        <div className="flex items-center gap-1">
          <ClaudeIcon className="h-3 w-3 text-[#D97757]/60" />
          <p className="truncate text-[11px] text-white/80">Haiku 4.5</p>
        </div>
        <div className="mt-1 text-[10px] text-white/50">8.2k tok · $0.003</div>
      </EventCardSummary>
      <EventCardDetail>
        <div className="space-y-0.5 text-[10px]">
          {children ?? (
            <>
              <DetailRow icon={ClaudeIcon} label="Model" color="#a78bfa" hoverMode={mode}>
                <div className="flex flex-col items-end">
                  <span className="text-white/80 font-medium">Haiku 4.5</span>
                  <span className="text-white/25 font-mono text-[8px]">claude-haiku-4-5-20251001</span>
                </div>
              </DetailRow>
              <DetailRow icon={ArrowUpIcon} label="Input" value="6,200 tokens" color="#60a5fa" hoverMode={mode} />
              <DetailRow icon={ArrowDownIcon} label="Output" value="2,000 tokens" color="#34d399" hoverMode={mode} />
              <DetailRow icon={ClockIcon} label="Duration" value="1.2s" color="#fbbf24" hoverMode={mode} />
              <DetailRow icon={CoinsIcon} label="Cost" value="$0.003" color="#f97316" hoverMode={mode} />
            </>
          )}
        </div>
      </EventCardDetail>
    </EventCard>
  );
}

export const HoverModeComparison: Story = {
  name: 'Detail Row Hover — Icon vs Text vs Both',
  render: () => (
    <div className="space-y-8">
      <p className="text-[10px] uppercase tracking-widest text-white/30">
        Hover each row to compare — icon only, text only, or both gain semantic color
      </p>

      {/* Chat card — all three modes */}
      <div className="flex gap-4">
        <HoverDemoCard title="Icon color only" mode="icon" />
        <HoverDemoCard title="Text color only" mode="text" />
        <HoverDemoCard title="Both colored" mode="both" />
      </div>

      {/* Eval — all three modes */}
      <div className="flex gap-4">
        {(['icon', 'text', 'both'] as const).map((mode) => (
          <EventCard key={mode} accentColor="#22c55e" significance="medium" defaultExpanded>
            <EventCardSummary>
              <p className="text-[10px] font-medium uppercase tracking-widest text-white/30 mb-1">Eval — {mode}</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400"><FlaskIcon className="h-2.5 w-2.5" />T1 — 25/25</span>
            </EventCardSummary>
            <EventCardDetail>
              <div className="space-y-0.5 text-[10px]">
                <DetailRow icon={FlaskIcon} label="Tier" value="1" color="#34d399" hoverMode={mode} />
                <DetailRow icon={HashIcon} label="Pass rate" value="100%" color="#22c55e" hoverMode={mode} />
                <DetailRow icon={ClockIcon} label="Duration" value="45s" color="#fbbf24" hoverMode={mode} />
              </div>
            </EventCardDetail>
          </EventCard>
        ))}
      </div>

      {/* Cost spike — all three modes */}
      <div className="flex gap-4">
        {(['icon', 'text', 'both'] as const).map((mode) => (
          <EventCard key={mode} accentColor="#eab308" significance="medium" className="border-amber-500/30 bg-amber-950/15" defaultExpanded>
            <EventCardSummary>
              <p className="text-[10px] font-medium uppercase tracking-widest text-white/30 mb-1">Cost — {mode}</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-400"><TrendingUpIcon className="h-2.5 w-2.5" />3x</span>
            </EventCardSummary>
            <EventCardDetail>
              <div className="space-y-0.5 text-[10px]">
                <DetailRow icon={CoinsIcon} label="Previous" value="$0.47" color="#94a3b8" hoverMode={mode} />
                <DetailRow icon={CoinsIcon} label="Current" value="$1.42" color="#f97316" hoverMode={mode} />
                <DetailRow icon={TrendingUpIcon} label="Increase" value="3x" color="#ef4444" hoverMode={mode} />
              </div>
            </EventCardDetail>
          </EventCard>
        ))}
      </div>
    </div>
  ),
};
