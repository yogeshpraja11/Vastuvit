import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';

export default function Contact() {
  return (
    <PageTransition>
      {/* 6.1 Hero */}
      <section className="bg-bg-dark pt-[180px] pb-20 px-6 md:px-20">
        <div className="max-w-[1440px] mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="font-display text-[9vw] leading-none text-text-primary mb-24"
          >
            Let's build<br />together.
          </motion.h1>

          {/* 6.2 2-Col Layout */}
          <div className="grid md:grid-cols-2 gap-20">
            {/* Form */}
            <form className="flex flex-col gap-12" onSubmit={(e) => e.preventDefault()}>
              <div className="flex flex-col gap-4">
                <input 
                  type="text" 
                  placeholder="Your Name *"
                  className="w-full bg-transparent border-b border-border py-4 font-ui text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent transition-colors"
                  required
                />
              </div>
              <div className="flex flex-col gap-4">
                <input 
                  type="email" 
                  placeholder="Email Address *"
                  className="w-full bg-transparent border-b border-border py-4 font-ui text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent transition-colors"
                  required
                />
              </div>
              <div className="flex flex-col gap-4">
                <select className="w-full bg-transparent border-b border-border py-4 font-ui text-text-secondary focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer">
                  <option value="" disabled selected>Project Type</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="cultural">Cultural</option>
                </select>
              </div>
              <div className="flex flex-col gap-4">
                <textarea 
                  placeholder="Project Details"
                  rows={4}
                  className="w-full bg-transparent border-b border-border py-4 font-ui text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-accent text-bg-dark py-5 font-ui text-[13px] uppercase tracking-[0.12em] hover:bg-text-primary transition-colors duration-300 mt-4"
                data-cursor
              >
                Submit Inquiry
              </button>
            </form>

            {/* Info */}
            <div className="flex flex-col gap-16 font-ui md:pl-12 border-t md:border-t-0 md:border-l border-border pt-12 md:pt-0">
              <div className="flex flex-col gap-4">
                <span className="font-mono text-[11px] text-accent uppercase tracking-widest">Studios</span>
                <p className="text-lg text-text-secondary leading-relaxed hover:text-text-primary transition-colors cursor-pointer max-w-xs">
                  14 Broadwick Street<br />Soho, London<br />W1F 8HQ, United Kingdom
                </p>
                <p className="text-lg text-text-secondary leading-relaxed hover:text-text-primary transition-colors cursor-pointer max-w-xs mt-4">
                  2-11-3 Meguro<br />Meguro City, Tokyo<br />153-0063, Japan
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <span className="font-mono text-[11px] text-accent uppercase tracking-widest">Direct Inquiries</span>
                <a href="mailto:hello@arcvault.studio" className="text-2xl font-display hover:text-accent transition-colors pointer-events-auto" data-cursor>hello@arcvault.studio</a>
                <a href="tel:+442071234567" className="text-xl font-display hover:text-accent transition-colors pointer-events-auto" data-cursor>+44 (0) 20 7123 4567</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
