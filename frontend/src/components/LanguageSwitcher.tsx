"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Loader2 } from "lucide-react";

type Variant = "nav" | "mobile";

const LOCALE_DISPLAY: Record<string, { short: string; long: string; hrefLang: string }> = {
  en: { short: "EN", long: "English", hrefLang: "en" },
  ar: { short: "ع", long: "العربية", hrefLang: "ar" },
};

export default function LanguageSwitcher({ variant = "nav" }: { variant?: Variant }) {
  const locale = useLocale();
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const switchTo = (next: string) => {
    if (next === locale || isPending) return;
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- pathname is typed to the current route; next-intl handles param carry-over
        { pathname, params },
        { locale: next as (typeof routing.locales)[number] },
      );
    });
  };

  const baseWrapper =
    variant === "nav"
      ? "inline-flex items-center gap-1 rounded-full bg-white/5 backdrop-blur-md border border-white/15 shadow-[0_4px_18px_rgba(0,0,0,0.25)] p-1"
      : "inline-flex items-center gap-1 rounded-full bg-white/5 backdrop-blur-md border border-white/15 p-1";

  return (
    <div
      className={baseWrapper}
      role="group"
      aria-label={t("languageSwitcher")}
    >
      {routing.locales.map((l) => {
        const info = LOCALE_DISPLAY[l];
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            onClick={() => switchTo(l)}
            disabled={isPending}
            lang={info.hrefLang}
            aria-label={info.long}
            aria-pressed={active}
            aria-current={active ? "true" : undefined}
            className={`relative inline-flex items-center justify-center min-w-9 h-8 px-3 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold ${
              active
                ? "bg-brand-gold/20 text-brand-gold ring-1 ring-inset ring-brand-gold/50 shadow-[inset_0_0_12px_rgba(201,168,106,0.15)]"
                : "text-brand-white/70 hover:text-brand-white"
            } disabled:opacity-60`}
          >
            {isPending && active ? (
              <Loader2 className="w-3 h-3 animate-spin" aria-hidden />
            ) : (
              info.short
            )}
          </button>
        );
      })}
    </div>
  );
}
