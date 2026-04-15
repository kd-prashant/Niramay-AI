"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Trash2, ChevronRight, Activity, Sprout, Lock } from 'lucide-react';

interface ScanRecord {
  id: number;
  created_at: string;
  disease_status: string;
  plant_name: string;
  confidence: number;
  image_url: string;
}

export default function HistoryDashboard() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHistory();
      const interval = setInterval(fetchHistory, 5000); 
      return () => clearInterval(interval);
    } else {
      setScans([]);
      setLoading(false);
    }
  }, [user]);

  async function fetchHistory() {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user.id) // Filter by the logged-in user!
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      setScans(data || []);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  }

  const getSeverityColor = (confidence: number) => {
    if (confidence > 90) return 'text-red-500 bg-red-500/10';
    if (confidence > 70) return 'text-orange-500 bg-orange-500/10';
    return 'text-green-500 bg-green-500/10';
  };

  return (
    <div id="history-section" className="max-w-[1200px] mx-auto px-6 py-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
            {t('FARM_RECORDS')}
          </h2>
          <p className="text-white/40 text-lg md:text-xl font-bold uppercase tracking-widest">
            {t('LATEST_UPDATES')}
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-veridian-500/20 flex items-center justify-center text-veridian-500">
                <Activity size={24} />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Global Health Status</p>
                <p className="font-black text-xl">PROACTIVE</p>
            </div>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-veridian-500/30 border-t-veridian-500 rounded-full animate-spin" />
        </div>
      ) : !user ? (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-96 flex flex-col items-center justify-center text-center bg-white/5 border border-white/10 rounded-[60px] p-12 relative overflow-hidden group hover:border-veridian-500/30 transition-all"
        >
          <div className="relative z-10">
            <div className="w-24 h-24 rounded-full bg-veridian-500/10 flex items-center justify-center text-veridian-500 mb-8 mx-auto group-hover:scale-110 transition-transform duration-500">
                <Lock size={40} />
            </div>
            <h3 className="text-3xl font-black tracking-tighter mb-4 italic">FARM RECORDS SECURED</h3>
            <p className="text-white/40 font-bold max-w-md mx-auto leading-relaxed mb-10">
                Please authentication to access your private diagnostic history and management records.
            </p>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-veridian-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-veridian-500/5 blur-[100px] rounded-full" />
        </motion.div>
      ) : scans.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center bg-white/5 border border-dashed border-white/10 rounded-[40px]">
          <Sprout className="text-white/10 mb-4" size={48} />
          <p className="text-white/20 font-bold text-xl">{t('NO_SCANS')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {scans.map((scan, index) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={scan.id}
              className="group relative bg-white/5 hover:bg-white/[0.08] border border-white/10 rounded-[32px] p-6 flex flex-col md:flex-row items-center gap-8 transition-all overflow-hidden"
            >
              {/* IMAGE HOVER EFFECT */}
              <div className="w-full md:w-32 h-32 rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden flex-shrink-0">
                <div className="w-full h-full bg-veridian-500/5 flex items-center justify-center">
                    <Sprout className="text-veridian-500/20" size={40} />
                </div>
              </div>

              <div className="flex-grow space-y-2 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <h4 className="text-2xl font-black tracking-tight">{t(scan.plant_name) || scan.plant_name}</h4>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getSeverityColor(scan.confidence)}`}>
                    {scan.confidence}% CONFIDENCE
                  </span>
                </div>
                <p className="text-white/40 font-bold uppercase tracking-widest text-sm italic">
                  {t(scan.disease_status) || scan.disease_status.replace(/___/g, ' ').replace(/_/g, ' ')}
                </p>
              </div>

              <div className="flex flex-col items-center md:items-end gap-3 flex-shrink-0">
                <div className="flex items-center gap-2 text-white/30">
                  <Calendar size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {new Date(scan.created_at).toLocaleDateString(language === 'HI' ? 'hi-IN' : 'en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <button className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-veridian-500 hover:text-white transition-all">
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* GLASS DECORATION */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-veridian-500/10 blur-[60px] rounded-full pointer-events-none" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
