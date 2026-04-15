"use client";

import React, { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import AuthModal from "@/components/AuthModal";
import { motion, useScroll, useTransform } from "framer-motion";
import { Globe, Menu } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { user, signOut } = useAuth();
  const { scrollY } = useScroll();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Refined for Dark Mode only (No eye-hurting white)
  const background = useTransform(
    scrollY,
    [0, 50],
    ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.8)"]
  );
  const borderBottom = useTransform(
    scrollY,
    [0, 50],
    ["1px solid rgba(255, 255, 255, 0)", "1px solid rgba(34, 197, 94, 0.2)"]
  );

  return (
    <>
      <motion.header
        style={{ background, borderBottom, backdropFilter: "blur(20px)" }}
        className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center transition-all duration-300"
      >
        <div className="max-w-[1200px] mx-auto w-full px-6 flex items-center justify-between">
          <div className="text-3xl font-black tracking-tighter text-white flex items-center gap-2">
            {t('brand')}
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => document.getElementById('history-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-veridian-500 transition-colors"
              >
                {t('HISTORY')}
              </button>
              
              {user ? (
                 <button 
                  onClick={() => signOut()}
                  className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                 >Sign Out</button>
              ) : (
                <button 
                  onClick={() => setIsAuthOpen(true)}
                  className="px-6 py-2 rounded-full bg-veridian-500 text-white shadow-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                >Join Portal</button>
              )}
            </div>

            {/* High-Contrast Lang Switcher */}
            <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
              <button
                onClick={() => setLanguage('EN')}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${language === 'EN' ? 'bg-veridian-500 text-white shadow-lg' : 'text-white/40'}`}
              >EN</button>
              <button
                onClick={() => setLanguage('HI')}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${language === 'HI' ? 'bg-veridian-500 text-white shadow-lg' : 'text-white/40'}`}
              >हिन्दी</button>
            </div>
          </div>
        </div>
      </motion.header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}

function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="py-20 bg-transparent text-white relative z-10">
      <div className="max-w-[1200px] mx-auto px-6 border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-6 relative z-10">
        <div className="space-y-3 text-center md:text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-veridian-500/40">Healing the earth, one leaf at a Time</p>
          <p className="text-[11px] md:text-sm text-white/40 font-bold uppercase tracking-widest leading-none">Copyright © 2025 {t('brand')} {t('copyright')}</p>
        </div>
        <div className="flex gap-10 md:gap-8 justify-center items-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Privacy</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Terms</span>
          <Globe size={18} className="text-white/30" />
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white`}>
        <AuthProvider>
          <LanguageProvider>
            <Header />
            <div className="relative min-h-screen flex flex-col">
              <main className="flex-grow">{children}</main>
              <Footer />
              
              {/* 🌊 GLOBAL BOTTOM ART: Covers Last Section & Footer */}
              <div className="absolute inset-x-0 bottom-0 h-[80vh] opacity-[0.25] pointer-events-none z-0"
                style={{ maskImage: 'radial-gradient(circle at bottom, black 25%, transparent 80%)' }}>
                <img
                  src="/horizon_harvest_doodle_footer_1775828161891.png"
                  className="w-full h-full object-cover object-bottom"
                  alt=""
                />
              </div>
            </div>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
