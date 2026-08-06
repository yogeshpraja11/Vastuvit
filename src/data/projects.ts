/* Shared project data.
 *
 * Previously the grid in Projects.tsx and the detail page in ProjectDetail.tsx
 * each held their own copy, and the detail page ignored the :id route param —
 * every project opened as "The Obsidian House".
 *
 * PLACEHOLDER CONTENT: every entry below is invented, and the imagery is
 * hotlinked from Unsplash. None of it is the studio's work. See PRODUCT.md
 * "Evidence on Hand" before treating any of it as fact.
 */

export type Project = {
  id: number;
  slug: string;
  title: string;
  location: string;
  year: string;
  category: string;
  status: string;
  area: string;
  img: string;
  gallery: string[];
};

export const PROJECTS: Project[] = [
  {
    id: 1,
    slug: 'obsidian-house',
    title: 'The Obsidian House',
    location: 'Kyoto, Japan',
    year: '2025',
    category: 'Residential',
    status: 'Completed',
    area: '840 sqm',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2560&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  {
    id: 2,
    slug: 'lumina-gallery',
    title: 'Lumina Gallery',
    location: 'Paris, France',
    year: '2024',
    category: 'Cultural',
    status: 'Completed',
    area: '1,240 sqm',
    img: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1000&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2560&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  {
    id: 3,
    slug: 'aura-skyscraper',
    title: 'Aura Skyscraper',
    location: 'New York, USA',
    year: '2023',
    category: 'Commercial',
    status: 'Completed',
    area: '18,600 sqm',
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2560&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600607688969-a5bfcd64bd40?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  {
    id: 4,
    slug: 'vertex-pavilion',
    title: 'Vertex Pavilion',
    location: 'Oslo, Norway',
    year: '2025',
    category: 'Cultural',
    status: 'In progress',
    area: '620 sqm',
    img: 'https://images.unsplash.com/photo-1545042746-1db810e206ab?q=80&w=1000&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1545042746-1db810e206ab?q=80&w=2560&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600607688969-a5bfcd64bd40?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  {
    id: 5,
    slug: 'slate-residence',
    title: 'Slate Residence',
    location: 'London, UK',
    year: '2022',
    category: 'Residential',
    status: 'Completed',
    area: '410 sqm',
    img: 'https://images.unsplash.com/photo-1600607688969-a5bfcd64bd40?q=80&w=1000&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1600607688969-a5bfcd64bd40?q=80&w=2560&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  {
    id: 6,
    slug: 'mono-block',
    title: 'The Mono Block',
    location: 'Berlin, Germany',
    year: '2024',
    category: 'Urban',
    status: 'Completed',
    area: '3,900 sqm',
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2560&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1545042746-1db810e206ab?q=80&w=1200&auto=format&fit=crop',
    ],
  },
];

export const FILTERS = ['All', 'Residential', 'Commercial', 'Cultural', 'Urban'];

export const findProject = (id: string | undefined) =>
  PROJECTS.find((p) => String(p.id) === id || p.slug === id);

export const nextProject = (current: Project) =>
  PROJECTS[(PROJECTS.findIndex((p) => p.id === current.id) + 1) % PROJECTS.length];

/* PLACEHOLDER narrative, shared by every project because no real project
 * writing exists yet. Replace per-project when the studio supplies copy —
 * six identical descriptions is a launch blocker, not a design choice. */
export const PLACEHOLDER_STATEMENT = '"A dialogue between deep shadow and precise light."';

export const PLACEHOLDER_BODY = [
  'Stripped of all superfluous ornament, the building relies entirely on the interplay of charred timber, raw concrete, and carefully orchestrated natural light.',
  'The spatial sequence is conceived as a gradient from public to private, light to shadow, with each threshold marked by a change in material rather than a change in level.',
];
