"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { X, Mail, Lock, ArrowRight, Github, Loader2, Leaf } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 💡 IDENTITY TRICK: Using a more standard system domain pattern
    const sanitizedId = email.trim().toLowerCase().replace(/\s+/g, '');
    const systemEmail = `${sanitizedId}@farm.niramay.com`;

    try {
      const { error } = isLogin 
        ? await supabase.auth.signInWithPassword({ email: systemEmail, password })
        : await supabase.auth.signUp({ email: systemEmail, password });

      if (error) throw error;
      onClose();
    } catch (err: any) {
      // Clean up error messages for the user
      const message = err.message === "User already registered" 
        ? "Farmer ID already exists. Please choose another."
        : err.message === "Invalid login credentials"
        ? "Incorrect Farmer ID or Security Credential."
        : err.message;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[48px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]"
        >
          {/* Top Visual Decor */}
          <div className="h-32 bg-veridian-500/20 relative flex items-center justify-center overflow-hidden">
             <Leaf className="text-veridian-500/40 rotate-12" size={80} />
             <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
          </div>

          <button onClick={onClose} className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all">
            <X size={20} />
          </button>

          <div className="p-10 md:p-14">
            <div className="mb-10 text-center">
              <h2 className="text-4xl font-black tracking-tighter mb-3">
                {isLogin ? 'Welcome Back' : 'Join Niramay AI'}
              </h2>
              <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
                {isLogin ? 'Authorized Personnel Only' : 'Start protecting your farm today'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-veridian-500 transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Farmer ID (Unique Username)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 focus:border-veridian-500/50 rounded-[24px] py-6 pl-16 pr-6 outline-none transition-all font-bold text-white placeholder:text-white/10"
                    required
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-veridian-500 transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Security Credential"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 focus:border-veridian-500/50 rounded-[24px] py-6 pl-16 pr-6 outline-none transition-all font-bold text-white placeholder:text-white/10"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-[10px] font-black uppercase text-center tracking-widest leading-loose">
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 rounded-[24px] bg-veridian-500 text-white font-black text-lg hover:bg-veridian-400 transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_-10px_rgba(34,197,94,0.3)] disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : (isLogin ? 'Unlock Portal' : 'Create Account')}
                {!loading && <ArrowRight size={24} />}
              </button>
            </form>

            <div className="mt-10 pt-10 border-t border-white/5 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                type="button"
                className="text-white/30 hover:text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all"
              >
                {isLogin ? "Don't have an ID? Construct one" : "Already registered? Authenticate"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
