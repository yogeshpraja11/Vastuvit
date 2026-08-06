# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: private residential clients in India.** Individuals and families commissioning a home. The decision is personal and slow, usually needs family consensus, and is often the largest single commission of their life. They are evaluating whether this studio can be trusted with it.

**Secondary: commercial, institutional, and developer clients in India.** Organizations and builders commissioning non-residential work. They evaluate on delivery capability and evidence of competence rather than on personal rapport.

Both audiences arrive at the same site. Splitting into two sites is not on the table; the site must serve both without diluting either.

## Product Purpose

VASTUVIT is a full-service architecture practice working in India across residential, commercial, and institutional projects.

The site exists to establish credibility for a **new practice with a thin portfolio**. Success is a prospective client concluding that VASTUVIT is a serious, capable studio worth contacting — before there is a long track record to prove it. The contact inquiry is the measurable evidence that this worked, but the goal is the conviction that precedes it, not the form fill.

## Positioning

**Undecided — do not invent one.**

The practice is a conventional full-service architecture studio. No differentiating mechanism, methodology, or claim has been confirmed. Despite the name reading as "one who knows Vastu," Vastu Shastra doctrine is explicitly **not** part of the offering and must not be presented as one.

Future work must either surface a real differentiator from the practice or build credibility without asserting one. It must not manufacture a position to fill this section.

## Operating Context

- The practice is early-stage. There is no deep body of completed work to present.
- Prospective clients research architects before making contact; the site is often the first and only impression prior to a conversation.
- The Indian market spans a wide range of devices and network conditions. **Open:** no specific device, bandwidth, or language requirement has been confirmed.

## Capabilities and Constraints

**Stack (existing, in place):** React 19, TypeScript, Vite 8, Tailwind CSS v4 (`@theme` tokens in [src/index.css](src/index.css)), framer-motion, react-router-dom 7, lucide-react, `@lottiefiles/dotlottie-react`.

**Surfaces that exist:** routes for `/`, `/projects`, `/projects/:id`, `/about`, `/services`, `/contact` in [src/App.tsx](src/App.tsx).

**Known technical debt, confirmed by reading the code:**

- **Duplicate content architecture.** [Home.tsx](src/pages/Home.tsx#L136-L140) renders `Projects`, `About`, `Services`, and `Contact` as embedded sections while those same components are also standalone routes. Every one of them ships its own `PageTransition` and its own hero, so the home page stacks four page-heroes inside itself. Whether this is a one-page site with routes as a fallback, or a multi-page site, is **undecided** and blocks any layout work.
- **The contact form does not submit.** [Contact.tsx](src/pages/Contact.tsx#L20) calls `preventDefault()` with no handler, no validation, no success or error state. There is no backend. For a site whose entire job is earning an inquiry, this is the highest-severity gap.
- **26 images are hotlinked from Unsplash** across pages and the navbar. None are the studio's work.
- Four local assets exist — `Home.png`, `Sketch.png`, `Sketch_Black.png`, `hero.png` — with unconfirmed provenance.
- [Navbar.tsx](src/components/Navbar.tsx) is 441 lines and carries its own hardcoded hex colors (`#0E0E0E`, `#4A4A48`, `#E0DED8`) outside the token system.
- A custom cursor ([CustomCursor.tsx](src/components/CustomCursor.tsx)) is active, driven by `data-cursor` attributes.

## Brand Commitments

**The name is VASTUVIT.** This is the single binding brand fact and it is currently wrong in four places, all of which must be corrected:

| Location | Currently says | Should say |
|---|---|---|
| [package.json](package.json#L2) | `vastuvita` | vastuvit |
| [index.html](index.html#L6) `<title>` | `vastuvita` | VASTUVIT |
| [Footer.tsx](src/components/Footer.tsx#L9-L12) wordmark + copyright | `ARCVAULT STUDIO` | VASTUVIT |
| [About.tsx](src/pages/About.tsx#L162) timeline copy | `Vastuvita Studio` | VASTUVIT |

[Navbar.tsx](src/components/Navbar.tsx#L134) is the only correct instance.

No logo, palette, typeface, voice, or visual reference has been confirmed as binding. The current colors, fonts (Space Mono, Cormorant Garamond), and `favicon.svg` are incumbent implementation, not client commitments.

## Evidence on Hand

**None. Every fact currently on the site is fabricated and must not be cited, reused, or treated as true by any future work.**

The confirmed-fictional inventory:

- **Statistics** — "120+ Projects Completed", "18 Countries Active", "34 Global Awards", "EST. 2009" ([Home.tsx](src/pages/Home.tsx#L70-L75)). The practice is new; these are the opposite of true.
- **Leadership** — Elena Rostova, Marcus Chen, Sarah Jenkins, David Okafor, with Unsplash stock headshots ([About.tsx](src/pages/About.tsx#L134-L139)). Invented people.
- **Projects** — all six: The Obsidian House (Kyoto), Lumina Gallery (Paris), Aura Skyscraper (New York), Vertex Pavilion (Oslo), Slate Residence (London), The Mono Block (Berlin) ([Projects.tsx](src/pages/Projects.tsx#L5-L12)). Invented, and set in a geography the practice does not work in.
- **History** — the entire chronology: 2009 London founding, 2012 cultural commission, 2015 Tokyo studio, 2019 "Global Architect of the Year", 2023 sustainability initiative ([About.tsx](src/pages/About.tsx#L161-L168)).
- **Contact details** — 14 Broadwick Street, Soho, London; 2-11-3 Meguro, Tokyo; `hello@arcvault.studio`; +44 (0) 20 7123 4567 ([Contact.tsx](src/pages/Contact.tsx#L66-L76)). Wrong brand, wrong continent, invented.
- **Service descriptions** — the five service blurbs ([Services.tsx](src/pages/Services.tsx#L6-L12)) are template prose, not the practice's confirmed offering.
- **All imagery** — 26 Unsplash hotlinks. Not the studio's work.

Real project photography, real team details, and real contact information do not exist yet and must be supplied by the client. Until then, placeholders must be visibly placeholder — not plausible fiction that could ship by accident.

## Product Principles

1. **Never claim what the practice has not done.** A new studio's credibility is destroyed the moment a prospective client discovers an invented award, project, or office. Every fabricated fact in this codebase is a liability, not a starting point.
2. **Credibility comes from demonstrated thinking, not from scale claims.** With no track record to cite, the site must earn trust through the quality of how the practice explains its work, its process, and its judgment — the one asset a new studio genuinely has.
3. **One name, everywhere: VASTUVIT.** Four competing names on one site reads as unfinished, which is the precise opposite of the credibility the site is for.
4. **Serve the homeowner and the developer on one site.** The private client needs reassurance and warmth; the commercial client needs evidence of capability. Neither may be sacrificed for the other.
5. **The inquiry must actually work.** A credibility site that loses the message it earned has failed completely, regardless of how it looks.
