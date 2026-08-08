import Lenis from 'lenis';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';

/* Lenis, mounted once, driving the *native* window scroll.
 *
 * This matters more than it looks. Lenis has two modes: given no `wrapper` /
 * `content` it eases `window.scrollTo` once per frame, so `window.scrollY`
 * stays truthful and Framer Motion's `useScroll` keeps reporting real
 * progress — which is why the gallery needs no bridge between the two and no
 * scroll listener of its own. Hand Lenis a wrapper element and it switches to
 * transforming that element instead; at that point the document never scrolls,
 * `useScroll` reads a frozen 0, and the whole gallery sits dead on the first
 * frame. So: no wrapper, no content, and no `overflow: hidden` scroll
 * container between the viewport and the sticky child.
 *
 * NOTE: this app already ships components/SmoothScroll.tsx (lenis/react's
 * ReactLenis with `root`). Mount ONE of the two — two instances both easing
 * window.scrollTo every frame will fight over the scroll position. The gallery
 * reads neither directly, so either works.
 */
export default function LenisProvider({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const lenis = new Lenis({
      // Frame-rate independent damping — identical glide at 60Hz and 120Hz.
      // 0.075 is tighter than Lenis' 0.1 default: the track tracks the wheel
      // closely enough that the active-index swap doesn't lag the gesture.
      lerp: 0.075,

      // Off under prefers-reduced-motion. Setting it false makes Lenis stop
      // calling preventDefault on wheel entirely, so the browser scrolls the
      // page itself — a real opt-out, not a very fast animation.
      smoothWheel: !reduceMotion,

      // Touch stays native. syncTouch is what costs you iOS momentum and
      // pull-to-refresh, and the <768px branch of the gallery is a native
      // snap-scroller that wants the platform gesture anyway.
      syncTouch: false,

      // We drive the loop below so it can be cancelled precisely on unmount
      // rather than left to Lenis' internal rAF.
      autoRaf: false,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [reduceMotion]);

  return <>{children}</>;
}
