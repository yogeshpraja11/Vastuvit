/* The studio's real-world details, in one place because two surfaces now show
   them: the Contact page and the footer. Splitting the constants across both
   is how a site ends up with a confirmed address on one page and a placeholder
   on the other.

   None of it is confirmed yet. PRODUCT.md is explicit that the address, phone
   and email this repo used to ship were invented — wrong brand, wrong
   continent — and that until the client supplies real ones, placeholders must
   read as placeholders rather than as plausible fiction. So each value is
   either injected at build time or stays null, and every consumer is expected
   to render the "to be confirmed" state rather than a convincing stand-in. */

/* Delivery. Set VITE_CONTACT_ENDPOINT to POST inquiries at a backend, or
   VITE_CONTACT_EMAIL to hand off to the visitor's mail client. With neither
   set the contact form cannot deliver anything and says so, rather than
   accepting a message it would silently drop — the one outcome this site
   exists to produce is the one it must never quietly lose. */
export const CONTACT_ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT as
  | string
  | undefined;

export const INQUIRY_EMAIL = import.meta.env.VITE_CONTACT_EMAIL as
  | string
  | undefined;

export const STUDIO_ADDRESS: string[] | null = null;

export const STUDIO_PHONE: string | null = null;
