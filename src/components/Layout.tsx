import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CustomCursor from './CustomCursor';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* The fixed nav carries two mega-menus; without this, every page starts
          with a long tab journey through them. */}
      <a href="#main" className="skip-link">Skip to content</a>
      <CustomCursor />
      <Navbar />
      {/* `bg-bg-dark` is what hides the footer. The footer is parked under the
          page at a negative z-index (see Footer.tsx); the body's background
          paints on the canvas, *below* it, so without an opaque ground of its
          own `main` would let the footer show through the whole page. */}
      <main id="main" className="min-h-dvh flex flex-col pt-[72px] bg-bg-dark">
        {children}
      </main>
      <Footer />
    </>
  );
}
