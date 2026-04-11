"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'EN' | 'HI';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

const translations: Translations = {
  brand: { EN: "Niramay AI", HI: "निरामय AI" },
  tagline: { EN: "HEALTHY PLANTS, FLOURISHING HARVEST.", HI: "स्वस्थ पौधे, समृद्ध फसल।" },
  hero_title: { EN: "The future of", HI: "खेती का भविष्य" },
  hero_green: { EN: "farming starts here.", HI: "यहाँ से शुरू होता है।" },
  hero_p: { EN: "Niramay AI uses advanced clinical-grade bio-neural networks to protect your crops. Empowering every farmer with high-tech certainty.", HI: "निरामय AI आपकी फसलों की सुरक्षा के लिए उन्नत क्लिनिकल-ग्रेड बायो-न्यूरल नेटवर्क का उपयोग करता है। हर किसान को हाई-टेक निश्चितता के साथ सशक्त बनाना।" },
  scan_btn: { EN: "Protect My Crop", HI: "मेरी फसल सुरक्षित करें" },
  watch_film: { EN: "About Niramay", HI: "निरामय के बारे में" },
  diag_title: { EN: "Diagnostic Portal", HI: "नैदानिक पोर्टल" },
  diag_p: { EN: "Upload a photo of your leaf for real-time biological assessment and treatment plan.", HI: "वास्तविक समय के जैविक मूल्यांकन और उपचार योजना के लिए अपनी पत्ती का एक फोटो अपलोड करें।" },
  drop_leaf: { EN: "Drop a Leaf Photo", HI: "पत्ती का फोटो यहाँ डालें" },
  neural: { EN: "NEURAL ENGINE", HI: "न्यूरल इंजन" },
  multicrop: { EN: "MULTI-CROP AI", HI: "मल्टी-क्रॉप AI" },
  expert: { EN: "EXPERT REVIEW", HI: "विशेषज्ञ समीक्षा" },
  precision: { EN: "PRECISION SCAN", HI: "सटीक स्कैन" },
  conf: { EN: "CONFIDENCE LEVEL", HI: "आत्मविश्वास स्तर" },
  risk_level: { EN: "RISK LEVEL", HI: "जोखिम स्तर" },
  treatment: { EN: "TARGETED TREATMENT", HI: "लक्षित उपचार" },
  action_plan: { EN: "IMMEDIATE ACTION PLAN", HI: "तत्काल कार्य योजना" },
  loc: { EN: "MADHYA PRADESH, IND", HI: "मध्य प्रदेश, भारत" },
  advisory: { EN: "SMART ADVISORY", HI: "स्मार्ट सलाह" },
  risk: { EN: "MODERATE BLIGHT RISK", HI: "मध्यम ब्लाइट जोखिम" },
  history: { EN: "Crop Health History", HI: "फसल स्वास्थ्य इतिहास" },
  health_index: { EN: "HEALTH INDEX", HI: "स्वास्थ्य सूचकांक" },
  health_status: { EN: "98% OPTIMAL", HI: "98% इष्टतम" },
  rapid_ai: { EN: "Rapid AI", HI: "तेज़ AI" },
  protected: { EN: "Protected", HI: "सुरक्षित" },
  global: { EN: "Global", HI: "वैश्विक" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('EN');

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
