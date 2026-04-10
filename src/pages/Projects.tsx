import { motion } from 'framer-motion';
import { useState } from 'react';
import PageTransition from '../components/PageTransition';

const PROJECTS = [
  { id: 1, title: 'The Obsidian House', location: 'Kyoto, Japan', year: '2025', category: 'Residential', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop' },
  { id: 2, title: 'Lumina Gallery', location: 'Paris, France', year: '2024', category: 'Cultural', img: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1000&auto=format&fit=crop' },
  { id: 3, title: 'Aura Skyscraper', location: 'New York, USA', year: '2023', category: 'Commercial', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop' },
  { id: 4, title: 'Vertex Pavilion', location: 'Oslo, Norway', year: '2025', category: 'Cultural', img: 'https://images.unsplash.com/photo-1545042746-1db810e206ab?q=80&w=1000&auto=format&fit=crop' },
  { id: 5, title: 'Slate Residence', location: 'London, UK', year: '2022', category: 'Residential', img: 'https://images.unsplash.com/photo-1600607688969-a5bfcd64bd40?q=80&w=1000&auto=format&fit=crop' },
  { id: 6, title: 'The Mono Block', location: 'Berlin, Germany', year: '2024', category: 'Urban', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop' },
];

const FILTERS = ['All', 'Residential', 'Commercial', 'Cultural', 'Urban'];

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All' ? PROJECTS : PROJECTS.filter(p => p.category === activeFilter);

  return (
    <PageTransition>
      {/* Header */}
      <section className="bg-bg-dark pt-32 pb-20 px-6 md:px-20 text-text-primary">
        <div className="max-w-[1440px] mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="font-display text-[9vw] leading-none mb-12"
          >
            All Projects
          </motion.h1>
          
          <div className="flex flex-wrap gap-4">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`font-mono text-[11px] uppercase tracking-widest px-4 py-2 border rounded-full transition-all duration-300 ${
                  activeFilter === f 
                    ? 'bg-accent text-bg-dark border-accent' 
                    : 'border-border text-text-secondary hover:text-text-primary hover:border-accent'
                }`}
                data-cursor
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="bg-bg-dark px-6 md:px-20 pb-32">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              key={item.id}
              className="group relative aspect-[3/4] overflow-hidden bg-surface cursor-pointer"
              data-cursor
            >
              <img 
                src={item.img} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-[0.8s] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                <motion.div initial={{ y: 20 }} whileInView={{ y: 0 }} className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="font-display text-3xl text-text-primary mb-2">{item.title}</h3>
                  <div className="flex justify-between font-mono text-[11px] text-accent uppercase tracking-widest border-t border-border/50 pt-4 mt-4">
                    <span>{item.location}</span>
                    <span>{item.year}</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </PageTransition>
  );
}
