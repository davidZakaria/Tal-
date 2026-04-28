"use client";

import { useEffect } from "react";
import { CalendarOff } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useBookingStatus } from "@/hooks/useBookingStatus";

const BANNER_HTML_CLASS = "booking-banner-active";

export default function BookingClosedBanner() {
  const { data, isFetched } = useBookingStatus();
  const locale = useLocale();
  const t = useTranslations("booking");

  const paused = isFetched && data && !data.bookingOpen && data.opensAt;

  useEffect(() => {
    const root = document.documentElement;
    if (paused) root.classList.add(BANNER_HTML_CLASS);
    else root.classList.remove(BANNER_HTML_CLASS);
    return () => root.classList.remove(BANNER_HTML_CLASS);
  }, [paused]);

  if (!paused || !data?.opensAt) return null;

  const [y, mo, da] = data.opensAt.split("-").map((p) => parseInt(p, 10));
  const anchor = new Date(Date.UTC(y, mo - 1, da));
  const formatted = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Cairo",
  }).format(anchor);

  return (
    <div
      className="fixed inset-x-0 top-0 z-[220] flex min-h-[3rem] flex-wrap items-center justify-center gap-2 border-b border-brand-yellow/35 bg-brand-forest px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
      role="status"
      aria-live="polite"
    >
      <CalendarOff className="h-4 w-4 shrink-0 text-brand-gold" aria-hidden />
      <p className="text-center text-[11px] font-bold uppercase leading-snug tracking-[0.22em] text-brand-white sm:text-xs">
        <span className="text-brand-yellow-light">{t("bannerPaused")}</span>
        {" — "}
        <span className="font-semibold tracking-[0.12em] text-brand-white/95 normal-case">{t("bannerOpens", { date: formatted })}</span>
      </p>
    </div>
  );
}
