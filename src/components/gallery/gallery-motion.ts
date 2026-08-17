/* The intro's timeline.
 *
 * Two phases, both on mount, both finishing before any scrolling is required:
 *
 *   PHASE A  every card widens from a thin line to its compact width, a beat
 *            apart and rightmost first, while the row holds its centre. No
 *            hero — the cards are the only thing on screen.
 *   PHASE B  the row slides right until card 0 lands on the anchor, the gaps
 *            open to their settled spacing and the cards finish growing, so
 *            the remaining cards trail off to the right. The hero arrives as
 *            card 0 lands.
 *
 * A module with no component exports, so importing it cannot break Fast
 * Refresh for the components that do.
 */

/* Explicitly a 4-tuple: Framer's `Easing` union accepts a cubic-bezier as
   [number, number, number, number], and a bare array literal widens to
   number[], which does not match it. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Beat before anything moves, so the section is not already animating when it arrives. */
export const PHASE_A_DELAY = 0.2;

/**
 * Phase A — the width reveal.
 *
 * Long. This is the part with nothing else on screen competing for attention,
 * and the cards are small, so it has to be unhurried or it reads as a flicker
 * rather than an opening. Each card's own slice is roughly half of this once
 * the stagger has been carved out of it.
 */
export const PHASE_A_DURATION = 1.8;

/** Hold on the finished compact row before it moves. Lets Phase A land. */
export const PHASE_HOLD = 0.2;

/** Phase B — the slide right, the gaps opening, the cards finishing. */
export const PHASE_B_DURATION = 1.3;

/** When Phase B begins, in seconds from the intro starting. */
export const PHASE_B_START = PHASE_A_DELAY + PHASE_A_DURATION + PHASE_HOLD;

/**
 * When the whole intro is done, in seconds.
 *
 * Derived from the phase durations rather than written down separately. Note
 * that nothing schedules off this — the gallery decides the intro is over by
 * watching the settle clock reach 1, because a timer and an rAF-driven
 * animation drift apart the moment the browser throttles frames. It is here
 * for documentation and for tests.
 */
export const INTRO_DURATION = PHASE_B_START + PHASE_B_DURATION;

/**
 * Every phase collapses to instant under prefers-reduced-motion.
 *
 * Phase A's driver runs LINEARLY on purpose. Each card carves its own window
 * out of that 0..1 clock and applies its own easing inside it (see
 * `cardWidthAt`); easing the driver as well would bend the windows themselves,
 * bunching the early cards and stretching the late ones.
 */
export const phaseTiming = (reduceMotion: boolean) => ({
  a: reduceMotion
    ? { duration: 0, delay: 0, ease: 'linear' as const }
    : { duration: PHASE_A_DURATION, delay: PHASE_A_DELAY, ease: 'linear' as const },
  b: reduceMotion
    ? { duration: 0, delay: 0 }
    : { duration: PHASE_B_DURATION, delay: PHASE_B_START, ease: EASE },
});

/** PHASE C — active/inactive thumbnail state. */
export const thumbStateTransition = { duration: 0.5, ease: EASE };
