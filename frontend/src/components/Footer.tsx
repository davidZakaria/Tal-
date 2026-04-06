"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { SiteLogo } from '@/components/SiteLogo';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const instagramHref =
  process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL || "https://www.instagram.com";
const facebookHref =
  process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL || "https://www.facebook.com";

export default function Footer() {
  const pathname = usePathname();
  
  // Guard clause: Hide footer structurally on the immersive Admin Dashboard and Guest Portal
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/portal')) {
    return null;
  }

  return (
    <footer className="bg-brand-charcoal text-brand-white pt-20 sm:pt-28 md:pt-32 pb-10 sm:pb-12 relative overflow-x-hidden flex flex-col items-center">
      {/* Aesthetic Ocean Wave Bleed */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/25 to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 md:px-12 relative z-10 w-full max-w-full min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 sm:gap-16 md:gap-8 mb-16 sm:mb-24">
          
          <div className="md:col-span-4 flex flex-col">
            <div className="mb-8">
              <SiteLogo
                href="/"
                variant="onDark"
                wrapperClassName="h-32 w-[22rem] sm:h-36 sm:w-[26rem] md:h-40 md:w-[30rem]"
                linkClassName="focus-visible:ring-offset-brand-charcoal focus-visible:ring-offset-4"
              />
              <p className="mt-5 text-xs uppercase tracking-[0.28em] text-brand-gold/80 font-bold">
                Talé Hotel · Galala City
              </p>
            </div>
            <p className="text-brand-white/55 text-sm leading-relaxed mb-8 max-w-sm font-light">
              The pinnacle of coastal hospitality. Discover a pristine extension of the Red Sea lifestyle, where uninterrupted panoramic views meet curated personal service at every physical corner.
            </p>
            <div className="flex items-center gap-4 mt-auto pt-6">
              <a
                href={instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-brand-gold/20 flex items-center justify-center hover:bg-brand-gold hover:border-brand-gold hover:text-brand-charcoal transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                aria-label="Talé on Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href={facebookHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-brand-gold/20 flex items-center justify-center hover:bg-brand-gold hover:border-brand-gold hover:text-brand-charcoal transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                aria-label="Talé on Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="md:col-span-2 md:col-start-6">
            <h4 className="text-xs uppercase tracking-[0.25em] font-bold text-brand-white/35 mb-8 border-b border-brand-gold/15 pb-4 inline-block">Discovery</h4>
            <ul className="space-y-4 text-sm font-light text-brand-white/70">
              <li><Link href="/#sanctuaries" className="hover:text-brand-gold hover:translate-x-1 inline-block transition-all duration-300">Sanctuaries</Link></li>
              <li><span className="hover:text-brand-gold hover:translate-x-1 inline-block transition-all duration-300 cursor-pointer">Coastal Dining</span></li>
              <li><span className="hover:text-brand-gold hover:translate-x-1 inline-block transition-all duration-300 cursor-pointer">Spa & Wellness</span></li>
              <li><span className="hover:text-brand-gold hover:translate-x-1 inline-block transition-all duration-300 cursor-pointer">Curated Offers</span></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs uppercase tracking-[0.25em] font-bold text-brand-white/35 mb-8 border-b border-brand-gold/15 pb-4 inline-block">Concierge</h4>
            <ul className="space-y-4 text-sm font-light text-brand-white/70">
              <li><span className="hover:text-brand-gold hover:translate-x-1 inline-block transition-all duration-300 cursor-pointer">Private Transfers</span></li>
              <li><span className="hover:text-brand-gold hover:translate-x-1 inline-block transition-all duration-300 cursor-pointer">Contact Directly</span></li>
              <li><Link href="/portal" className="hover:text-brand-gold hover:translate-x-1 inline-block transition-all duration-300 text-brand-gold">Guest Portal</Link></li>
              <li><span className="hover:text-brand-gold hover:translate-x-1 inline-block transition-all duration-300 cursor-pointer">Careers at Talé</span></li>
            </ul>
          </div>

          <div className="md:col-span-3">
             <h4 className="text-xs uppercase tracking-[0.25em] font-bold text-brand-white/35 mb-8 border-b border-brand-gold/15 pb-4 inline-block">Private Newsletter</h4>
             <p className="text-brand-white/55 text-xs mb-6 font-light leading-relaxed">Subscribe for strictly exclusive access to peak-season suite availability prior to global drops.</p>
             <div className="relative group">
               <input type="email" placeholder="Your email address" className="w-full bg-transparent border-b border-brand-gold/25 py-3 pr-10 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-charcoal focus:border-brand-gold text-brand-white placeholder:text-brand-white/25 transition-colors" />
               <button type="button" aria-label="Subscribe" className="absolute right-0 top-3 text-brand-white/45 group-hover:text-brand-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded"><ArrowRight className="w-4 h-4" /></button>
             </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-brand-white/10 text-[10px] sm:text-xs uppercase tracking-[0.08em] sm:tracking-[0.1em] text-brand-white/35 font-bold">
           <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left w-full md:w-auto">
             <SiteLogo
               href="/"
               variant="onDark"
               wrapperClassName="h-14 w-48 sm:h-16 sm:w-56"
               imageClassName="opacity-90"
               linkClassName="focus-visible:ring-offset-brand-charcoal focus-visible:ring-offset-4"
             />
             <p className="leading-relaxed max-w-xl">
               © {new Date().getFullYear()} Talé Hotel & Resorts. All Rights Reserved. Engineered By David Zakaria.
             </p>
           </div>
           <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:mt-0">
             <span className="hover:text-brand-gold transition-colors cursor-pointer">Privacy Framework</span>
             <span className="hover:text-brand-gold transition-colors cursor-pointer">Terms of Stay</span>
           </div>
        </div>
      </div>
    </footer>
  );
}
