import { createContext, useContext } from 'react';
import type { RailInstance } from '../../types';

export const RailContext = createContext<RailInstance | null>(null);

/**
 * Hook to access the Rail instance from within a `<Rail>` component tree.
 *
 * @returns The active RailInstance
 * @throws If used outside of a `<Rail>` provider
 *
 * @example
 * ```tsx
 * function SlideControls() {
 *   const rail = useRailContext();
 *   return <button onClick={() => rail.slideNext()}>Next</button>;
 * }
 * ```
 */
export function useRailContext(): RailInstance {
  const ctx = useContext(RailContext);
  if (!ctx) throw new Error('useRailContext must be used inside <Rail>');
  return ctx;
}
