"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { sanitizeReturnPath } from "@/lib/guestReturnTo";

function OAuthSuccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
      <h1 className="text-2xl font-serif tracking-widest uppercase">Authenticating Identity Pipeline</h1>
      <p className="text-xs tracking-[0.2em] uppercase mt-2 text-white/50">Securely routing payload into User Portal...</p>
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
