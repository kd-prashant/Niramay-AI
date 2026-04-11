"use client";

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import DiagnosisPortal from "@/components/DiagnosisPortal";
import { MoveRight, Zap, ShieldCheck, Globe, Play } from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';

function BackgroundImage({ src, y, opacity, scale, rotate, left, top, width = "600px" }: any) {
  return (
    <motion.div
      style={{
        y,
        opacity,
        scale,
        rotate,
        left,
        top,
        width,
        height: "auto",
        aspectRatio: "1/1.2",
        position: 'absolute',
        zIndex: -20
      }}
      className="pointer-events-none rounded-[80px] overflow-hidden border border-white/5 shadow-[0_50px_100px_rgba(0,0,0,1)] bg-zinc-900/20"
    >
      <img src={src} className="w-full h-full object-cover brightness-[0.5] contrast-125 grayscale hover:grayscale-0 transition-all duration-1000" alt="" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
    </motion.div>
  );
}

export default function Home() {
  const { t } = useLanguage();
  const { scrollYProgress } = useScroll();

  const artY = useTransform(scrollYProgress, [0, 1], [0, -600]);
  const img1Y = useTransform(scrollYProgress, [0, 0.5], [200, -200]);
  const img1Op = useTransform(scrollYProgress, [0.1, 0.25, 0.45], [0, 0.4, 0]);
  const img2Y = useTransform(scrollYProgress, [0.2, 0.7], [300, -300]);
  const img2Op = useTransform(scrollYProgress, [0.3, 0.5, 0.65], [0, 0.4, 0]);
  const img3Y = useTransform(scrollYProgress, [0.5, 1], [300, -300]);
  const img3Op = useTransform(scrollYProgress, [0.6, 0.8, 0.95], [0, 0.4, 0]);

  return (
    <div className="flex flex-col min-h-screen bg-black selection:bg-veridian-500 selection:text-white overflow-x-hidden">

      {/* 🏙️ IMMERSIVE HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden">

        <div className="absolute inset-0 -z-30 bg-black">
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.3 }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="w-full h-full"
          >
            <img src="/veridian_hero_bg_1775820090106.png" className="w-full h-full object-cover" alt="" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        </div>

        <BackgroundImage src="/media__1775821511761.png" y={img1Y} opacity={img1Op} scale={1.1} rotate={-4} left="-10%" top="115%" width="700px" />
        <BackgroundImage src="/media__1775821522197.png" y={img2Y} opacity={img2Op} scale={1.05} rotate={6} left="75%" top="220%" width="800px" />
        <BackgroundImage src="/media__1775821439475.png" y={img3Y} opacity={img3Op} scale={1.2} rotate={-2} left="-5%" top="360%" width="750px" />

        <motion.div
          style={{
            y: artY,
            maskImage: 'radial-gradient(circle at center, black 25%, transparent 75%)'
          }}
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 opacity-[0.25] w-[1400px] h-[1400px] pointer-events-none"
        >
          <img src="/agri_line_art_bg_1775821778626.png" className="w-full h-full object-contain" alt="" />
        </motion.div>

        <div className="max-w-[1400px] mx-auto px-6 text-center z-10">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 text-white text-[10px] font-black tracking-[0.5em] uppercase mb-10 shadow-2xl">
              <span className="w-2 h-2 rounded-full bg-veridian-500 animate-pulse shadow-[0_0_15px_rgba(34,197,94,1)]" />
              {t('tagline')}
            </div>

            <h1 className="text-[15vw] md:text-[10rem] font-black text-white tracking-[-0.07em] leading-[0.82] mb-6 md:mb-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              {t('hero_title')} <br />
              <span className="text-veridian-500">{t('hero_green')}</span>
            </h1>

            <p className="max-w-6xl mx-auto text-base md:text-2xl text-white/30 font-bold tracking-tight mb-8 md:mb-12 text-balance leading-relaxed">
              {t('hero_p')}
            </p>
            <p className="text-veridian-500/60 text-[10px] md:text-xl font-black uppercase tracking-[0.5em] mb-8 md:mb-8 text-center w-full">
              Healing the earth, one leaf at a Time
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-8">
              <button
                onClick={() => document.getElementById('scan')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-6 py-3 md:px-10 md:py-4.5 bg-white text-black rounded-full font-black text-base md:text-lg hover:bg-veridian-500 hover:text-white hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-4 group"
              >
                {t('scan_btn')} <MoveRight size={20} className="md:size-[22px] group-hover:translate-x-3 transition-transform" />
              </button>
              <button className="flex items-center gap-4 md:gap-6 text-white font-black text-base md:text-xl hover:text-veridian-400 transition-colors group">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all shadow-2xl">
                  <Play size={20} className="md:size-[24px]" fill="currentColor" />
                </div>
                {t('watch_film')}
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 4, repeat: Infinity }} className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="w-px h-20 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>
      </section>

      {/* 🚀 ZONE 1: HISTORY + VALUE PROP */}
      <section className="relative overflow-hidden z-10">
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none"
          style={{ maskImage: 'radial-gradient(circle at center, black 40%, transparent 90%)' }}>
          <img
            src="/scientific_agri_history_doodle_1775828844003.png"
            className="w-full h-full object-cover"
            alt=""
          />
        </div>

        {/* 🔬 SCANNER SECTION */}
        <section id="scan" className="py-10 relative z-10">
          <DiagnosisPortal />
        </section>

        {/* 📊 VALUE PROPOSITION SECTION */}
        <section className="py-20 md:py-40 border-y border-white/5 relative z-10">
          <div className="max-w-[1240px] mx-auto px-6 overflow-x-auto flex pb-10 md:pb-0 md:grid md:grid-cols-3 gap-16 md:gap-32 snap-x snap-mandatory scrollbar-hide">
            <div className="min-w-[85vw] md:min-w-0 space-y-8 md:space-y-12 group snap-center">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-[35px] md:rounded-[45px] bg-veridian-500/10 flex items-center justify-center text-veridian-500 group-hover:bg-veridian-500 group-hover:text-white transition-all duration-700 shadow-2xl border border-veridian-500/20">
                <Zap size={40} className="md:size-[56px]" />
              </div>
              <h3 className="text-4xl md:text-6xl font-black tracking-tight">{t('rapid_ai') || 'Rapid AI'}</h3>
              <p className="text-white/50 text-xl md:text-2xl font-bold leading-relaxed">Biological assessments in under 2 seconds. Clinical precision in every hand.</p>
              <p className="text-veridian-500/40 text-[10px] md:text-base font-black uppercase tracking-[0.4em] mt-8 md:mt-16">
                Healing the earth, one leaf at a Time
              </p>
            </div>

            <div className="min-w-[85vw] md:min-w-0 space-y-8 md:space-y-12 group snap-center">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-[35px] md:rounded-[45px] bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-700 shadow-2xl border border-blue-500/20">
                <ShieldCheck size={40} className="md:size-[56px]" />
              </div>
              <h3 className="text-4xl md:text-6xl font-black tracking-tight">{t('protected') || 'Protected'}</h3>
              <p className="text-white/50 text-xl md:text-2xl font-bold leading-relaxed">Edge-computing ensures your data never leaves your field. Safe. Private. Secure.</p>
            </div>

            <div className="min-w-[85vw] md:min-w-0 space-y-8 md:space-y-12 group snap-center">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-[35px] md:rounded-[45px] bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all duration-700 shadow-2xl border border-purple-500/20">
                <Globe size={40} className="md:size-[56px]" />
              </div>
              <h3 className="text-4xl md:text-6xl font-black tracking-tight">{t('global') || 'Global'}</h3>
              <p className="text-white/50 text-xl md:text-2xl font-bold leading-relaxed">Built to work in low-connectivity areas from India to the world.</p>
            </div>
          </div>
        </section>
      </section>

      {/* 👋 ZONE 2: CALL TO ACTION + FOOTER BACKGROUND */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 bg-transparent relative z-10">
        <h2 className="text-[12vw] md:text-[8vw] font-black tracking-tighter mb-12 md:mb-20 leading-[0.8] relative z-10">{t('brand')}. <br /> <span className="text-white/15 uppercase">Farming evolved.</span></h2>
        <button
          onClick={() => document.getElementById('scan')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-8 py-4 md:px-16 md:py-7 bg-white text-black rounded-full font-black text-lg md:text-xl hover:bg-veridian-500 hover:text-white hover:scale-105 active:scale-95 transition-all shadow-2xl relative z-10"
        >
          {t('scan_btn')}
        </button>
      </section>

    </div>
  );
}
