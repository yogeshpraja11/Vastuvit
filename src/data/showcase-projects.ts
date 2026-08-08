/* Data for the scroll-driven horizontal showcase.
 *
 * The five photographs are the studio's own supplied reference images, copied
 * into `public/media/showcase/`. They are the only real assets here — the
 * titles, categories and captions below are PLACEHOLDER COPY invented to fill
 * the layout, same caveat as data/projects.ts. Replace them when the studio
 * supplies naming.
 *
 * This file is the only place the showcase touches image URLs, so pointing at
 * the API (or at S3) is a one-file change; nothing in the components
 * hardcodes a src.
 *
 * `aspect` is what makes the rail mix landscape and portrait cards. Card
 * width is fixed (see CARD_W in ProjectShowcase) and the height falls out of
 * this ratio, which is why the row's bottom edge is deliberately ragged.
 * Every source photo is landscape, so a `3/4` entry is a centre crop of one —
 * that is intentional, `object-cover` does the cropping.
 */

export type ShowcaseAspect = '4/3' | '3/4';

export type ShowcaseProject = {
  id: string;
  /** Large bottom-left display type, e.g. "795 HAUS". */
  title: string;
  /** Small uppercase eyebrow above the title, e.g. "ARCHITECTURAL DESIGN". */
  category: string;
  /** Short label floated above the active thumbnail, e.g. "Private House". */
  caption: string;
  /** Description for assistive tech — heroes are decorative, thumbs are buttons. */
  alt: string;
  thumb: string;
  hero: string;
  aspect: ShowcaseAspect;
};

/* One file serves as both thumb and hero. The sources top out around 1000–1250
   px wide, which is sharp at the 180px card size and acceptable full-bleed on a
   laptop; if these ever ship to a 5K display, add a `-2560` variant next to
   each and split `thumb` / `hero` the way Home.tsx does with its srcSets. */
const media = (file: string) => `/media/showcase/${file}`;

export const SHOWCASE_PROJECTS: ShowcaseProject[] = [
  {
    id: '795-haus',
    title: '795 HAUS',
    category: 'ARCHITECTURAL DESIGN',
    caption: 'Private House',
    alt: 'A stepped concrete and stone villa with cantilevered terraces above a paved forecourt',
    thumb: media('villa-house.jpg'),
    hero: media('villa-house.jpg'),
    aspect: '4/3',
  },
  {
    id: 'nokke-residence',
    title: 'NOKKÈ RESIDENCE',
    category: 'ARCHITECTURAL DESIGN',
    caption: 'Private House',
    alt: 'A blackened-timber house lit from within at dusk, facing a lap pool across a lawn',
    thumb: media('private-house.jpg'),
    hero: media('private-house.jpg'),
    aspect: '3/4',
  },
  {
    id: 'chromatica',
    title: 'CHROMATICA',
    category: 'INTERIOR DESIGN',
    caption: 'Living Pavilion',
    alt: 'A double-height living room in stone and pale timber, with a black stair and snow beyond the glazing',
    thumb: media('interior.jpg'),
    hero: media('interior.jpg'),
    aspect: '4/3',
  },
  {
    id: 'verdant-block',
    title: 'VERDANT BLOCK',
    category: 'LANDSCAPE + ARCHITECTURE',
    caption: 'Green-Roof House',
    alt: 'A dark cubic house wrapped in planted terraces and climbing greenery, seen from above at dusk',
    thumb: media('green-roof-house.webp'),
    hero: media('green-roof-house.webp'),
    aspect: '3/4',
  },
  {
    id: 'the-long-room',
    title: 'THE LONG ROOM',
    category: 'WORKPLACE DESIGN',
    caption: 'Studio Office',
    alt: 'An open-plan studio with exposed steel joists, pendant lamps and timber desks against full-height glazing',
    thumb: media('office.jpeg'),
    hero: media('office.jpeg'),
    aspect: '4/3',
  },
];

/* No fetch helpers here any more: ProjectGallery takes `projects` as a
   required prop and never reaches for a URL of its own. Whatever eventually
   feeds it — this module, an Express route, a CMS — the shape above is the
   contract, and the mapping lives at the call site. */
