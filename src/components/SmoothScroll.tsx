import { ReactLenis } from 'lenis/react';
import { useReducedMotion } from 'framer-motion';
import type { LenisOptions } from 'lenis';
import type { ReactNode } from 'react';

/* Lenis drives the *real* window scroll — it calls `window.scrollTo` once per
   frame rather than transforming a wrapper element. That is why nothing else
   on this site had to change: `window.scrollY` in the navbar, Framer Motion's
   `useScroll` parallax on Home and the word-swap on About, `whileInView` in
   ScrollReveal, and the `position: sticky` panels all keep reading the same
   values they always did. */
const options: LenisOptions = {
  // Frame-rate independent damping, so the glide feels identical on a 60Hz
  // and a 120Hz display. Lower = longer glide; 0.1 is Lenis' own default.
  lerp: 0.1,

  // Touch stays fully native. `syncTouch` is the option that costs you iOS
  // momentum and pull-to-refresh, and nothing here needs it.
  syncTouch: false,

  // Nested scrollers keep their own gesture instead of the page stealing it:
  // the mobile menu overlay (`overflow-y-auto`) and the About timeline rail
  // (`overflow-x-auto`). Scroll chaining still works — reach the end of one
  // and the page picks up from there.
  allowNestedScroll: true,

  // In-page hash links animate instead of jumping: the navbar's /#projects,
  // /#services, /#contact and the skip link. Lenis reads `scroll-margin-top`,
  // so the sections' `scroll-mt-[72px]` still clears the fixed 72px navbar.
  // Note this does not preventDefault, so the URL hash and the skip link's
  // focus move exactly as they did before.
  anchors: true,

  // Makes programmatic scrolls (the anchors above) instant under reduced
  // motion. On its own it only damps the wheel to lerp:1, which still leaves a
  // ~100ms tail — hence `smoothWheel` being switched off outright below.
  respectReducedMotion: true,

  autoRaf: true,
};

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  /* With `smoothWheel: false` Lenis stops consuming wheel events entirely — it
     never calls preventDefault, so the browser scrolls the page itself. That is
     a real opt-out rather than a very fast animation, which is what the rest of
     index.css promises reduced-motion users. Swapping the option rather than
     unmounting the provider matters: `ReactLenis` re-creates its instance when
     the options change, so the page state below survives the toggle. */
  return (
    <ReactLenis root options={{ ...options, smoothWheel: !reduceMotion }}>
      {children}
    </ReactLenis>
  );
}
