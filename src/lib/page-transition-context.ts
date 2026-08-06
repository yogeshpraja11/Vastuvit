import { createContext, useContext } from 'react';

/* Lives outside PageTransition.tsx so that file exports only components and
 * React Fast Refresh keeps working.
 *
 * Home renders Projects, About, Services and Contact as embedded sections,
 * and each of those is also a route that wraps itself in PageTransition.
 * Nested, that produced five stacked `fixed` full-screen wipe overlays at
 * z-999 and five competing opacity animations on one page. This context lets
 * an inner PageTransition detect that it is already inside one and step
 * aside, and tells embedded pages to demote their <h1> to <h2> so the home
 * page has one top-level heading instead of five. */
export const NestedContext = createContext(false);

export const useIsNested = () => useContext(NestedContext);
