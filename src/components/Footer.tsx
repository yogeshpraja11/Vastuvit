import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { cn } from '../lib/utils';
import { INQUIRY_EMAIL, STUDIO_ADDRESS, STUDIO_PHONE } from '../data/studio';

/* How far the footer's content drifts up as the page uncovers it. */
const RISE = 40;

/* A footer taller than the viewport can never be fully uncovered — the top of
   it would sit above the top of the screen with no way to scroll to it. Below
   this fraction of the viewport we reveal; above it we fall back to a plain
   in-flow footer, which is also what small phones get. */
const MAX_VIEWPORT_SHARE = 0.9;

const SITE_LINKS = [
  { to: '/projects', label: 'Projects' },
  { to: '/showcase', label: 'Case studies' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

type Metrics = { height: number; maxScroll: number };

/* PRODUCT.md is unambiguous: until the practice supplies real details, a
   placeholder must read as a placeholder. A footer is exactly where a
   plausible-looking invented address would survive unnoticed. */
function Pending({ label }: { label: string }) {
  return (
    <p className="font-mono text-[12px] leading-relaxed text-text-muted">
      [ {label} — to be confirmed ]
    </p>
  );
}

function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-mono text-[11px] text-accent-ink uppercase tracking-widest">
      {children}
    </h2>
  );
}

export default function Footer() {
  const reduceMotion = useReducedMotion();
  const footerRef = useRef<HTMLElement>(null);
  const [{ height, maxScroll }, setMetrics] = useState<Metrics>({
    height: 0,
    maxScroll: 0,
  });

  /* The reveal is off until we have measured, so the first paint is the plain
     in-flow footer rather than a fixed one sitting on an unreserved strip. */
  const reveal = !reduceMotion && height > 0;

  useLayoutEffect(() => {
    /* Nothing to measure under reduced motion — `reveal` is already false, so
       the stale metrics left in state go unread. */
    if (reduceMotion) return;

    const footer = footerRef.current;
    if (!footer) return;

    const measure = () => {
      const measured = footer.offsetHeight;
      const height =
        measured > window.innerHeight * MAX_VIEWPORT_SHARE ? 0 : measured;
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
      /* Bail out when nothing moved. The spacer below is sized from `height`,
         so a state write on every observation would feed the ResizeObserver
         its own output. */
      setMetrics((prev) =>
        prev.height === height && prev.maxScroll === maxScroll
          ? prev
          : { height, maxScroll }
      );
    };

    measure();

    /* Two things move the reveal window: the footer's own height (breakpoints,
       font loading) and the height of the document above it — which changes on
       every route swap, so a one-off measurement would leave the fade running
       against the previous page's numbers. */
    const observer = new ResizeObserver(measure);
    observer.observe(footer);
    observer.observe(document.body);
    window.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [reduceMotion]);

  /* Lenis drives the real window scroll (see SmoothScroll.tsx), so `scrollY`
     is the same value it would be without it. The last `height` pixels of the
     page are the ones that uncover the footer. */
  const { scrollY } = useScroll();
  const start = Math.max(0, maxScroll - height);
  const end = Math.max(start + 1, maxScroll);
  const opacity = useTransform(scrollY, [start, end], [0, 1]);
  const y = useTransform(scrollY, [start, end], [RISE, 0]);

  /* Tabbing into a link that is still under the page would otherwise put focus
     on something invisible: the footer is fixed, so the browser cannot scroll
     it into view itself. Lenis patches `window.scrollTo`, so this glides. */
  const handleFocus = useCallback(() => {
    if (!reveal || window.scrollY >= start) return;
    window.scrollTo({ top: maxScroll, behavior: 'smooth' });
  }, [reveal, start, maxScroll]);

  const linkClass =
    'hover:text-accent-ink transition-colors duration-300 w-fit';

  return (
    <>
      {/* Reserves the strip of document the footer is revealed through. It sits
          above the footer in the paint order, hence `pointer-events-none` —
          otherwise it would swallow the clicks meant for the links below it. */}
      {reveal && (
        <div
          aria-hidden="true"
          className="pointer-events-none"
          style={{ height }}
        />
      )}

      <motion.footer
        ref={footerRef}
        onFocusCapture={handleFocus}
        className={cn(
          /* `surface`, not the page ground: the page slides off a plane one
             tone darker, so the reveal registers as an under-layer rather
             than as text appearing on the same sheet. */
          'relative overflow-hidden',
          'w-full bg-surface text-text-primary border-t border-border',
          /* Vertical rhythm is deliberately tight on phones: a footer taller
             than the screen both reads as a second page and costs the reveal
             (see MAX_VIEWPORT_SHARE). */
          'px-6 md:px-20 pt-10 md:pt-16',
          /* The bottom pad is the wordmark's room. Its letters are 0.147× the
             footer's width tall (see the SVG below), so on a wide screen they
             need far more space beneath the columns than a fixed 4rem — and
             what they cannot get, the bottom edge crops. Scaling the pad with
             the viewport keeps ~80% of the letterforms showing at every width
             instead of half of them on a large display. The `max()` is the
             floor for phones, where the term goes to nothing. */
          'pb-[max(2.5rem,calc(11.8vw_-_40px))] md:pb-[max(4rem,calc(11.8vw_-_40px))]',
          /* Negative z-index parks the footer under the page: it paints above
             the canvas but below `main`'s background, so the page itself is
             what hides it until the scroll runs out. */
          reveal && 'fixed bottom-0 left-0 -z-10'
        )}
        style={{ opacity: reveal ? opacity : 1 }}
      >
        {/* The wordmark as a ground rather than a label.

            SVG, because `textLength` fits the run to exactly the viewBox width
            whatever the typeface's metrics are: the wordmark spans the footer
            edge to edge at every viewport, with no media query, no measurement
            and nothing to re-tune if the brand font is ever swapped. The
            drawing scales with its own width, so the crop below is a
            percentage rather than a pixel value.

            Outfit rather than the display mono: monospace advances leave
            gutters around narrow caps (the I in VASTUVIT floats in its own
            600-unit cell), which at 300px reads as a spacing bug. A geometric
            sans holds together as one mass, which is what a ground has to do.

            The tint is flat rather than masked. A gradient here read as a
            blur — soft, half-there letterforms under the inquiry link, which
            looked like the type had failed to load rather than like a ground.
            What the gradient was protecting was contrast: accent ink only
            clears 4.5:1 while the tint behind it stays under ~7%. Sinking the
            wordmark until it clears the link solves the same problem without
            softening anything, so the crop does the work the mask was doing.

            Which makes the 26% the load-bearing number: it puts the cap line
            below the inquiry link, leaving the copyright row — secondary ink,
            4.9:1 over the full tint — as the only type standing on the
            wordmark. Reduce it and the letters climb back behind the accent
            link; the same rule applies to raising the 12%. It only goes this
            low because the footer's bottom pad scales with the viewport to
            make room for it — the two numbers are one decision, and moving
            either alone is what puts the letters back under the columns.

            Being let past the bottom edge is also what stops a 300px wordmark
            reading as a heading you were supposed to finish: `overflow-hidden`
            on the footer crops it, and because the drawing scales with its own
            width the crop is a percentage, identical at every viewport.
            Sitting outside the rising content wrapper, it stays put while the
            copy drifts up across it as the page uncovers the footer. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1000 190"
          className={cn(
            'pointer-events-none select-none absolute inset-x-0 bottom-0 w-full translate-y-[26%]',
            'text-text-primary/[0.12]'
          )}
        >
          <text
            x="500"
            y="170"
            textLength="1000"
            lengthAdjust="spacing"
            textAnchor="middle"
            fontSize="210"
            fontWeight="500"
            fill="currentColor"
            className="font-sans"
          >
            VASTUVIT
          </text>
        </svg>

        <motion.div
          style={{ y: reveal ? y : 0 }}
          className="relative max-w-[1440px] mx-auto"
        >
          {/* Two columns from `md` up, not `lg`: at tablet widths the page
              padding and gaps have already gone to their desktop values, and a
              stacked layout on top of those pushed the footer past 650px. */}
          <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:gap-12 lg:gap-16 pb-8 md:pb-12 border-b border-border">
            {/* The one thing this site exists to produce. */}
            <div className="flex flex-col gap-4 md:gap-6">
              <GroupLabel>New commissions</GroupLabel>
              <p className="font-display text-[clamp(1.75rem,4vw,3.25rem)] tracking-[-0.02em] leading-[1.05] max-w-[16ch]">
                Tell us about the project.
              </p>
              <Link
                to="/contact"
                data-cursor
                className="group inline-flex items-center gap-3 w-fit font-ui text-[13px] uppercase tracking-[0.12em] text-accent-ink"
              >
                <span className="border-b border-accent-ink/40 group-hover:border-accent-ink transition-colors duration-300 pb-1">
                  Start an inquiry
                </span>
                <ArrowUpRight
                  size={16}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-8 md:gap-12 font-ui text-[13px] leading-relaxed">
              <nav aria-label="Footer" className="flex flex-col gap-4">
                <GroupLabel>Site</GroupLabel>
                <ul className="flex flex-col gap-3 text-text-secondary uppercase tracking-wider">
                  {SITE_LINKS.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to} data-cursor className={linkClass}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="flex flex-col gap-6 md:gap-8">
                <div className="flex flex-col gap-3 md:gap-4">
                  <GroupLabel>Studio</GroupLabel>
                  {STUDIO_ADDRESS ? (
                    <address className="not-italic text-text-secondary">
                      {STUDIO_ADDRESS.map((line) => (
                        <span key={line} className="block">{line}</span>
                      ))}
                    </address>
                  ) : (
                    <Pending label="Studio address" />
                  )}
                </div>

                <div className="flex flex-col gap-3 md:gap-4">
                  <GroupLabel>Direct</GroupLabel>
                  <div className="flex flex-col gap-3 text-text-secondary">
                    {INQUIRY_EMAIL ? (
                      <a
                        href={`mailto:${INQUIRY_EMAIL}`}
                        data-cursor
                        className={cn(linkClass, 'break-words')}
                      >
                        {INQUIRY_EMAIL}
                      </a>
                    ) : (
                      <Pending label="Email address" />
                    )}
                    {/* No placeholder for the phone: three "to be confirmed"
                        markers in one column reads as an unfinished site
                        rather than an honest one. The Contact page is where
                        the full set of pending details is accounted for. */}
                    {STUDIO_PHONE && (
                      <a
                        href={`tel:${STUDIO_PHONE.replace(/[^+\d]/g, '')}`}
                        data-cursor
                        className={linkClass}
                      >
                        {STUDIO_PHONE}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 md:pt-8 flex flex-row items-end justify-between gap-6">
            {/* No wordmark of its own down here: it landed on top of the
                letterforms of the giant one, two sizes of the same word in the
                same place. The brand was also "ARCVAULT STUDIO" — a different
                name from the navbar's. VASTUVIT is the canonical one (see
                PRODUCT.md), and the copyright line carries it.

                `text-secondary`, not `text-muted`: over the wordmark's 12%
                tint the muted ink lands at 4.1:1, under the 4.5 this palette
                is built to hold (see the note in index.css). */}
            <span className="font-mono text-[11px] text-text-secondary tracking-widest uppercase">
              © {new Date().getFullYear()} VASTUVIT
              <span className="hidden md:inline"> — Architecture practice, India</span>
            </span>

            {/* Real work for a real problem: the reveal only happens at the
                very bottom of pages that are frequently very long. */}
            <button
              type="button"
              data-cursor
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group inline-flex items-center gap-2 w-fit font-ui text-[11px] uppercase tracking-[0.12em] text-text-secondary hover:text-text-primary transition-colors duration-300"
            >
              <ArrowUp
                size={14}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:-translate-y-1"
              />
              Back to top
            </button>
          </div>
        </motion.div>
      </motion.footer>
    </>
  );
}
