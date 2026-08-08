import { AnimatePresence, motion } from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import { EASE } from './gallery-motion';

type TextProps = {
  title: string;
  category: string;
  /** Index, not the strings: it is the AnimatePresence key. */
  activeIndex: number;
  reduceMotion: boolean;
};

/* Layer z-20 — the bottom-left display block.
 *
 * `mode="wait"` is right here and wrong for the background. Two photographs
 * overlapping mid-fade reads as a dissolve; two project names overlapping
 * reads as a rendering bug. So the outgoing line clears completely before the
 * incoming one starts.
 *
 * The `key` is what makes any of it happen. AnimatePresence detects a change
 * by identity, not by props — without a key that changes, React reconciles
 * the same node with new text and the exit animation never fires at all.
 * Keying on `activeIndex` rather than the title also keeps two projects that
 * happen to share a name from being treated as the same node.
 */
export default function GalleryText({ title, category, activeIndex, reduceMotion }: TextProps) {
  const shift = reduceMotion ? 0 : 20;

  return (
    <div className="pointer-events-none absolute bottom-8 left-6 z-20 max-w-[80vw] md:bottom-14 md:left-12">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, y: shift }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -shift }}
          transition={{ duration: reduceMotion ? 0.2 : 0.5, ease: EASE }}
        >
          <p className="mb-2 font-mono text-[10px] tracking-[0.22em] text-white/55 uppercase md:text-[11px]">
            {category}
          </p>
          {/* aria-live so a screen reader hears the project change — the
              visual cue for it is a photograph swap, which announces nothing. */}
          <h2
            aria-live="polite"
            className="font-sans leading-[0.9] font-medium tracking-[-0.03em] text-white/70"
            style={{ fontSize: 'clamp(3rem, 7vw, 7rem)' }}
          >
            {title}
          </h2>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

type CaptionProps = {
  caption: string;
  activeIndex: number;
  /**
   * Live viewport x of the active thumbnail's centre. A MotionValue, not a
   * number: this label is glued to a card that moves every frame, and
   * re-rendering the component at 120Hz to keep up is exactly the cost the
   * rest of the gallery is built to avoid.
   */
  centerX: MotionValue<number>;
  /** Track top edge in px, so the caption can sit just above the cards. */
  trackTop: number;
  reduceMotion: boolean;
};

/**
 * The small label directly above the active thumbnail.
 *
 * Two nested elements on purpose: the outer carries the tracking MotionValue
 * on `x`, the inner the static `-50%` centring. Combining them would mean
 * rebuilding a translate string every frame just to re-add a constant.
 */
export function GalleryCaption({
  caption,
  activeIndex,
  centerX,
  trackTop,
  reduceMotion,
}: CaptionProps) {
  const shift = reduceMotion ? 0 : 8;

  return (
    <motion.div
      className="pointer-events-none absolute left-0 z-20 will-change-transform"
      style={{ x: centerX, top: trackTop - 34 }}
      aria-hidden="true"
    >
      <div className="-translate-x-1/2 whitespace-nowrap">
        <AnimatePresence mode="wait">
          <motion.span
            key={activeIndex}
            initial={{ opacity: 0, y: shift }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -shift }}
            transition={{ duration: reduceMotion ? 0.15 : 0.4, ease: EASE }}
            className="block font-sans text-[13px] text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]"
          >
            {caption}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
