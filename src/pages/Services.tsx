import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import { useIsNested } from '../lib/page-transition-context';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const SERVICES_DATA = [
  { id: '01', title: 'Master Planning', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop', desc: 'Comprehensive urban and site strategies that establish long-term frameworks for growth, sustainability, and community integration.' },
  { id: '02', title: 'Architecture', img: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=800&auto=format&fit=crop', desc: 'From the initial concept to construction administration, delivering uncompromising spatial experiences deeply rooted in their context.' },
  { id: '03', title: 'Interior Design', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop', desc: 'Curating the tactile and intimate scales of a building. Material selection, bespoke furniture design, and intricate detailing.' },
  { id: '04', title: 'Landscape', img: 'https://images.unsplash.com/photo-1545042746-1db810e206ab?q=80&w=800&auto=format&fit=crop', desc: 'Integrating natural topologies with built forms. Establishing an effortless dialogue between the interior void and the exterior wild.' },
  { id: '05', title: 'Restoration', img: 'https://images.unsplash.com/photo-1600607688969-a5bfcd64bd40?q=80&w=800&auto=format&fit=crop', desc: 'Sensitive interventions into historic structures. Preserving heritage while injecting contemporary program and structural vitality.' },
];

/* Scroll the section holds the screen for, per service, on top of the one
   viewport the pinned frame itself occupies. A quarter of a screen each — two
   wheel notches — so the five follow each other closely. Worth knowing before
   dropping it further: at this pace a steady scroll crosses a band in roughly
   the 600ms a handover takes, so below about 20 the rows start being cut off
   mid-animation by the next one rather than reading as a sequence. */
const STEP_VH = 25;
const SECTION_VH = 100 + STEP_VH * SERVICES_DATA.length;

/* The pin only exists where the two-column layout does. Below `lg` the media
   panel is hidden and the viewport is short enough that a pinned frame risks
   clipping the open row, so small screens keep normal scrolling and open rows
   on tap. */
const PIN_QUERY = '(min-width: 1024px)';

/* One curve and one duration for every moving part of a handover: row tint,
   title, the + mark, the panel height and the photo crossfade. They used to run
   at four different speeds — 0.5s, 0.6s, 0.7s — so a single gesture arrived in
   stages. The curve matters more than the spread: the panel was on an expo-out
   that spends about two thirds of its travel in the first fifth of the time,
   which is exactly what reads as a snap. This is a symmetric ease-in-out, so
   the row leaves and arrives gently, the way the Lenis wheel does.

   The Tailwind twin has to stay in step with the Framer one — same 600ms, same
   four bezier handles — or the CSS half of the handover drifts against the JS
   half and the staging comes straight back. */
const EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];
const HANDOVER = { duration: 0.6, ease: EASE };
const HANDOVER_CLASS = 'duration-600 ease-[cubic-bezier(0.65,0,0.35,1)]';

export default function Services() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const nested = useIsNested();
  const Heading = nested ? motion.h2 : motion.h1;

  const pinRef = useRef<HTMLElement>(null);
  const fromScroll = useRef<string | null>(null);
  const canPin = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia(PIN_QUERY);
    const update = () => {
      canPin.current = mq.matches;
    };
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  /* `start start` → `end end` spans exactly the pinned stretch: 0 the moment the
     frame parks against the top of the viewport, 1 the moment it lets go. So
     progress measures the scroll the section absorbs while standing still,
     which is the whole point of pinning — the rows advance against a ruler that
     the rows themselves cannot move. Measuring the list in the document (what
     this did before) meant every expansion shifted the thing being measured. */
  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    if (!canPin.current) return;

    /* Even bands rather than `round(progress * last)`. Rounding would put a
       service on each *endpoint* of the range, which hands the first and last
       rows half the dwell of the middle three. Nothing here has to physically
       travel to an anchor — the rows hold still and only the scroll advances —
       so an equal slice each is what actually reads as evenly paced. */
    const last = SERVICES_DATA.length - 1;
    const index = Math.min(last, Math.max(0, Math.floor(progress * SERVICES_DATA.length)));
    const id = SERVICES_DATA[index].id;

    /* Only write when the scroll-derived row actually changes. Without this the
       next frame would overwrite a click — instead a click holds until you
       scroll on into a different row, and then the sequence picks up again. */
    if (id === fromScroll.current) return;
    fromScroll.current = id;
    setExpanded(id);
  });

  return (
    <PageTransition>
      {/* 5.1 Hero */}
      <section className="bg-bg-dark h-[35vh] md:h-[45vh] flex items-end pb-10 md:pb-16 px-6 md:px-20 border-b border-border">
        <Heading
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="font-display text-5xl md:text-7xl leading-none text-text-primary"
        >
          What we do.
        </Heading>
      </section>

      {/* 5.2 Content Section. The tall outer section is scroll length, nothing
          more — the frame inside it sticks to the top and holds the screen
          still while the list plays through, then releases. */}
      <section
        ref={pinRef}
        style={{ '--pin-height': `${SECTION_VH}vh` } as CSSProperties}
        className="bg-bg-dark lg:h-[var(--pin-height)]"
      >
        <div className="py-12 md:py-20 px-6 md:px-20 lg:sticky lg:top-0 lg:h-dvh lg:py-0 lg:flex lg:items-center">
          <div className="max-w-[1440px] mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 md:gap-16 items-start lg:items-center">

            {/* Left: Media (Desktop Only). No `sticky` of its own any more — the
                pinned frame above already holds it still. */}
            <div className="hidden lg:block relative overflow-hidden bg-surface/10 aspect-square group">
              {/* Background Images Cross-fade */}
              <AnimatePresence initial={false}>
                {expanded ? (
                  <motion.div
                    key={expanded}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={HANDOVER}
                    className="absolute inset-0"
                  >
                    <img
                      src={SERVICES_DATA.find(s => s.id === expanded)?.img}
                      alt="Service preview"
                      className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000"
                    />
                    <div className="absolute inset-0 bg-bg-dark/40 mix-blend-multiply" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-surface/10"
                  />
                )}
              </AnimatePresence>

              {/* Lottie Overlay. The art is dark ink (#252945) on transparent, so
                  it multiplies onto the paper ground like a drawing — `screen`
                  here was a holdover from the dark theme and erased the line work. */}
              {/* It belongs to the empty state only: once a service is picked its
                  photo owns the frame, so the drawing fades out with the crossfade. */}
              <div
                className={`absolute inset-0 flex items-center justify-center p-8 md:p-12 mix-blend-multiply pointer-events-none z-10 transition-opacity ${HANDOVER_CLASS} ${expanded ? 'opacity-0' : 'opacity-100'}`}
              >
                <DotLottieReact
                  src="https://lottie.host/a8de5cca-c2de-4c33-9a52-e6816d5b1539/BflBsj4eog.lottie"
                  loop
                  autoplay
                  className="w-full h-full opacity-60 group-hover:opacity-85 transition-opacity duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/30 via-transparent to-transparent pointer-events-none z-20" />
            </div>

            {/* Right: Services List */}
            <div className="border-t border-border">
              {SERVICES_DATA.map((service) => {
                const isExpanded = expanded === service.id;
                return (
                  <div
                    key={service.id}
                    className={`group border-b border-border transition-all ${HANDOVER_CLASS} overflow-hidden ${isExpanded ? 'bg-surface/15' : 'hover:bg-surface/5'}`}
                  >
                    <h3 className="m-0">
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-controls={`service-panel-${service.id}`}
                        onClick={() => setExpanded(isExpanded ? null : service.id)}
                        className="w-full py-6 md:py-8 flex items-center justify-between px-4 md:px-6 text-left cursor-pointer"
                      >
                        <span className="flex items-center gap-8 w-full">
                          <span className="font-mono text-[9px] text-text-muted tracking-[0.4em] font-medium hidden md:block">{service.id}</span>
                          <span className={`font-display transition-all ${HANDOVER_CLASS} group-hover:translate-x-2 leading-tight text-2xl md:text-[28px] ${isExpanded ? 'text-accent-ink' : 'text-text-secondary group-hover:text-text-primary'}`}>
                            {service.title}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className={`text-accent-ink text-xl font-light transition-transform ${HANDOVER_CLASS} w-6 flex justify-center`}
                          style={{ transform: isExpanded ? 'rotate(45deg)' : 'rotate(0deg)' }}
                        >
                          +
                        </span>
                      </button>
                    </h3>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          id={`service-panel-${service.id}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={HANDOVER}
                        >
                          <div className="pb-8 pt-0 px-4 md:px-6">
                            <div className="md:pl-20 w-full">
                              <p className="font-ui text-xs md:text-sm font-light leading-relaxed text-text-secondary mb-6 max-w-[500px]">
                                {service.desc}
                              </p>

                              {/* Mobile Image (Visible when sticky media is hidden) */}
                              <div className="lg:hidden aspect-[16/9] w-full overflow-hidden rounded-xl shadow-xl">
                                <img src={service.img} alt={service.title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
