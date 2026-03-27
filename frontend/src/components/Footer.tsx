"use client";

import { usePathname } from 'next/navigation';
import { ArrowRight, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  
  // Guard clause: Hide footer structurally on the immersive Admin Dashboard and Guest Portal
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/portal')) {
    return null;
  }

  return (
    <footer className="bg-[#03202e] text-sand-light pt-32 pb-12 relative overflow-hidden flex flex-col items-center">
      {/* Aesthetic Ocean Wave Bleed */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-turquoise/20 to-transparent" />
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 mb-24">
          
          <div className="md:col-span-4 flex flex-col">
            <h2 className="text-4xl md:text-5xl font-serif mb-6 tracking-wide font-light text-white">Talé Resort.</h2>
            <p className="text-sand/50 text-sm leading-relaxed mb-8 max-w-sm font-light">
              The pinnacle of coastal hospitality. Discover a pristine extension of the Red Sea lifestyle, where uninterrupted panoramic views meet curated personal service at every physical corner.
            </p>
            <div className="flex items-center gap-4 mt-auto pt-6">
              <span className="w-10 h-10 rounded-full border border-sand/10 flex items-center justify-center hover:bg-turquoise hover:border-turquoise hover:text-[#03202e] text-[9px] font-bold tracking-widest transition-all duration-300 cursor-pointer">IG</span>
              <span className="w-10 h-10 rounded-full border border-sand/10 flex items-center justify-center hover:bg-turquoise hover:border-turquoise hover:text-[#03202e] text-[9px] font-bold tracking-widest transition-all duration-300 cursor-pointer">FB</span>
            </div>
          </div>

          <div className="md:col-span-2 md:col-start-6">
            <h4 className="text-[9px] uppercase tracking-[0.25em] font-bold text-sand/30 mb-8 border-b border-sand/10 pb-4 inline-block">Discovery</h4>
            <ul className="space-y-4 text-sm font-light text-sand/70">
              <li><a href="/#sanctuaries" className="hover:text-turquoise hover:translate-x-1 inline-block transition-all duration-300">Sanctuaries</a></li>
              <li><span className="hover:text-turquoise hover:translate-x-1 inline-block transition-all duration-300 cursor-pointer">Coastal Dining</span></li>
              <li><span className="hover:text-turquoise hover:translate-x-1 inline-block transition-all duration-300 cursor-pointer">Spa & Wellness</span></li>
              <li><span className="hover:text-turquoise hover:translate-x-1 inline-block transition-all duration-300 cursor-pointer">Curated Offers</span></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[9px] uppercase tracking-[0.25em] font-bold text-sand/30 mb-8 border-b border-sand/10 pb-4 inline-block">Concierge</h4>
            <ul className="space-y-4 text-sm font-light text-sand/70">
              <li><span className="hover:text-turquoise hover:translate-x-1 inline-block transition-all duration-300 cursor-pointer">Private Transfers</span></li>
              <li><span className="hover:text-turquoise hover:translate-x-1 inline-block transition-all duration-300 cursor-pointer">Contact Directly</span></li>
              <li><a href="/portal" className="hover:text-turquoise hover:translate-x-1 inline-block transition-all duration-300 text-terracotta">Guest Portal</a></li>
              <li><span className="hover:text-turquoise hover:translate-x-1 inline-block transition-all duration-300 cursor-pointer">Careers at Talé</span></li>
            </ul>
          </div>

          <div className="md:col-span-3">
             <h4 className="text-[9px] uppercase tracking-[0.25em] font-bold text-sand/30 mb-8 border-b border-sand/10 pb-4 inline-block">Private Newsletter</h4>
             <p className="text-sand/50 text-xs mb-6 font-light leading-relaxed">Subscribe for strictly exclusive access to peak-season suite availability prior to global drops.</p>
             <div className="relative group">
               <input type="email" placeholder="Your email address" className="w-full bg-transparent border-b border-sand/20 py-3 pr-10 text-sm focus:outline-none focus:border-turquoise text-sand placeholder:text-sand/20 transition-colors" />
               <button className="absolute right-0 top-3 text-sand/40 group-hover:text-turquoise transition-colors"><ArrowRight className="w-4 h-4" /></button>
             </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-sand/5 text-[9px] uppercase tracking-[0.1em] text-sand/30 font-bold">
           <p>© {new Date().getFullYear()} Talé Hotel & Resorts. All Rights Reserved. Engineered By David Zakaria.</p>
           <div className="flex gap-6 mt-4 md:mt-0">
             <span className="hover:text-sand/80 transition-colors cursor-pointer">Privacy Framework</span>
             <span className="hover:text-sand/80 transition-colors cursor-pointer">Terms of Stay</span>
           </div>
        </div>
      </div>
    </footer>
  );
}
