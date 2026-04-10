import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';

export default function ProjectDetail() {
  return (
    <PageTransition>
      {/* 3.1 Hero */}
      <section className="relative w-full h-[90vh]">
        <img 
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2560&auto=format&fit=crop" 
          alt="The Obsidian House" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-bg-dark/30" />
        <div className="absolute bottom-12 left-6 md:left-20 text-text-primary">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="font-display text-5xl md:text-[72px] mb-4"
          >
            The Obsidian House
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="font-mono text-accent text-[11px] uppercase tracking-widest flex gap-4"
          >
            <span>Kyoto, Japan</span>
            <span>—</span>
            <span>2025</span>
          </motion.div>
        </div>
      </section>

      {/* 3.2 Meta Strip */}
      <section className="bg-bg-dark border-y border-border">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-5 text-center px-6 md:px-20 py-8">
          {[
            { label: 'Type', val: 'Residential' },
            { label: 'Location', val: 'Kyoto, Japan' },
            { label: 'Year', val: '2025' },
            { label: 'Status', val: 'Completed' },
            { label: 'Area', val: '840 sqm' }
          ].map((meta, i) => (
            <div key={i} className={`flex flex-col gap-2 ${i !== 4 ? 'border-r border-border' : ''}`}>
              <span className="font-mono text-[11px] text-text-secondary uppercase">{meta.label}</span>
              <span className="font-ui text-[13px] text-text-primary">{meta.val}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3.3 Description */}
      <section className="bg-bg-light text-text-dark py-24 px-6 md:px-20">
        <div className="max-w-[1440px] mx-auto grid md:grid-cols-2 gap-12">
          <h2 className="font-display italic text-4xl md:text-[48px] leading-tight max-w-sm">
            "A dialogue between deep shadow and precise light."
          </h2>
          <div className="font-ui font-light text-lg space-y-6 max-w-xl">
            <p>
              The Obsidian House stands as a testament to reduction. Stripped of all superfluous ornament, it relies entirely on the interplay of charred timber, raw concrete, and carefully orchestrated natural light.
            </p>
            <p>
              Designed for a private collector in Kyoto, the residence serves dual functions: an introspective dwelling and an uncompromising gallery for minimalist art. The spatial sequence is conceived as a gradient from public to private, light to shadow.
            </p>
          </div>
        </div>
      </section>

      {/* 3.4 Image Gallery */}
      <section className="bg-bg-dark">
        <div className="w-full h-screen relative">
          <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2560&auto=format&fit=crop" className="w-full h-full object-cover" />
          <p className="absolute bottom-6 right-6 font-mono text-[11px] text-bg-light p-2 bg-overlay">01 — Courtyard View</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="h-[80vh] relative">
            <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover" />
          </div>
          <div className="h-[80vh] relative">
             <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* 3.5 Next Project Teaser */}
      <section className="h-[60vh] bg-surface flex flex-col items-center justify-center relative overflow-hidden group border-t border-border" data-cursor>
        <img 
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2560&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover opacity-20 filter grayscale group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-[1s]"
        />
        <div className="relative z-10 text-center pointer-events-none">
          <span className="font-mono text-[11px] text-accent uppercase tracking-widest mb-4 block">Next Project</span>
          <h2 className="font-display text-5xl md:text-[72px] text-text-primary">Aura Skyscraper</h2>
        </div>
      </section>
    </PageTransition>
  );
}
