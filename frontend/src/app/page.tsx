"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent text-foreground flex flex-col font-sans selection:bg-primary/50 relative">
      
      {/* Navigation Layer */}
      <nav className="absolute top-0 w-full p-6 md:px-12 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center h-16 w-32 md:w-40">
            <Image
              src="/logo.png"
              alt="Talé Hotel"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </div>
        <div className="hidden md:flex gap-10 text-sm font-medium tracking-[0.2em] text-primary/90">
          <a href="#" className="hover:text-primary transition-colors uppercase">Stay</a>
          <a href="#" className="hover:text-primary transition-colors uppercase">Experience</a>
          <a href="#" className="hover:text-primary transition-colors uppercase">Dining</a>
        </div>
        <button className="px-6 py-2.5 bg-primary text-secondary font-semibold hover:bg-[#d6b797] transition-all shadow-xl rounded-sm text-sm tracking-wide">
          BOOK NOW
        </button>
      </nav>

      {/* Main Hero Layer */}
      <main className="relative flex-grow flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden bg-background">
        
        {/* Dynamic Abstract Water & Sand Elements */}
        {/* Dark theme inherently shifts to the deep ocean blue --background, but we add subtle gradients */}
        <div className="absolute inset-0 z-0 opacity-10 md:opacity-20 pointer-events-none mix-blend-overlay" 
             style={{ 
               backgroundImage: 'radial-gradient(circle at 50% 120%, var(--primary) 0%, transparent 60%)' 
             }}></div>
        
        {/* Wavy Ambient Orbs using Framer Motion */}
        <motion.div 
          animate={{ y: [0, -40, 0], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/4 -right-1/4 w-[50rem] h-[50rem] bg-primary/20 rounded-full blur-[150px] pointer-events-none z-0"
        />
        <motion.div 
          animate={{ y: [0, 40, 0], x: [0, -30, 0], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-1/4 -left-1/4 w-[40rem] h-[40rem] bg-secondary/80 rounded-full blur-[120px] pointer-events-none z-0"
        />

        <div className="z-10 container mx-auto px-6 max-w-4xl text-center flex flex-col items-center mt-12">
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-light mb-8 text-primary tracking-tighter font-serif"
          >
            Welcome to Talé
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
            className="w-20 h-[0.15rem] bg-primary/80 mb-12 rounded-full"
          />

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl md:text-2xl leading-relaxed mb-6 font-light"
          >
            Talé Hotel introduces a tailored hospitality experience at the heart of Galala city &mdash; Red Sea.
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-lg md:text-xl leading-relaxed mb-6 font-light max-w-3xl opacity-80"
          >
            Designed as a seamless extension of the coastal lifestyle, Talé brings together hotel comfort, curated service, and uninterrupted views of the Red Sea.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="text-lg md:text-xl leading-relaxed mb-16 font-light max-w-3xl opacity-80"
          >
            Whether for a weekend retreat or an annual escape, Talé transforms every stay into a signature experience.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 border border-primary/50 bg-background/50 backdrop-blur-sm text-primary px-10 py-4 rounded-full hover:bg-primary hover:text-secondary transition-all shadow-[0_0_20px_rgba(227,200,171,0.1)] group text-sm tracking-widest uppercase font-medium"
          >
            Explore Options
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </main>
    </div>
  );
}
