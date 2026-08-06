import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-bg-dark text-text-primary py-12 px-6 md:px-20 border-t border-border mt-auto">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        
        {/* Brand was "ARCVAULT STUDIO" here — a different name from the one in
            the navbar. VASTUVIT is the canonical name (see PRODUCT.md). */}
        <div className="flex flex-col gap-2">
          <span className="font-display text-2xl tracking-wide">VASTUVIT</span>
          <span className="font-mono text-[11px] text-text-muted tracking-widest uppercase">
            © {new Date().getFullYear()} VASTUVIT
          </span>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-8 md:gap-12 font-ui text-[13px] uppercase tracking-wider text-text-secondary">
          <Link to="/projects" className="hover:text-accent-ink transition-colors">Projects</Link>
          <Link to="/about" className="hover:text-accent-ink transition-colors">About</Link>
          <Link to="/services" className="hover:text-accent-ink transition-colors">Services</Link>
          <Link to="/contact" className="hover:text-accent-ink transition-colors">Contact</Link>
        </nav>

      </div>
    </footer>
  );
}
