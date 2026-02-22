import { forwardRef } from 'react';
import type { LucideProps } from 'lucide-react';

/**
 * Rem silhouette icon — extracted from configs/branding/rem/mono/rem-outline-dark.svg.
 * Uses currentColor for stroke so it can be themed via CSS className.
 * Typed as LucideIcon-compatible so it can be used interchangeably with lucide-react icons.
 */
export const RemIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ className, size, color, strokeWidth: _sw, absoluteStrokeWidth: _asw, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1090 1090"
      width={size}
      height={size}
      fill="none"
      stroke={color || 'currentColor'}
      strokeWidth={64}
      className={className}
      {...props}
    >
      {/* Head circle (offset by parent group translate 32.617, 32.679) */}
      <g transform="translate(32.617,32.679)">
        <path d="M 467,1023.14 C 299.26,1008.19 142.33,906.29 62.33,757.70 25.16,700.60 7.59,631.47 0.38,564.20 -1.92,490.53 -2.13,415.33 25,345.5 92.28,140.98 300.94,-11.51 517.98,-0.06 735.27,-6.59 940.76,151.18 1003,357.5 c 25.35,70.20 22.18,145.34 20,218.67 -9.72,77.93 -37.34,153.26 -82.76,217.30 -98.23,151.39 -279.97,242.65 -460.02,230.28 l -9.67,-0.27 z" />
      </g>
      {/* Hair silhouette */}
      <path d="M 553,32.41 C 514.10,32.28 476.18,39.72 437.62,46.18 242.09,85.71 79.96,250.98 44.14,447.23 38.88,490.20 30.15,531.85 37.02,574.88 44.42,645.14 58.58,717.64 92.51,780.40 l 0.03,0.04 1.58,2.18 c 205.67,-0.15 411.33,-0.29 617,-0.44 0.24,-92.79 0.45,-185.58 0.72,-278.37 l 1.89,-119.93 c 67.31,113.95 137.87,229.19 204.51,343.62 24.49,35.82 27.31,54.43 76.95,54.21 26.63,-46.14 42.74,-98.68 51.91,-151.23 4.46,-41.04 10.88,-84.90 7.11,-124.39 C 1042.75,309.04 901.36,128.13 715.12,64.20 668.63,45.51 618.16,41.63 569.73,32.96 564.13,32.60 558.55,32.43 553,32.41 Z" />
    </svg>
  )
);

RemIcon.displayName = 'RemIcon';
