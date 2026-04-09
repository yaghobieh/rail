import { useState, useEffect, useCallback } from 'react';
import type { UseRailReturn, RailInstance } from '../types';
import { useRailContext } from '../components/RailContext/RailContext';

/**
 * React hook that provides reactive access to the Rail carousel instance.
 * Returns the current active index, navigation state, and imperative methods
 * (slideTo, slideNext, slidePrev). Automatically subscribes to slide-change
 * events and re-renders when the state changes.
 *
 * Must be used inside a `<Rail>` component tree.
 *
 * @returns Object with reactive state and control methods
 *
 * @example
 * ```tsx
 * function Controls() {
 *   const { activeIndex, slideNext, slidePrev, isEnd } = useRail();
 *   return (
 *     <div>
 *       <button onClick={slidePrev}>Prev</button>
 *       <span>Slide {activeIndex + 1}</span>
 *       <button onClick={slideNext} disabled={isEnd}>Next</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useRail(): UseRailReturn {
  const instance = useRailContext();

  const [activeIndex, setActiveIndex] = useState(instance?.state.activeIndex ?? 0);
  const [realIndex, setRealIndex] = useState(instance?.state.realIndex ?? 0);
  const [isBeginning, setIsBeginning] = useState(instance?.state.isBeginning ?? true);
  const [isEnd, setIsEnd] = useState(instance?.state.isEnd ?? false);
  const [isLocked, setIsLocked] = useState(instance?.state.isLocked ?? false);
  const [progress, setProgress] = useState(instance?.state.progress ?? 0);
  const [slidesCount, setSlidesCount] = useState(instance?.state.slidesCount ?? 0);
  const [autoplayRunning, setAutoplayRunning] = useState(instance?.state.autoplayRunning ?? false);
  const [autoplayPaused, setAutoplayPaused] = useState(instance?.state.autoplayPaused ?? false);

  useEffect(() => {
    if (!instance) return;

    const onSlideChange = () => {
      setActiveIndex(instance.state.activeIndex);
      setRealIndex(instance.state.realIndex);
      setIsBeginning(instance.state.isBeginning);
      setIsEnd(instance.state.isEnd);
      setSlidesCount(instance.state.slidesCount);
    };

    const onProgress = (p: number) => setProgress(p);
    const onLock = () => setIsLocked(true);
    const onUnlock = () => setIsLocked(false);
    const onAutoplayStart = () => setAutoplayRunning(true);
    const onAutoplayStop = () => setAutoplayRunning(false);
    const onAutoplayPause = () => setAutoplayPaused(true);
    const onAutoplayResume = () => setAutoplayPaused(false);

    instance.on('slideChange', onSlideChange);
    instance.on('progress', onProgress);
    instance.on('lock', onLock);
    instance.on('unlock', onUnlock);
    instance.on('autoplayStart', onAutoplayStart);
    instance.on('autoplayStop', onAutoplayStop);
    instance.on('autoplayPause', onAutoplayPause);
    instance.on('autoplayResume', onAutoplayResume);
    instance.on('update', onSlideChange);

    onSlideChange();

    return () => {
      instance.off('slideChange', onSlideChange);
      instance.off('progress', onProgress);
      instance.off('lock', onLock);
      instance.off('unlock', onUnlock);
      instance.off('autoplayStart', onAutoplayStart);
      instance.off('autoplayStop', onAutoplayStop);
      instance.off('autoplayPause', onAutoplayPause);
      instance.off('autoplayResume', onAutoplayResume);
      instance.off('update', onSlideChange);
    };
  }, [instance]);

  const slideNext = useCallback((speed?: number) => instance?.slideNext(speed), [instance]);
  const slidePrev = useCallback((speed?: number) => instance?.slidePrev(speed), [instance]);
  const slideTo = useCallback((index: number, speed?: number) => instance?.slideTo(index, speed), [instance]);
  const update = useCallback(() => instance?.update(), [instance]);
  const autoplayStart = useCallback(() => instance?.autoplayStart(), [instance]);
  const autoplayStop = useCallback(() => instance?.autoplayStop(), [instance]);

  return {
    activeIndex,
    realIndex,
    isBeginning,
    isEnd,
    isLocked,
    progress,
    slidesCount,
    autoplayRunning,
    autoplayPaused,
    slideNext,
    slidePrev,
    slideTo,
    update,
    autoplayStart,
    autoplayStop,
  };
}
