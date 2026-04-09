import type { CSSProperties, ReactNode } from 'react';

export interface RailNavigationProps {
  /** Additional CSS class for both buttons */
  className?: string;
  /** Inline styles for both buttons */
  style?: CSSProperties;
  /** Custom icon for the "previous" button (replaces the default chevron SVG) */
  prevIcon?: ReactNode;
  /** Custom icon for the "next" button (replaces the default chevron SVG) */
  nextIcon?: ReactNode;
  /** Icon size in px (used when rendering the default SVG chevrons) */
  iconSize?: number;
  /** Whether the previous button is disabled */
  prevDisabled?: boolean;
  /** Whether the next button is disabled */
  nextDisabled?: boolean;
  /** Custom aria-label for the previous button */
  prevAriaLabel?: string;
  /** Custom aria-label for the next button */
  nextAriaLabel?: string;
  /** Full custom render for the previous button */
  renderPrev?: (onClick: () => void) => ReactNode;
  /** Full custom render for the next button */
  renderNext?: (onClick: () => void) => ReactNode;
}
