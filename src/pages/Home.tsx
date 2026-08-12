import PageTransition from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import ScrollRevealLines from '../components/ScrollRevealLines';
import ScrollRevealHero from '../components/ScrollRevealHero';
import ProjectGallery from '../components/gallery/ProjectGallery';
import Projects from './Projects';
import { SHOWCASE_PROJECTS } from '../data/showcase-projects';
import About from './About';
import Services from './Services';
import Contact from './Contact';

// Local Assets
import sketchImg from '../assets/Sketch.png';
import sketchBlackImg from '../assets/Sketch_Black.png';
import homeProjectImg from '../assets/Home.png';

/* Served from /public for now. In production these are whatever URLs the API
   hands back — the component takes them as props precisely so this pairing
   can move to S3 without touching it. Both ladders use the same widths so the
   two layers always resolve to the same scale. */
const SKETCH = {
  src: '/media/Sketch_Image.webp',
  srcSet:
    '/media/Sketch_Image-1440.webp 1440w, /media/Sketch_Image-2160.webp 2160w, /media/Sketch_Image.webp 2880w',
};
const PHOTO = {
  src: '/media/Final_Image.webp',
  srcSet:
    '/media/Final_Image-1440.webp 1440w, /media/Final_Image-2160.webp 2160w, /media/Final_Image.webp 2880w',
};

export default function Home() {
  return (
    <PageTransition>
      {/* 1.1 Hero Section. `headerOffset` is the fixed navbar's 72px: the pin
          runs edge to edge, but the frame centres in the clear area below the
          bar so the bar never covers the top of the drawing. */}
      <ScrollRevealHero
        headline={['Where vision', 'meets execution']}
        sketchSrc={SKETCH.src}
        sketchSrcSet={SKETCH.srcSet}
        photoSrc={PHOTO.src}
        photoSrcSet={PHOTO.srcSet}
        alt="A single-storey glass pavilion with a deep flat roof overhang and a stone end wall, seen across a striped lawn"
        headerOffset={72}
      />

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
              {/* Uncovered a line at a time rather than as a block — the three
                  lines are one sentence, and staggering them makes the reader
                  arrive at "conviction" last. */}
              <ScrollRevealLines
                lines={['A studio', 'built on', 'conviction.']}
                delay={0.6}
                className="font-display text-[24px] md:text-[26px] leading-[1.1] text-text-primary"
              />
            </div>
          </div>
        </div>
      </section>
      {/* 1.4 Selected work, scroll-driven. Full-bleed on purpose — the stage is
          exactly one viewport and pins itself, so it sits outside the page's
          max-w container rather than inside it. `z-20` matches the sections
          above so the pinned hero at the top of the page cannot show through.
          It leads into the project grid below: the same work, first as a
          sequence you are walked through, then as an index you can scan. */}
      <div className="relative z-20">
        <ProjectGallery projects={SHOWCASE_PROJECTS} />
      </div>

      {/* Embedded Pages. `scroll-mt` keeps anchored sections clear of the
          fixed 72px navbar, which otherwise covers the top of each target. */}
      <section id="projects" aria-label="Projects" className="w-full relative scroll-mt-[72px]"><Projects /></section>
      <section id="about" aria-label="About the studio" className="w-full relative scroll-mt-[72px]"><About /></section>
      <section id="services" aria-label="Services" className="w-full relative scroll-mt-[72px]"><Services /></section>
      <section id="contact" aria-label="Contact" className="w-full relative scroll-mt-[72px]"><Contact /></section>
    </PageTransition>
  );
}
