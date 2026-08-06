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
      <main id="main" className="min-h-dvh flex flex-col pt-[72px]">
        {children}
      </main>
      <Footer />
    </>
  );
}
