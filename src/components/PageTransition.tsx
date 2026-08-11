import { motion, useReducedMotion } from 'framer-motion';
import { useContext } from 'react';
import { useNavigationType } from 'react-router-dom';
import type { ReactNode } from 'react';
import { NestedContext } from '../lib/page-transition-context';

const transitionDuration = 0.4;
const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

export default function PageTransition({ children }: { children: ReactNode }) {
  const nested = useContext(NestedContext);
  const reduceMotion = useReducedMotion();
  /* The wipe is a *transition* device: it exists to cover the swap between an
     outgoing and an incoming route. On the first load there is no outgoing
     page to cover, so all it does is drag a full-screen accent panel sideways
     across the viewport — a left-to-right sweep with nothing behind it, and
     one that fights the hero's own entrance underneath.

     `useNavigationType` is the honest signal for "did the reader navigate
     here": it is POP on the initial render and PUSH/REPLACE once the router
     has been driven. Reading it beats tracking a first-mount flag, which
     StrictMode's mount/unmount/remount would burn in development — exactly
     where this gets looked at. The trade is that back and forward are also
     POP and so lose the wipe; on a site whose history is mostly one page,
     that is a fair price for an opening that is not a curtain. */
  const isNavigation = useNavigationType() !== 'POP';

  if (nested) return <>{children}</>;

  return (
    <NestedContext.Provider value={true}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: transitionDuration, ease }}
      >
        {children}
      </motion.div>

      {/* Wipe effect. Skipped entirely under prefers-reduced-motion — a
          full-viewport sweep is exactly what that setting exists to stop — and
          on the first load, where there is no route swap for it to cover. */}
      {!reduceMotion && isNavigation && (
        <motion.div
          aria-hidden="true"
          className="fixed top-0 left-0 w-full h-dvh bg-accent z-[999] pointer-events-none"
          initial={{ scaleX: 1, transformOrigin: 'right' }}
          animate={{ scaleX: 0, transformOrigin: 'right' }}
          exit={{ scaleX: 1, transformOrigin: 'left' }}
          transition={{ duration: transitionDuration, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
    </NestedContext.Provider>
  );
}
