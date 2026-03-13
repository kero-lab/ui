import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, waitFor } from 'storybook/test';
import { useState } from 'react';
import { AudioWave } from './audio-wave';

const meta = {
  title: 'Components/AudioWave',
  component: AudioWave,
  tags: ['autodocs', 'lifecycle:prototype'],
  parameters: {
    backgrounds: { default: 'dark' },
    layout: 'centered',
  },
} satisfies Meta<typeof AudioWave>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Idle state — 4 composite sinusoid layers scrolling gently */
export const Idle: Story = {
  args: { active: false },
  decorators: [
    (Story) => (
      <div className="relative h-32 w-72 overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
        <div className="absolute inset-x-0 bottom-0 h-[65%]">
          <Story />
        </div>
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const wave = canvasElement.querySelector('[data-slot="audio-wave"]')!;
    await expect(wave).not.toBeNull();
    await expect(wave.getAttribute('data-active')).toBe('false');
    const svgs = wave.querySelectorAll('svg');
    await expect(svgs.length).toBe(4);
  },
};

/** Active/hover state — waves amplify, brighten, and glow */
export const Active: Story = {
  args: { active: true },
  decorators: [
    (Story) => (
      <div className="relative h-32 w-72 overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
        <div className="absolute inset-x-0 bottom-0 h-[65%]">
          <Story />
        </div>
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const wave = canvasElement.querySelector('[data-slot="audio-wave"]')!;
    await expect(wave.getAttribute('data-active')).toBe('true');
  },
};

/** Hover interaction — parent card controls active state */
export const HoverInteraction: Story = {
  render: () => {
    const [active, setActive] = useState(false);
    return (
      <div
        className="relative h-32 w-72 cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-zinc-900 transition-colors hover:border-white/20"
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
      >
        <div className="relative z-10 p-4">
          <p className="text-sm font-semibold text-white">Voice</p>
          <p className="text-xs text-white/40">Speech synthesis</p>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[65%]">
          <AudioWave active={active} />
        </div>
      </div>
    );
  },
};

/** Side by side — idle vs active comparison */
export const Comparison: Story = {
  render: () => (
    <div className="flex gap-4">
      {[false, true].map((active) => (
        <div key={String(active)} className="flex flex-col items-center gap-2">
          <div className="relative h-32 w-56 overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
            <div className="absolute inset-x-0 bottom-0 h-[65%]">
              <AudioWave active={active} />
            </div>
          </div>
          <span className="text-xs text-white/50">{active ? 'active' : 'idle'}</span>
        </div>
      ))}
    </div>
  ),
};

/** Color variants — same component, different synthesis moods */
export const Colors: Story = {
  render: () => {
    const variants = [
      { label: 'Emerald (default)', color: 'oklch(0.696 0.17 162.48)' },
      { label: 'Violet',           color: 'oklch(0.65 0.22 295)' },
      { label: 'Amber',            color: 'oklch(0.76 0.18 70)' },
      { label: 'Rose',             color: 'oklch(0.65 0.22 15)' },
    ];
    return (
      <div className="grid grid-cols-2 gap-3">
        {variants.map(({ label, color }) => (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <div className="relative h-24 w-52 overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
              <div className="absolute inset-x-0 bottom-0 h-[65%]">
                <AudioWave active color={color} />
              </div>
            </div>
            <span className="text-xs text-white/40">{label}</span>
          </div>
        ))}
      </div>
    );
  },
};

/** As used in a workspace card — mimics RemHub VoiceCard layout */
export const VoiceCardPreview: Story = {
  render: () => {
    const [active, setActive] = useState(false);
    return (
      <div
        className="relative h-40 w-52 cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-zinc-900 transition-all duration-200 hover:border-emerald-500/30 hover:shadow-lg"
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
      >
        {/* Card content */}
        <div className="relative z-10 flex h-full flex-col p-4">
          <div>
            <p className="text-sm font-semibold text-white">Voice</p>
            <p className="mt-0.5 text-[11px] text-white/40">3 models</p>
          </div>
        </div>
        {/* Wave fills bottom 60% */}
        <div className="absolute inset-x-0 bottom-0 z-[1] h-[60%] overflow-hidden">
          <AudioWave active={active} />
        </div>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    await step('Wave is visible in idle state', async () => {
      await waitFor(() => {
        const wave = canvasElement.querySelector('[data-slot="audio-wave"]')!;
        expect(wave).not.toBeNull();
        expect(wave.getAttribute('data-active')).toBe('false');
      });
    });
  },
};
