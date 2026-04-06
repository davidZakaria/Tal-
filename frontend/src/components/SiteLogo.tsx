"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { siteLogoSrc } from "@/lib/siteLogo";

type SiteLogoProps = {
  variant: "onDark" | "onLight";
  wrapperClassName: string;
  priority?: boolean;
  href?: string;
  imageClassName?: string;
  linkClassName?: string;
};

const FALLBACK_SVG = "/logo.svg";

type LoadStage = "primary" | "svg" | "text";

export function SiteLogo({
  variant,
  wrapperClassName,
  priority = false,
  href,
  imageClassName = "",
  linkClassName = "",
}: SiteLogoProps) {
  const primarySrc = siteLogoSrc();
  const [stage, setStage] = useState<LoadStage>("primary");

  const src = stage === "primary" ? primarySrc : stage === "svg" ? FALLBACK_SVG : null;

  const onError = useCallback(() => {
    setStage((s) => {
      if (s === "primary") return "svg";
      if (s === "svg") return "text";
      return s;
    });
  }, []);

  const shadow =
    variant === "onDark"
      ? "drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] drop-shadow-[0_0_1px_rgba(0,0,0,0.9)]"
      : "drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]";

  const content =
    stage === "text" ? (
      <span
        className={`flex h-full min-h-[2.5rem] w-full flex-col justify-center font-sans text-xs font-semibold tracking-[0.2em] text-brand-gold sm:text-sm ${imageClassName}`.trim()}
      >
        <span className="font-serif text-3xl font-light tracking-[0.15em] text-brand-gold sm:text-4xl md:text-5xl">
          TAL{"\u00C9"}
        </span>
        <span className="text-xs uppercase tracking-[0.3em] text-brand-white/90 sm:text-sm">Hotel</span>
      </span>
    ) : (
      // eslint-disable-next-line @next/next/no-img-element -- public/ assets; avoids Next/Image 404 edge cases
      <img
        src={src!}
        alt="TALE Hotel"
        width={800}
        height={260}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        loading={priority ? "eager" : "lazy"}
        onError={onError}
        className={`absolute inset-0 h-full w-full object-contain object-left transition-all duration-500 ${shadow} ${imageClassName}`.trim()}
      />
    );

  const inner = <span className={`relative block ${wrapperClassName}`}>{content}</span>;

  if (href) {
    return (
      <Link
        href={href}
        className={`inline-flex shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-sm ${linkClassName}`.trim()}
      >
        {inner}
      </Link>
    );
  }
  return inner;
}
