/**
 * Wave Playground — Compare approaches to voice-synthesis visualization.
 *
 * AudioWave:    Deterministic composite sine waves (original)
 * NoiseWave:    Fractal Brownian Motion — genuinely different every frame
 * EnvelopeWave: Noise wave driven by Rem's actual voice amplitude envelope
 * ChromaWave:   EnvelopeWave + hue shifts through a color palette with amplitude
 * VoiceWave:    Hybrid — smooth sinusoids + Gaussian attenuation + additive Canvas glow + envelope
 */
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { AudioWave } from './audio-wave'
import { NoiseWave } from './noise-wave'
import { EnvelopeWave } from './envelope-wave'
import { VoiceWave } from './voice-wave'

const meta = {
  title: 'Experiments/WavePlayground',
  tags: ['autodocs', 'lifecycle:prototype'],
  parameters: {
    backgrounds: { default: 'dark' },
    layout: 'centered',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

// --- Shared card wrapper -----------------------------------------------------

function WaveCard({
  label,
  sublabel,
  children,
}: {
  label: string
  sublabel?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-32 w-56 overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
        <div className="absolute inset-0">{children}</div>
      </div>
      <p className="text-xs font-medium text-white/70">{label}</p>
      {sublabel && <p className="text-[10px] text-white/30">{sublabel}</p>}
    </div>
  )
}

function HoverCard({
  label,
  sublabel,
  children,
}: {
  label: string
  sublabel?: string
  children: (active: boolean) => React.ReactNode
}) {
  const [active, setActive] = useState(false)
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative h-36 w-60 cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-zinc-900 transition-colors hover:border-white/20"
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
      >
        <div className="absolute inset-0">{children(active)}</div>
      </div>
      <p className="text-xs font-medium text-white/70">{label}</p>
      {sublabel && <p className="text-[10px] text-white/30">{sublabel}</p>}
    </div>
  )
}

// --- Stories -----------------------------------------------------------------

/** All five variants idle — no hover interaction */
export const IdleComparison: Story = {
  render: () => (
    <div className="flex flex-wrap justify-center gap-6 p-4">
      <WaveCard label="AudioWave" sublabel="sine — deterministic">
        <AudioWave active={false} />
      </WaveCard>
      <WaveCard label="NoiseWave" sublabel="fbm noise — never repeats">
        <NoiseWave active={false} />
      </WaveCard>
      <WaveCard label="EnvelopeWave" sublabel="noise × Rem voice envelope">
        <EnvelopeWave active={false} colorMode="static" />
      </WaveCard>
      <WaveCard label="ChromaWave" sublabel="envelope + hue shift">
        <EnvelopeWave active={false} colorMode="chroma" />
      </WaveCard>
      <WaveCard label="VoiceWave" sublabel="sinusoids + gaussian + additive glow">
        <VoiceWave active={false} colorMode="static" />
      </WaveCard>
      <WaveCard label="VoiceWave chroma" sublabel="hybrid + hue shift">
        <VoiceWave active={false} colorMode="chroma" />
      </WaveCard>
    </div>
  ),
}

/** Hover over each card to see the active state */
export const HoverComparison: Story = {
  render: () => (
    <div className="flex flex-wrap justify-center gap-6 p-4">
      <HoverCard label="AudioWave" sublabel="sine — scaleY + glow">
        {(active) => <AudioWave active={active} />}
      </HoverCard>
      <HoverCard label="NoiseWave" sublabel="fbm — speed + amplitude ramp">
        {(active) => <NoiseWave active={active} />}
      </HoverCard>
      <HoverCard label="EnvelopeWave" sublabel="envelope × 1.8× speed boost">
        {(active) => <EnvelopeWave active={active} colorMode="static" />}
      </HoverCard>
      <HoverCard label="ChromaWave" sublabel="envelope + color shifts">
        {(active) => <EnvelopeWave active={active} colorMode="chroma" />}
      </HoverCard>
      <HoverCard label="VoiceWave" sublabel="hybrid — gaussian + additive glow">
        {(active) => <VoiceWave active={active} colorMode="static" />}
      </HoverCard>
      <HoverCard label="VoiceWave chroma" sublabel="hybrid + hue shift">
        {(active) => <VoiceWave active={active} colorMode="chroma" />}
      </HoverCard>
    </div>
  ),
}

/** NoiseWave alone — idle vs forced active */
export const NoiseWaveStates: Story = {
  render: () => (
    <div className="flex gap-6 p-4">
      <WaveCard label="Idle" sublabel="slow, low amplitude">
        <NoiseWave active={false} />
      </WaveCard>
      <WaveCard label="Active" sublabel="3.5× speed, full amplitude">
        <NoiseWave active={true} />
      </WaveCard>
    </div>
  ),
}

/** EnvelopeWave alone — showing how the wave breathes with speech rhythm */
export const EnvelopeWaveStates: Story = {
  render: () => (
    <div className="flex gap-6 p-4">
      <WaveCard label="Idle" sublabel="1× playback speed">
        <EnvelopeWave active={false} colorMode="static" />
      </WaveCard>
      <WaveCard label="Active" sublabel="1.8× speed + amplitude boost">
        <EnvelopeWave active={true} colorMode="static" />
      </WaveCard>
    </div>
  ),
}

/** ChromaWave — hue shifts with amplitude */
export const ChromaWaveStates: Story = {
  render: () => (
    <div className="flex gap-6 p-4">
      <WaveCard label="Idle" sublabel="teal during silence">
        <EnvelopeWave active={false} colorMode="chroma" />
      </WaveCard>
      <WaveCard label="Active" sublabel="cycles violet → amber → coral at peaks">
        <EnvelopeWave active={true} colorMode="chroma" />
      </WaveCard>
    </div>
  ),
}

function VoiceCardItem({
  label,
  sublabel,
  renderWave,
}: {
  label: string
  sublabel: string
  renderWave: (active: boolean) => React.ReactNode
}) {
  const [active, setActive] = useState(false)
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative h-40 w-52 cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-zinc-900 transition-colors hover:border-white/20"
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
      >
        <div className="relative z-10 p-4">
          <p className="text-sm font-semibold text-white">Voice</p>
          <p className="mt-0.5 text-[11px] text-white/40">3 models</p>
        </div>
        <div className="absolute inset-x-0 bottom-0 z-[1] h-[60%]">
          {renderWave(active)}
        </div>
      </div>
      <p className="text-xs font-medium text-white/60">{label}</p>
      <p className="text-[10px] text-white/30">{sublabel}</p>
    </div>
  )
}

/** Full voice-card mock — hover to activate. Mimics RemHub VoiceCard layout */
export const VoiceCardMock: Story = {
  render: () => (
    <div className="flex flex-wrap justify-center gap-4 p-4">
      <VoiceCardItem label="AudioWave" sublabel="(current)" renderWave={(a) => <AudioWave active={a} />} />
      <VoiceCardItem label="NoiseWave" sublabel="fbm noise" renderWave={(a) => <NoiseWave active={a} />} />
      <VoiceCardItem label="EnvelopeWave" sublabel="voice rhythm" renderWave={(a) => <EnvelopeWave active={a} colorMode="static" />} />
      <VoiceCardItem label="ChromaWave" sublabel="voice + color" renderWave={(a) => <EnvelopeWave active={a} colorMode="chroma" />} />
      <VoiceCardItem label="VoiceWave" sublabel="hybrid — best of both" renderWave={(a) => <VoiceWave active={a} colorMode="static" />} />
      <VoiceCardItem label="VoiceWave chroma" sublabel="hybrid + hue shift" renderWave={(a) => <VoiceWave active={a} colorMode="chroma" />} />
    </div>
  ),
}

/** VoiceWave — idle vs active, static vs chroma */
export const VoiceWaveStates: Story = {
  render: () => (
    <div className="flex flex-wrap justify-center gap-6 p-4">
      <WaveCard label="Idle (static)" sublabel="1× speed, envelope floor">
        <VoiceWave active={false} colorMode="static" />
      </WaveCard>
      <WaveCard label="Active (static)" sublabel="1.8× speed + 1.6× amp boost">
        <VoiceWave active={true} colorMode="static" />
      </WaveCard>
      <WaveCard label="Idle (chroma)" sublabel="teal during silence">
        <VoiceWave active={false} colorMode="chroma" />
      </WaveCard>
      <WaveCard label="Active (chroma)" sublabel="violet → amber → coral at peaks">
        <VoiceWave active={true} colorMode="chroma" />
      </WaveCard>
    </div>
  ),
}
