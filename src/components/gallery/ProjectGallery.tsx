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
import type { MotionValue } from 'framer-motion';
import { useLenis } from 'lenis/react';

import HeroBackdrop from './HeroBackdrop';
import ThumbnailTrack from './ThumbnailTrack';
import GalleryText, { GalleryCaption } from './GalleryText';
import { EASE, INTRO_DURATION, phaseTiming } from './gallery-motion';
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

/**
 * Scroll progress past which the intro is skipped outright.
 *
 * Small — roughly 100px of a 5400px section. The intro ends with card 0 on the
 * anchor, which is only true at progress 0, so anywhere else it would be
 * setting up a position the reader has already left. Arriving mid-section by
 * deep link or restored scroll goes straight to the settled state, and
 * crucially takes no scroll lock with it.
 */
const INTRO_MAX_PROGRESS = 0.02;

/**
 * Backstop for the scroll lock, in seconds past the intro's expected end.
 *
 * A lock that depends on an animation completing is a lock that never lifts if
 * the animation never completes. Nothing here is expected to fail, but the
 * failure mode is a page the reader cannot scroll, so it gets a deadline.
 */
const LOCK_MAX_OVERRUN = 1.5;

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
   * most of 6300px inside a 900px window is a threshold that can never be
   * crossed, and the intro would simply never fire. The sticky child is
   * exactly one viewport, so the fraction means what it reads like.
   *
   * Nearly all of it, not a bare majority, because the intro takes the
   * reader's scroll with it. The stage is only fully visible once the section
   * has pinned — which is also progress 0 — so waiting for that is what makes
   * the hold land on a full screen rather than freezing the page half way
   * through the section arriving.
   */
  const inView = useInView(stageRef, { once: true, amount: 0.95 });
  const revealed = ready && inView;

  /* PHASE 3. Native scroll only — no wheel listener, no preventDefault. Lenis
     eases `window.scrollTo`, so `window.scrollY` stays truthful and useScroll
     reads real progress with nothing bridging the two. Declared before the
     intro because the intro needs to know where the page already is. */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  /* The intro's two clocks. Plain 0 → 1 MotionValues rather than `animate`
     props, because several different things are derived from each of them —
     card width, gap, and the row's own x — and they all have to stay in exact
     step. One driver each, everything else a pure function of it. */
  const reveal = useMotionValue(0);
  const settle = useMotionValue(0);
  const [staged, setStaged] = useState(false);

  /* `staged` follows the settle clock itself, not a timer counting out the
     phase durations in parallel.
   *
   * Those two can disagree. Animations advance on requestAnimationFrame, which
   * the browser throttles in a background tab or under load, while a timeout
   * keeps counting wall-clock seconds — so the hero and the title would appear
   * over a row still sitting in its Phase A position. Reading the clock the
   * animation actually drives makes "the intro has finished" mean it, and it
   * covers the abort path below for free, whatever duration that lands over.
   *
   * Declared BEFORE the intro effect on purpose: effects run in order, so this
   * subscription is live by the time that one can skip the intro by setting
   * `settle` outright. Otherwise the skip would have to setState synchronously
   * from an effect body, which is a cascading render. */
  useEffect(
    () =>
      settle.on('change', (v) => {
        // 0.999 rather than 1: the Phase B easing is aggressively front-loaded,
        // so this trips a beat before the very last frame — which is when the
        // row has visually arrived anyway.
        if (v >= 0.999) setStaged(true);
      }),
    [settle],
  );

  /* Running the intro is conditional on the reader actually being at the start
     of the section, because that is the only place its choreography is true:
     Phase B ends with card 0 on the anchor, and card 0 is only on the anchor
     at progress 0. Play it anywhere else and it fights the scroll position
     rather than setting it up. */
  useEffect(() => {
    if (!revealed) return;

    /* Already inside the section — a deep link, a restored scroll position, or
       an observer that fired as the reader swept past. Skip to the settled
       state; there is no sense opening a prelude to something they are already
       in, and no sense locking their scroll to make them watch it. */
    if (scrollYProgress.get() > INTRO_MAX_PROGRESS) {
      reveal.set(1);
      settle.set(1);
      return;
    }

    const timing = phaseTiming(reduceMotion);
    const running = [animate(reveal, 1, timing.a), animate(settle, 1, timing.b)];

    return () => running.forEach((c) => c.stop());
  }, [revealed, reduceMotion, reveal, settle, scrollYProgress]);

  /* Scroll is held for the length of the intro — the same treatment
     ScrollRevealHero gives its own opening, and for the same reason: the
     choreography assumes the row is where the intro put it, and a reader who
     scrolls through it sees neither the intro nor the gallery, just the two
     fighting.
   *
   * Lenis' own stop() covers the wheel. `touch-action` covers the touch it does
   * not own — syncTouch is off, so touch stays native — and it is safe here
   * where `overflow` would not be, because it creates no scroll container and
   * so the sticky pin survives. The clamp catches everything else: arrow keys,
   * space, anchor jumps.
   *
   * Reading `settle` directly rather than trusting `staged`: on the skip path
   * above the clocks are already at 1 when this effect runs, but the state
   * derived from them has not landed yet, and a lock that engages for one
   * frame is still a lock that fought the reader for one frame. */
  const lenis = useLenis();

  useEffect(() => {
    if (!revealed || staged || reduceMotion || settle.get() >= 0.999) return;

    const html = document.documentElement;
    const previousTouchAction = html.style.touchAction;
    // Where progress is already 0, so holding here means the intro still ends
    // exactly where the scroll phase begins — and nothing jumps on release.
    const lockY = window.scrollY;
    const clamp = () => {
      if (window.scrollY !== lockY) window.scrollTo(0, lockY);
    };

    lenis?.stop();
    html.style.touchAction = 'none';
    window.addEventListener('scroll', clamp, { passive: true });

    // Finishing the clocks releases the lock through this effect's own cleanup,
    // so the backstop lifts it by ending the intro rather than by leaving a
    // half-played animation behind a suddenly scrollable page.
    const backstop = window.setTimeout(
      () => {
        reveal.set(1);
        settle.set(1);
      },
      (INTRO_DURATION + LOCK_MAX_OVERRUN) * 1000,
    );

    return () => {
      window.clearTimeout(backstop);
      window.removeEventListener('scroll', clamp);
      html.style.touchAction = previousTouchAction;
      lenis?.start();
    };
  }, [revealed, staged, reduceMotion, settle, reveal, lenis]);


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

  /* PHASE C — scroll travel, measured from where the intro left the row.
   *
   * Scaled by `settle`, and that factor is load-bearing. Applied raw, the row
   * carries the scroll offset from the very first frame — so a reader who
   * scrolls while the intro is running drags the compact row up to a full
   * travel-length off to the left, and the whole reveal happens somewhere off
   * screen. Phasing it in with Phase B means Phase A is composed in the middle
   * of the viewport no matter where the page has been scrolled to, and by the
   * time the row is under scroll control the factor is 1 and this is exactly
   * `p * travel` again.
   */
  const scrollX = useTransform(
    [scrollYProgress, settle] as MotionValue<number>[],
    ([p, s]: number[]) => s * p * geometry.travel,
  );

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
