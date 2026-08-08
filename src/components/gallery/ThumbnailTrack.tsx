import { motion, useMotionTemplate, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { MotionValue } from 'framer-motion';
import type { ShowcaseProject } from '../../data/showcase-projects';
import type { Geometry } from './gallery-geometry';
import { cardInsetAt, cardWidthAt } from './gallery-geometry';
import { EASE, thumbStateTransition } from './gallery-motion';

type Props = {
  projects: ShowcaseProject[];
  geometry: Geometry;
  /** Phase A + B translation of the whole row. Mount-driven. */
  mountX: MotionValue<number>;
  /** Phase C translation. Scroll-driven, 0 at progress 0. */
  scrollX: MotionValue<number>;
  /** Phase A clock, 0 → 1, LINEAR. Each card carves its own window from it. */
  reveal: MotionValue<number>;
  /** Phase B clock, 0 → 1. Drives the gaps, the slide and the final growth. */
  settle: MotionValue<number>;
  /** Live gap in px: gapCompact → gap across Phase B. */
  gapPx: MotionValue<number>;
  activeIndex: number;
  /** The intro is over, so cards may take their active/inactive state. */
  staged: boolean;
  browseHref: string;
};

/* Layer z-10 — the horizontal track.
 *
 * TWO nested translated elements, not one. The outer carries the mount-driven
 * intro (Phase A's centring and Phase B's slide); the inner carries the
 * scroll. Keeping them apart is what lets the scroll transform stay a clean
 * "distance travelled since the intro finished", so it can be mapped straight
 * from scroll progress with no offset to subtract — and it means scrolling
 * during the intro composes with it instead of fighting it.
 *
 * `items-start` is load-bearing: fixed width, height from the aspect ratio, so
 * aligning TOP edges is what leaves the bottom line ragged. Centring would
 * even it out and lose the look.
 *
 * `justify-start` with an explicit left padding, never `justify-center` — see
 * the note on `centeredX` in gallery-geometry.
 */
export default function ThumbnailTrack({
  projects,
  geometry,
  mountX,
  scrollX,
  reveal,
  settle,
  gapPx,
  activeIndex,
  staged,
  browseHref,
}: Props) {
  // `gap` is not one of the properties Framer appends units to, so it has to
  // arrive as a string. Everything else here is a plain px number.
  const gap = useMotionTemplate`${gapPx}px`;

  return (
    <div className="absolute inset-0 z-10">
      <motion.div className="absolute top-[44%] left-0 will-change-transform" style={{ x: mountX }}>
        <motion.ul
          className="flex w-max items-start justify-start will-change-transform"
          style={{ x: scrollX, gap, paddingLeft: geometry.padLeft }}
        >
          {projects.map((project, index) => (
            <Thumbnail
              key={project.id}
              project={project}
              index={index}
              count={projects.length}
              geometry={geometry}
              reveal={reveal}
              settle={settle}
              isActive={index === activeIndex}
              staged={staged}
            />
          ))}

          {/* Part of the track, not an overlay — it translates with the row and
              arrives on its own as the last thing in the sequence. Held back
              until the intro is over: it is white text, and during Phase A
              there is no photograph behind it yet. */}
          <motion.li
            className="shrink-0 self-center"
            initial={false}
            animate={{ opacity: staged ? 1 : 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <Link
              to={browseHref}
              className="group inline-flex items-center gap-3 font-sans text-[15px] whitespace-nowrap text-white/85 transition-colors duration-300 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
              data-cursor
            >
              <span>Browse all</span>
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                [&rarr;]
              </span>
            </Link>
          </motion.li>
        </motion.ul>
      </motion.div>
    </div>
  );
}

type ThumbProps = {
  project: ShowcaseProject;
  index: number;
  count: number;
  geometry: Geometry;
  reveal: MotionValue<number>;
  settle: MotionValue<number>;
  isActive: boolean;
  staged: boolean;
};

/* PHASE A, per card.
 *
 * The card's SLOT is fixed from the first frame — its width tracks Phase B
 * only — and the reveal is a clip-path drawn inside it. So the card never
 * moves while it opens, and opening never displaces its neighbours. Each card
 * takes its own slice of the shared `reveal` clock (rightmost first), which is
 * what makes them arrive together but a beat apart instead of in a queue.
 *
 * Inside the slot, the image is pinned at the FULL settled width and centred,
 * so what changes is how much of it you can see, never its proportions: scale
 * a squashed image up and you get a rubber-band stretch, whereas this reads as
 * a curtain drawing back across a photograph that was always there.
 */
function Thumbnail({
  project,
  index,
  count,
  geometry,
  reveal,
  settle,
  isActive,
  staged,
}: ThumbProps) {
  const height = geometry.heights[index];
  const width = useTransform(settle, (s) => cardWidthAt(s, geometry));

  /* Only the RIGHT inset animates, so the card is uncovered left edge first
     and the wipe travels rightward. inset() reads top / right / bottom / left
     — feed `inset` to the fourth slot instead of the second to reverse it. */
  const inset = useTransform(reveal, (r) => cardInsetAt(index, count, r));
  const clipPath = useMotionTemplate`inset(0% ${inset}% 0% 0%)`;

  return (
    <li className="shrink-0">
      <motion.div
        className="relative overflow-hidden"
        style={{ width, height, clipPath, willChange: 'clip-path' }}
        /* Until the intro is over every card sits at full strength — the
           dimming is part of the stage being set, not of the entrance. */
        initial={false}
        animate={
          staged
            ? { opacity: isActive ? 1 : 0.5, scale: isActive ? 1 : 0.95 }
            : { opacity: 1, scale: 1 }
        }
        transition={thumbStateTransition}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2"
          style={{ width: geometry.cardW, height }}
        >
          <img
            src={project.thumb}
            alt={project.title}
            draggable={false}
            decoding="async"
            className="h-full w-full max-w-none object-cover select-none"
          />
        </div>
      </motion.div>
    </li>
  );
}
