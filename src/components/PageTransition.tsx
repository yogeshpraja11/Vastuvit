import { motion, useReducedMotion } from 'framer-motion';
import { useContext } from 'react';
import type { ReactNode } from 'react';
import { NestedContext } from '../lib/page-transition-context';

const transitionDuration = 0.4;
const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

export default function PageTransition({ children }: { children: ReactNode }) {
  const nested = useContext(NestedContext);
  const reduceMotion = useReducedMotion();

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
          full-viewport sweep is exactly what that setting exists to stop. */}
      {!reduceMotion && (
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
