import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useIsNested } from '../lib/page-transition-context';

/* Delivery. Set VITE_CONTACT_ENDPOINT to POST inquiries at a backend, or
   VITE_CONTACT_EMAIL to hand off to the visitor's mail client. With neither
   set the form cannot deliver anything and says so, rather than accepting a
   message it would silently drop — the one outcome this site exists to
   produce is the one it must never quietly lose. */
const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined;
const INQUIRY_EMAIL = import.meta.env.VITE_CONTACT_EMAIL as string | undefined;

const STUDIO_ADDRESS: string[] | null = null;
const STUDIO_PHONE: string | null = null;

const canDeliver = Boolean(ENDPOINT || INQUIRY_EMAIL);

type Status = 'idle' | 'submitting' | 'sent' | 'handoff' | 'error';

type Fields = { name: string; email: string; type: string; details: string };

const EMPTY: Fields = { name: '', email: '', type: '', details: '' };

const PROJECT_TYPES = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'cultural', label: 'Cultural' },
];

function validate(fields: Fields) {
  const errors: Partial<Record<keyof Fields, string>> = {};
  if (!fields.name.trim()) errors.name = 'Enter your name so we know who we are replying to.';
  if (!fields.email.trim()) errors.email = 'Enter an email address so we can reply.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()))
    errors.email = 'That email address is missing an @ or a domain.';
  if (!fields.details.trim()) errors.details = 'Tell us a little about the project.';
  return errors;
}


const fieldClass =
  'w-full bg-transparent border-b border-border-strong py-4 font-ui text-text-primary ' +
  'placeholder:text-text-muted focus:border-accent-ink transition-colors';

const labelClass = 'font-mono text-[11px] text-text-muted uppercase tracking-widest';

const errorClass = 'font-ui text-[13px] leading-relaxed text-danger';


function Pending({ label }: { label: string }) {
  return (
    <p className="font-mono text-[13px] leading-relaxed text-text-muted">
      [ {label} — to be confirmed ]
    </p>
  );
}

export default function Contact() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [status, setStatus] = useState<Status>('idle');

  const set = (key: keyof Fields) => (value: string) => {
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!canDeliver) return;

    const found = validate(fields);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Move focus to the first problem so keyboard and screen-reader users
      // are told what to fix rather than left at a button that did nothing.
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      });
      return;
    }

    setStatus('submitting');

    if (!ENDPOINT) {
      const subject = `Project inquiry — ${fields.name}`;
      const body = [
        `Name: ${fields.name}`,
        `Email: ${fields.email}`,
        `Project type: ${fields.type || 'Not specified'}`,
        '',
        fields.details,
      ].join('\n');
      window.location.href = `mailto:${INQUIRY_EMAIL}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
      setStatus('handoff');
      return;
    }

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error(String(res.status));
      setFields(EMPTY);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const busy = status === 'submitting';
  const nested = useIsNested();
  const Heading = nested ? motion.h2 : motion.h1;
  const SubHeading = nested ? 'h3' : 'h2';

  return (
    <PageTransition>
      <section className="bg-bg-dark pt-28 md:pt-[180px] pb-20 px-6 md:px-20">
        <div className="max-w-[1440px] mx-auto">
          <Heading
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="font-display text-[clamp(2.5rem,9vw,6rem)] tracking-[-0.02em] leading-none text-text-primary mb-24"
          >
            Let&rsquo;s build<br />together.
          </Heading>

          {/* 6.2 2-Col Layout */}
          <div className="grid md:grid-cols-2 gap-20">
            {/* Form */}
            <form className="flex flex-col gap-10" onSubmit={handleSubmit} noValidate>
              <div className="flex flex-col gap-2">
                <label htmlFor="contact-name" className={labelClass}>
                  Your name <span className="text-accent-ink" aria-hidden="true">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={fields.name}
                  onChange={(e) => set('name')(e.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'contact-name-error' : undefined}
                  className={fieldClass}
                />
                {errors.name && (
                  <p id="contact-name-error" className={errorClass}>
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="contact-email" className={labelClass}>
                  Email address <span className="text-accent-ink" aria-hidden="true">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={fields.email}
                  onChange={(e) => set('email')(e.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'contact-email-error' : undefined}
                  className={fieldClass}
                />
                {errors.email && (
                  <p id="contact-email-error" className={errorClass}>
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="contact-type" className={labelClass}>
                  Project type
                </label>

                <div className="relative">
                  <select
                    id="contact-type"
                    value={fields.type}
                    onChange={(e) => set('type')(e.target.value)}
                    className={`${fieldClass} appearance-none cursor-pointer pr-8 ${
                      fields.type ? 'text-text-primary' : 'text-text-muted'
                    }`}
                  >
                    <option value="">Select a type</option>
                    {PROJECT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    strokeWidth={1.5}
                    className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="contact-details" className={labelClass}>
                  Project details <span className="text-accent-ink" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="contact-details"
                  rows={4}
                  required
                  value={fields.details}
                  onChange={(e) => set('details')(e.target.value)}
                  aria-invalid={Boolean(errors.details)}
                  aria-describedby={errors.details ? 'contact-details-error' : undefined}
                  className={`${fieldClass} resize-none`}
                />
                {errors.details && (
                  <p id="contact-details-error" className={errorClass}>
                    {errors.details}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={busy || !canDeliver}
                aria-describedby={canDeliver ? undefined : 'contact-unwired'}
                className="w-full bg-accent text-text-primary py-5 font-ui text-[13px] uppercase tracking-[0.12em] hover:bg-text-primary hover:text-bg-dark transition-colors duration-300 mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-accent disabled:hover:text-text-primary"
                data-cursor
              >
                {busy ? 'Sending…' : 'Submit inquiry'}
              </button>

              {!canDeliver && (
                <p id="contact-unwired" className={errorClass}>
                  This form is not connected yet, so it cannot deliver a message.
                  The studio&rsquo;s contact details are being finalised.
                </p>
              )}

              {/* Outcome. Announced politely so it reaches screen readers, and
                  never claims delivery the site cannot actually guarantee. */}
              <div role="status" aria-live="polite" className="min-h-[1.5rem]">
                {status === 'sent' && (
                  <p className="font-ui text-[15px] text-text-primary">
                    Thank you — your inquiry is with us. We reply to every message within two working days.
                  </p>
                )}
                {status === 'handoff' && (
                  <p className="font-ui text-[15px] text-text-primary">
                    Your email client should now be open with the message ready. Send it and we will reply within two working days.
                  </p>
                )}
                {status === 'error' && (
                  <p className={errorClass}>
                    That did not send.{' '}
                    {INQUIRY_EMAIL ? (
                      <>
                        Email us directly at{' '}
                        <a href={`mailto:${INQUIRY_EMAIL}`} className="underline hover:text-accent-ink">
                          {INQUIRY_EMAIL}
                        </a>{' '}
                        and we will pick it up from there.
                      </>
                    ) : (
                      <>Please try again in a moment.</>
                    )}
                  </p>
                )}
              </div>
            </form>

            {/* Info */}
            <div className="flex flex-col gap-16 font-ui md:pl-12 border-t md:border-t-0 md:border-l border-border pt-12 md:pt-0">
              <div className="flex flex-col gap-4">
                <SubHeading className="font-mono text-[11px] text-accent-ink uppercase tracking-widest">Studio</SubHeading>
                {STUDIO_ADDRESS ? (
                  <address className="not-italic text-lg text-text-secondary leading-relaxed max-w-xs">
                    {STUDIO_ADDRESS.map((line) => (
                      <span key={line} className="block">{line}</span>
                    ))}
                  </address>
                ) : (
                  <Pending label="Studio address" />
                )}
              </div>

              <div className="flex flex-col gap-4">
                <SubHeading className="font-mono text-[11px] text-accent-ink uppercase tracking-widest">Direct Inquiries</SubHeading>
                {INQUIRY_EMAIL ? (
                  <a href={`mailto:${INQUIRY_EMAIL}`} className="text-2xl font-display hover:text-accent-ink transition-colors break-words" data-cursor>
                    {INQUIRY_EMAIL}
                  </a>
                ) : (
                  <Pending label="Email address" />
                )}
                {STUDIO_PHONE ? (
                  <a href={`tel:${STUDIO_PHONE.replace(/[^+\d]/g, '')}`} className="text-xl font-display hover:text-accent-ink transition-colors" data-cursor>
                    {STUDIO_PHONE}
                  </a>
                ) : (
                  <Pending label="Phone number" />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
