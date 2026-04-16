"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, User, LogOut, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-[100] px-6 py-6"
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-8 py-5 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[40px] shadow-2xl">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-12 h-12 rounded-2xl bg-veridian-500 flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-500">
               <Sprout size={24} />
            </div>
            <div>
                <h1 className="text-xl font-black tracking-tighter leading-none">{t('brand') || 'NIRAMAY AI'}</h1>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30">{t('navbar_tagline')}</span>
            </div>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-10">
            <button onClick={() => document.getElementById('scan')?.scrollIntoView({ behavior: 'smooth' })} className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-veridian-500 transition-colors">{t('scan_btn')}</button>
            <button onClick={() => document.getElementById('history-section')?.scrollIntoView({ behavior: 'smooth' })} className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-veridian-500 transition-colors">{t('history')}</button>
            <div className="w-px h-6 bg-white/10" />
            
            {/* High-Contrast Lang Switcher */}
            <div className="flex bg-white/5 p-1 rounded-[14px] border border-white/10">
              <button
                onClick={() => setLanguage('EN')}
                className={`px-4 py-1.5 rounded-[12px] text-[10px] font-black transition-all ${language === 'EN' ? 'bg-veridian-500 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
              >EN</button>
              <button
                onClick={() => setLanguage('HI')}
                className={`px-4 py-1.5 rounded-[12px] text-[10px] font-black transition-all ${language === 'HI' ? 'bg-veridian-500 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
              >हिन्दी</button>
            </div>

            <div className="w-px h-6 bg-white/10" />
            
            {user ? (
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-4 group">
                    <div className="text-right">
                        <p className="text-white/30 text-xs font-black uppercase tracking-[0.3em]">
                            Niramay Secure Protocol
                        </p>
                        <p className="text-xs font-black truncate max-w-[120px]">{user.email}</p>
                    </div>
                    <div 
                      onClick={() => document.getElementById('history-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white cursor-pointer hover:bg-veridian-500 hover:text-white transition-all active:scale-90"
                    >
                        <User size={18} />
                    </div>
                 </div>
                 <button 
                    onClick={() => signOut()}
                    className="p-3 bg-red-600/10 text-red-500 rounded-xl border border-red-600/20 hover:bg-red-600 hover:text-white transition-all shadow-xl"
                 >
                    <LogOut size={18} />
                 </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="px-8 py-4 bg-white text-black rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-veridian-500 hover:text-white transition-all shadow-2xl flex items-center gap-3"
              >
                Access Farm <ArrowRight size={14} />
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-4 rounded-2xl bg-white/5 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
            <motion.div
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                className="fixed inset-0 z-[110] bg-black p-12 flex flex-col pt-40 md:hidden"
            >
                <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="absolute top-12 right-12 p-5 bg-white/5 rounded-full text-white"
                >
                    <X size={32} />
                </button>

                <div className="space-y-12">
                    <button onClick={() => { setIsMobileMenuOpen(false); document.getElementById('scan')?.scrollIntoView({ behavior: 'smooth' })}} className="block text-6xl font-black tracking-tighter text-white/20 hover:text-veridian-500">Scanner</button>
                    <button onClick={() => { setIsMobileMenuOpen(false); document.getElementById('history-section')?.scrollIntoView({ behavior: 'smooth' })}} className="block text-6xl font-black tracking-tighter text-white/20 hover:text-veridian-500">History</button>
                </div>

                <div className="mt-auto">
                    {user ? (
                        <div className="p-8 bg-zinc-900 rounded-[40px] border border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-veridian-500 flex items-center justify-center text-white">
                                    <ShieldCheck size={32} />
                                </div>
                                <p className="text-xl font-black truncate max-w-[200px]">{user.email}</p>
                            </div>
                            <button onClick={() => signOut()} className="p-6 bg-red-600/10 text-red-500 rounded-2xl">
                                <LogOut size={24} />
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => { setIsMobileMenuOpen(false); setIsAuthModalOpen(true); }}
                            className="w-full py-8 bg-white text-black rounded-[40px] font-black text-2xl"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
