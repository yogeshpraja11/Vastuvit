import { useEffect, useState } from 'react';
import { motion, useSpring, useReducedMotion } from 'framer-motion';

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const reduceMotion = useReducedMotion();
  // Touch devices have no cursor to decorate: this was rendering a stray
  // spring-animated dot that chased taps around the screen.
  const [hasFinePointer, setHasFinePointer] = useState(false);

  // Use springs for smooth following
  const cursorX = useSpring(0, { stiffness: 300, damping: 20 });
  const cursorY = useSpring(0, { stiffness: 300, damping: 20 });

  useEffect(() => {
    const query = window.matchMedia('(pointer: fine)');
    const update = () => setHasFinePointer(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const manageMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') !== null ||
        target.closest('button') !== null ||
        target.hasAttribute('data-cursor') ||
        target.closest('[data-cursor]') !== null
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', manageMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', manageMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY]);

  if (!hasFinePointer || reduceMotion) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 w-3 h-3 bg-accent rounded-full pointer-events-none z-[9999] opacity-40 mix-blend-difference transform-gpu"
      style={{
        x: cursorX,
        y: cursorY,
        translateX: '-50%',
        translateY: '-50%',
      }}
      animate={{
        scale: isHovering ? 4 : 1,
        opacity: isHovering ? 1 : 0.4,
      }}
      transition={{ type: 'tween', ease: 'backOut', duration: 0.3 }}
    />
  );
}
