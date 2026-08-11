import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { preload } from 'react-dom';
import {
  animate,
  cubicBezier,
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useLenis } from 'lenis/react';

/* Gap between the media box and the edge of the visible area, per side. */
const INSET = 28;

/* Page-load choreography, in two beats: the frame arrives from under the fold,
   and only once it has settled is the headline uncovered. */
const INTRO_BOX = { duration: 2.6, delay: 0.3 };

/* Each line sits in its own overflow-hidden strip and starts pushed a full
   line-height below it, so it is not hidden by opacity — it is simply not in
   the box yet, and slides up into view as if being uncovered. `110%` rather
   than `100%` keeps descenders clear of the mask on the way up. */
const HEADLINE_HIDDEN = '110%';
const HEADLINE_LINE = { duration: 0.85, stagger: 0.12 };
const HEADLINE_EASE = cubicBezier(0.22, 1, 0.36, 1);

/* The rise is the whole gesture; the widening is the last beat of it. The
   width holds until the section is nearly home, then opens as it settles. */
const INTRO_WIDEN_AT = 0.68;

/* `introProgress` runs linearly and each output carries its own curve, rather
   than easing the animation and mapping both outputs off it. That split is
   what makes the stagger real: ease the animation instead and the progress
   value races through its own range, so "the last third" arrives almost
   immediately in wall-clock time and the hold above buys nothing.

   The curve matters more than anything else here. A hard ease-out — the
   obvious choice for "slow at the end" — puts 76% of the travel in the first
   quarter of the time and 96% in the first half, so the section snaps into
   place at the start and everything left to watch is the width opening. That
   is what makes it read as a left-to-right wipe instead of as a section
   arriving from below. This is an ease-in-out: the section is still only 10%
   risen at a quarter of the time and 70% at half, so it is visibly travelling
   for most of the animation, then spends the last stretch easing to a stop
   just as the frame opens. Both share the curve so they settle in unison. */
const INTRO_RISE_EASE = cubicBezier(0.6, 0, 0.2, 1);
const INTRO_WIDEN_EASE = cubicBezier(0.6, 0, 0.2, 1);

/* How far past the fold the section's top edge starts, once the travel has
   been measured. Small on purpose: every pixel above this is time the section
   spends rising while still off-screen, which the reader never sees. */
const INTRO_CLEARANCE = 24;

/* Longest the box will wait on the sketch before travelling anyway. The wait
   is what stops a cold load animating an empty frame; this is what stops a
   slow or broken image leaving the page scroll-locked forever. */
const INTRO_MAX_WAIT = 1200;
/* Slack added to the computed ceiling below, to absorb the frame or two
   between an animation ending and its callback landing. */
const INTRO_LOCK_SLACK = 1000;

/* `useReducedMotion` from framer-motion returns `null` on the first render and
   settles a tick later, which would mean rendering the animated branch once
   before swapping. Reading matchMedia through useSyncExternalStore is correct
   from render one, and it is the same primitive the mobile breakpoint needs —
   one subscription each, both torn down on unmount, and no resize handler
   anywhere in this component (a resize listener that re-measures is what
   causes layout thrash here; media queries only fire on an actual crossing). */
function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}

export interface ScrollRevealHeroProps {
  /** The `<h2>`, one entry per visual line. It is an array rather than a
      fragment with `<br />` because each line needs its own mask to be
      revealed independently, and a `<br />` gives nothing to wrap. */
  headline?: ReactNode[];

  /* Sources are props on purpose — in production these come off the API/S3,
     so nothing about the pairing is baked into the component. */
  /** Transparent line-art trace. Decorative; never carries alt text. */
  sketchSrc: string;
  sketchSrcSet?: string;
  /** The photograph the sketch traces. Must be pixel-registered with it. */
  photoSrc: string;
  photoSrcSet?: string;
  /** Alt text for the photograph — this is the section's only real image. */
  alt: string;

  /** `sizes` for the photo. Defaults to the media box's own width. */
  sizes?: string;
  /** `sizes` for the sketch. Defaults to 1.5x the box — see note below. */
  sketchSizes?: string;

  /** Scroll runway. The first 100dvh of it is spent pinned. */
  scrollLength?: string;
  /** Runway below 768px, where a 250vh scroll is a long way to drag. */
  mobileScrollLength?: string;

  /** The box's *tallest* permitted shape, written "W / H". The box always
      takes the full available width; this caps how tall that makes it. On a
      viewport too short for the ratio the box stays full width and gets
      shorter, so the crop tightens rather than the frame shrinking. */
  aspectRatio?: string;
  /** Tallest shape below 768px. A 16/9 box on a 375px phone is only 179px
      tall, which is not a hero; 3/2 is closer to the source's own ratio, so
      the phone crops *less* than the desktop rather than more. */
  mobileAspectRatio?: string;

  /** Height of any fixed site header, so the box centres in the clear area. */
  headerOffset?: number;

  /** Fallback travel, in vh, used only on the first paint and if the frame
      cannot be measured. The real distance is measured — see `measureRise` —
      so this only has to be roughly enough to hold the frame under the fold
      until the measurement lands. */
  introRiseVh?: number;
  /** Fraction of the frame's final width showing when the intro starts. The
      frame opens to full width from there; the picture inside never moves. */
  introWidth?: number;
}

export default function ScrollRevealHero({
  headline = ['Where vision', 'meets execution'],
  sketchSrc,
  sketchSrcSet,
  photoSrc,
  photoSrcSet,
  alt,
  sizes = `calc(100vw - ${INSET * 2}px)`,
  /* The ink is 1–2px wide at 2880 and starts dropping out below roughly
     1600px of rendered width on a 1x display. Asking for 1.5x the box width
     biases the sketch one variant up so it never resolves finer than the
     photo — the brief's "don't downscale the sketch more aggressively". */
  sketchSizes = `calc((100vw - ${INSET * 2}px) * 1.5)`,
  scrollLength = '250vh',
  mobileScrollLength = '180vh',
  aspectRatio = '16 / 9',
  mobileAspectRatio = '3 / 2',
  headerOffset = 0,
  introRiseVh = 45,
  introWidth = 0.7,
}: ScrollRevealHeroProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const still = useMediaQuery('(prefers-reduced-motion: reduce)');

  const wrapperRef = useRef<HTMLDivElement>(null);
  const sketchRef = useRef<HTMLImageElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);

  const [sketchReady, setSketchReady] = useState(false);
  const [photoReady, setPhotoReady] = useState(false);
  const bothReady = sketchReady && photoReady;

  /* ── Page-load intro ──────────────────────────────────────────────────────
     Decided once, at mount, and never re-armed: a reader who reloaded halfway
     down the page gets their scroll position restored by the browser, and
     replaying a "rises into view" opening while the frame is already pinned
     would be nonsense — worse, the lock below would yank them back to the top.
     `still` is read straight from matchMedia, so it is correct on render one
     and reduced-motion readers never arm the intro at all. */
  const [introArmed] = useState(
    () => !still && typeof window !== 'undefined' && window.scrollY === 0
  );
  /* Travel in px rather than vh: framer would have to re-resolve a vh string
     against a viewport this component deliberately does not listen for, and
     the value only matters for the 2.4s the box is in flight — after which y
     rests at 0 and a resize cannot strand it anywhere.

     "From the bottom of the screen" is not a fixed fraction of the viewport,
     so measure it off the frame — now the only thing that travels, the
     headline having become its own beat. The gap between the frame's resting
     top and the fold depends on the navbar, on how many lines the headline
     wrapped to above it, and on whether a short viewport clamped the frame's
     height. Anchoring to the frame rather than to the headline also keeps the
     travel honest: with the headline no longer riding along, every pixel of a
     longer guess would be spent rising below the fold, where there is now
     nothing for the reader to watch. `introRiseVh` is only the fallback for
     when there is nothing to measure.

     Measured twice on purpose. A tab that has never been painted — opened in
     the background, or prerendered — reports `innerHeight: 0`, which would
     arm a rise of 0 and give a frame that widens without ever travelling. So
     fall back to the layout viewport, and re-measure at the moment the box is
     released: by then the tab someone is actually looking at has been laid
     out, and rAF (and with it framer) is running.

     `appliedOffset` is passed in rather than read off the motion value below,
     which would make this and `introY` mutually dependent. Both call sites
     run while progress is still 0, where the applied offset is exactly
     `introRise`. */
  const boxRef = useRef<HTMLDivElement>(null);
  const measureRise = useCallback(
    (appliedOffset: number) => {
      const viewport =
        typeof window === 'undefined'
          ? 0
          : window.innerHeight || document.documentElement.clientHeight || 0;
      const el = boxRef.current;
      if (!el || !viewport) return (viewport * introRiseVh) / 100;
      /* The frame is already carrying the offset the intro wrote to it, so
         subtract that back out to recover where it comes to rest. */
      const restingTop = el.getBoundingClientRect().top - appliedOffset;
      return Math.max(0, viewport - restingTop + INTRO_CLEARANCE);
    },
    [introRiseVh]
  );
  /* Nothing is mounted on the first render, so this lands on the viewport
     fraction; the measurement replaces it at release. */
  const [introRise, setIntroRise] = useState(() => measureRise(0));
  const [introPlaying, setIntroPlaying] = useState(false);
  /* Two separate moments now. `boxLanded` is the frame reaching its resting
     place, which is what cues the headline; `introDone` is the whole sequence
     finishing, which is what releases the scroll. */
  const [boxLanded, setBoxLanded] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  /* Hard ceiling on the scroll lock, in case a completion callback never lands
     — a page that will not scroll is a far worse failure than an intro that
     ends abruptly. Computed rather than a constant because it has to outlast
     the *last* headline line, and the stagger before that line grows with the
     headline: a three-line headline finishes a full stagger later than a
     two-line one, and a fixed ceiling would cut the lock before it. */
  const introMaxLock =
    INTRO_MAX_WAIT +
    (INTRO_BOX.delay +
      INTRO_BOX.duration +
      Math.max(0, headline.length - 1) * HEADLINE_LINE.stagger +
      HEADLINE_LINE.duration) *
      1000 +
    INTRO_LOCK_SLACK;

  /* One number drives both halves of the intro on one timebase, so the rise
     and the widening are staggered by choice rather than drifting apart — the
     same reason the wipe and the creep below share `eased`. Each reads the
     progress over its own slice of the range, set above.

     Templating the clip out of a numeric value is also the only way
     the widening works at all: framer mixes two `inset()` strings by matching
     their token counts, and the browser serialises `inset(0% 0% 0% 0%)` down
     to `inset(0%)` while leaving `inset(0% 15% 0% 15%)` at two values. Handed
     that pair, framer cannot mix them and silently leaves the frame clipped
     shut while `y` animates perfectly — which reads as the intro half-working
     rather than as a bug.

     The frame opens from the middle, so each side hides half of what is
     missing. `round 4px` matches the box's own radius, so at inset 0 the clip
     is exactly the border box and costs nothing. */
  const introSide = ((1 - introWidth) / 2) * 100;
  const introProgress = useMotionValue(introArmed ? 0 : 1);
  const introY = useTransform(introProgress, [0, 1], [introRise, 0], {
    ease: INTRO_RISE_EASE,
  });
  /* Starts at INTRO_WIDEN_AT, not 0 — and `clamp` (on by default) is what
     holds the frame at its start width for everything before that, so the
     section spends the first half of its travel rising at a fixed width. */
  const introInset = useTransform(introProgress, [INTRO_WIDEN_AT, 1], [introSide, 0], {
    ease: INTRO_WIDEN_EASE,
  });
  const introClip = useMotionTemplate`inset(0% ${introInset}% 0% ${introInset}% round 4px)`;

  /* "end end", not "end start". The sticky child is only pinned for
     `runway - 100dvh`, but "end start" spreads progress 0→1 across the whole
     runway, so the pin lets go at progress (runway - vh) / runway — 0.6 for a
     250vh runway on a 720px viewport. The wipe would still be at 35% when the
     frame started scrolling away. "end end" ends progress exactly where the
     pin does, so the whole 0→1 range is pinned time. */
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  });

  /* Reveal over the first 85% of the pin; the last 15% holds the finished
     photograph still before the section scrolls on. */
  const raw = useTransform(scrollYProgress, [0.05, 0.85], [100, 0]);
  /* Lenis already smooths the scroll input, so this spring only has to take
     the step out of Lenis' per-frame lerp — it must not add lag of its own.
     120/30/0.4 is heavily overdamped: ζ ≈ 2.2, and the slow pole gives a
     ~240ms time constant, so the edge takes nearly a second to settle and
     visibly trails the scroll. That lag is the "not smooth" feel — it is not
     frame drops. These numbers are ζ ≈ 0.98 (ω₀ ≈ 45 rad/s), a ~23ms
     constant settling in ~90ms: tight enough to read as attached to the
     scroll, damped enough to still settle rather than snap. */
  const smooth = useSpring(raw, { stiffness: 500, damping: 22, mass: 0.25 });
  /* At ζ just under 1 the spring overshoots slightly. Past 0 the inset goes
     negative and the photo pulls away from its own frame; past 100 a strip of
     paper opens at the bottom. Both read as a gap, so clamp the output. */
  const eased = useTransform(smooth, (v: number) => Math.min(100, Math.max(0, v)));

  /* Holds the wipe shut until both files are decoded. Without it a fast first
     scroll wipes an image that has not arrived and reveals an empty box. */
  const ready = useMotionValue(0);
  const gated = useTransform<number, number>([eased, ready], ([e, r]) => (r === 1 ? e : 100));
  const clipPath = useMotionTemplate`inset(${gated}% 0% 0% 0%)`;

  /* Driven off the same spring rather than off scrollYProgress directly, so
     the creep and the wipe edge share one timebase and cannot drift apart.
     It sits on the shared parent — scaling either layer alone would slide the
     trace out from under the photograph. */
  const boxScale = useTransform(eased, [100, 0], [1, 1.04]);

  /* A cached image can finish before React attaches onLoad, in which case the
     event never fires and the wipe stays shut forever. Re-running on the src
     props also resets the gate when the sources change. */
  useLayoutEffect(() => {
    const sketch = sketchRef.current;
    const photo = photoRef.current;
    setSketchReady(!!sketch?.complete && sketch.naturalWidth > 0);
    setPhotoReady(!!photo?.complete && photo.naturalWidth > 0);
  }, [sketchSrc, sketchSrcSet, photoSrc, photoSrcSet]);

  useEffect(() => {
    if (!bothReady) return;
    /* If the images landed after the reader had already scrolled, the spring
       has been chasing a target it was not allowed to show. Jump it onto the
       current scroll position so the wipe opens where the scroll actually is
       instead of animating a long catch-up. */
    smooth.jump(raw.get());
    ready.set(1);
  }, [bothReady, ready, smooth, raw]);

  /* Hold the box until the sketch has decoded. It is the only layer visible
     while the frame travels — the photo is still clipped shut — so starting
     any earlier animates an empty box on a cold load. Gating on the sketch
     alone rather than on `bothReady` matters: the photograph is the larger
     file and nothing waits on it here. */
  useEffect(() => {
    if (!introArmed || introPlaying) return;
    const release = () => {
      setIntroRise((applied) => measureRise(applied));
      setIntroPlaying(true);
    };
    if (sketchReady) {
      release();
      return;
    }
    const t = window.setTimeout(release, INTRO_MAX_WAIT);
    return () => window.clearTimeout(t);
  }, [introArmed, introPlaying, sketchReady, measureRise]);

  /* The travel itself. Imperative rather than an `animate` prop because the
     box's transform is already a motion value (`scale`, off the scroll
     timeline) and mixing declarative and motion-value writes on one element
     means two owners for one style property. */
  useEffect(() => {
    if (!introArmed || !introPlaying) return;
    const controls = animate(introProgress, 1, {
      ...INTRO_BOX,
      ease: 'linear',
      onComplete: () => setBoxLanded(true),
    });
    return () => controls.stop();
  }, [introArmed, introPlaying, introProgress]);

  /* Scroll is held at the top until the box lands. Without it the first flick
     of the wheel starts the sketch→photo wipe against a frame that is still
     half a viewport low and 30% too narrow, and the two motions read as one
     broken thing. Lenis' own stop() covers the wheel; `touch-action` covers
     the touch it does not own (syncTouch is off, so touch stays native), and
     the clamp catches everything else — arrow keys, space, anchor jumps.
     touch-action is safe here where `overflow` would not be: it creates no
     scroll container, so the pin below survives. */
  const lenis = useLenis();
  useEffect(() => {
    if (!introArmed || introDone) return;
    const html = document.documentElement;
    const prevTouchAction = html.style.touchAction;
    const clamp = () => window.scrollTo(0, 0);

    lenis?.stop();
    html.style.touchAction = 'none';
    window.addEventListener('scroll', clamp, { passive: true });

    return () => {
      window.removeEventListener('scroll', clamp);
      html.style.touchAction = prevTouchAction;
      lenis?.start();
    };
  }, [introArmed, introDone, lenis]);

  /* The ceiling computed above. `onAnimationComplete` on the last headline
     line is the normal release; this is the backstop for when it never fires.
     Deliberately not restarted by anything but arming: it is a wall-clock
     deadline for the whole intro, not a per-phase timer. */
  useEffect(() => {
    if (!introArmed || introDone) return;
    const t = window.setTimeout(() => setIntroDone(true), introMaxLock);
    return () => window.clearTimeout(t);
  }, [introArmed, introDone, introMaxLock]);

  /* Toggling the OS reduced-motion switch mid-intro swaps the pin out from
     under a box that is still travelling. Land it immediately and let go of
     the scroll rather than leaving it stranded low and clipped. */
  useEffect(() => {
    if (!still) return;
    introProgress.set(1);
    setIntroPlaying(true);
    setBoxLanded(true);
    setIntroDone(true);
  }, [still, introProgress]);

  /* The headline is the second beat: it waits for the frame to land, then each
     line slides out from under its own mask. When the intro is not armed there
     is nothing to wait for and the lines render in place. */
  const revealHeadline = !introArmed || still || boxLanded;

  if (!still) {
    preload(sketchSrc, {
      as: 'image',
      fetchPriority: 'high',
      imageSrcSet: sketchSrcSet,
      imageSizes: sketchSrcSet ? sketchSizes : undefined,
    });
  }
  preload(photoSrc, {
    as: 'image',
    imageSrcSet: photoSrcSet,
    imageSizes: photoSrcSet ? sizes : undefined,
  });

  /* Width first, height clamped. The old `min(width, height * ratio)` made
     the *height* budget the binding constraint on any viewport shorter than
     the ratio wants: at 1280x720 it capped the box at 1052px with 1224px
     available, leaving 172px of unused paper either side. Here the width is
     definite and full, aspect-ratio derives the height from it, and
     max-height clamps that on short viewports — aspect-ratio only transfers
     toward the indefinite axis, so the width never gives. A short viewport
     tightens the crop instead of shrinking the frame. Neither layer can
     stretch: both are object-fit cover, so this changes only how much of the
     source shows, identically on each.

     `100%` of the flex parent, not `100vw` — `100vw` includes the scrollbar,
     which quietly ate 8px of the inset once width became the binding side. */
  const ratio = isMobile ? mobileAspectRatio : aspectRatio;
  const boxWidth = `calc(100% - ${INSET * 2}px)`;
  const boxMaxHeight = `calc(100dvh - ${headerOffset + INSET * 2}px)`;

  const layer = 'absolute inset-0 h-full w-full object-cover object-center';

  return (
    <section className="relative w-full bg-[#F2EFEC] text-[#1A1A1A]">
      {/* Scrolls away normally — the pin does not begin until it has left.
          It holds its layout position throughout; only the lines inside move,
          and only after the frame below has landed. */}
      <div className="mx-auto flex max-w-4xl flex-col items-center px-6 text-center md:pt-[16vh]">
        <h2
          className="text-[clamp(2.75rem,7.5vw,5.5rem)] leading-[1.03] font-light tracking-[-0.015em]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {headline.map((line, i) => (
            /* The mask. `leading-[1.03]` crops tight enough that a plain
               overflow-hidden would shave the tops and tails of the glyphs, so
               the strip is padded and the padding pulled back out of the flow
               — the line box is unchanged, but there is room for the type. */
            <span
              key={i}
              className="block overflow-hidden pt-[0.08em] -mt-[0.08em] pb-[0.14em] -mb-[0.14em]"
            >
              <motion.span
                className="block"
                initial={introArmed && !still ? { y: HEADLINE_HIDDEN } : false}
                animate={{ y: revealHeadline ? '0%' : HEADLINE_HIDDEN }}
                transition={{
                  duration: still ? 0 : HEADLINE_LINE.duration,
                  delay: revealHeadline && !still ? i * HEADLINE_LINE.stagger : 0,
                  ease: HEADLINE_EASE,
                }}
                /* The last line finishing is the end of the intro, and the
                   only thing still holding the scroll. Guarded because framer
                   settles initial→animate on mount even when the two match,
                   which would otherwise release the lock immediately. */
                onAnimationComplete={
                  i === headline.length - 1
                    ? () => {
                        if (revealHeadline) setIntroDone(true);
                      }
                    : undefined
                }
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h2>
      </div>

      {/* Runway. Its height is the whole scroll budget for the wipe; the
          sticky child spends the first 100dvh of it pinned. Nothing between
          here and <body> may set overflow or a transform — either one turns
          the sticky child back into a static one and the pin silently dies. */}
      <div
        ref={wrapperRef}
        className="relative w-full"
        style={still ? undefined : { height: isMobile ? mobileScrollLength : scrollLength }}
      >
        <div
          className={
            still
              ? 'flex w-full items-center justify-center overflow-hidden'
              : 'sticky top-0 flex h-[100dvh] w-full items-center justify-center overflow-hidden'
          }
          style={{ paddingTop: headerOffset, paddingBottom: still ? INSET * 2 : undefined }}
        >
          <motion.div
            ref={boxRef}
            className="relative overflow-hidden rounded-[4px]"
            /* `scale` and the photo's `clipPath` below are always passed, and
               neutralised by value rather than by dropping the prop. Framer
               writes both imperatively, so React has no record of them to
               clean up — hand it `undefined` and whatever was written last
               stays on the element. That is not hypothetical: it is what a
               reader toggling the OS reduced-motion switch mid-page hits, and
               it strands the photo clipped shut at 100%. */
            /* The intro rides on `y` and `clipPath`; the scroll timeline owns
               `scale`. Different properties, so the two never contend — and
               `scale` is 1 for the whole intro regardless, since the wipe is
               shut at scroll 0. Widening by clip rather than by `width` is
               the point: the box holds its final geometry from the first
               frame, so the sketch never re-crops or re-scales under
               object-fit, and the frame simply opens over a drawing that was
               always there at its final size. Both are motion values rather
               than conditional props, which is the same discipline the note
               above asks for: always written, never dropped. */
            style={{
              width: boxWidth,
              aspectRatio: ratio,
              maxHeight: boxMaxHeight,
              scale: still ? 1 : boxScale,
              y: introY,
              clipPath: introClip,
            }}
          >
            {/* Bottom layer. The sketch has no background of its own, so the
                section colour above is the paper its ink reads against. It
                stays underneath: on top, the photo would show through its
                transparent areas and its lines would sit over the reveal. */}
            {!still && (
              <img
                ref={sketchRef}
                src={sketchSrc}
                srcSet={sketchSrcSet}
                sizes={sketchSrcSet ? sketchSizes : undefined}
                alt=""
                aria-hidden="true"
                fetchPriority="high"
                onLoad={() => setSketchReady(true)}
                className={layer}
              />
            )}

            {/* Top layer, clipped. object-fit and object-position are
                identical to the sketch's — any difference between the two
                desynchronises the trace and the wipe edge visibly slips. */}
            <motion.img
              ref={photoRef}
              src={photoSrc}
              srcSet={photoSrcSet}
              sizes={photoSrcSet ? sizes : undefined}
              alt={alt}
              decoding="async"
              onLoad={() => setPhotoReady(true)}
              className={layer}
              /* clip-path, not height: animating height reflows the box and
                 rescales the photo out of register with the drawing. */
              style={{
                clipPath: still ? 'none' : clipPath,
                willChange: still ? 'auto' : 'clip-path',
                transform: 'translateZ(0)',
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
