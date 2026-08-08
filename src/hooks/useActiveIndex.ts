import { useState } from 'react';
import { useMotionValueEvent } from 'framer-motion';
import type { MotionValue } from 'framer-motion';

/**
 * Which card is currently sitting on the anchor line — the middle of the screen.
 *
 * The track's x is a straight lerp from "card 0 on the anchor" to "the last
 * card on the anchor", and the cards are evenly pitched, so card i is exactly
 * on the anchor when progress is i/(count-1). Rounding that back gives the
 * nearest card without measuring anything, which matters because the intro
 * animates card WIDTH — any DOM measurement taken while it runs describes a
 * row that no longer exists a moment later.
 *
 * Note this is not `floor(progress * count)`. That splits the scroll into
 * count equal bands, which is a different thing: it changes the active project
 * when you cross a boundary rather than when a card actually reaches the
 * middle, so the background would swap while the incoming card was still
 * halfway there.
 *
 * The guard is not an optimisation. `scrollYProgress` emits every frame, and
 * setting state on every frame would restart the 0.9s crossfade and the
 * title's AnimatePresence exit sixty times a second — a stutter instead of a
 * dissolve. With it, a full sweep costs one render per project.
 *
 * @param scrollYProgress 0 → 1 across the gallery's spacer section.
 * @param count Number of projects.
 */
export default function useActiveIndex(scrollYProgress: MotionValue<number>, count: number) {
  const [activeIndex, setActiveIndex] = useState(0);

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    if (count <= 1) return;

    const nearest = Math.round(progress * (count - 1));
    // Clamp for the endpoints, where progress can overshoot a hair.
    const next = Math.min(Math.max(nearest, 0), count - 1);
    setActiveIndex((current) => (current === next ? current : next));
  });

  return activeIndex;
}
