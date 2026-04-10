import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-bg-dark text-text-primary py-12 px-6 md:px-20 border-t border-border mt-auto">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        
        <div className="flex flex-col gap-2">
          <span className="font-display text-2xl tracking-wide">ARCVAULT STUDIO</span>
          <span className="font-mono text-[11px] text-accent tracking-widest uppercase">
            © {new Date().getFullYear()} ARCVAULT STUDIO
          </span>
        </div>

        <div className="flex gap-8 md:gap-12 font-ui text-[13px] uppercase tracking-wider text-text-secondary">
          <Link to="/projects" className="hover:text-accent transition-colors">Projects</Link>
          <Link to="/about" className="hover:text-accent transition-colors">About</Link>
          <a href="#" className="hover:text-accent transition-colors">Instagram</a>
          <a href="#" className="hover:text-accent transition-colors">LinkedIn</a>
        </div>

      </div>
    </footer>
  );
}
