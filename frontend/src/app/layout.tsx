"use client";

import React, { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import AuthModal from "@/components/AuthModal";
import { motion, useScroll, useTransform } from "framer-motion";
import { Globe, Menu } from "lucide-react";

import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

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
            <Navbar />
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
