import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  AccessWidgetVariants,
  type AccessWidgetData,
  type WidgetVariant,
} from './access-widget-variants';

const meta = {
  title: 'KeroHub/AccessWidgetVariants',
  component: AccessWidgetVariants,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['compact', 'sidebar', 'banner', 'split'] satisfies WidgetVariant[],
    },
  },
} satisfies Meta<typeof AccessWidgetVariants>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Sample Data ────────────────────────────────────────────────

const MOCK_DATA: Record<string, AccessWidgetData> = {
  notLinked: {
    status: 'not-linked',
    serverName: 'KeroCraft',
  },
  noRequest: {
    status: 'no-request',
    gameUsername: 'StevePlayer',
    serverName: 'KeroCraft',
    avatarUrl: 'https://mc-heads.net/avatar/MHF_Steve/32',
  },
  pending: {
    status: 'pending',
    gameUsername: 'StevePlayer',
    serverName: 'KeroCraft',
    avatarUrl: 'https://mc-heads.net/avatar/MHF_Steve/32',
  },
  approvedVerified: {
    status: 'approved-verified',
    gameUsername: 'StevePlayer',
    serverName: 'KeroCraft',
    avatarUrl: 'https://mc-heads.net/avatar/MHF_Steve/32',
  },
  approvedUnverified: {
    status: 'approved-unverified',
    gameUsername: 'StevePlayer',
    serverName: 'KeroCraft',
    avatarUrl: 'https://mc-heads.net/avatar/MHF_Steve/32',
  },
  rejected: {
    status: 'rejected',
    gameUsername: 'StevePlayer',
    serverName: 'KeroCraft',
    avatarUrl: 'https://mc-heads.net/avatar/MHF_Steve/32',
    reviewNote: 'Not a recognized community member',
  },
};

// ─── Individual Variant Stories ─────────────────────────────────

export const CompactPending: Story = {
  args: { variant: 'compact', data: MOCK_DATA.pending },
};

export const CompactApproved: Story = {
  args: { variant: 'compact', data: MOCK_DATA.approvedVerified },
};

export const CompactUnverified: Story = {
  args: { variant: 'compact', data: MOCK_DATA.approvedUnverified },
};

export const SidebarPending: Story = {
  args: { variant: 'sidebar', data: MOCK_DATA.pending },
};

export const SidebarUnverified: Story = {
  args: { variant: 'sidebar', data: MOCK_DATA.approvedUnverified },
};

export const BannerPending: Story = {
  args: { variant: 'banner', data: MOCK_DATA.pending },
};

export const BannerApproved: Story = {
  args: { variant: 'banner', data: MOCK_DATA.approvedVerified },
};

export const BannerUnverified: Story = {
  args: { variant: 'banner', data: MOCK_DATA.approvedUnverified },
};

export const SplitApproved: Story = {
  args: { variant: 'split', data: MOCK_DATA.approvedVerified },
};

export const SplitUnverified: Story = {
  args: { variant: 'split', data: MOCK_DATA.approvedUnverified },
};

// ─── Gallery: All 4 Variants Side by Side ───────────────────────

const VARIANTS: WidgetVariant[] = ['compact', 'sidebar', 'banner', 'split'];
const VARIANT_LABELS: Record<WidgetVariant, string> = {
  compact: 'A) Compact Centered',
  sidebar: 'B) Side Panel',
  banner: 'C) Inline Banner',
  split: 'D) Split Card',
};

function GalleryForState({ data, label }: { data: AccessWidgetData; label: string }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#888' }}>
        {label}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {VARIANTS.map((v) => (
          <div key={v}>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 4, fontFamily: 'monospace' }}>
              {VARIANT_LABELS[v]}
            </div>
            <AccessWidgetVariants variant={v} data={data} />
          </div>
        ))}
      </div>
    </div>
  );
}

export const Gallery: Story = {
  render: () => (
    <div style={{ maxWidth: 900, padding: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>
        Access Widget — Layout Comparison
      </h2>
      <GalleryForState data={MOCK_DATA.approvedUnverified} label='Approved (Unverified)' />
      <GalleryForState data={MOCK_DATA.approvedVerified} label='Approved (Verified)' />
      <GalleryForState data={MOCK_DATA.pending} label='Pending Review' />
      <GalleryForState data={MOCK_DATA.noRequest} label='No Request Yet' />
      <GalleryForState data={MOCK_DATA.notLinked} label='Account Not Linked' />
      <GalleryForState data={MOCK_DATA.rejected} label='Rejected' />
    </div>
  ),
  args: { variant: 'compact', data: MOCK_DATA.approvedVerified },
};
