import PageTransition from '../components/PageTransition';
import ProjectGallery from '../components/gallery/ProjectGallery';
import { SHOWCASE_PROJECTS } from '../data/showcase-projects';

/* The gallery on its own route, as its own subject.
 *
 * No LenisProvider here on purpose — App.tsx already wraps the tree in
 * components/SmoothScroll (lenis/react's ReactLenis with `root`). Mounting the
 * second provider would give the page two Lenis instances easing
 * window.scrollTo every frame, and they fight. Use
 * components/gallery/LenisProvider only where SmoothScroll is absent.
 */
export default function Showcase() {
  return (
    <PageTransition>
      {/* Layout's <main> carries pt-[72px] to clear the fixed navbar. The
          sticky child is `h-screen`, so inheriting that padding would push it
          72px past the bottom of the viewport and crop the display title.
          Pulling it back up makes one stage exactly one viewport again — which
          is the assumption the whole (n + 2) × 100vh spacer is built on. */}
      <div className="-mt-[72px]">
        <ProjectGallery projects={SHOWCASE_PROJECTS} />
      </div>
    </PageTransition>
  );
}
