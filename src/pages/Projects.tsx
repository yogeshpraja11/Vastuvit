import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import { useIsNested } from '../lib/page-transition-context';
import { PROJECTS, FILTERS } from '../data/projects';

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState('All');
  const nested = useIsNested();
  // Embedded in the home page this is a section, not the page's subject.
  const Heading = nested ? motion.h2 : motion.h1;

  const filtered = activeFilter === 'All' ? PROJECTS : PROJECTS.filter(p => p.category === activeFilter);

  return (
    <PageTransition>
      {/* Header */}
      <section className="bg-bg-dark pt-32 pb-20 px-6 md:px-20 text-text-primary">
        <div className="max-w-[1440px] mx-auto">
          <Heading
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="font-display text-[9vw] leading-none mb-12"
          >
            All Projects
          </Heading>

          <div className="flex flex-wrap gap-4" role="group" aria-label="Filter projects by category">
            {FILTERS.map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                aria-pressed={activeFilter === f}
                className={`font-mono text-[11px] uppercase tracking-widest px-4 py-2 border rounded-full transition-all duration-300 ${
                  activeFilter === f
                    ? 'bg-accent text-text-primary border-accent'
                    : 'border-border-strong text-text-secondary hover:text-text-primary hover:border-accent-ink'
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
            >
              {/* A real link: these were `cursor-pointer` divs that navigated
                  nowhere and were invisible to keyboard and screen readers. */}
              <Link
                to={`/projects/${item.id}`}
                className="group relative block aspect-[3/4] overflow-hidden bg-surface"
                data-cursor
              >
                <img
                  src={item.img}
                  alt=""
                  loading={index < 3 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-[0.8s] group-hover:scale-105"
                />
                {/* Caption is permanent below `md`, where there is no hover to
                    reveal it — touch visitors previously saw no project names
                    at all. Above `md` it stays a hover/focus reveal. */}
                <div className="absolute inset-0 bg-overlay flex flex-col justify-end p-8 transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
                  <div className="transition-transform duration-500 md:translate-y-4 md:group-hover:translate-y-0 md:group-focus-visible:translate-y-0">
                    <h3 className="font-display text-3xl text-text-primary mb-2">{item.title}</h3>
                    <div className="flex justify-between font-mono text-[11px] text-accent-ink uppercase tracking-widest border-t border-border pt-4 mt-4">
                      <span>{item.location}</span>
                      <span>{item.year}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="max-w-[1440px] mx-auto font-ui text-text-secondary py-20">
            No projects in this category yet.
          </p>
        )}
      </section>
    </PageTransition>
  );
}
