"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { sanitizeReturnPath } from "@/lib/guestReturnTo";

function OAuthSuccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("auth");

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("guestToken", token);
      const stored = sessionStorage.getItem("guestReturnTo");
      sessionStorage.removeItem("guestReturnTo");
      const rt = sanitizeReturnPath(stored);
      if (rt) {
        router.replace(rt);
      } else {
        router.push("/portal");
      }
    } else {
      router.push("/portal?error=oauth_failed");
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-sapphire flex flex-col items-center justify-center text-white">
      <Loader2 className="w-12 h-12 animate-spin text-turquoise mb-6" />
      <h1 className="text-2xl font-serif tracking-widest uppercase">{t("successHeading")}</h1>
      <p className="text-xs tracking-[0.2em] uppercase mt-2 text-white/50">{t("successIntro")}</p>
    </div>
  );
}

export default function OAuthSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-sapphire flex flex-col items-center justify-center text-white">
          <Loader2 className="w-12 h-12 animate-spin text-turquoise mb-6" />
        </div>
      }
    >
      <OAuthSuccessInner />
    </Suspense>
  );
}
