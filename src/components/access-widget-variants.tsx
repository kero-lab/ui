// Access Widget Layout Variants
// Presentational component for comparing different widget layouts in Storybook.
// Issue: #406 - Game Server Ecosystem
//
// Each variant renders the same access request state data in a different layout.
// After the user picks a variant, the chosen layout will be integrated into
// the real AccessRequestWidget in KeroHub.

import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Button } from './button';

// ─── Types ──────────────────────────────────────────────────────

export type WidgetStatus =
  | 'not-linked'
  | 'no-request'
  | 'pending'
  | 'approved-verified'
  | 'approved-unverified'
  | 'rejected';

export type WidgetVariant = 'compact' | 'sidebar' | 'banner' | 'split';

export interface AccessWidgetData {
  status: WidgetStatus;
  gameUsername?: string;
  serverName?: string;
  avatarUrl?: string;
  reviewNote?: string;
}

export interface AccessWidgetVariantsProps {
  variant: WidgetVariant;
  data: AccessWidgetData;
}

// ─── Status Config ──────────────────────────────────────────────

interface StatusConfig {
  icon: string;
  iconBg: string;
  borderColor: string;
  title: string;
  titleColor: string;
  badge: string;
  badgeColor: string;
  action?: { label: string; variant: 'default' | 'outline' | 'ghost' };
}

function getStatusConfig(data: AccessWidgetData): StatusConfig {
  switch (data.status) {
    case 'not-linked':
      return {
        icon: '🚪',
        iconBg: '',
        borderColor: '',
        title: 'Server Access',
        titleColor: 'text-foreground',
        badge: '',
        badgeColor: '',
        action: { label: 'Link Account', variant: 'outline' },
      };
    case 'no-request':
      return {
        icon: '🚪',
        iconBg: '',
        borderColor: '',
        title: 'Server Access',
        titleColor: 'text-foreground',
        badge: '',
        badgeColor: '',
        action: { label: 'Request Access', variant: 'default' },
      };
    case 'pending':
      return {
        icon: '⏳',
        iconBg: 'bg-yellow-500/15',
        borderColor: 'border-yellow-500/20',
        title: 'Pending Review',
        titleColor: 'text-yellow-600 dark:text-yellow-400',
        badge: 'Pending',
        badgeColor: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
        action: { label: 'Cancel', variant: 'ghost' },
      };
    case 'approved-verified':
      return {
        icon: '✅',
        iconBg: 'bg-green-500/15',
        borderColor: 'border-green-500/20',
        title: 'Whitelisted',
        titleColor: 'text-green-600 dark:text-green-400',
        badge: 'Access Granted',
        badgeColor: 'bg-green-500/10 text-green-600 dark:text-green-400',
      };
    case 'approved-unverified':
      return {
        icon: '⚠️',
        iconBg: 'bg-amber-500/15',
        borderColor: 'border-amber-500/20',
        title: 'Whitelisted — Unverified',
        titleColor: 'text-amber-600 dark:text-amber-400',
        badge: 'Unverified',
        badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        action: { label: 'Verify Account', variant: 'outline' },
      };
    case 'rejected':
      return {
        icon: '❌',
        iconBg: 'bg-red-500/15',
        borderColor: 'border-red-500/20',
        title: 'Request Denied',
        titleColor: 'text-red-600 dark:text-red-400',
        badge: 'Rejected',
        badgeColor: 'bg-red-500/10 text-red-600 dark:text-red-400',
        action: { label: 'Re-request', variant: 'outline' },
      };
  }
}

// ─── Main Component ─────────────────────────────────────────────

export function AccessWidgetVariants({ variant, data }: AccessWidgetVariantsProps) {
  switch (variant) {
    case 'compact':
      return <CompactCentered data={data} />;
    case 'sidebar':
      return <SidePanel data={data} />;
    case 'banner':
      return <InlineBanner data={data} />;
    case 'split':
      return <SplitCard data={data} />;
  }
}

// ─── Variant A: Compact Centered ────────────────────────────────

function CompactCentered({ data }: { data: AccessWidgetData }) {
  const cfg = getStatusConfig(data);

  return (
    <div className='mx-auto max-w-md'>
      <Card className={`overflow-hidden ${cfg.borderColor}`}>
        <CardContent>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex items-center gap-3'>
              <span className='text-lg'>{cfg.icon}</span>
              <div>
                <div className={`text-sm font-semibold ${cfg.titleColor}`}>{cfg.title}</div>
                {data.gameUsername && (
                  <div className='flex items-center gap-1.5'>
                    {data.avatarUrl && (
                      <img src={data.avatarUrl} alt='' className='h-4 w-4 rounded' />
                    )}
                    <span className='text-xs text-muted-foreground'>{data.gameUsername}</span>
                  </div>
                )}
                {data.status === 'not-linked' && (
                  <p className='text-xs text-muted-foreground'>Link your Minecraft account to request access</p>
                )}
                {data.reviewNote && (
                  <p className='text-xs text-muted-foreground'>{data.reviewNote}</p>
                )}
              </div>
            </div>
            <div className='flex items-center gap-2'>
              {cfg.badge && (
                <Badge className={`text-xs shrink-0 ${cfg.badgeColor}`}>{cfg.badge}</Badge>
              )}
              {cfg.action && (
                <Button variant={cfg.action.variant} size='sm' className='shrink-0 h-7 text-xs'>
                  {cfg.action.label}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Variant B: Side Panel ──────────────────────────────────────

function SidePanel({ data }: { data: AccessWidgetData }) {
  const cfg = getStatusConfig(data);

  return (
    <div className='grid grid-cols-[280px_1fr] gap-4'>
      {/* Widget panel */}
      <Card className={`overflow-hidden ${cfg.borderColor}`}>
        <CardContent className='space-y-3'>
          <div className='flex items-center gap-2'>
            <span className='text-lg'>{cfg.icon}</span>
            <div className={`text-sm font-semibold ${cfg.titleColor}`}>{cfg.title}</div>
          </div>
          {data.gameUsername && (
            <div className='flex items-center gap-1.5'>
              {data.avatarUrl && (
                <img src={data.avatarUrl} alt='' className='h-5 w-5 rounded' />
              )}
              <span className='text-sm text-muted-foreground'>{data.gameUsername}</span>
            </div>
          )}
          {data.status === 'not-linked' && (
            <p className='text-xs text-muted-foreground'>Link your Minecraft account to get started</p>
          )}
          {cfg.badge && (
            <Badge className={`text-xs ${cfg.badgeColor}`}>{cfg.badge}</Badge>
          )}
          {data.reviewNote && (
            <p className='text-xs text-muted-foreground'>{data.reviewNote}</p>
          )}
          {data.status === 'approved-unverified' && (
            <p className='text-xs text-muted-foreground'>
              Verify ownership of your Minecraft account to complete setup
            </p>
          )}
          {cfg.action && (
            <Button variant={cfg.action.variant} size='sm' className='w-full text-xs'>
              {cfg.action.label}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Placeholder content area */}
      <Card className='border-dashed'>
        <CardContent className='flex items-center justify-center py-12'>
          <p className='text-sm text-muted-foreground'>Server content area (stats, info, players...)</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Variant C: Inline Banner ───────────────────────────────────

function InlineBanner({ data }: { data: AccessWidgetData }) {
  const cfg = getStatusConfig(data);

  const bgColor =
    data.status === 'pending' ? 'bg-yellow-500/5 border-yellow-500/20' :
    data.status === 'approved-verified' ? 'bg-green-500/5 border-green-500/20' :
    data.status === 'approved-unverified' ? 'bg-amber-500/5 border-amber-500/20' :
    data.status === 'rejected' ? 'bg-red-500/5 border-red-500/20' :
    'bg-muted/30 border-border';

  return (
    <div className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 ${bgColor}`}>
      <span className='text-base shrink-0'>{cfg.icon}</span>
      <span className={`text-sm font-medium ${cfg.titleColor}`}>{cfg.title}</span>
      {data.gameUsername && (
        <span className='text-xs text-muted-foreground'>
          as {data.gameUsername}
        </span>
      )}
      {data.status === 'not-linked' && (
        <span className='text-xs text-muted-foreground'>
          Link your Minecraft account to request access
        </span>
      )}
      {data.reviewNote && (
        <span className='text-xs text-muted-foreground truncate max-w-[200px]'>
          {data.reviewNote}
        </span>
      )}
      <div className='ml-auto flex items-center gap-2 shrink-0'>
        {cfg.badge && (
          <Badge className={`text-xs ${cfg.badgeColor}`}>{cfg.badge}</Badge>
        )}
        {cfg.action && (
          <Button variant={cfg.action.variant} size='sm' className='h-6 text-xs px-2'>
            {cfg.action.label}
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Variant D: Split Card ──────────────────────────────────────

function SplitCard({ data }: { data: AccessWidgetData }) {
  const cfg = getStatusConfig(data);

  return (
    <Card className={`overflow-hidden ${cfg.borderColor}`}>
      <CardContent>
        <div className='grid grid-cols-2 gap-4'>
          {/* Left: Access status */}
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <span className='text-lg'>{cfg.icon}</span>
              <div className={`text-sm font-semibold ${cfg.titleColor}`}>{cfg.title}</div>
            </div>
            {cfg.badge && (
              <Badge className={`text-xs ${cfg.badgeColor}`}>{cfg.badge}</Badge>
            )}
            {data.reviewNote && (
              <p className='text-xs text-muted-foreground'>{data.reviewNote}</p>
            )}
            {data.status === 'not-linked' && (
              <p className='text-xs text-muted-foreground'>Link your Minecraft account to request access</p>
            )}
            {data.status === 'approved-unverified' && (
              <p className='text-xs text-muted-foreground'>
                Verify ownership to complete setup
              </p>
            )}
            {cfg.action && (
              <Button variant={cfg.action.variant} size='sm' className='text-xs'>
                {cfg.action.label}
              </Button>
            )}
          </div>

          {/* Right: Account details */}
          <div className='space-y-2 border-l pl-4'>
            <div className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
              Linked Account
            </div>
            {data.gameUsername ? (
              <div className='space-y-1.5'>
                <div className='flex items-center gap-2'>
                  {data.avatarUrl && (
                    <img src={data.avatarUrl} alt='' className='h-8 w-8 rounded' />
                  )}
                  <div>
                    <div className='text-sm font-medium'>{data.gameUsername}</div>
                    <div className='text-xs text-muted-foreground'>Minecraft</div>
                  </div>
                </div>
                <div className='flex items-center gap-1'>
                  <span className='text-xs text-muted-foreground'>Server:</span>
                  <span className='text-xs font-medium'>{data.serverName ?? 'KeroCraft'}</span>
                </div>
                {data.status === 'approved-verified' && (
                  <div className='flex items-center gap-1 text-green-600 dark:text-green-400'>
                    <span className='text-xs'>Verified</span>
                  </div>
                )}
                {data.status === 'approved-unverified' && (
                  <div className='flex items-center gap-1 text-amber-600 dark:text-amber-400'>
                    <span className='text-xs'>Unverified</span>
                  </div>
                )}
              </div>
            ) : (
              <p className='text-xs text-muted-foreground'>No account linked</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
