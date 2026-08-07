import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { preload } from 'react-dom';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';

/* Gap between the media box and the edge of the visible area, per side. */
const INSET = 28;

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
  /** The `<h2>`. Pass a fragment with a `<br />` to control the line break. */
  headline?: ReactNode;

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
}

export default function ScrollRevealHero({
  headline = (
    <>
      Where visio dfdfn
      <br />
      meets execution
    </>
  ),
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
}: ScrollRevealHeroProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const still = useMediaQuery('(prefers-reduced-motion: reduce)');

  const wrapperRef = useRef<HTMLDivElement>(null);
  const sketchRef = useRef<HTMLImageElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);

  const [sketchReady, setSketchReady] = useState(false);
  const [photoReady, setPhotoReady] = useState(false);
  const bothReady = sketchReady && photoReady;

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
      {/* Scrolls away normally — the pin does not begin until it has left. */}
      <div className="mx-auto flex max-w-4xl flex-col items-center px-6 text-center md:pt-[16vh]">
        <h2 className="text-[clamp(2.75rem,7.5vw,5.5rem)] leading-[1.03] font-light tracking-[-0.015em]" style={{ fontFamily: "var(--font-sans)" }}>
          {headline}
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
            className="relative overflow-hidden rounded-[4px]"
            /* `scale` and the photo's `clipPath` below are always passed, and
               neutralised by value rather than by dropping the prop. Framer
               writes both imperatively, so React has no record of them to
               clean up — hand it `undefined` and whatever was written last
               stays on the element. That is not hypothetical: it is what a
               reader toggling the OS reduced-motion switch mid-page hits, and
               it strands the photo clipped shut at 100%. */
            style={{
              width: boxWidth,
              aspectRatio: ratio,
              maxHeight: boxMaxHeight,
              scale: still ? 1 : boxScale,
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
