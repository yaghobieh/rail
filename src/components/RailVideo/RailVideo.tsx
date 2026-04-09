import { forwardRef, useRef, useEffect, useImperativeHandle, useContext, type CSSProperties, type VideoHTMLAttributes } from 'react';
import { RailContext } from '../RailContext/RailContext';

export interface RailVideoProps extends Omit<VideoHTMLAttributes<HTMLVideoElement>, 'style'> {
  /** Index of the parent slide (0-based). Used to auto-play/pause on slide change. */
  slideIndex: number;
  /** CSS object-fit for the video element. Defaults to `'cover'`. */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  /** Reset playback to start when the slide becomes inactive. Defaults to `true`. */
  resetOnLeave?: boolean;
  style?: CSSProperties;
}

/**
 * Video element that auto-plays when its parent slide is active and pauses
 * when the user navigates away. Works with both regular carousels and
 * StoryMode.
 *
 * @example
 * ```tsx
 * <Rail modules={[Navigation]}>
 *   <RailSlide>
 *     <RailVideo slideIndex={0} src="/intro.mp4" muted />
 *   </RailSlide>
 * </Rail>
 * ```
 */
export const RailVideo = forwardRef<HTMLVideoElement, RailVideoProps>(
  ({ slideIndex, objectFit = 'cover', resetOnLeave = true, style, className, ...rest }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement);

    const rail = useContext(RailContext);

    useEffect(() => {
      if (!rail) return;

      const onSlideChange = (index: number) => {
        const video = videoRef.current;
        if (!video) return;

        if (index === slideIndex) {
          video.play().catch(() => {});
        } else {
          video.pause();
          if (resetOnLeave) {
            video.currentTime = 0;
          }
        }
      };

      if (rail.state.activeIndex === slideIndex) {
        videoRef.current?.play().catch(() => {});
      }

      rail.on('slideChange', onSlideChange);
      return () => rail.off('slideChange', onSlideChange);
    }, [rail, slideIndex, resetOnLeave]);

    return (
      <video
        ref={videoRef}
        playsInline
        className={className}
        style={{ width: '100%', height: '100%', objectFit, display: 'block', ...style }}
        {...rest}
      />
    );
  },
);

RailVideo.displayName = 'RailVideo';
