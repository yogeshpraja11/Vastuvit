import { motion } from 'framer-motion';
import type { ShowcaseProject } from '../../data/showcase-projects';
import { EASE } from './gallery-motion';

type Props = {
  projects: ShowcaseProject[];
  activeIndex: number;
  reduceMotion: boolean;
};

/* Layer z-0 — every hero stacked full-bleed, only the active one opaque.
 *
 * No AnimatePresence, deliberately. With `mode="wait"` the outgoing image has
 * to finish leaving before the incoming one is even mounted, so there is a
 * beat of empty background between every project — a cut, not a dissolve.
 * Without a mode they overlap but the exiting node is unmounted the instant
 * its animation ends, which makes the tail of the fade jump. Rendering all of
 * them all the time and animating opacity is what produces a real crossfade:
 * mid-swap both images are genuinely on screen at partial opacity, and that
 * overlap is the effect.
 *
 * The cost is n decoded full-viewport bitmaps in memory. For a five-project
 * gallery that is the right trade; past a couple of dozen it would not be.
 */
export default function HeroBackdrop({ projects, activeIndex, reduceMotion }: Props) {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {projects.map((project, index) => {
        const isActive = index === activeIndex;
        return (
          <motion.img
            key={project.id}
            src={project.hero}
            alt=""
            aria-hidden="true"
            draggable={false}
            decoding="async"
            /* No blur filter here at any point — the hero stays sharp and the
               scrim below does the work of keeping the title readable. */
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
            /* Promoted for the whole life of the section rather than toggled
               per animation: these are full-viewport bitmaps, and letting the
               compositor re-rasterise one at the moment it starts fading is
               exactly when the dropped frame shows. */
            style={{ willChange: 'transform, opacity' }}
            /* `initial={false}` so the first hero is simply *there* the moment
               the layer is revealed. Without it every layer plays an entry
               animation behind the curtain and index 0 arrives a beat late. */
            initial={false}
            animate={{
              opacity: isActive ? 1 : 0,
              // Reduced motion keeps the opacity swap — it carries the
              // meaning — and drops the push, which is the part that moves.
              scale: reduceMotion ? 1 : isActive ? 1 : 1.06,
            }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.9, ease: EASE }}
          />
        );
      })}

      {/* Scrim. Bottom-weighted so the display title clears its own ground
          without flattening the top two-thirds of the photograph, which is
          the part the thumbnail track sits over. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/5"
      />
    </div>
  );
}
