import { motion, useReducedMotion, cubicBezier } from 'framer-motion';
import type { Variants } from 'framer-motion';

/* Line-by-line reveal, the same gesture as the hero headline: each line sits
   in its own overflow-hidden strip and starts a full line-height below it, so
   it is not hidden by opacity — it is simply not in the box yet, and slides up
   as if being uncovered. `110%` rather than `100%` keeps descenders clear of
   the mask on the way up. */
const HIDDEN = '110%';
const LINE = { duration: 0.85, stagger: 0.12 };
const EASE = cubicBezier(0.22, 1, 0.36, 1);

const line: Variants = {
  hidden: { y: HIDDEN },
  visible: { y: '0%', transition: { duration: LINE.duration, ease: EASE } },
};

export default function ScrollRevealLines({
  lines,
  className = '',
  delay = 0,
}: {
  /** One entry per rendered line. Line breaks are the array, not `<br />`. */
  lines: string[];
  className?: string;
  /** Held before the first line moves, for sequencing against neighbours. */
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  /* One trigger on the parent, not one per line: with `whileInView` on each
     strip, a block this short crosses the threshold all at once and every
     line fires together — which is the thing being fixed. */
  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: LINE.stagger, delayChildren: delay } },
  };

  // Reduced motion, or an observer that never fires, must leave readable text
  // rather than a block parked below its own mask.
  if (reduceMotion) {
    return (
      <p className={className}>
        {lines.map((text, i) => (
          <span key={i} className="block">
            {text}
          </span>
        ))}
      </p>
    );
  }

  return (
    <motion.p
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.6 }}
    >
      {lines.map((text, i) => (
        /* The mask. Tight leading crops close enough that a plain
           overflow-hidden would shave the tops and tails of the glyphs, so the
           strip is padded and the padding pulled back out of the flow — the
           line box is unchanged, but there is room for the type. */
        <span
          key={i}
          className="block overflow-hidden pt-[0.08em] -mt-[0.08em] pb-[0.14em] -mb-[0.14em]"
        >
          <motion.span className="block" variants={line}>
            {text}
          </motion.span>
        </span>
      ))}
    </motion.p>
  );
}
