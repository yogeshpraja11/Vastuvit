import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function Services() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const nested = useIsNested();
  const Heading = nested ? motion.h2 : motion.h1;

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

      {/* 5.2 Content Section */}
      <section className="bg-bg-dark py-12 md:py-20 px-6 md:px-20">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 md:gap-16 items-start">

            {/* Left: Sticky Media (Desktop Only) */}
            <div className="hidden lg:block sticky top-32 overflow-hidden bg-surface/10 aspect-square group">
              {/* Background Images Cross-fade */}
              <AnimatePresence initial={false}>
                {expanded ? (
                  <motion.div
                    key={expanded}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
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
                    className="absolute inset-0 bg-surface/10 flex items-center justify-center"
                  >
                    <span className="font-mono text-[10px] text-text-muted tracking-[0.4em]">SELECT A SERVICE</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Lottie Overlay */}
              <div className="absolute inset-0 flex items-center justify-center p-8 md:p-12 mix-blend-screen pointer-events-none z-10">
                <DotLottieReact
                  src="https://lottie.host/a8de5cca-c2de-4c33-9a52-e6816d5b1539/BflBsj4eog.lottie"
                  loop
                  autoplay
                  className="w-full h-full opacity-20 group-hover:opacity-40 transition-opacity duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/60 via-transparent to-transparent pointer-events-none z-20" />
            </div>

            {/* Right: Services List */}
            <div
              className="border-t border-border"
              onMouseLeave={() => setExpanded(null)}
            >
              {SERVICES_DATA.map((service) => {
                const isExpanded = expanded === service.id;
                return (
                  <div
                    key={service.id}
                    className={`group border-b border-border transition-all duration-500 overflow-hidden ${isExpanded ? 'bg-surface/15' : 'hover:bg-surface/5'}`}
                    onMouseEnter={() => setExpanded(service.id)}
                  >
                    {/* A real button, not a hover-only div: this list was previously
                        unreachable by keyboard and could not be collapsed by tap. */}
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
                          <span className={`font-display transition-all duration-500 group-hover:translate-x-2 leading-tight text-2xl md:text-[28px] ${isExpanded ? 'text-accent-ink' : 'text-text-secondary group-hover:text-text-primary'}`}>
                            {service.title}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className="text-accent-ink text-xl font-light transition-transform duration-700 w-6 flex justify-center"
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
                          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
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
      </section>
    </PageTransition>
  );
}
