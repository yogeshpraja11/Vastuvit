import { motion, useScroll, useTransform, MotionValue, useMotionValueEvent } from 'framer-motion';
import { useRef, useState } from 'react';
import PageTransition from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';

const AnimatedLine = ({
  word1,
  word2,
  font1,
  font2,
  sizeClass,
  progress,
  triggerPoint
}: {
  word1: string,
  word2: string,
  font1: string,
  font2: string,
  sizeClass: string,
  progress: MotionValue<number>,
  triggerPoint: number
}) => {
  const [swapped, setSwapped] = useState(false);

  // Trigger automatically when scroll passes the trigger point
  useMotionValueEvent(progress, 'change', (latest) => {
    if (latest >= triggerPoint) {
      setSwapped(true);
    } else {
      setSwapped(false);
    }
  });

  return (
    <div className={`relative flex justify-center items-center overflow-hidden h-[0.85em] w-full ${sizeClass}`}>
      <motion.span
        initial={false}
        animate={{ y: swapped ? "-100%" : "0%" }}
        transition={{ duration: 0.6, ease: [0.25, 1, 0.35, 1] }}
        className={`absolute whitespace-nowrap leading-none ${font1}`}
      >
        {word1}
      </motion.span>
      <motion.span
        initial={false}
        animate={{ y: swapped ? "0%" : "100%" }}
        transition={{ duration: 0.6, ease: [0.25, 1, 0.35, 1] }}
        className={`absolute whitespace-nowrap leading-none ${font2}`}
      >
        {word2}
      </motion.span>
    </div>
  );
};

const ScrollTextReplace = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  return (
    <section ref={containerRef} className="h-[100vh] relative border-b border-border">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden w-full px-6">
        <div className="text-center w-full flex flex-col items-center justify-center text-[#111] leading-none gap-y-0">

          <AnimatedLine
            word1="TRANSFORMING"
            word2="CINEMATIC"
            font1="font-serif font-thin tracking-normal"
            font2="font-display font-medium tracking-[-0.02em]"
            sizeClass="text-[10vw] md:text-[7vw]"
            progress={scrollYProgress}
            triggerPoint={0.35}
          />

          <AnimatedLine
            word1="ARCHITECTURE"
            word2="VISUAL"
            font1="font-display font-medium uppercase tracking-[-0.02em]"
            font2="font-serif font-thin tracking-normal"
            sizeClass="text-[12vw] md:text-[9vw]"
            progress={scrollYProgress}
            triggerPoint={0.5}
          />

          <AnimatedLine
            word1="INTO"
            word2="NARRATIVES"
            font1="font-serif font-thin tracking-normal"
            font2="font-display font-medium tracking-[-0.02em]"
            sizeClass="text-[10vw] md:text-[7vw]"
            progress={scrollYProgress}
            triggerPoint={0.60}
          />

        </div>
      </div>
    </section>
  );
};

export default function About() {
  return (
    <PageTransition>
      {/* Scroll Text Replace Animation */}
      <ScrollTextReplace />

      {/* 4.2 Philosophy */}
      <section className="bg-bg-light text-text-dark py-[120px] px-6 md:px-20">
        <div className="max-w-[1440px] mx-auto grid md:grid-cols-3 gap-12">
          {[
            { num: '01', title: 'Material Truth', text: 'We believe materials should be expressed honestly, not concealed. The textural quality of raw concrete, timber, and steel forms the foundation of our spatial dialogue.' },
            { num: '02', title: 'Spatial Clarity', text: 'Architecture must resonate with its environment. We strip away the unnecessary, seeking an absolute clarity of form that allows light and shadow to define the experience.' },
            { num: '03', title: 'Enduring Craft', text: 'We design for permanence. In a world of fleeting trends, our buildings are rooted in rigorous detailing and masterful craftsmanship intended to age gracefully.' }
          ].map((pillar, i) => (
            <ScrollReveal key={i} delay={i * 0.2} className="flex flex-col">
              <span className="font-mono text-[11px] text-accent uppercase tracking-widest block mb-4 border-b border-border/20 pb-4">{pillar.num}</span>
              <h3 className="font-display text-3xl mb-4">{pillar.title}</h3>
              <p className="font-ui text-text-secondary">{pillar.text}</p>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 4.3 Team Grid */}
      <section className="bg-bg-dark py-[120px] px-6 md:px-20">
        <div className="max-w-[1440px] mx-auto">
          <ScrollReveal>
            <h2 className="font-display text-5xl md:text-[72px] mb-20 text-center">Leadership</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Elena Rostova', role: 'Principal Architect', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop' },
              { name: 'Marcus Chen', role: 'Design Director', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop' },
              { name: 'Sarah Jenkins', role: 'Head of Interiors', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop' },
              { name: 'David Okafor', role: 'Technical Director', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop' }
            ].map((member, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="group relative aspect-[3/4] overflow-hidden bg-surface mb-4">
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover grayscale mix-blend-luminosity group-hover:mix-blend-normal group-hover:grayscale-0 transition-all duration-700" />
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-bg-dark/90 to-transparent translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <h4 className="font-display text-2xl text-text-primary">{member.name}</h4>
                    <p className="font-mono text-[11px] text-accent uppercase tracking-widest">{member.role}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4.4 Timeline */}
      <section className="bg-bg-dark border-t border-border overflow-hidden py-[120px]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-20 mb-20">
          <h2 className="font-display text-5xl md:text-[72px]">Chronology</h2>
        </div>
        {/* Simple horizontal scrolling native container (architectural preference vs complex hijack) */}
        <div className="flex overflow-x-auto pb-10 px-6 md:px-20 gap-20 hide-scrollbar snap-x cursor-grab active:cursor-grabbing">
          {[
            { year: '2009', text: 'Vastuvita Studio founded in London.' },
            { year: '2012', text: 'First major cultural commission won.' },
            { year: '2015', text: 'Expansion to Tokyo studio.' },
            { year: '2019', text: 'Awarded Global Architect of the Year.' },
            { year: '2023', text: 'Launched urban sustainability initiative.' },
            { year: '2026', text: 'Present form, shaping the future.' }
          ].map((item, i) => (
            <div key={i} className="min-w-[300px] snap-center flex flex-col border-l border-border pl-8 pt-4">
              <span className="font-mono text-[11px] text-accent tracking-widest mb-6">{item.year}</span>
              <p className="font-ui text-lg text-text-primary">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </PageTransition>
  );
}
