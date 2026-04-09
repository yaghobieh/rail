import type { FC } from 'react';
import { NAV_ICON_SIZE, NAV_ICON_STROKE_WIDTH } from '../RailNavigation.const';

interface NavArrowSvgProps {
  points: string;
  size?: number;
}

/** SVG chevron arrow used as the default fallback in navigation buttons. */
export const NavArrowSvg: FC<NavArrowSvgProps> = ({ points, size = NAV_ICON_SIZE }) => (
  <svg
    width={size}
    height={size}
    viewBox={`0 0 ${NAV_ICON_SIZE} ${NAV_ICON_SIZE}`}
    fill="none"
    stroke="currentColor"
    strokeWidth={NAV_ICON_STROKE_WIDTH}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points={points} />
  </svg>
);
