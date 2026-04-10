import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import PageTransition from '../components/PageTransition';

const SERVICES_DATA = [
  { id: '01', title: 'Master Planning', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop', desc: 'Comprehensive urban and site strategies that establish long-term frameworks for growth, sustainability, and community integration.' },
  { id: '02', title: 'Architecture', img: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=800&auto=format&fit=crop', desc: 'From the initial concept to construction administration, delivering uncompromising spatial experiences deeply rooted in their context.' },
  { id: '03', title: 'Interior Design', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop', desc: 'Curating the tactile and intimate scales of a building. Material selection, bespoke furniture design, and intricate detailing.' },
  { id: '04', title: 'Landscape', img: 'https://images.unsplash.com/photo-1545042746-1db810e206ab?q=80&w=800&auto=format&fit=crop', desc: 'Integrating natural topologies with built forms. Establishing an effortless dialogue between the interior void and the exterior wild.' },
  { id: '05', title: 'Restoration', img: 'https://images.unsplash.com/photo-1600607688969-a5bfcd64bd40?q=80&w=800&auto=format&fit=crop', desc: 'Sensitive interventions into historic structures. Preserving heritage while injecting contemporary program and structural vitality.' },
];

export default function Services() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <PageTransition>
      {/* 5.1 Hero */}
      <section className="bg-bg-dark h-[50vh] flex items-end pb-20 px-6 md:px-20 border-b border-border">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="font-display text-[9vw] leading-none text-text-primary"
        >
          What we do.
        </motion.h1>
      </section>

      {/* 5.2 Accordion Services */}
      <section className="bg-bg-dark py-12 px-6 md:px-20">
        <div 
          className="max-w-[1440px] mx-auto border-t border-border"
          onMouseLeave={() => setExpanded(null)}
        >
          {SERVICES_DATA.map((service) => {
            const isExpanded = expanded === service.id;
            return (
              <div 
                key={service.id} 
                className={`group border-b border-border cursor-pointer transition-colors duration-500 overflow-hidden ${isExpanded ? 'bg-surface/50' : 'hover:bg-surface/30'}`}
                onMouseEnter={() => setExpanded(service.id)}
              >
                <div className="py-10 flex items-center justify-between">
                  <div className="flex items-center gap-12 w-full">
                    <span className="font-mono text-[11px] text-accent tracking-widest hidden md:block">{service.id}</span>
                    <h3 className="font-display text-4xl md:text-[56px] text-text-primary transition-transform duration-500 group-hover:translate-x-4">
                      {service.title}
                    </h3>
                  </div>
                  <div className="text-accent text-2xl font-light transform transition-transform duration-500 w-8" style={{ transform: isExpanded ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                    +
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                      <div className="pb-12 pt-4 grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="pr-12 md:pl-20 flex items-center">
                          <p className="font-ui text-lg font-light leading-relaxed">{service.desc}</p>
                        </div>
                        <div className="aspect-[16/9] w-full hidden md:block overflow-hidden">
                          <img src={service.img} alt={service.title} className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
    </PageTransition>
  );
}
