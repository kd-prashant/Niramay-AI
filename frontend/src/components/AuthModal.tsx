"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sprout, ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 🛠️ USERID FIX: Automatically append dummy domain if no @ found
      const finalEmail = email.includes('@') ? email : `${email}@niramay.ai`;

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: finalEmail, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email: finalEmail, password });
        if (error) throw error;
        alert("Account Created! You can now log in with your Farmer ID.");
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center px-6"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, y: 20, rotate: -2 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-[500px] bg-zinc-900 border border-white/10 rounded-[60px] p-12 md:p-16 shadow-[0_50px_100px_rgba(0,0,0,1)] relative z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="text-center mb-12">
                <div className="w-20 h-20 rounded-[30px] bg-veridian-500 flex items-center justify-center text-white mx-auto mb-8 shadow-2xl">
                    <Sprout size={40} />
                </div>
                <h2 className="text-4xl font-black tracking-tighter mb-4 italic uppercase">
                    {isLogin ? "Welcome Back" : "Join the Field"}
                </h2>
                <p className="text-white/30 text-xs font-black uppercase tracking-[0.3em]">
                    Niramay Secure Gateway
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-6">
                <div className="space-y-4">
                    <div className="relative group">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-veridian-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Farmer ID (e.g. farmer1)"
                            className="w-full bg-white/5 border border-white/10 py-6 pl-14 pr-6 rounded-3xl outline-none focus:border-veridian-500/50 transition-all font-bold text-white placeholder:text-white/10"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-veridian-500 transition-colors" size={20} />
                        <input 
                            type="password" 
                            placeholder="Security Key"
                            className="w-full bg-white/5 border border-white/10 py-6 pl-14 pr-6 rounded-3xl outline-none focus:border-veridian-500/50 transition-all font-bold text-white placeholder:text-white/10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-600/10 border border-red-600/20 rounded-2xl text-red-500 text-[10px] font-black uppercase text-center tracking-widest">
                        {error}
                    </div>
                )}

                <button 
                    disabled={loading}
                    className="w-full py-7 bg-white text-black font-black text-xl rounded-[30px] shadow-2xl hover:bg-veridian-500 hover:text-white active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : isLogin ? "Authorize Access" : "Establish Link"}
                    {!loading && <ArrowRight size={24} />}
                </button>
            </form>

            {/* Footer */}
            <div className="mt-12 text-center">
                <p className="text-white/20 text-[11px] font-bold mb-4 uppercase tracking-[0.2em]">
                    {isLogin ? "New to the platform?" : "Already have access?"}
                </p>
                <button 
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-veridian-500 font-black text-sm uppercase tracking-[0.2em] hover:opacity-80 transition-opacity"
                >
                    {isLogin ? "Sign Up Now" : "Sign In Here"}
                </button>
            </div>

            {/* Decoration */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-veridian-500/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute top-8 right-8">
                <button onClick={onClose} className="p-4 rounded-full bg-white/5 text-white/20 hover:text-white">
                    <X size={20} />
                </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
