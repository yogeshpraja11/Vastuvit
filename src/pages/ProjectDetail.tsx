import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import {
  findProject,
  nextProject,
  PLACEHOLDER_BODY,
  PLACEHOLDER_STATEMENT,
} from '../data/projects';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const project = findProject(id);

  // Previously this page was hardcoded to one project and ignored the route
  // param entirely, so every card opened "The Obsidian House" and a bad URL
  // rendered a confidently wrong page instead of saying it could not be found.
  if (!project) {
    return (
      <PageTransition>
        <section className="bg-bg-dark min-h-[60dvh] flex flex-col items-start justify-center px-6 md:px-20 py-32">
          <div className="max-w-[1440px] mx-auto w-full">
            <h1 className="font-display text-5xl md:text-[72px] text-text-primary mb-6">
              We can't find that project.
            </h1>
            <p className="font-ui text-lg text-text-secondary mb-10 max-w-md">
              The link may be out of date, or the project may have moved.
            </p>
            <Link
              to="/projects"
              className="inline-block border border-accent-ink text-text-primary uppercase font-ui text-[12px] tracking-widest py-[14px] px-[36px] hover:bg-accent-ink hover:text-bg-dark transition-all duration-300"
              data-cursor
            >
              View all projects
            </Link>
          </div>
        </section>
      </PageTransition>
    );
  }

  const next = nextProject(project);
  const meta = [
    { label: 'Type', val: project.category },
    { label: 'Location', val: project.location },
    { label: 'Year', val: project.year },
    { label: 'Status', val: project.status },
    { label: 'Area', val: project.area },
  ];

  return (
    <PageTransition>
      {/* 3.1 Hero */}
      <section className="relative w-full h-[90dvh]">
        <img
          src={project.gallery[0]}
          alt=""
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-bg-dark/30" />
        <div className="absolute bottom-12 left-6 md:left-20 text-text-primary">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="font-display text-5xl md:text-[72px] mb-4"
          >
            {project.title}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="font-mono text-accent-ink text-[11px] uppercase tracking-widest flex gap-4"
          >
            <span>{project.location}</span>
            <span aria-hidden="true">—</span>
            <span>{project.year}</span>
          </motion.div>
        </div>
      </section>

      {/* 3.2 Meta Strip */}
      <section className="bg-bg-dark border-y border-border">
        <dl className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-5 text-center px-6 md:px-20 py-8 m-0">
          {meta.map((item, i) => (
            <div
              key={item.label}
              className={`flex flex-col gap-2 ${i !== meta.length - 1 ? 'md:border-r border-border' : ''}`}
            >
              <dt className="font-mono text-[11px] text-text-muted uppercase">{item.label}</dt>
              <dd className="font-ui text-[13px] text-text-primary m-0">{item.val}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 3.3 Description */}
      <section className="bg-bg-light text-text-primary py-24 px-6 md:px-20">
        <div className="max-w-[1440px] mx-auto grid md:grid-cols-2 gap-12">
          <h2 className="font-display italic text-4xl md:text-[48px] leading-tight max-w-sm">
            {PLACEHOLDER_STATEMENT}
          </h2>
          <div className="font-ui font-light text-lg space-y-6 max-w-xl text-text-secondary">
            {PLACEHOLDER_BODY.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
        </div>
      </section>

      {/* 3.4 Image Gallery */}
      <section className="bg-bg-dark">
        <h2 className="sr-only">Gallery</h2>
        <figure className="w-full h-dvh relative m-0">
          <img
            src={project.gallery[0]}
            alt={`${project.title}, courtyard view`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <figcaption className="absolute bottom-6 right-6 font-mono text-[11px] text-text-primary p-2 bg-overlay">
            01 — Courtyard View
          </figcaption>
        </figure>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {project.gallery.slice(1, 3).map((src, i) => (
            <div key={src} className="h-[80dvh] relative">
              <img
                src={src}
                alt={`${project.title}, view ${i + 2}`}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 3.5 Next Project Teaser — was a hardcoded, unclickable panel. */}
      <Link
        to={`/projects/${next.id}`}
        className="h-[60dvh] bg-surface flex flex-col items-center justify-center relative overflow-hidden group border-t border-border"
        data-cursor
      >
        <img
          src={next.img}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-[1s]"
        />
        <span className="relative z-10 text-center">
          <span className="font-mono text-[11px] text-accent-ink uppercase tracking-widest mb-4 block">Next Project</span>
          <span className="font-display text-5xl md:text-[72px] text-text-primary block">{next.title}</span>
        </span>
      </Link>
    </PageTransition>
  );
}
