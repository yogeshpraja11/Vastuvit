import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import PageTransition from '../components/PageTransition';
import StaggeredText from '../components/StaggeredText';
import ScrollReveal from '../components/ScrollReveal';
import Projects from './Projects';
import About from './About';
import Services from './Services';
import Contact from './Contact';

// Local Assets
import sketchImg from '../assets/Sketch.png';
import sketchBlackImg from '../assets/Sketch_Black.png';
import homeProjectImg from '../assets/Home.png';

export default function Home() {
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 1000], [0, 300]);

  return (
    <PageTransition>
      {/* 1.1 Hero Section */}
      <section ref={heroRef} className="relative w-full h-dvh overflow-hidden flex items-center justify-center -mt-[72px]">
        <motion.div
          className="absolute inset-0 w-full h-[120dvh] -top-[10dvh] bg-surface z-0"
          style={{ y: yParallax }}
        >
          {/* External placeholder architecture image. Decorative: the heading
              beneath it carries the meaning, so an alt string would just be
              noise in a screen reader. */}
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&q=80"
            alt=""
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-bg-dark/40 mix-blend-multiply" />
        </motion.div>

        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl">
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            className="font-mono text-accent-ink text-[11px] uppercase tracking-widest mb-8"
          >
            — EST. 2009 — VASTUVIT
          </motion.p>

          <h1 className="font-display text-5xl md:text-[9vw] leading-[1.1] text-text-primary uppercase mb-8">
            <StaggeredText text="We build Spaces that Remember you." />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.8 }}
            className="font-ui font-light text-base md:text-lg max-w-lg mx-auto mb-12"
          >
            An architecture studio committed to enduring material and spatial clarity.
          </motion.p>

          {/* Was a <button> with no handler — the hero's primary call to
              action did nothing at all. Matches the navbar's anchor pattern. */}
          <motion.a
            href="#projects"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
            className="inline-block border border-accent-ink text-text-primary uppercase font-ui text-[12px] tracking-widest py-[14px] px-[36px] hover:bg-accent-ink hover:text-bg-dark hover:border-accent-ink transition-all duration-300"
            data-cursor
          >
            View Projects
          </motion.a>
        </div>
      </section>

      {/* 1.2 Featured Numbers */}
      <section className="bg-bg-dark py-[120px] px-6 border-b border-border relative z-20">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-y-12">
          {[
            { num: '120+', label: 'Projects Completed' },
            { num: '18', label: 'Countries Active' },
            { num: '34', label: 'Global Awards' },
            { num: '2009', label: 'Year Established' }
          ].map((stat, i) => (
            <ScrollReveal key={i} delay={i * 0.1} className={`flex flex-col items-center text-center ${i !== 3 ? 'md:border-r border-border' : ''}`}>
              <span className="font-display text-5xl md:text-[56px] text-text-primary mb-2">{stat.num}</span>
              <span className="font-mono text-[11px] text-accent-ink uppercase tracking-widest">{stat.label}</span>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 1.3 Selected Work (Placeholder content) */}
      <section className="bg-bg-light text-text-primary py-[10px] px-6 md:px-20 relative z-20">
        <div className="max-w-[1440px] mx-auto">
          <div className="relative mt-20 min-h-[800px] md:min-h-[1200px]">
            {/* Collage Layout inspired by ss 4 */}

            {/* 1. Primary Sketch (Top) */}
            <ScrollReveal className="relative z-0 w-full md:w-[85%] mx-auto">
              <div className="overflow-hidden bg-surface group" data-cursor>
                <img
                  src={sketchImg}
                  alt="Early process sketch exploring the building's massing"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                />
              </div>
            </ScrollReveal>

            {/* 2. Secondary Sketch (Bottom Left - Overlapping) */}
            <ScrollReveal delay={0.2} className="absolute top-[60%] md:top-[60%] left-[5%] md:left-[5%] z-20 w-[55%] md:w-[42%]">
              <div className="overflow-hidden bg-bg-light group" data-cursor>
                <img
                  src={sketchBlackImg}
                  alt="Blueprint sketch of the project in plan"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                />
              </div>
            </ScrollReveal>

            {/* 3. Final Result (Bottom Right - Overlapping) */}
            <ScrollReveal delay={0.4} className="absolute top-[57.5%] md:top-[57.5%] right-[3%] md:right-[3%] z-30 w-[65%] md:w-[50%]">
              <div className="overflow-hidden group" data-cursor>
                <img
                  src={homeProjectImg}
                  alt="The completed building on site"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                />
              </div>
            </ScrollReveal>

            {/* Bottom Left Quote Section - Overlapping the B&W sketch at the bottom */}
            <div className="absolute top-[80%] md:top-[80%] left-[15%] md:left-[15%] z-40 w-max max-w-[90vw]">
              <ScrollReveal delay={0.6}>
                <p className="font-display text-[24px] md:text-[26px] leading-[1.1] text-text-primary">
                  A studio <br />
                  built on <br />
                  conviction.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
      {/* Embedded Pages. `scroll-mt` keeps anchored sections clear of the
          fixed 72px navbar, which otherwise covers the top of each target. */}
      <section id="projects" aria-label="Projects" className="w-full relative scroll-mt-[72px]"><Projects /></section>
      <section id="about" aria-label="About the studio" className="w-full relative scroll-mt-[72px]"><About /></section>
      <section id="services" aria-label="Services" className="w-full relative scroll-mt-[72px]"><Services /></section>
      <section id="contact" aria-label="Contact" className="w-full relative scroll-mt-[72px]"><Contact /></section>
    </PageTransition>
  );
}
