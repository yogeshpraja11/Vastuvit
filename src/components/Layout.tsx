import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CustomCursor from './CustomCursor';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <CustomCursor />
      <Navbar />
      <main className="min-h-screen flex flex-col pt-[72px]">
        {children}
      </main>
      <Footer />
    </>
  );
}
