"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Calendar, Users, ChevronDown, CheckCircle2, Menu, X } from "lucide-react";
import Image from "next/image";
import { useProperties } from "@/hooks/useProperties";
import { useRouter } from "next/navigation";

const NAV_LINKS = ["Sanctuaries", "Dining", "Wellness", "Experiences"] as const;

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All Suites");
  const { scrollY } = useScroll();
  const reduceMotion = useReducedMotion();
  const { data: dbProperties, isLoading } = useProperties();
  const router = useRouter();
  
  const heroY = useTransform(scrollY, [0, 1000], [0, reduceMotion ? 0 : 300]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter all loaded Properties using React State logic exclusively relying on Class Type Enum
  const properties = (dbProperties || []).filter(p => activeCategory === "All Suites" || p.roomType === activeCategory);

  const scrollToSanctuaries = () => {
    document.getElementById("sanctuaries")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 1.2 }}
      className="bg-sand-light text-sapphire font-sans selection:bg-turquoise/30"
    >
      {/* Sleek Transparent-to-Solid Navigation */}
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-700 ${
          isScrolled ? "bg-sand-light/95 backdrop-blur-md shadow-sm py-4" : "bg-transparent py-8"
        }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex justify-between items-center gap-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex items-center h-12 w-28 md:w-36"
          >
            <Image
              src="/logo.png"
              alt="Talé Hotel"
              fill
              sizes="(max-width: 768px) 112px, 144px"
              className="object-contain object-left"
              priority
            />
          </motion.div>
          
          <div className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
             {NAV_LINKS.map((link, i) => (
               <motion.a 
                 key={link}
                 href={`#${link.toLowerCase()}`}
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 + (i * 0.1), duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                 className={`text-xs uppercase tracking-[0.25em] font-bold cursor-pointer transition-all duration-500 hover:text-turquoise focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 rounded-full px-2 py-1 ${isScrolled ? 'text-sapphire/70 ring-offset-sand-light' : 'text-white/80 ring-offset-transparent'}`}
               >
                 {link}
               </motion.a>
             ))}
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <button
              type="button"
              className={`md:hidden rounded-full p-3 border backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise ${
                isScrolled
                  ? "border-sapphire/20 bg-white text-sapphire hover:bg-sand-light"
                  : "border-white/30 bg-white/10 text-white hover:bg-white/20"
              }`}
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileNavOpen((o) => !o)}
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <motion.button 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => router.push('/portal')} 
              className={`px-6 md:px-8 py-3 md:py-3.5 font-bold text-xs tracking-[0.2em] uppercase transition-all duration-500 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 ${
            isScrolled ? "bg-sapphire text-white hover:bg-turquoise hover:shadow-lg ring-offset-sand-light" : "bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white hover:text-sapphire ring-offset-transparent"
          }`}>
              Guest Portal
            </motion.button>
          </div>
        </div>
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              id="mobile-nav"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-white/10 bg-sapphire/95 backdrop-blur-md"
            >
              <div className="container mx-auto px-6 py-8 flex flex-col gap-4">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link}
                    href={`#${link.toLowerCase()}`}
                    className="text-sm uppercase tracking-[0.2em] font-bold text-white/90 py-2 border-b border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise rounded"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Immersive Panoramic Hero Section */}
      <section className="relative h-screen min-h-[800px] w-full overflow-hidden flex items-center justify-center">
        
        {/* Background Image Parallax Overlay */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0 scale-110">
          <div className="absolute inset-0 bg-black/20 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
          <Image 
            src="https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2500&q=80" 
            alt="Red Sea Pristine Coast" 
            fill 
            sizes="100vw"
            className="object-cover"
            priority
          />
        </motion.div>

        {/* Wave-like Rhythmic Hero Content & Typography */}
        <div className="relative z-10 container mx-auto px-6 flex flex-col items-center justify-center h-full text-center text-white mt-12 pointer-events-none">
          
          <div className="flex flex-col items-center">
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-xs font-bold tracking-[0.35em] uppercase mb-8 text-sand drop-shadow-md"
            >
              Galala City • Red Sea
            </motion.p>
            
            <h1 className="text-7xl md:text-[10rem] font-serif font-light tracking-tighter mb-10 drop-shadow-2xl leading-[0.9] flex flex-col items-center">
               <span className="overflow-hidden block pb-2">
                  <motion.span 
                    initial={{ y: "110%" }} 
                    animate={{ y: 0 }} 
                    transition={{ duration: 1.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} 
                    className="block"
                  >
                    Soul of
                  </motion.span>
               </span>
               <span className="overflow-hidden block pb-4">
                  <motion.span 
                    initial={{ y: "110%" }} 
                    animate={{ y: 0 }} 
                    transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} 
                    className="block text-sand-light italic pr-4"
                  >
                    a Resort.
                  </motion.span>
               </span>
            </h1>
          </div>

          {/* Bright Tactical Booking Widget connected to internal Scroll Anchor */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
            className="absolute bottom-16 w-full max-w-4xl px-4 md:px-0"
          >
            <div className="bg-white p-2 md:p-3 rounded-3xl md:rounded-full w-full shadow-[0_40px_80px_rgba(6,64,90,0.3)]">
               <div className="flex flex-col md:flex-row items-center justify-between gap-2 w-full">
                  
                  <div onClick={scrollToSanctuaries} className="flex-1 flex max-md:w-full items-center gap-5 hover:bg-sand-light p-4 md:px-8 rounded-2xl md:rounded-full cursor-pointer transition-colors group">
                    <Calendar className="text-terracotta w-6 h-6 group-hover:scale-110 transition-transform" />
                    <div className="text-left flex-1">
                      <p className="text-xs text-sapphire/50 uppercase tracking-[0.2em] font-bold mb-1">Itinerary</p>
                      <p className="text-sm font-bold text-sapphire tracking-wide">Select Dates</p>
                    </div>
                    <ChevronDown className="text-sapphire/30 w-4 h-4" />
                  </div>
                  
                  <div className="hidden md:block w-px h-12 bg-sapphire/10"></div>

                  <div onClick={scrollToSanctuaries} className="flex-1 flex max-md:w-full items-center gap-5 hover:bg-sand-light p-4 md:px-8 rounded-2xl md:rounded-full cursor-pointer transition-colors group">
                    <Users className="text-terracotta w-6 h-6 group-hover:scale-110 transition-transform" />
                    <div className="text-left flex-1">
                      <p className="text-xs text-sapphire/50 uppercase tracking-[0.2em] font-bold mb-1">Target Class</p>
                      <p className="text-sm font-bold text-sapphire tracking-wide">Guests & Rooms</p>
                    </div>
                    <ChevronDown className="text-sapphire/30 w-4 h-4" />
                  </div>

                  <button onClick={scrollToSanctuaries} className="bg-sapphire text-white px-10 py-5 rounded-2xl md:rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:bg-turquoise transition-all duration-500 max-md:w-full max-md:mt-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                    Check Availability
                  </button>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Properties (Panoramic Off-Grid Layout) */}
      <section id="sanctuaries" className="pt-24 pb-40 bg-sand-light relative z-20 overflow-hidden">
        <div className="container mx-auto px-6 md:px-12">
          
          <div className="max-w-4xl mb-32 md:pl-12">
            <motion.h2 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="text-6xl md:text-8xl font-serif text-sapphire font-light tracking-tighter mb-10"
            >
              A Tactile Haven
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-xl md:text-2xl text-sapphire/70 leading-relaxed font-light max-w-2xl"
            >
              Designed as a seamless extension of the coastal lifestyle, Talé brings together curated service and uninterrupted views of the Red Sea.
            </motion.p>
          </div>

          <div className="md:pl-12 mb-20 flex flex-wrap gap-4 uppercase tracking-[0.2em] text-xs font-bold">
            {["All Suites", "Signature Suite", "Ocean Villa", "Penthouse", "Alpine Chalet", "Standard Room"].map(cat => (
               <button 
                 key={cat} 
                 onClick={() => setActiveCategory(cat)}
                 className={`px-6 md:px-8 py-3.5 rounded-full transition-all border ${activeCategory === cat ? 'bg-sapphire text-white border-sapphire shadow-[0_10px_30px_rgba(6,64,90,0.3)]' : 'bg-transparent text-sapphire/40 border-sapphire/20 hover:border-sapphire/40 hover:text-sapphire'}`}
               >
                 {cat}
               </button>
            ))}
          </div>

          <motion.div layout className="relative flex flex-col gap-24 md:gap-40 items-center w-full">
            {isLoading && (
              <div className="w-full flex flex-col gap-24 md:gap-32" aria-busy="true" aria-label="Loading properties">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-full flex flex-col md:flex-row items-center gap-10 md:gap-20 animate-pulse"
                  >
                    <div className="w-full md:w-7/12 min-h-[400px] md:h-[600px] rounded-[2.5rem] md:rounded-[4rem] bg-sand/50" />
                    <div className="w-full md:w-5/12 space-y-6 px-2">
                      <div className="h-4 w-32 rounded-full bg-sand/60" />
                      <div className="h-14 w-3/4 rounded-lg bg-sand/40" />
                      <div className="h-24 w-full rounded-lg bg-sand/40" />
                      <div className="h-10 w-40 rounded-full bg-sapphire/10" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!isLoading && properties.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full py-32 text-center px-4">
                <p className="text-sapphire/60 font-medium text-lg md:text-xl mb-6">
                  No suites match <span className="text-terracotta font-serif">{activeCategory}</span> yet.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveCategory("All Suites")}
                  className="text-xs uppercase tracking-[0.2em] font-bold text-sapphire border border-sapphire/30 px-8 py-3 rounded-full hover:bg-sapphire hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise"
                >
                  View all suites
                </button>
              </motion.div>
            )}

            <AnimatePresence mode="popLayout">
            {properties.map((prop, i) => (
              <motion.div 
                layout
                key={prop._id}
                onClick={() => router.push(`/properties/${prop._id}`)}
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className={`group cursor-pointer w-full flex flex-col md:flex-row items-center gap-10 md:gap-20 ${
                  i % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Breathtaking Magazine Fluid Image Frame */}
                <div className="w-full md:w-7/12 relative min-h-[400px] md:h-[600px] overflow-hidden rounded-[2.5rem] md:rounded-[4rem] shadow-2xl shadow-sapphire/10">
                  <Image 
                    src={prop.images && prop.images[0] ? prop.images[0] : "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"} 
                    alt={prop.name} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 58vw"
                    className="object-cover transition-transform duration-[2.5s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]" 
                  />
                  <div className="absolute inset-0 bg-sapphire/10 group-hover:bg-transparent transition-colors duration-1000 mix-blend-multiply" />
                  
                  {prop.isOccupiedToday && (
                     <div className="absolute top-8 left-8 z-20 bg-white/95 backdrop-blur-md px-6 py-3 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.2)] flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-terracotta animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-sapphire">Private Party Occupied</span>
                     </div>
                  )}
                </div>
                
                {/* Elevated Text Content Block */}
                <div className="w-full md:w-5/12 flex flex-col items-start px-2 md:px-0">
                  <div className="flex items-center gap-4 mb-6 md:mb-10">
                    <span className="px-5 py-2 rounded-full border border-sapphire/10 text-xs uppercase tracking-widest font-bold text-sapphire/50">
                      {prop.roomType || "Signature Suite"}
                    </span>
                    <span className="text-xs uppercase tracking-widest font-bold text-sapphire/40 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-sapphire/30" /> Up to {prop.capacity || 2} Guests
                    </span>
                  </div>

                  <h3 className="text-4xl md:text-5xl lg:text-6xl font-serif text-sapphire font-light mb-6 leading-[1.1] tracking-tight group-hover:text-turquoise transition-colors duration-500">
                    {prop.name}
                  </h3>
                  
                  <p className="text-sapphire/60 text-sm md:text-base leading-[1.8] font-light mb-12 line-clamp-4">
                    {prop.description || "Designed as a seamless extension of the coastal lifestyle, bridging curated personal service with purely uninterrupted views of the Red Sea."}
                  </p>
                  
                  <div className="flex items-end justify-between w-full border-t border-sapphire/10 pt-8 mt-auto">
                     <div>
                       <p className="text-xs uppercase tracking-widest text-sapphire/40 font-bold mb-1">Starting Rate</p>
                       <p className="text-2xl font-serif text-sapphire">{prop.basePrice} <span className="text-xs font-sans uppercase tracking-[0.2em] text-sapphire/40 ml-1">EGP</span></p>
                     </div>
                     <div className="flex items-center gap-4 text-xs font-bold tracking-[0.2em] uppercase text-sapphire group-hover:text-turquoise transition-colors duration-500">
                        Explore Sanctuary
                        <span className="w-12 h-12 rounded-full border border-sapphire/10 flex items-center justify-center group-hover:border-turquoise group-hover:bg-turquoise group-hover:text-white transition-all duration-500 shadow-sm"><ArrowRight className="w-4 h-4" /></span>
                     </div>
                  </div>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
      
      {/* Signature Experience */}
      <section className="py-40 bg-white relative">
        <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="md:w-5/12 relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl"
          >
             <Image 
                src="https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                fill 
                sizes="(max-width: 768px) 100vw, 42vw"
                alt="Signature Experience" 
                className="object-cover" 
              />
          </motion.div>
          <div className="md:w-7/12">
            <h2 className="text-5xl md:text-7xl font-serif text-sapphire font-light mb-10 tracking-tight leading-tight">
              Every stay is <br/> a signature.
            </h2>
            <p className="text-xl text-sapphire/70 mb-12 font-light leading-relaxed max-w-xl">
              Whether for a weekend retreat or an annual escape, we ensure a pristine canvas for your most memorable moments by the sea.
            </p>
            <ul className="space-y-6">
               {["Uninterrupted Panoramic Views", "Curated Personal Service", "Rhythmic Ocean Design"].map((item, i) => (
                  <motion.li 
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2, duration: 0.8 }}
                    className="flex items-center gap-6 text-sapphire font-medium tracking-wide text-lg"
                  >
                    <CheckCircle2 className="w-6 h-6 text-turquoise" />
                    {item}
                  </motion.li>
               ))}
            </ul>
          </div>
        </div>
      </section>

    </motion.div>
  );
}
