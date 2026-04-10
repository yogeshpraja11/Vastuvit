import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

export default function StaggeredText({ text }: { text: string }) {
  const words = text.split(' ');

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 * i },
    }),
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 24,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 40,
    },
  };

  return (
    <motion.div
      className="flex flex-wrap overflow-hidden"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span
          variants={child}
          key={index}
          className="mr-[0.3em]"
          style={{ whiteSpace: word.includes('\n') ? 'pre-wrap' : 'nowrap' }}
        >
          {word.includes('\n') ? (
            <>
              {word.replace('\n', '')}
              <br />
            </>
          ) : (
            word
          )}
        </motion.span>
      ))}
    </motion.div>
  );
}
