import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';

/* ─── Data for mega-menu panels ─── */
const PROJECT_CATEGORIES = [
  {
    heading: 'ARCHITECTURE',
    items: [
      { label: 'Residential', desc: 'Custom homes and private estates designed for timeless living.' },
      { label: 'Commercial', desc: 'Office towers, retail centres, and mixed-use developments.' },
      { label: 'Institutional', desc: 'Schools, hospitals, and public buildings that serve communities.' },
    ],
  },
  {
    heading: 'INTERIOR DESIGN',
    items: [
      { label: 'Living Spaces', desc: 'Bespoke interiors that reflect your personality and lifestyle.' },
      { label: 'Workspaces', desc: 'Efficient and inspiring offices, co-working, and studios.' },
      { label: 'Hospitality', desc: 'Hotels, restaurants, and resorts with memorable atmospheres.' },
    ],
  },
  {
    heading: 'LANDSCAPE',
    items: [
      { label: 'Garden Design', desc: 'Lush outdoor spaces crafted in harmony with nature.' },
      { label: 'Urban Landscapes', desc: 'Parks, plazas, and streetscapes that enliven cities.' },
      { label: 'Outdoor Living', desc: 'Terraces, pools, and courtyards for seamless indoor-outdoor flow.' },
    ],
  },
];

const PROJECT_CTAS = [
  {
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop',
    title: 'Custom Projects',
    desc: 'Collaborate with us on a custom design and bring your vision to life.',
    cta: 'Learn more',
  },
  {
    img: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=400&auto=format&fit=crop',
    title: 'View Portfolio',
    desc: 'Browse our complete collection of architecture, interior, and landscape work.',
    cta: 'See all projects',
  },
];

const ABOUT_ITEMS = [
  {
    img: 'https://images.unsplash.com/photo-1545042746-1db810e206ab?q=80&w=400&auto=format&fit=crop',
    title: 'Our Story',
    desc: 'Crafting spaces at the intersection of culture, climate, and context.',
    cta: 'Read more',
  },
  {
    img: 'https://images.unsplash.com/photo-1600607688969-a5bfcd64bd40?q=80&w=400&auto=format&fit=crop',
    title: 'Our Approach',
    desc: 'Sustainable design is something we consider at every step of the way.',
    cta: 'Read more',
  },
  {
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=400&auto=format&fit=crop',
    title: 'Insights',
    desc: 'Read about our latest projects, industry news, and design thinking.',
    cta: 'Read more',
  },
];

/* ─── Animation variants ─── */
const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

/* Opens the page-load sequence, ahead of the hero's headline and frame. The
   bar mounts once for the whole app — it sits above the router, not inside it
   — so this plays on arrival and never again on a route change. Delayed past
   PageTransition's 0.4s wipe, which is opaque and covers the bar until then. */
const INTRO_HIDDEN = { opacity: 0, y: -16 };
const INTRO_VISIBLE = { opacity: 1, y: 0 };
const INTRO_TRANSITION = { duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };

const panelVariants: Variants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto', transition: { duration: 0.35, ease } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.25, ease } },
};

type DropdownKey = 'projects' | 'about' | null;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdownRaw, setActiveDropdown] = useState<DropdownKey>(null);
  const [mobileOpenRaw, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Menus belong to the page they were opened on. Deriving "still current"
  // from the pathname closes them on navigation without the setState-in-effect
  // cascade this previously used.
  const [menuOrigin, setMenuOrigin] = useState(location.pathname);
  const stale = menuOrigin !== location.pathname;
  const mobileOpen = stale ? false : mobileOpenRaw;
  const activeDropdown = stale ? null : activeDropdownRaw;

  const openDropdown = (key: DropdownKey) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setMenuOrigin(location.pathname);
    setActiveDropdown(key);
  };

  const scheduleClose = () => {
    closeTimeout.current = setTimeout(() => setActiveDropdown(null), 200);
  };

  const cancelClose = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
  };

  // Hover alone left the mega-menus unreachable by keyboard. Toggling on click
  // gives them a keyboard and touch path; Escape closes whatever is open.
  const toggleDropdown = (key: Exclude<DropdownKey, null>) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setMenuOrigin(location.pathname);
    setActiveDropdown(activeDropdown === key ? null : key);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setActiveDropdown(null);
      setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Close an open panel when focus leaves the nav entirely (tabbing past it).
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setActiveDropdown(null);
    }
  };

  return (
    <motion.div
      ref={navRef}
      className="fixed top-0 left-0 w-full z-[100]"
      onBlur={handleBlur}
      /* Plain objects rather than a named variant: a string `animate` on this
         wrapper would propagate the label down to every motion child that has
         no `animate` of its own — including the mega-menu panels — and drive
         them off this timeline. `initial={false}` mounts straight at the
         visible state, so a reduced-motion reader gets no drop-in at all. */
      initial={reduceMotion ? false : INTRO_HIDDEN}
      animate={INTRO_VISIBLE}
      transition={INTRO_TRANSITION}
    >
      {/* ─── Main Bar ─── */}
      <nav
        aria-label="Primary"
        className={cn(
          'relative w-full h-[72px] flex items-center justify-between px-6 md:px-16 lg:px-20 transition-all duration-300 border-b',
          scrolled
            ? 'bg-bg-dark/95 backdrop-blur-md border-border'
            : 'bg-bg-dark border-border'
        )}
      >
        {/* Brand */}
        <Link
          to="/"
          className="font-display text-[21px] md:text-[23px] tracking-[0.2em] text-text-primary z-10 uppercase font-bold flex items-center gap-3"
          data-cursor
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-90">
            <rect x="3" y="3" width="8" height="18" rx="0" />
            <rect x="13" y="7" width="8" height="14" rx="0" />
          </svg>
          VASTUVIT
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-0 group/nav-links">
          {/* PROJECTS dropdown trigger */}
          <div
            className="relative"
            onMouseEnter={() => openDropdown('projects')}
            onMouseLeave={scheduleClose}
          >
            <button
              type="button"
              aria-expanded={activeDropdown === 'projects'}
              aria-controls="projects-panel"
              aria-haspopup="true"
              onClick={() => toggleDropdown('projects')}
              className={cn(
                'font-ui text-[18px] uppercase tracking-[0.15em] font-medium px-5 py-6 flex items-center gap-1.5 transition-[opacity,border-color] duration-300',
                'group-hover/nav-links:opacity-40 hover:!opacity-100',
                activeDropdown === 'projects' ? 'text-text-primary !opacity-100' : 'text-text-primary'
              )}
            >
              Projects
              <svg
                className={cn('w-4 h-4 transition-transform duration-300', activeDropdown === 'projects' ? 'rotate-0' : 'rotate-[135deg]')}
                viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="0.8"
              >
                <path d="M8 13.5v-11m0 0L3.5 7M8 2.5 12.5 7" strokeLinejoin="bevel" />
              </svg>
            </button>
          </div>

          {/* SERVICES link */}
          <a
            href="/#services"
            className="font-ui text-[18px] font-medium text-text-primary uppercase tracking-[0.15em] px-5 py-6 transition-[opacity,border-color] duration-300 group-hover/nav-links:opacity-40 hover:!opacity-100"
          >
            Services
          </a>

          {/* CASE STUDIES link */}
          <a
            href="/#projects"
            className="font-ui text-[18px] font-medium text-text-primary uppercase tracking-[0.15em] px-5 py-6 transition-[opacity,border-color] duration-300 group-hover/nav-links:opacity-40 hover:!opacity-100"
          >
            Case Studies
          </a>

          {/* ABOUT dropdown trigger */}
          <div
            className="relative"
            onMouseEnter={() => openDropdown('about')}
            onMouseLeave={scheduleClose}
          >
            <button
              type="button"
              aria-expanded={activeDropdown === 'about'}
              aria-controls="about-panel"
              aria-haspopup="true"
              onClick={() => toggleDropdown('about')}
              className={cn(
                'font-ui text-[18px] uppercase tracking-[0.15em] font-medium px-5 py-6 flex items-center gap-1.5 transition-[opacity,border-color] duration-300',
                'group-hover/nav-links:opacity-40 hover:!opacity-100',
                activeDropdown === 'about' ? 'text-text-primary !opacity-100' : 'text-text-primary'
              )}
            >
              About
              <svg
                className={cn('w-4 h-4 transition-transform duration-300', activeDropdown === 'about' ? 'rotate-0' : 'rotate-[135deg]')}
                viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="0.8"
              >
                <path d="M8 13.5v-11m0 0L3.5 7M8 2.5 12.5 7" strokeLinejoin="bevel" />
              </svg>
            </button>
          </div>

          {/* CONTACT link. Was a <span> with cursor-pointer and no handler:
              it looked clickable, did nothing, and no keyboard could reach it. */}
          <a
            href="/#contact"
            className="font-ui font-medium text-[18px] text-text-primary uppercase tracking-[0.15em] px-5 py-6 transition-[opacity,border-color] duration-300 group-hover/nav-links:opacity-40 hover:!opacity-100"
          >
            Contact
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          className="lg:hidden flex flex-col items-center justify-center gap-[5px] p-2 z-10 min-w-11 min-h-11"
          onClick={() => {
            setMenuOrigin(location.pathname);
            setMobileOpen(!mobileOpen);
          }}
          data-cursor
        >
          <span className={cn('block w-5 h-[1.5px] bg-text-primary transition-all duration-300', mobileOpen && 'rotate-45 translate-y-[6.5px]')} />
          <span className={cn('block w-5 h-[1.5px] bg-text-primary transition-all duration-300', mobileOpen && 'opacity-0')} />
          <span className={cn('block w-5 h-[1.5px] bg-text-primary transition-all duration-300', mobileOpen && '-rotate-45 -translate-y-[6.5px]')} />
        </button>
      </nav>

      {/* ─── Desktop PROJECTS Mega Panel ─── */}
      <AnimatePresence>
        {activeDropdown === 'projects' && (
          <motion.div
            id="projects-panel"
            key="projects-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute left-0 w-full bg-bg-dark border-b border-border shadow-[0_8px_32px_rgba(0,0,0,0.06)] overflow-hidden"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <div className="max-w-[1440px] mx-auto px-6 md:px-16 lg:px-20 py-10">
              {/* Categories grid */}
              <div className="grid grid-cols-3 gap-x-16 gap-y-0 mb-10">
                {PROJECT_CATEGORIES.map((cat) => (
                  <div key={cat.heading}>
                    <h4 className="font-ui text-[12px] font-bold text-text-muted uppercase tracking-[0.2em] mb-5 pb-3 border-b border-border">
                      {cat.heading}
                    </h4>
                    <div className="space-y-4">
                      {cat.items.map((item) => (
                        <a
                          key={item.label}
                          href="/#projects"
                          className="group block"
                        >
                          <div className="flex items-start gap-3">
                            <span className="font-ui text-[15px] font-bold text-text-primary group-hover:text-accent-ink transition-colors duration-200">
                              {item.label}
                            </span>
                          </div>
                          <p className="text-[13px] text-text-muted mt-1 leading-relaxed max-w-[280px]">
                            {item.desc}
                          </p>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA row */}
              <div className="border-t border-border pt-8 grid grid-cols-2 gap-8">
                {PROJECT_CTAS.map((cta) => (
                  <a key={cta.title} href="/#projects" className="flex gap-5 group">
                    <div className="w-[140px] h-[90px] flex-shrink-0 overflow-hidden">
                      <img
                        src={cta.img}
                        alt={cta.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h5 className="font-ui text-[16px] font-bold text-text-primary mb-1">{cta.title}</h5>
                      <p className="text-[13px] text-text-muted leading-relaxed mb-2 max-w-[260px]">{cta.desc}</p>
                      <span className="inline-flex items-center gap-1 text-[12px] font-bold text-text-primary uppercase tracking-[0.15em] border border-text-primary rounded-sm px-3 py-1.5 w-fit group-hover:bg-text-primary group-hover:text-bg-dark transition-all duration-300">
                        {cta.cta}
                        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M2 10L10 2M10 2H4M10 2v6" />
                        </svg>
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Desktop ABOUT Mega Panel ─── */}
      <AnimatePresence>
        {activeDropdown === 'about' && (
          <motion.div
            id="about-panel"
            key="about-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute left-0 w-full bg-bg-dark border-b border-border shadow-[0_8px_32px_rgba(0,0,0,0.06)] overflow-hidden"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <div className="max-w-[1440px] mx-auto px-6 md:px-16 lg:px-20 py-10">
              <div className="grid grid-cols-3 gap-8">
                {ABOUT_ITEMS.map((item) => (
                  <a key={item.title} href="/#about" className="group">
                    <div className="aspect-[4/3] w-full overflow-hidden mb-4">
                      <img
                        src={item.img}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h5 className="font-ui text-[18px] font-bold text-text-primary mb-2">{item.title}</h5>
                    <p className="text-[14px] text-text-muted leading-relaxed mb-3">{item.desc}</p>
                    <span className="inline-flex items-center gap-1 text-[12px] font-bold text-text-primary uppercase tracking-[0.15em] border border-text-primary rounded-sm px-3 py-1.5 group-hover:bg-text-primary group-hover:text-bg-dark transition-all duration-300">
                      {item.cta}
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M2 10L10 2M10 2H4M10 2v6" />
                      </svg>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Mobile Menu ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            id="mobile-menu"
            className="lg:hidden fixed inset-0 top-[72px] bg-bg-dark z-[99] overflow-y-auto"
          >
            <div className="px-6 py-8 flex flex-col gap-0">
              {/* PROJECTS (collapsible) */}
              <div className="border-b border-border">
                <button
                  type="button"
                  aria-expanded={mobileExpanded === 'projects'}
                  aria-controls="mobile-projects-panel"
                  onClick={() => setMobileExpanded(mobileExpanded === 'projects' ? null : 'projects')}
                  className="w-full flex items-center justify-between py-5"
                >
                  <span className="font-ui text-[18px] font-medium text-text-primary uppercase tracking-[0.15em]">Projects</span>
                  <svg
                    className={cn('w-5 h-5 text-text-muted transition-transform duration-300', mobileExpanded === 'projects' ? 'rotate-0' : 'rotate-90')}
                    viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="0.8"
                  >
                    <path d="M8 13.5v-11m0 0L3.5 7M8 2.5 12.5 7" strokeLinejoin="bevel" />
                  </svg>
                </button>
                <AnimatePresence>
                  {mobileExpanded === 'projects' && (
                    <motion.div
                      id="mobile-projects-panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 pl-4 space-y-5">
                        {PROJECT_CATEGORIES.map((cat) => (
                          <div key={cat.heading}>
                            <h4 className="font-ui text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] mb-3">{cat.heading}</h4>
                            <div className="space-y-2 pl-2">
                              {cat.items.map((item) => (
                                <a key={item.label} href="/#projects" className="block text-[13px] text-text-secondary py-1">
                                  {item.label}
                                </a>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* SERVICES */}
              <a href="/#services" className="block py-5 border-b border-border font-ui text-[18px] font-medium text-text-primary uppercase tracking-[0.15em]">
                Services
              </a>

              {/* CASE STUDIES */}
              <a href="/#projects" className="block py-5 border-b border-border font-ui text-[18px] font-medium text-text-primary uppercase tracking-[0.15em]">
                Case Studies
              </a>

              {/* ABOUT (collapsible) */}
              <div className="border-b border-border">
                <button
                  type="button"
                  aria-expanded={mobileExpanded === 'about'}
                  aria-controls="mobile-about-panel"
                  onClick={() => setMobileExpanded(mobileExpanded === 'about' ? null : 'about')}
                  className="w-full flex items-center justify-between py-5"
                >
                  <span className="font-ui text-[18px] font-medium text-text-primary uppercase tracking-[0.15em]">About</span>
                  <svg
                    className={cn('w-5 h-5 text-text-muted transition-transform duration-300', mobileExpanded === 'about' ? 'rotate-0' : 'rotate-90')}
                    viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="0.8"
                  >
                    <path d="M8 13.5v-11m0 0L3.5 7M8 2.5 12.5 7" strokeLinejoin="bevel" />
                  </svg>
                </button>
                <AnimatePresence>
                  {mobileExpanded === 'about' && (
                    <motion.div
                      id="mobile-about-panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 pl-4 space-y-2">
                        {ABOUT_ITEMS.map((item) => (
                          <a key={item.title} href="/#about" className="block text-[13px] text-text-secondary py-1">
                            {item.title}
                          </a>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CONTACT */}
              <a href="/#contact" className="block py-5 border-b border-border font-ui text-[18px] font-medium text-text-primary uppercase tracking-[0.15em]">
                Contact
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
