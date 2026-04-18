"use client";

import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Check, Loader2, Mail, Phone, UserRound, ArrowRight, Sparkles } from "lucide-react";
import { scrollRevealProps } from "@/lib/brochureMotion";
import { apiUrl } from "@/lib/api";
import { SectionLabel } from "./SectionLabel";

type FormStatus = "idle" | "submitting" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s\-()]{6,}$/;

export default function PricingLeadSection() {
  const reduceMotion = useReducedMotion();
  const reveal = scrollRevealProps(reduceMotion);
  const t = useTranslations("pricing");
  const tl = useTranslations("lead");
  const locale = useLocale();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  // Hidden honeypot. Real users never fill it; bots often will.
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = tl("errors.nameRequired");
    if (!email.trim()) errors.email = tl("errors.emailRequired");
    else if (!EMAIL_RE.test(email.trim())) errors.email = tl("errors.emailInvalid");
    if (!phone.trim()) errors.phone = tl("errors.phoneRequired");
    else if (!PHONE_RE.test(phone.trim())) errors.phone = tl("errors.phoneInvalid");
    return errors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setStatus("submitting");
    try {
      const response = await fetch(apiUrl("/api/leads"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          locale,
          website, // honeypot — server discards submissions where this is non-empty
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data?.errors && typeof data.errors === "object") {
          setFieldErrors(data.errors as Record<string, string>);
        }
        setSubmitError(data?.message || tl("errors.generic"));
        setStatus("error");
        return;
      }

      setStatus("success");
      setName("");
      setEmail("");
      setPhone("");
      setWebsite("");
      setFieldErrors({});
    } catch {
      setStatus("error");
      setSubmitError(tl("errors.network"));
    }
  };

  return (
    <section id="presentation" className="relative bg-brand-forest py-24 sm:py-32 md:py-44 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.1] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, #c9a86a 0, transparent 40%), radial-gradient(circle at 85% 80%, #ffb600 0, transparent 45%)",
        }}
        aria-hidden
      />

      <div className="container mx-auto px-4 sm:px-6 md:px-12 relative">
        <motion.div {...reveal} className="max-w-5xl mx-auto text-center mb-16">
          <SectionLabel className="mb-6">{t("label")}</SectionLabel>
          <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-brand-white/60 mb-6">
            {t("duration")}
          </p>
          <h2 className="font-serif font-light text-brand-white text-5xl sm:text-7xl md:text-[8rem] leading-[0.95] tracking-tight">
            <span className="italic text-brand-gold">{t("priceFrom")}</span> {t("priceAmount")}
            <span className="ms-4 text-3xl sm:text-5xl md:text-6xl align-top tracking-[0.1em] text-brand-gold/80">
              {t("priceCurrency")}
            </span>
          </h2>
          <p className="mt-10 text-brand-gold text-sm sm:text-base uppercase tracking-[0.4em] font-bold">
            {t("taglineLead")} <span className="text-brand-white">{t("taglineHighlight")}</span>
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 md:gap-10 items-stretch">
          <motion.aside
            {...reveal}
            className="lg:col-span-2 rounded-[2rem] md:rounded-[2.5rem] border border-brand-gold/25 bg-brand-charcoal/80 p-8 sm:p-10 flex flex-col gap-8"
          >
            <div>
              <SectionLabel tone="gold" className="mb-4">{t("planLabel")}</SectionLabel>
              <div className="flex items-end gap-4">
                <span className="font-serif font-light text-brand-white text-6xl md:text-7xl leading-none">20%</span>
                <span className="text-brand-white/70 text-sm uppercase tracking-[0.25em] font-bold pb-2">
                  {t("downPayment")}
                </span>
              </div>
            </div>
            <div className="h-px bg-brand-gold/20" />
            <div>
              <div className="flex items-end gap-4">
                <span className="font-serif font-light text-brand-white text-6xl md:text-7xl leading-none">3</span>
                <span className="text-brand-white/70 text-sm uppercase tracking-[0.25em] font-bold pb-2">
                  {t("installments")}
                </span>
              </div>
              <p className="mt-4 text-brand-white/65 text-sm leading-relaxed">{t("planDescription")}</p>
            </div>
            <div className="mt-auto rounded-2xl border border-brand-gold/30 bg-brand-gold/10 p-5 flex items-start gap-4">
              <Sparkles className="w-5 h-5 text-brand-gold shrink-0 mt-1" />
              <p className="text-brand-white/85 text-sm leading-relaxed">{t("limitedNotice")}</p>
            </div>
          </motion.aside>

          <motion.div
            {...reveal}
            className="lg:col-span-3 rounded-[2rem] md:rounded-[2.5rem] border border-brand-gold/30 bg-gradient-to-br from-brand-teal/90 to-brand-charcoal p-8 sm:p-12 shadow-[0_40px_90px_rgba(0,0,0,0.45)]"
          >
            <SectionLabel tone="gold" className="mb-4">{tl("label")}</SectionLabel>
            <h3 className="font-serif font-light text-brand-white text-3xl sm:text-4xl md:text-5xl leading-tight mb-3">
              {tl("heading")} <span className="italic text-brand-gold">{tl("headingAccent")}</span>
            </h3>
            <p className="text-brand-white/65 text-sm sm:text-base mb-8 leading-relaxed">{tl("intro")}</p>

            {status === "success" ? (
              <SuccessPanel onReset={() => setStatus("idle")} />
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Honeypot. Hidden from humans + assistive tech; bots usually fill it. */}
                <div aria-hidden="true" className="absolute left-[-10000px] top-auto w-px h-px overflow-hidden">
                  <label htmlFor="lead-website">Website</label>
                  <input
                    id="lead-website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
                <LeadField
                  id="lead-name"
                  label={tl("name")}
                  icon={UserRound}
                  value={name}
                  onChange={setName}
                  type="text"
                  autoComplete="name"
                  error={fieldErrors.name}
                />
                <LeadField
                  id="lead-email"
                  label={tl("email")}
                  icon={Mail}
                  value={email}
                  onChange={setEmail}
                  type="email"
                  autoComplete="email"
                  error={fieldErrors.email}
                />
                <LeadField
                  id="lead-phone"
                  label={tl("phone")}
                  icon={Phone}
                  value={phone}
                  onChange={setPhone}
                  type="tel"
                  autoComplete="tel"
                  error={fieldErrors.phone}
                />

                {submitError && (
                  <p role="alert" className="text-sm text-brand-yellow/90 leading-relaxed">
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="group mt-2 w-full inline-flex items-center justify-center gap-3 rounded-full bg-brand-gold text-brand-charcoal px-8 py-5 text-xs sm:text-sm font-bold uppercase tracking-[0.25em] hover:bg-brand-yellow transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-brand-charcoal disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {tl("submitting")}
                    </>
                  ) : (
                    <>
                      {tl("submit")}
                      <ArrowRight className="w-4 h-4 rtl:-scale-x-100 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                    </>
                  )}
                </button>
                <p className="text-[11px] uppercase tracking-[0.2em] text-brand-white/40 text-center pt-2">
                  {tl("privacy")}
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

type LeadFieldProps = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (value: string) => void;
  type: "text" | "email" | "tel";
  autoComplete?: string;
  error?: string;
};

function LeadField({ id, label, icon: Icon, value, onChange, type, autoComplete, error }: LeadFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-[10px] uppercase tracking-[0.3em] text-brand-white/50 font-bold mb-2">
        {label}
      </label>
      <div
        className={`relative flex items-center rounded-full border bg-brand-charcoal/50 transition-colors ${
          error
            ? "border-brand-yellow/60"
            : "border-brand-gold/25 focus-within:border-brand-gold/70"
        }`}
      >
        <Icon className="w-4 h-4 text-brand-gold/70 absolute start-5" />
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type={type}
          autoComplete={autoComplete}
          required
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="w-full bg-transparent ps-12 pe-5 py-4 text-sm sm:text-base text-brand-white placeholder-brand-white/30 font-medium focus:outline-none"
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-2 text-xs text-brand-yellow/90">
          {error}
        </p>
      )}
    </div>
  );
}

function SuccessPanel({ onReset }: { onReset: () => void }) {
  const tl = useTranslations("lead");
  return (
    <div className="relative rounded-2xl border border-brand-gold/40 bg-brand-gold/10 p-8 text-center">
      <div className="w-14 h-14 mx-auto rounded-full bg-brand-gold text-brand-charcoal flex items-center justify-center mb-5 shadow-lg">
        <Check className="w-6 h-6" />
      </div>
      <h4 className="font-serif text-brand-white text-2xl sm:text-3xl font-light mb-3">{tl("successHeading")}</h4>
      <p className="text-brand-white/75 text-sm sm:text-base leading-relaxed max-w-sm mx-auto">{tl("successBody")}</p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 text-xs uppercase tracking-[0.3em] text-brand-gold border border-brand-gold/40 px-6 py-3 rounded-full hover:bg-brand-gold/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
      >
        {tl("successReset")}
      </button>
    </div>
  );
}
