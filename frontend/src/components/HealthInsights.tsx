"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Activity, ShieldAlert, CheckCircle2, TrendingUp, Zap, Map as MapIcon } from 'lucide-react';
import DiseaseMap from './DiseaseMap';

interface InsightStats {
  totalScans: number;
  criticalCases: number;
  healthyCrops: number;
  preventionRate: number;
}

export default function HealthInsights() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [stats, setStats] = useState<InsightStats>({
    totalScans: 0,
    criticalCases: 0,
    healthyCrops: 0,
    preventionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInsightData();
    }
  }, [user]);

  async function fetchInsightData() {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('disease_status, confidence')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        const total = data.length;
        const critical = data.filter(s => s.disease_status.toLowerCase().includes('blight')).length;
        const healthy = data.filter(s => s.disease_status.toLowerCase().includes('healthy')).length;
        
        setStats({
          totalScans: total,
          criticalCases: critical,
          healthyCrops: healthy,
          preventionRate: total > 0 ? Math.round(((total - critical) / total) * 100) : 0
        });
      }
    } catch (err) {
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
    }
  }

  const cards = [
    { 
        label: t('total_ops'), 
        value: stats.totalScans, 
        icon: Activity, 
        color: "text-blue-500", 
        bg: "bg-blue-500/10",
        desc: t('diagnostic_sessions')
    },
    { 
        label: t('threats_detected'), 
        value: stats.criticalCases, 
        icon: ShieldAlert, 
        color: "text-red-500", 
        bg: "bg-red-500/10",
        desc: t('blight_cases')
    },
    { 
        label: t('resilience_score'), 
        value: `${stats.preventionRate}%`, 
        icon: Zap, 
        color: "text-veridian-500", 
        bg: "bg-veridian-500/10",
        desc: t('health_preservation')
    },
    { 
        label: t('health_index_label'), 
        value: stats.healthyCrops, 
        icon: CheckCircle2, 
        color: "text-emerald-500", 
        bg: "bg-emerald-500/10",
        desc: t('verified_samples')
    }
  ];

  if (!user) return null;

  return (
    <div className="max-w-[1240px] mx-auto px-6 py-20 relative z-10">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-16">
        <div className="space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-500/20">
            {t('systems_audit')}
          </div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none italic uppercase">
            {t('deep_insights').split(' ')[0]} <span className="text-veridian-500">{t('deep_insights').split(' ')[1] || ""}</span>
          </h2>
          <p className="text-white/40 font-bold max-w-xl leading-relaxed uppercase tracking-widest text-sm">
            {t('insights_desc')}
          </p>
        </div>
        
        <div className="p-8 bg-zinc-900 border border-white/5 rounded-[40px] shadow-2xl flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-veridian-500 flex items-center justify-center text-white shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                <TrendingUp size={28} />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{t('weekly_efficiency')}</p>
                <p className="text-3xl font-black italic">+12.4%</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -5, borderColor: 'rgba(255,255,255,0.2)' }}
            className="p-10 bg-zinc-900 border border-white/5 rounded-[48px] shadow-2xl relative overflow-hidden group transition-all"
          >
            <div className={`w-14 h-14 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 transition-transform duration-500`}>
              <card.icon size={28} />
            </div>
            
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2 truncate">{card.label}</p>
            <h4 className="text-5xl font-black italic tracking-tighter mb-4">{loading ? '--' : card.value}</h4>
            <p className="text-[11px] font-bold text-white/40 leading-none">{card.desc}</p>
            
            {/* Ambient Background Glow */}
            <div className={`absolute -bottom-10 -right-10 w-32 h-32 ${card.bg} blur-[60px] rounded-full opacity-50`} />
          </motion.div>
        ))}
      </div>

      {/* 🏙️ ACTION CTA: Open Map */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="mt-12 p-12 bg-veridian-500 rounded-[60px] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(34,197,94,0.3)]"
      >
        <div className="relative z-10 text-center md:text-left">
            <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2 italic">{t('geotagged_map')}</h3>
            <p className="text-white/70 font-bold uppercase tracking-widest text-sm">{t('map_desc')}</p>
        </div>
        <button 
          onClick={() => setIsMapOpen(true)}
          className="relative z-10 px-10 py-5 bg-black text-white rounded-full font-black text-xl flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl group"
        >
            {t('launch_map')}
            <MapIcon size={24} className="group-hover:rotate-12 transition-transform" />
        </button>
        
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />
      </motion.div>

      {/* 🗺️ THE MAP MODAL */}
      <DiseaseMap isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
    </div>
  );
}
