"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Activity, ShieldAlert, CheckCircle2, TrendingUp, Zap, Map as MapIcon, Thermometer, Droplets, Wind, AlertTriangle } from 'lucide-react';
import DiseaseMap from './DiseaseMap';
import { useWeather } from '@/hooks/useWeather';

interface InsightStats {
  totalScans: number;
  criticalCases: number;
  healthyCrops: number;
  preventionRate: number;
}

export default function HealthInsights() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const weather = useWeather();
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [stats, setStats] = useState<InsightStats>({
    totalScans: 0,
    criticalCases: 0,
    healthyCrops: 0,
    preventionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [nearbyThreat, setNearbyThreat] = useState<{ count: number, disease: string } | null>(null);

  // 🌍 GEOSPATIAL RADIUS LOGIC: Calculate Distance (Haversine)
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
  };

  useEffect(() => {
    if (user) {
      fetchInsightData();
      const interval = setInterval(fetchInsightData, 5000); 
      return () => clearInterval(interval);
    }
  }, [user]);

  // 🔔 PROXIMITY SCAN: Check for nearby infections
  useEffect(() => {
    if (weather.location !== 'Searching...' && !weather.loading) {
        checkNearbyThreats();
    }
  }, [weather]);

  async function checkNearbyThreats() {
    try {
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
        const { data, error } = await supabase
            .from('scans')
            .select('latitude, longitude, disease_status')
            .not('latitude', 'is', null)
            .gt('created_at', fortyEightHoursAgo)
            .ilike('disease_status', '%blight%');

        if (error) throw error;

        if (data && data.length > 0 && weather.lat && weather.lng) {
            const detected = data.filter(scan => {
                const dist = getDistance(weather.lat!, weather.lng!, scan.latitude, scan.longitude);
                return dist < 5; // 5km radius
            });

            if (detected.length > 0) {
                setNearbyThreat({ count: detected.length, disease: detected[0].disease_status });
            }
        }
    } catch (err) {
        console.error("Proximity Check Error:", err);
    }
  }

  const calculateBlightRisk = () => {
    if (weather.loading) return { label: 'Analyzing...', color: 'text-white/40', bg: 'bg-white/5' };
    const isHighHumidity = weather.humidity > 80;
    const isOptimalTemp = weather.temp >= 15 && weather.temp <= 25;
    if (isHighHumidity && isOptimalTemp) return { label: t('HIGH RISK'), color: 'text-red-500', bg: 'bg-red-500/10' };
    if (isHighHumidity || isOptimalTemp) return { label: t('MEDIUM RISK'), color: 'text-orange-500', bg: 'bg-orange-500/10' };
    return { label: t('LOW RISK'), color: 'text-veridian-500', bg: 'bg-veridian-500/10' };
  };

  const risk = calculateBlightRisk();

  async function fetchInsightData() {
    if (!user?.id) return;
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
      
      {/* 🚨 ACTIVE THREAT ALERT BANNER (PHASE 4) */}
      <AnimatePresence>
          {nearbyThreat && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8 p-6 bg-red-600 rounded-3xl border border-red-400 shadow-[0_20px_50px_rgba(220,38,38,0.3)] flex flex-col md:flex-row items-center justify-between gap-6"
              >
                  <div className="flex items-center gap-4 text-center md:text-left">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 animate-pulse">
                          <AlertTriangle size={28} />
                      </div>
                      <div>
                          <h4 className="text-white font-black uppercase tracking-tighter text-xl">Threat Nearby: Outbreak Detected!</h4>
                          <p className="text-white/80 font-bold text-xs uppercase tracking-widest">
                            {nearbyThreat.count} critical cases of {nearbyThreat.disease} reported within 5KM of your farm!
                          </p>
                      </div>
                  </div>
                  <button 
                    onClick={() => setIsMapOpen(true)}
                    className="px-8 py-3 bg-white text-red-600 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-black hover:text-white transition-all shadow-xl"
                  >
                      Locate Threats on Map
                  </button>
              </motion.div>
          )}
      </AnimatePresence>
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

      {/* 🌪️ ENVIRONMENTAL TELEMETRY HUD (PHASE 4) */}
      <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 bg-zinc-900 border border-white/5 rounded-[40px] flex items-center justify-between group overflow-hidden relative">
              <div className="flex items-center gap-6 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/20">
                      <Thermometer size={24} />
                  </div>
                  <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{t('local_temp')}</p>
                      <h5 className="text-3xl font-black italic">{weather.loading ? '--' : `${weather.temp}°C`}</h5>
                  </div>
              </div>
              <div className="text-right relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-veridian-500 mb-1">{weather.condition}</p>
                  <p className="text-xs font-bold text-white/20">{weather.location}</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="p-8 bg-zinc-900 border border-white/5 rounded-[40px] flex items-center justify-between group overflow-hidden relative">
              <div className="flex items-center gap-6 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                      <Droplets size={24} />
                  </div>
                  <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{t('air_moisture')}</p>
                      <h5 className="text-3xl font-black italic">{weather.loading ? '--' : `${weather.humidity}%`}</h5>
                  </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className={`p-8 border border-white/5 rounded-[40px] flex items-center justify-between group overflow-hidden relative ${risk.bg} transition-colors duration-700`}
          >
              <div className="flex items-center gap-6 relative z-10">
                  <div className={`w-12 h-12 rounded-2xl bg-white/10 ${risk.color} flex items-center justify-center border border-white/10`}>
                      <AlertTriangle size={24} />
                  </div>
                  <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{t('blight_advisory')}</p>
                      <h5 className={`text-2xl font-black italic uppercase ${risk.color}`}>{risk.label}</h5>
                  </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-20" />
          </motion.div>
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
