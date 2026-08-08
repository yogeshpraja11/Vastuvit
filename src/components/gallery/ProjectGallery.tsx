import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';

import HeroBackdrop from './HeroBackdrop';
import ThumbnailTrack from './ThumbnailTrack';
import GalleryText, { GalleryCaption } from './GalleryText';
import { EASE, phaseTiming } from './gallery-motion';
import { computeGeometry, gapAt, mountXAt } from './gallery-geometry';
import useActiveIndex from '../../hooks/useActiveIndex';
import type { ShowcaseProject } from '../../data/showcase-projects';

/**
 * The stage ground.
 *
 * The brief specifies `bg-neutral-900`; you asked for the section to match the
 * site, so this is the site's own token. It is the ONLY place the colour is
 * set — swap the string for `bg-neutral-900` and nothing else needs to change,
 * because every piece of UI that sits on it either arrives with the
 * photograph or carries its own contrast.
 */
const GROUND = 'bg-bg-dark';

/** Below this the sticky mechanic is dropped for a native snap row. */
const MOBILE_QUERY = '(max-width: 767px)';

/** Track top edge, as a fraction of viewport height. Cards hang below it. */
const TRACK_TOP_RATIO = 0.44;

/* ─────────────────────────────────────────────────────────────────────────
   SHARED HOOKS
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Hold on the ground until the section can actually open on a picture.
 *
 * Gates on the first two heroes rather than all of them: two is enough for the
 * opening frame and the first crossfade, and waiting on every one means the
 * section is a dead rectangle for as long as the slowest takes. The rest keep
 * decoding in the background and are ready long before the track reaches them.
 */
function useHeroPreload(projects: ShowcaseProject[]) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (projects.length === 0) return;
    let cancelled = false;

    const warm = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.src = src;
        // decode() rejects on abort or a broken file; either way we stop waiting.
        if (typeof img.decode === 'function') img.decode().then(() => resolve(), () => resolve());
        else {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }
      });

    /* A deadline, not just a race. `decode()` rejects on a broken file, which
       is handled above, but it can also simply never settle — a backgrounded
       tab defers decoding, and a stalled connection defers it indefinitely.
       Without this the gate holds and the section is a blank rectangle
       forever, which is a far worse failure than one undecoded photograph. */
    const deadline = new Promise<void>((resolve) => setTimeout(resolve, 3000));

    Promise.race([Promise.all(projects.slice(0, 2).map((p) => warm(p.hero))), deadline]).then(
      () => {
        if (!cancelled) setReady(true);
      },
    );

    projects.slice(2).forEach((p) => void warm(p.hero));
    projects.forEach((p) => void warm(p.thumb));

    return () => {
      cancelled = true;
    };
  }, [projects]);

  return ready;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);

    // Sync once on mount: the initialiser runs during the first render, which
    // on a server or a not-yet-measured viewport reads a width of 0 and picks
    // the mobile branch for a desktop.
    onChange();

    mql.addEventListener('change', onChange);
    // Belt and braces. `change` is the right signal and fires on a real window
    // resize, but some programmatic viewport overrides (devtools device
    // metrics, embedded preview panes) skip it — and the cost of missing one
    // is the entire desktop mechanic silently not mounting.
    window.addEventListener('resize', onChange);

    return () => {
      mql.removeEventListener('change', onChange);
      window.removeEventListener('resize', onChange);
    };
  }, [query]);

  return matches;
}

function useViewport() {
  const [viewport, setViewport] = useState(() => ({
    w: typeof window === 'undefined' ? 1440 : window.innerWidth,
    h: typeof window === 'undefined' ? 900 : window.innerHeight,
  }));

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  return viewport;
}

/* ─────────────────────────────────────────────────────────────────────────
   ENTRY
   ───────────────────────────────────────────────────────────────────────── */

type Props = {
  /** Required. This component never invents image URLs. */
  projects: ShowcaseProject[];
  /** Where the trailing "Browse all" link points. */
  browseHref?: string;
};

export default function ProjectGallery({ projects, browseHref = '/projects' }: Props) {
  const reduceMotion = useReducedMotion() ?? false;
  const ready = useHeroPreload(projects);
  const isMobile = useMediaQuery(MOBILE_QUERY);

  if (projects.length === 0) return null;

  /* Two entirely separate subtrees rather than one that branches internally.
     The desktop branch builds a scroll-progress graph over a tall spacer; the
     mobile one has no such spacer to measure. Swapping the whole component
     keeps each set of hooks with the DOM it was written for. */
  const shared = { projects, ready, browseHref, reduceMotion };
  return isMobile ? <GalleryMobile {...shared} /> : <GalleryDesktop {...shared} />;
}

type BranchProps = {
  projects: ShowcaseProject[];
  ready: boolean;
  browseHref: string;
  reduceMotion: boolean;
};

/* ─────────────────────────────────────────────────────────────────────────
   DESKTOP — sticky child inside a tall spacer
   ───────────────────────────────────────────────────────────────────────── */

function GalleryDesktop({ projects, ready, browseHref, reduceMotion }: BranchProps) {
  const containerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const viewport = useViewport();
  const geometry = useMemo(
    () => computeGeometry(viewport.w, projects),
    [viewport.w, projects],
  );
  const trackTop = viewport.h * TRACK_TOP_RATIO;
  const n = projects.length;

  /* PHASE 1 trigger.
   *
   * A deliberate deviation from "on mount": mounted is not the same as seen.
   * This gallery sits partway down the home page, so a mount-time intro would
   * play to an empty room and be long finished by the time anyone scrolled to
   * it. Firing on first intersection makes "on mount" true for the standalone
   * route and true in spirit everywhere else. `once` so scrolling back up
   * never replays it.
   *
   * Observing the STAGE, not the section. `amount` is a fraction of the
   * observed element, and the section is (n + 2) viewports tall — asking for
   * 60% of 6300px inside a 900px window is a threshold that can never be
   * crossed, and the intro would simply never fire. The sticky child is
   * exactly one viewport, so the fraction means what it reads like.
   */
  const inView = useInView(stageRef, { once: true, amount: 0.6 });
  const revealed = ready && inView;

  /* The intro's two clocks. Plain 0 → 1 MotionValues rather than `animate`
     props, because several different things are derived from each of them —
     card width, gap, and the row's own x — and they all have to stay in exact
     step. One driver each, everything else a pure function of it. */
  const reveal = useMotionValue(0);
  const settle = useMotionValue(0);
  const [staged, setStaged] = useState(false);

  useEffect(() => {
    if (!revealed) return;
    const timing = phaseTiming(reduceMotion);

    const a = animate(reveal, 1, timing.a);
    const b = animate(settle, 1, timing.b);
    // Derived from the phase constants, never a written-down number, so
    // retuning a phase cannot leave the hero firing at the wrong moment.
    const done = setTimeout(() => setStaged(true), timing.introDuration * 1000);

    return () => {
      a.stop();
      b.stop();
      clearTimeout(done);
    };
  }, [revealed, reduceMotion, reveal, settle]);

  /* PHASE 3. Native scroll only — no wheel listener, no preventDefault. Lenis
     eases `window.scrollTo`, so `window.scrollY` stays truthful and useScroll
     reads real progress with nothing bridging the two. */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  /* PHASE B — the gaps opening. This is what turns a row sitting in the middle
     of the screen into one that runs off the right edge. */
  const gapPx = useTransform(settle, (s) => gapAt(s, geometry));

  /* PHASE A + B — the row's own translation.
   *
   * At settle 0 the row is held centred at whatever width it currently has, so
   * Phase A opens outward from the middle of the screen. At settle 1 it is at
   * xStart, which puts card 0 dead on the anchor. Blending between the two on
   * `settle` gives the slide right, and because the centred position is itself
   * still drifting as the gaps open and the cards finish growing, the motions
   * resolve into one movement rather than reading as a resize then a slide.
   *
   * Note it depends on `settle` alone. Through Phase A the row does not move
   * at all: the cards are clipped open inside slots that are already their
   * final size, so there is nothing for the centring to chase.
   */
  const mountX = useTransform(settle, (s) => mountXAt(n, s, geometry, viewport.w));

  /* PHASE C — scroll travel, measured from where the intro left the row. Zero
     at progress 0, so the two translations compose without either needing to
     know the other's value. */
  const scrollX = useTransform(scrollYProgress, [0, 1], [0, geometry.travel]);

  const activeIndex = useActiveIndex(scrollYProgress, n);
  const active = projects[activeIndex];

  /* Framer recomputes these synchronously during render and re-subscribes on
     every render, so new geometry from a resize is picked up immediately and
     this closure always sees the current `activeIndex`. */
  const captionX = useTransform(
    [mountX, scrollX],
    ([m, s]: number[]) => m + s + (geometry.centers[activeIndex] ?? 0),
  );

  return (
    <section
      ref={containerRef}
      /* (n + 2) viewports. One per project, plus two of slack so the
         horizontal travel is unhurried — the reference gives it roughly ten
         seconds of scrolling, and the extra screens are what buy that. */
      style={{ height: `${(n + 2) * 100}vh` }}
      className={`relative ${GROUND}`}
      aria-label="Selected projects"
    >
      {/* No background colour and no negative z-index on the sticky child: it
          is transparent over the section's ground, and all three layers sit at
          zero or above so nothing can fall behind the page. */}
      <div ref={stageRef} className="sticky top-0 h-screen overflow-hidden">
        {/* The hero arrives as card 0 lands on the anchor, not before — through
            Phase A there is deliberately nothing behind the cards. On a
            wrapper rather than the first image so it composes with, instead of
            fighting, the index crossfade beneath it. */}
        <motion.div
          className="absolute inset-0 z-0"
          initial={false}
          animate={{ opacity: staged ? 1 : 0, scale: staged || reduceMotion ? 1 : 1.05 }}
          transition={{ duration: reduceMotion ? 0 : 1.2, ease: EASE }}
        >
          <HeroBackdrop projects={projects} activeIndex={activeIndex} reduceMotion={reduceMotion} />
        </motion.div>

        <ThumbnailTrack
          projects={projects}
          geometry={geometry}
          mountX={mountX}
          scrollX={scrollX}
          reveal={reveal}
          settle={settle}
          gapPx={gapPx}
          activeIndex={activeIndex}
          staged={staged}
          browseHref={browseHref}
        />

        {/* Text arrives with the photograph it needs to sit on. Mounting it
            here is what produces the fade-up from y: 20; from then on the same
            AnimatePresence handles every project change. */}
        {staged && (
          <>
            <GalleryText
              title={active.title}
              category={active.category}
              activeIndex={activeIndex}
              reduceMotion={reduceMotion}
            />
            <GalleryCaption
              caption={active.caption}
              activeIndex={activeIndex}
              centerX={captionX}
              trackTop={trackTop}
              reduceMotion={reduceMotion}
            />
          </>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MOBILE — no sticky mechanic, no scroll hijack
   ───────────────────────────────────────────────────────────────────────── */

const MOBILE_CARD_W = 200;

/**
 * Under 768px the whole conceit is dropped.
 *
 * Pinning a section for seven viewports of vertical scroll to move something
 * sideways is a desktop affordance; on a phone it is a scroll trap, and
 * `syncTouch` — the option that would make it feel right — is exactly the one
 * that costs iOS its momentum and pull-to-refresh. So: one viewport tall, the
 * active hero behind, and a native `snap-x` row the thumb already knows how to
 * flick. Same data, same crossfade, no custom gesture handling at all.
 */
function GalleryMobile({ projects, ready, browseHref, reduceMotion }: BranchProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const viewport = useViewport();

  // The snapped card is always centred here, so the caption's tracking value
  // is simply half the viewport.
  const captionX = useMotionValue(viewport.w / 2);
  useEffect(() => {
    captionX.set(viewport.w / 2);
  }, [captionX, viewport.w]);

  /* Same nearest-to-the-anchor rule as the desktop track, except the anchor is
     the centre of the scroller because that is where snapping parks a card. */
  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;

    const anchor = el.scrollLeft + el.clientWidth / 2;
    let nearest = 0;
    let smallest = Infinity;

    Array.from(el.children).forEach((child, index) => {
      const node = child as HTMLElement;
      const distance = Math.abs(node.offsetLeft + node.offsetWidth / 2 - anchor);
      if (distance < smallest) {
        smallest = distance;
        nearest = index;
      }
    });

    setActiveIndex((current) => (current === nearest ? current : nearest));
  };

  const active = projects[activeIndex];

  return (
    <section
      className={`relative h-[100svh] w-full overflow-hidden ${GROUND}`}
      aria-label="Selected projects"
    >
      <motion.div
        className="absolute inset-0 z-0"
        initial={false}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.8, ease: EASE }}
      >
        <HeroBackdrop projects={projects} activeIndex={activeIndex} reduceMotion={reduceMotion} />
      </motion.div>

      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="absolute inset-x-0 z-10 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          top: `${TRACK_TOP_RATIO * 100}%`,
          // Half a viewport minus half a card on each side, so the first and
          // last cards can still reach the centre snap position.
          paddingInline: `calc(50vw - ${MOBILE_CARD_W / 2}px)`,
        }}
      >
        {projects.map((project, index) => (
          <div
            key={project.id}
            className="relative shrink-0 snap-center overflow-hidden transition-opacity duration-300"
            style={{
              width: MOBILE_CARD_W,
              height: Math.round(
                project.aspect === '4/3' ? (MOBILE_CARD_W * 3) / 4 : (MOBILE_CARD_W * 4) / 3,
              ),
              opacity: index === activeIndex ? 1 : 0.5,
            }}
          >
            <img
              src={project.thumb}
              alt={project.title}
              draggable={false}
              decoding="async"
              className="h-full w-full object-cover select-none"
            />
          </div>
        ))}
      </div>

      {ready && (
        <>
          <GalleryCaption
            caption={active.caption}
            activeIndex={activeIndex}
            centerX={captionX}
            trackTop={viewport.h * TRACK_TOP_RATIO}
            reduceMotion={reduceMotion}
          />
          <GalleryText
            title={active.title}
            category={active.category}
            activeIndex={activeIndex}
            reduceMotion={reduceMotion}
          />
        </>
      )}

      <div className="absolute right-6 bottom-10 z-20">
        <Link
          to={browseHref}
          className="font-sans text-[13px] text-white/85 underline-offset-4 hover:underline"
          data-cursor
        >
          Browse all [&rarr;]
        </Link>
      </div>
    </section>
  );
}
