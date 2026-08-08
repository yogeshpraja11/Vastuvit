/* Every number the gallery positions itself with, in one place.
 *
 * Pure arithmetic, no React, no DOM — which is deliberate. The intro animates
 * each card's WIDTH, so anything measured from the DOM while it is running
 * reports a row that no longer exists a frame later. Card widths are a known
 * function of the two intro clocks, so the arithmetic below is exact, immune
 * to that timing problem, and free to recompute on resize.
 */

import type { ShowcaseProject } from '../../data/showcase-projects';

/**
 * Compact card width, as a fraction of the settled width.
 *
 * The cards do not reach full size in Phase A. They open to this, hold, and
 * then grow the rest of the way while the row slides in Phase B — so the
 * arrival has something left to give rather than being over before the
 * movement starts.
 */
const COMPACT_SCALE = 0.82;

/**
 * How much of the viewport the compact row occupies at the end of Phase A.
 *
 * Under half, on purpose: the row should sit in the middle of the screen with
 * real space around it, not span the whole width. That surrounding emptiness
 * is most of why the opening reads as composed rather than merely wide.
 *
 * Derived rather than hardcoded because Phase A only works if you can see
 * every card at once — a fixed gap is comfortable at one width and pushes the
 * outer cards off screen at another.
 */
const COMPACT_FILL = 0.46;

/** Floor for the compact gap, so cards never end up visually fused. */
const GAP_COMPACT_MIN = 20;

/**
 * Per-card offset in Phase A, as a fraction of the phase.
 *
 * Small on purpose. The cards are not meant to arrive in a procession — they
 * are meant to arrive together, with just enough slip between them that the
 * eye reads a ripple rather than a switch being thrown.
 */
const REVEAL_STAGGER = 0.12;

/** Track's left padding, as a fraction of viewport width. */
const PAD_LEFT_RATIO = 0.08;

/**
 * THE ANCHOR LINE — the middle of the screen.
 *
 * The whole gallery is defined against it: Phase B ends with card 0 sitting on
 * it, every scroll position puts some card on or near it, and "active" simply
 * means "nearest to it". Dead centre because that is where the sequence reads
 * from — a card arriving at the middle is the gesture the scroll is for.
 */
const ANCHOR_RATIO = 0.5;

/**
 * Card width as a fraction of the viewport, and the settled gap relative to
 * the card.
 *
 * Small. These are index marks against a full-bleed photograph, not the
 * subject — much bigger and they compete with the hero instead of pointing
 * into it. The gap ratio is then what decides how many cards clear the right
 * edge once card 0 is on the anchor: at 0.87 you get three more, and the last
 * runs off.
 */
const CARD_W_RATIO = 0.086;
const GAP_RATIO = 0.87;

/** Absolute bounds, so the cards stay usable on a small laptop and restrained on a 5K. */
const CARD_W_MIN = 80;
const CARD_W_MAX = 132;

/**
 * Fluid, not stepped.
 *
 * Breakpoint steps make the card a different fraction of the screen at either
 * end of each range — 124px is a comfortable 8.6% at 1440 and a chunky 9.7% at
 * 1280, so the composition quietly thickens as the window narrows. Scaling
 * with the viewport holds the proportion the reference frames were composed at.
 */
function sizesFor(viewportW: number) {
  const cardW = Math.round(
    Math.min(CARD_W_MAX, Math.max(CARD_W_MIN, viewportW * CARD_W_RATIO)),
  );
  return { cardW, gap: Math.round(cardW * GAP_RATIO) };
}

export type Geometry = {
  cardW: number;
  /** Width the cards open to in Phase A, before Phase B finishes them. */
  cardWCompact: number;
  /** Settled gap, reached at the end of Phase B. */
  gap: number;
  /** Gap during Phase A. Derived so the whole row sits in the middle. */
  gapCompact: number;
  /** Card heights in px, index-aligned with `projects`. Never animated. */
  heights: number[];
  padLeft: number;
  anchorX: number;
  /** Card centres in the track's own layout space, once settled. */
  centers: number[];
  rowWidth: number;
  rowWidthCompact: number;
  /** Track x when card 0 is on the anchor. Phase B's destination, scroll 0. */
  xStart: number;
  /** Track x when the LAST card is on the anchor. Scroll progress 1. */
  xEnd: number;
  /** Signed scroll travel. Negative — the row moves left. */
  travel: number;
};

export function computeGeometry(viewportW: number, projects: ShowcaseProject[]): Geometry {
  const { cardW, gap } = sizesFor(viewportW);
  const n = projects.length;
  const cardWCompact = Math.round(cardW * COMPACT_SCALE);

  /* Heights come from the SETTLED width and never change — only width
     animates. Holding the height still is what keeps the ragged bottom line
     stable through the intro instead of the whole row breathing vertically. */
  const heights = projects.map((p) =>
    Math.round(p.aspect === '4/3' ? (cardW * 3) / 4 : (cardW * 4) / 3),
  );

  const padLeft = viewportW * PAD_LEFT_RATIO;
  const anchorX = viewportW * ANCHOR_RATIO;

  const pitch = cardW + gap;
  const centers = Array.from({ length: n }, (_, i) => padLeft + i * pitch + cardW / 2);
  const rowWidth = n * cardW + Math.max(0, n - 1) * gap;

  /* The compact gap: whatever spacing makes n compact cards span COMPACT_FILL
     of the viewport. Falls out of the project count as well as the screen
     width, so adding projects tightens Phase A instead of pushing the outer
     ones off screen. Capped at the settled gap so the gaps can only ever open
     during Phase B, never close. */
  const compactSlack = viewportW * COMPACT_FILL - n * cardWCompact;
  const gapCompact =
    n > 1 ? Math.max(GAP_COMPACT_MIN, Math.min(gap, compactSlack / (n - 1))) : 0;
  const rowWidthCompact = n * cardWCompact + Math.max(0, n - 1) * gapCompact;

  /* THE TRAVEL RANGE.
   *
   * A card's live viewport x is `centers[i] + x`, so solving "card i is on the
   * anchor" gives `x = anchorX - centers[i]`. That single identity defines
   * both ends of the scroll:
   *   xStart → card 0 on the anchor (where Phase B lands, and scroll 0)
   *   xEnd   → the last card on the anchor (scroll 1)
   * The distance between them is therefore the gap between the first and last
   * CENTRES — (n-1) pitches — not the row's width. Using the width would stop
   * the row with its right edge at the screen edge, half a card past the
   * anchor, and the final project would never actually take the middle.
   */
  const xStart = anchorX - centers[0];
  const xEnd = anchorX - centers[n - 1];

  return {
    cardW,
    cardWCompact,
    gap,
    gapCompact,
    heights,
    padLeft,
    anchorX,
    centers,
    rowWidth,
    rowWidthCompact,
    xStart,
    xEnd,
    travel: xEnd - xStart,
  };
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

/**
 * Slow at both ends. Applied per card, not to the driver — see below.
 *
 * Ease-OUT would be wrong here: it leaves the opening almost immediately, so
 * the thin-line moment lasts a couple of frames and never registers. This
 * lingers there, opens through the middle, and settles.
 */
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Card `index`'s slice of Phase A, in phase-local 0..1 — RIGHTMOST FIRST.
 *
 * `rank` counts in from the right, so the last card starts at 0 and the first
 * starts last. The windows overlap heavily (a 0.12 offset against a ~0.5 span),
 * which is the point: every card is opening at once and merely a beat apart,
 * rather than each waiting its turn.
 *
 * The spans are squeezed to end at exactly 1 however many cards there are, so
 * the leftmost is always fully open before Phase B begins.
 */
export function revealWindow(index: number, count: number): [number, number] {
  if (count <= 1) return [0, 1];

  const rank = count - 1 - index;
  // Keep at least 40% of the phase as actual reveal time once the card count
  // gets high enough that the requested offset would eat all of it.
  const stagger = Math.min(REVEAL_STAGGER, 0.6 / (count - 1));
  const start = rank * stagger;
  return [start, start + (1 - (count - 1) * stagger)];
}

/**
 * How far card `index` is clipped in from its RIGHT edge, as a percentage.
 *
 * PHASE A IS A CLIP, NOT A RESIZE, and that distinction is the whole reason
 * the reveal holds together. Animating layout `width` inside a flex row means
 * every card shoves its neighbours aside as it grows: the cards arrive one at
 * a time and the row shuffles under them, so nothing is ever where it was a
 * moment ago. Clipping changes only what is painted. Each card occupies its
 * final slot from the first frame, sits perfectly still, and opens in place —
 * so the stagger reads as five things revealing together a beat apart, rather
 * than a queue pushing into a line.
 *
 * ONE DIRECTION. The clip is anchored at the card's left edge and only the
 * right inset moves, 100% → 0%, so the reveal travels rightward. Insetting
 * both sides opens from the centre outward, which is two edges moving in
 * opposite directions at once — busier, and it fights the single left-to-right
 * sweep the row is trying to describe. To flip it, swap which side this feeds
 * in the `inset()` template in ThumbnailTrack.
 *
 * The easing is applied HERE rather than on the driving animation, and that
 * matters: `reveal` has to advance linearly for the windows above to carve it
 * into equal slices. Ease the driver instead and the stagger is distorted by
 * the curve — the early cards would bunch and the late ones stretch.
 */
export function cardInsetAt(index: number, count: number, reveal: number) {
  const [start, end] = revealWindow(index, count);
  const t = clamp01((reveal - start) / (end - start));
  return (1 - easeInOutCubic(t)) * 100;
}

/**
 * A card's LAYOUT width. Depends only on Phase B.
 *
 * Constant through Phase A — see `cardInsetAt`. In Phase B every card grows by
 * the same amount at the same moment, alongside the gaps opening and the row
 * sliding, so the spread reads as one deliberate movement rather than as cards
 * jostling.
 */
export const cardWidthAt = (settle: number, g: Geometry) =>
  lerp(g.cardWCompact, g.cardW, settle);

export const gapAt = (settle: number, g: Geometry) => lerp(g.gapCompact, g.gap, settle);

/** Live width of the whole row. Also Phase B only, so the row is still during Phase A. */
export const rowWidthAt = (count: number, settle: number, g: Geometry) =>
  count * cardWidthAt(settle, g) + Math.max(0, count - 1) * gapAt(settle, g);

/**
 * Track x that centres a row of the given width on screen.
 *
 * Done as a transform, never `justify-center`: on a row wider than the
 * viewport that gives the flex container a negative start offset which no
 * measurement can see, and every position derived from it is then wrong.
 */
export const centeredX = (viewportW: number, rowW: number, padLeft: number) =>
  (viewportW - rowW) / 2 - padLeft;

/**
 * The row's translation during the intro.
 *
 * Phase B only. Through Phase A this is a constant — the compact row sits
 * centred and does not move a pixel while the cards open inside it, which is
 * what lets each card reveal exactly where it will still be a second later.
 * Then Phase B blends that centred position to xStart, putting card 0 on the
 * anchor, while the row simultaneously widens beneath the same expression.
 */
export const mountXAt = (count: number, settle: number, g: Geometry, viewportW: number) =>
  lerp(centeredX(viewportW, rowWidthAt(count, settle, g), g.padLeft), g.xStart, settle);
