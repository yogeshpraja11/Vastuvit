import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const transitionDuration = 0.4;
const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: transitionDuration, ease }}
      >
        {children}
      </motion.div>

      {/* Wipe effect */}
      <motion.div
        className="fixed top-0 left-0 w-full h-screen bg-accent z-[999] pointer-events-none"
        initial={{ scaleX: 1, transformOrigin: 'right' }}
        animate={{ scaleX: 0, transformOrigin: 'right' }}
        exit={{ scaleX: 1, transformOrigin: 'left' }}
        transition={{ duration: transitionDuration, ease: [0.22, 1, 0.36, 1] }}
      />
    </>
  );
}
