import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { Cpu, MemoryStick, HardDrive, Wifi, Activity, Thermometer } from 'lucide-react';
import { ResponsiveCard } from './responsive-card';
import { Sparkline } from './sparkline';

const meta = {
  title: 'Components/ResponsiveCard',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div style={{ width: 600 }}>
      <ResponsiveCard
        icon={<Cpu />}
        title="CPU Usage"
        value="73%"
        detail={<span>4 cores, load avg 2.1</span>}
      />
    </div>
  ),
};

export const Narrow: Story = {
  render: () => (
    <div style={{ width: 150 }}>
      <ResponsiveCard
        icon={<Cpu />}
        title="CPU Usage"
        value="73%"
        detail={<span>4 cores, load avg 2.1</span>}
      />
    </div>
  ),
};

export const Medium: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <ResponsiveCard
        icon={<Cpu />}
        title="CPU Usage"
        value="73%"
        detail={<span>4 cores, load avg 2.1</span>}
      />
    </div>
  ),
};

export const Wide: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <ResponsiveCard
        icon={<Cpu />}
        title="CPU Usage"
        value="73%"
        detail={<span>4 cores, load avg 2.1</span>}
      />
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4" style={{ width: 700 }}>
      {[150, 400, 480, 600].map((width) => (
        <div key={width}>
          <p className="text-xs text-muted-foreground mb-1">{width}px container</p>
          <div style={{ width }}>
            <ResponsiveCard
              icon={<Cpu />}
              title="CPU Usage"
              value="73%"
              detail={<span>4 cores, load avg 2.1</span>}
            />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const InGrid: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-3" style={{ width: 800 }}>
      <ResponsiveCard icon={<Cpu />} title="CPU" value="73%" />
      <ResponsiveCard icon={<MemoryStick />} title="Memory" value="2.4G" />
      <ResponsiveCard icon={<HardDrive />} title="Disk" value="45%" />
      <ResponsiveCard icon={<Wifi />} title="Network" value="120Mb" />
      <ResponsiveCard icon={<Activity />} title="Latency" value="12ms" />
      <ResponsiveCard icon={<Thermometer />} title="Temp" value="62°C" />
    </div>
  ),
};

export const WithSparklineDetail: Story = {
  render: () => (
    <div style={{ width: 600 }}>
      <ResponsiveCard
        icon={<Cpu />}
        title="CPU Usage"
        value="73%"
        detail={
          <div className="flex items-center gap-2">
            <Sparkline
              data={[30, 45, 60, 55, 70, 65, 73]}
              variant="warning"
              width={120}
              height={24}
            />
            <span className="text-xs">Last 7 readings</span>
          </div>
        }
      />
    </div>
  ),
};

export const Clickable: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <ResponsiveCard
        icon={<Cpu />}
        title="CPU Usage"
        value="73%"
        onClick={() => {}}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('[data-slot="responsive-card"]')!;
    await expect(card.getAttribute('role')).toBe('button');
    await userEvent.click(card);
  },
};

export const DataAttributes: Story = {
  render: () => (
    <div style={{ width: 600 }}>
      <ResponsiveCard
        icon={<Cpu />}
        title="CPU"
        value="73%"
        detail={<span>Detail</span>}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-slot="responsive-card"]')).toBeInTheDocument();
    await expect(canvasElement.querySelector('[data-slot="responsive-card-layout"]')).toBeInTheDocument();
    await expect(canvasElement.querySelector('[data-slot="responsive-card-icon"]')).toBeInTheDocument();
    await expect(canvasElement.querySelector('[data-slot="responsive-card-value"]')).toBeInTheDocument();
    await expect(canvasElement.querySelector('[data-slot="responsive-card-title"]')).toBeInTheDocument();
    await expect(canvasElement.querySelector('[data-slot="responsive-card-detail"]')).toBeInTheDocument();
  },
};
