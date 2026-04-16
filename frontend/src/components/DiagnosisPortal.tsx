"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, X, ShieldCheck, Microscope,
  CheckCircle2, Sprout,
  Activity, ArrowRight,
  CloudRain, MapPin, Search
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function DiagnosisPortal({ onDiagnosis }: { onDiagnosis?: (disease: string) => void }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showError, setShowError] = useState(false);

  // 🌦️ WEATHER & GEO STATE
  const [location, setLocation] = useState<string>("Detecting...");
  const [coords, setCoords] = useState<{lat: number, lon: number} | null>(null);
  const [weatherData, setWeatherData] = useState({ temp: '--', humidity: 0, condition: '--' });
  const [riskLevel, setRiskLevel] = useState<string>("Normal");

  React.useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lon: longitude });
        const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

        try {
          const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
          const data = await res.json();

          setLocation(data.name || "Global");
          setWeatherData({
            temp: Math.round(data.main.temp).toString(),
            humidity: data.main.humidity,
            condition: data.weather[0].main
          });

          // 🔬 SMART RISK LOGIC: High humidity = High blight risk
          if (data.main.humidity > 80) setRiskLevel("HIGH RISK");
          else if (data.main.humidity > 60) setRiskLevel("MONITOR");
          else setRiskLevel("LOW RISK");

        } catch (error) {
          console.error("Weather fetch failed", error);
          setLocation("Manual Set");
        }
      });
    }
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const startScan = async () => {
    if (!image) return;
    setIsScanning(true);
    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Backend connection failed");

      const data = await response.json();

      if (data.success) {
        // 🔒 CONFIDENCE GUARD (UNIVERSAL FIX)
        if (data.prediction.confidence < 80) {
           setShowError(true);
           setResult(null);
           setIsScanning(false);
           return;
        }

        const scanResult = {
          prediction: {
            common_name: data.prediction.common_name,
            class_name: data.prediction.class_name,
            confidence: data.prediction.confidence,
            severity: data.prediction.severity
          },
          recommendations: {
            treatment: data.recommendations.treatment,
            prevention: data.recommendations.prevention
          }
        };

        setResult(scanResult);
        setShowError(false);
        if (onDiagnosis) onDiagnosis(data.prediction.common_name);

        // 💾 PERSIST TO SUPABASE (Matching your specific table columns)
        try {
          const { error } = await supabase.from('scans').insert([{
            disease_status: data.prediction.class_name,
            plant_name: data.prediction.common_name,
            confidence: data.prediction.confidence,
            image_url: "", // Placeholder as images are stored locally for now
            user_id: user?.id, // Link scan to the authenticated user
            latitude: coords?.lat,
            longitude: coords?.lon
          }]);
          
          if (error) {
            console.error("Supabase Sync Error:", error.message);
          } else {
            console.log("✓ Scan saved successfully to your database.");
          }
        } catch (dbError) {
          console.error("Critical: Database sync failed:", dbError);
        }
      }
    } catch (error) {
      console.error("Scan error:", error);
      alert("Verification Failed: Please ensure your AI Backend is running on port 8000.");
    } finally {
      setIsScanning(false);
    }
  };

  const historyItems = [
    { date: "SEP 15", plant: "POTATO", status: "RECOVERED", color: "bg-veridian-500" },
    { date: "SEP 05", plant: "TOMATO", status: "EARLY BLIGHT", color: "bg-red-500" },
    { date: "OCT 24", plant: "TOMATO", status: "HEALTHY", color: "bg-veridian-500" },
    { date: "NOV 12", plant: "POTATO", status: "MONITORING", color: "bg-amber-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="max-w-[1240px] mx-auto px-6 py-10 relative z-10"
    >

      {/* 🏙️ SECTION HEADER */}
      <div className="mb-12 md:mb-24 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-veridian-500/10 text-veridian-500 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] mb-4 md:mb-6 border border-veridian-500/20">Health Analytics</div>
        <h2 className="text-4xl md:text-8xl font-black tracking-tighter leading-none mb-6 md:mb-8">{t('diag_title')}</h2>
        <p className="max-w-2xl mx-auto text-base md:text-xl text-white/40 font-bold leading-relaxed">{t('diag_p')}</p>
      </div>

      {/* 🌦️ SMART ADVISORY BAR */}
      <div className="mb-12 md:mb-20 overflow-x-auto pb-6 md:pb-0 scrollbar-hide snap-x snap-mandatory">
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 items-center p-6 md:p-8 bg-zinc-900 shadow-2xl rounded-[30px] md:rounded-[40px] border border-white/5 cursor-pointer min-w-max md:min-w-0"
        >
          <div className="flex items-center gap-4 px-4 snap-center">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-veridian-500/10 flex items-center justify-center text-veridian-500 border border-veridian-500/20">
              <MapPin size={22} className="md:size-[24px]" />
            </div>
            <div>
              <span className="block text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-30 mb-1">{t('Live Location')}</span>
              <span className="text-sm md:text-lg font-black text-white whitespace-nowrap">{location}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 px-4 md:border-l border-white/5 snap-center">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
              <CloudRain size={22} className="md:size-[24px]" />
            </div>
            <div>
              <span className="block text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-30 mb-1">{t('Blight Advisory')}</span>
              <span className={`text-sm md:text-lg font-black whitespace-nowrap ${riskLevel === 'HIGH RISK' ? 'text-red-500' : 'text-blue-500'}`}>{t(riskLevel)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 px-4 md:border-l border-white/5 snap-center">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <Activity size={22} className="md:size-[24px] animate-pulse" />
            </div>
            <div>
              <span className="block text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-30 mb-1">{t('Air Moisture')}</span>
              <span className="text-sm md:text-lg font-black text-emerald-500 uppercase whitespace-nowrap">{weatherData.humidity}% RH</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-start mb-20 md:mb-60">

        {/* Left Side: The Instrument */}
        <div className="relative">
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="p-1.5 rounded-[50px] bg-zinc-900 border border-white/10 shadow-2xl relative z-10"
          >
            <div className="bg-black rounded-[45px] p-2 aspect-square relative overflow-hidden flex items-center justify-center">

              {preview ? (
                <>
                  <motion.img
                    layoutId="main-image"
                    src={preview}
                    className="w-full h-full object-cover rounded-[38px] opacity-80"
                  />
                  {isScanning && (
                    <div className="absolute inset-0 z-20 pointer-events-none">
                      <motion.div
                        initial={{ top: "-10%" }}
                        animate={{ top: "110%" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-1 bg-veridian-500 shadow-[0_0_20px_rgba(34,197,94,1)] blur-[2px]"
                      />
                    </div>
                  )}
                  <button
                    onClick={() => { setPreview(null); setImage(null); setResult(null); }}
                    className="absolute top-8 right-8 p-5 bg-black/60 backdrop-blur-2xl rounded-full text-white z-30 border border-white/10 active:scale-90 transition-all"
                  >
                    <X size={24} />
                  </button>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center h-full w-full cursor-pointer hover:bg-white/5 transition-all duration-700 rounded-[38px]">
                  <div className="w-28 h-28 rounded-full bg-veridian-500/5 flex items-center justify-center text-veridian-500 mb-8 border border-veridian-500/10 transition-all">
                    <Upload size={40} />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black tracking-tighter mb-2">{t('drop_leaf')}</h3>
                  <p className="text-white/20 font-black uppercase tracking-widest text-[11px]">Sensor v2.0</p>
                  <input type="file" className="hidden" onChange={onFileChange} accept="image/*" />
                </label>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Side: Analysis */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {!result && !isScanning && !showError && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-2 gap-6"
              >
                {[
                  { icon: Activity, label: t('neural'), color: "text-blue-500" },
                  { icon: Sprout, label: t('multicrop'), color: "text-veridian-500" },
                  { icon: Search, label: t('expert'), color: "text-purple-500" },
                  { icon: ShieldCheck, label: t('precision'), color: "text-emerald-500" },
                ].map((feat, idx) => (
                  <motion.div
                    key={idx}
                    whileTap={{ scale: 0.95 }}
                    className="p-10 bg-zinc-900 border border-white/5 rounded-[40px] flex flex-col gap-6"
                  >
                    <feat.icon className={feat.color} size={36} />
                    <span className="font-black text-[11px] uppercase tracking-[0.2em] text-white/40 leading-none">{feat.label}</span>
                  </motion.div>
                ))}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={startScan}
                  disabled={!image}
                  className={`col-span-2 py-8 rounded-[35px] font-black text-2xl transition-all flex items-center justify-center gap-4 shadow-2xl ${!image ? 'bg-zinc-800 text-white/20' : 'bg-white text-black active:bg-veridian-500 active:text-white'
                    }`}
                >
                  {image ? t('scan_btn') : "Select Leaf"}
                  <ArrowRight size={28} />
                </motion.button>
              </motion.div>
            )}

            {isScanning && (
              <motion.div key="scanning" className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-full border-[6px] border-veridian-500 border-t-transparent animate-spin mb-10" />
                <h2 className="text-4xl font-black tracking-tighter text-white">Analyzing Bio-Systems...</h2>
              </motion.div>
            )}

            {showError && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-10 md:p-14 bg-red-600/10 border border-red-600/20 rounded-[50px] text-center space-y-8"
              >
                <div className="w-24 h-24 rounded-full bg-red-600/20 flex items-center justify-center mx-auto text-red-600">
                   <X size={48} />
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-black tracking-tighter text-white">{t('INVALID_SAMPLE')}</h2>
                  <p className="text-white/40 font-bold leading-relaxed">{t('INVALID_DESC')}</p>
                </div>
                <button 
                  onClick={() => {
                    setShowError(false);
                    setResult(null);
                    setPreview(null);
                    setImage(null);
                  }}
                  className="w-full py-6 rounded-3xl bg-white text-black font-black text-xl hover:bg-red-600 hover:text-white transition-all shadow-xl"
                >
                  {t('RETRY_SCAN')}
                </button>
              </motion.div>
            )}

            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className={`p-10 rounded-[50px] transition-all duration-700 ${result.prediction.severity === 'None' ? 'bg-veridian-600' :
                    result.prediction.severity === 'Critical' ? 'bg-red-600 shadow-[0_40px_100px_rgba(239,68,68,0.4)]' : 'bg-amber-600 shadow-[0_40px_100px_rgba(245,158,11,0.4)]'
                  } text-white`}>
                  <h2 className="text-4xl md:text-5xl font-black mb-3 tracking-tighter leading-none">{t(result.prediction.common_name)}</h2>
                  <p className="text-sm opacity-60 font-black uppercase tracking-widest mb-10">{result.prediction.class_name}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/10 rounded-3xl p-8 border border-white/10 text-center">
                      <span className="block text-4xl font-black">{result.prediction.confidence}%</span>
                      <span className="text-[10px] uppercase font-black opacity-40">{t('confidence')}</span>
                    </div>
                    <div className="bg-black/10 rounded-3xl p-8 border border-white/10 text-center">
                      <span className="block text-4xl font-black">{t(result.prediction.severity)}</span>
                      <span className="text-[10px] uppercase font-black opacity-40">{t('severity')}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-10 bg-zinc-900 rounded-[50px] border border-white/10 shadow-xl">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-blue-500">{t('treatment_title')}</h4>
                    <div className="flex flex-wrap gap-3">
                      {result.recommendations.treatment.medicines.map((m: string, i: number) => (
                        <span key={i} className="px-5 py-3 bg-black text-white text-[10px] font-black rounded-2xl border border-white/10">{t(m)}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-12 bg-white text-black rounded-[50px] shadow-2xl">
                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-8 text-veridian-600">{t('action_plan_title')}</h4>
                    <div className="space-y-6">
                      {result.recommendations.treatment.action_plan.map((step: string, i: number) => {
                        // Strip "1. ", "2. ", etc. from the start of the message if they exist
                        const cleanStep = step.replace(/^\d+\.\s*/, '');
                        return (
                          <div key={i} className="flex gap-6 items-start">
                            <span className="text-veridian-600 font-black text-2xl leading-none">{i + 1}</span>
                            <p className="text-sm font-bold text-black/60 leading-relaxed italic">{t(cleanStep)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 🚀 INFINITE MARQUEE */}
      <div className="mt-0 mb-5 overflow-hidden relative">
        <div className="max-w-[1240px] mx-auto px-6 mb-6">
          <h3 className="text-5xl md:text-7xl font-black tracking-tighter mb-2">{t('history')}</h3>
          <p className="text-white/40 text-sm font-black uppercase tracking-[0.3em] font-mono">REAL-TIME ARCHIVE DRIFT</p>
        </div>

        {/* Fading Mask Container */}
        <div
          className="relative py-12 pause-on-hover"
          style={{ maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}
        >
          <div className="flex gap-4 md:gap-6 w-fit animate-marquee">
            {[...historyItems, ...historyItems, ...historyItems].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{
                  scale: 1.05,
                  borderColor: "rgba(34, 197, 94, 0.6)",
                  boxShadow: "0 0 40px rgba(34, 197, 94, 0.2)",
                  backgroundColor: "rgba(24, 24, 27, 1)"
                }}
                whileTap={{ scale: 0.95 }}
                className="min-w-[280px] md:min-w-[360px] p-8 md:p-10 bg-zinc-900 rounded-[40px] border border-white/10 transition-all shadow-2xl overflow-hidden cursor-pointer group"
              >
                <div className="flex justify-between items-center mb-10">
                  <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white/60 group-hover:text-white transition-colors">{item.date}</span>
                  <div className={`px-4 py-1.5 rounded-full ${item.color} text-white font-black text-[9px] uppercase tracking-widest shadow-lg`}>{item.status}</div>
                </div>
                <h4 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-white uppercase group-hover:text-veridian-500 transition-colors">{item.plant}</h4>
                <div className="flex items-center gap-3 text-veridian-500/80">
                  <Activity size={14} className="animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em]">LIVE TELEMETRY</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

    </motion.div>
  );
}
