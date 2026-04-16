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
  tagline: { EN: "HEALING THE EARTH, ONE LEAF AT A TIME.", HI: "स्वस्थ पौधे, समृद्ध फसल।" },
  navbar_tagline: { EN: "PRECISION AGRI-TECH", HI: "सटीक कृषि-तकनीक" },
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
  'Live Location': { EN: "Live Location", HI: "सक्रिय स्थान" },
  'Blight Advisory': { EN: "Blight Advisory", HI: "ब्लाइट सलाह" },
  'Air Moisture': { EN: "Air Moisture", HI: "वायु नमी" },
  'LOW RISK': { EN: "Low Risk", HI: "कम जोखिम" },
  'MEDIUM RISK': { EN: "Medium Risk", HI: "मध्यम जोखिम" },
  'HIGH RISK': { EN: "High Risk", HI: "उच्च जोखिम" },
  history: { EN: "Crop Health History", HI: "फसल स्वास्थ्य इतिहास" },
  health_index: { EN: "HEALTH INDEX", HI: "स्वास्थ्य सूचकांक" },
  health_status: { EN: "98% OPTIMAL", HI: "98% इष्टतम" },
  rapid_ai: { EN: "Rapid AI", HI: "तेज़ AI" },
  protected: { EN: "Protected", HI: "सुरक्षित" },
  global: { EN: "Global", HI: "वैश्विक" },
  'Bacterial Spot': { EN: "Bacterial Spot", HI: "जीवाणु धब्बा (Bacterial Spot)" },
  'Potato Late Blight': { EN: "Potato Late Blight", HI: "आलू पछेती झुलसा" },
  'Tomato Late Blight': { EN: "Tomato Late Blight", HI: "टमाटर पछेती झुलसा" },
  'Moderate': { EN: "Moderate", HI: "मध्यम" },
  'High': { EN: "High", HI: "उच्च" },
  'Critical': { EN: "Critical", HI: "गंभीर" },
  'diseased': { EN: "Diseased", HI: "रोगग्रस्त" },
  'healthy': { EN: "Healthy", HI: "स्वस्थ" },
  'confidence': { EN: "Confidence Level", HI: "आत्मविश्वास स्तर" },
  'severity': { EN: "Risk Level", HI: "जोखिम स्तर" },
  'treatment_title': { EN: "Targeted Treatment", HI: "सटीक उपचार" },
  'action_plan_title': { EN: "Immediate Action Plan", HI: "तत्काल कार्य योजना" },
  'Prune all heavily infected leaves in dry weather.': { EN: "Prune all heavily infected leaves in dry weather.", HI: "सूखे मौसम में रोगग्रस्त पत्तों की छंटाई करें।" },
  'Apply copper fungicide every 7-10 days.': { EN: "Apply copper fungicide every 7-10 days.", HI: "हर 7-10 दिनों में कॉपर फफूंदनाशक का प्रयोग करें।" },
  'Switch to drip irrigation to keep foliage dry.': { EN: "Switch to drip irrigation to keep foliage dry.", HI: "पत्तियों को सूखा रखने के लिए ड्रिप सिंचाई का उपयोग करें।" },
  'Copper-based bactericides (e.g., Kocide 3000)': { EN: "Copper-based bactericides (e.g., Kocide 3000)", HI: "कॉपर-आधारित जीवाणुनाशक (जैसे, कोसाइड 3000)" },
  'Streptomycin sulfate (for early stage)': { EN: "Streptomycin sulfate (for early stage)", HI: "स्ट्रेप्टोमाइसिन सल्फेट (शुरुआती चरण के लिए)" },
  'Pepper Bacterial Spot': { EN: "Pepper Bacterial Spot", HI: "मिर्च का जीवाणु धब्बा (Pepper Bacterial Spot)" },
  'Copper-based fungicides': { EN: "Copper-based fungicides", HI: "तांबा आधारित कवकनाशी" },
  'Streptomycin sprays': { EN: "Streptomycin sprays", HI: "स्ट्रेप्टोमाइसिन स्प्रे" },
  'Seed treatment with hot water': { EN: "Seed treatment with hot water", HI: "गर्म पानी से बीजोपचार" },
  'Removal of infected debris': { EN: "Removal of infected debris", HI: "संक्रमित कचरे को हटाना" },
  'Isolate the plant to prevent spread.': { EN: "Isolate the plant to prevent spread.", HI: "प्रसार रोकने के लिए पौधे को अलग करें।" },
  'Apply copper spray at first sign.': { EN: "Apply copper spray at first sign.", HI: "पहले लक्षण पर तांबा स्प्रे करें।" },
  'Avoid handling plants when wet.': { EN: "Avoid handling plants when wet.", HI: "गीले होने पर पौधों को छूने से बचें।" },
  'Use certified seeds and rotate crops.': { EN: "Use certified seeds and rotate crops.", HI: "प्रमाणित बीज का उपयोग करें और फसल चक्र अपनाएं।" },
  'Consult a local agricultural expert': { EN: "Consult a local agricultural expert", HI: "स्थानीय कृषि विशेषज्ञ से परामर्श लें" },
  'Isolate the plant.': { EN: "Isolate the plant.", HI: "पौधे को अलग करें।" },
  'Monitor for changes.': { EN: "Monitor for changes.", HI: "बदलावों की निगरानी करें।" },
  'HISTORY': { EN: "History", HI: "इतिहास" },
  'NO_SCANS': { EN: "No scan history yet.", HI: "अभी तक कोई स्कैन इतिहास नहीं है।" },
  'FARM_RECORDS': { EN: "Farm Health Records", HI: "फार्म स्वास्थ्य रिकॉर्ड" },
  'LATEST_UPDATES': { EN: "Latest updates from your fields", HI: "आपके खेतों के ताज़ा अपडेट" },

  // 🥔 POTATO UNIVERSAL
  'Late Blight (Potato)': { EN: "Late Blight (Potato)", HI: "आलू का पछेती झुलसा (Potato Late Blight)" },
  'Metalaxyl': { EN: "Metalaxyl", HI: "मेटालेक्सिल (Metalaxyl)" },
  'Destroy haulms (vines) if infection is detected.': { EN: "Destroy haulms (vines) if infection is detected.", HI: "संक्रमण दिखने पर लताओं (हाम्स) को नष्ट कर दें।" },
  'Harvest tubers carefully to avoid contact with spores.': { EN: "Harvest tubers carefully to avoid contact with spores.", HI: "बीजाणुओं के संपर्क से बचने के लिए कंदों की सावधानीपूर्वक कटाई करें।" },
  'Potato___Late_blight': { EN: "Late Blight", HI: "पछेती झुलसा" },

  // 🍅 TOMATO UNIVERSAL
  'Tomato___Late_blight': { EN: "Late Blight", HI: "पछेती झुलसा" },
  'Tomato___Early_blight': { EN: "Early Blight", HI: "अगेती झुलसा" },
  'Tomato___Bacterial_spot': { EN: "Bacterial Spot", HI: "जीवाणु धब्बा" },
  'Chlorothalonil (Daconil)': { EN: "Chlorothalonil (Daconil)", HI: "क्लोरोथैलोनिल (डैकोनिल)" },
  'Mancozeb': { EN: "Mancozeb", HI: "मैन्कोज़ेब (Mancozeb)" },
  'Increase air circulation between plants': { EN: "Increase air circulation between plants", HI: "पौधों के बीच हवा का संचार बढ़ाएं" },
  'Mulch around the base to prevent soil splash': { EN: "Mulch around the base to prevent soil splash", HI: "मिट्टी के छींटों को रोकने के लिए आधार के चारों ओर मल्च करें" },
  'Serenade (Bacillus subtilis) bio-fungicide': { EN: "Serenade (Bacillus subtilis) bio-fungicide", HI: "सेरेनेड (बैसिलस सब्टिलिस) जैव-कवकनाशी" },

  // 🌱 HEALTHY & ORGANIC UNIVERSAL
  'Healthy Plant': { EN: "Healthy Plant", HI: "स्वस्थ पौधा (Healthy Plant)" },
  'Healthy Potato': { EN: "Healthy Potato", HI: "स्वस्थ आलू" },
  'None': { EN: "None", HI: "कोई नहीं (None)" },
  'Continue regular monitoring.': { EN: "Continue regular monitoring.", HI: "नियमित निगरानी जारी रखें।" },
  'Keep the soil moisture consistent.': { EN: "Keep the soil moisture consistent.", HI: "मिट्टी की नमी को स्थिर बनाए रखें।" },
  'Regular composting': { EN: "Regular composting", HI: "नियमित खाद (composting)" },
  'Seaweed extract': { EN: "Seaweed extract", HI: "समुद्री शैवाल का अर्क (Seaweed extract)" },
  'Organic manure': { EN: "Organic manure", HI: "जैविक खाद" },
  'Monitor for pests.': { EN: "Monitor for pests.", HI: "कीटों की निगरानी करें।" },
  'Maintain hilling.': { EN: "Maintain hilling.", HI: "मिट्टी चढ़ाना (hilling) जारी रखें।" },
  'INVALID_SAMPLE': { EN: "Analysis Inconclusive", HI: "विश्लेषण अनिर्णायक" },
  'INVALID_DESC': { EN: "Confidence is too low. Please upload a clear photo of the infected leaf.", HI: "विश्वास स्तर बहुत कम है। कृपया संक्रमित पत्ती का स्पष्ट फोटो अपलोड करें।" },
  'RETRY_SCAN': { EN: "Retry with Clear Photo", HI: "स्पष्ट फोटो के साथ पुनः प्रयास करें" },

  // 📈 HEALTH INSIGHTS & ANALYTICS
  'deep_insights': { EN: "Deep Insights", HI: "गहन अंतर्दृष्टि" },
  'insights_desc': { EN: "AI-Driven Telemetry and Biological Threat Analysis for your entire farm ecosystem.", HI: "आपके पूरे कृषि पारिस्थितिकी तंत्र के लिए AI-संचालित टेलीमेट्री और जैविक खतरे का विश्लेषण।" },
  'total_ops': { EN: "Total Operations", HI: "कुल संचालन" },
  'threats_detected': { EN: "Threats Detected", HI: "खतरे की पहचान" },
  'resilience_score': { EN: "Resilience Score", HI: "लचीलापन स्कोर" },
  'health_index_label': { EN: "Health Index", HI: "स्वास्थ्य सूचकांक" },
  'geotagged_map': { EN: "GEOTAGGED BIOSPHERE MAP", HI: "जियोटैग्ड बायोस्फीयर मैप" },
  'map_desc': { EN: "Visualize infection clusters and manage field operations.", HI: "संक्रमण समूहों की कल्पना करें और कृषि गतिविधियों का प्रबंधन करें।" },
  'launch_map': { EN: "LAUNCH MAP", HI: "नक्शा खोलें" },
  'systems_audit': { EN: "Real-time Systems Audit", HI: "रीयल-टाइम सिस्टम ऑडिट" },
  'weekly_efficiency': { EN: "Weekly Efficiency", HI: "साप्ताहिक दक्षता" },
  'diagnostic_sessions': { EN: "Active diagnostic sessions", HI: "सक्रिय नैदानिक सत्र" },
  'blight_cases': { EN: "Blight & infection cases", HI: "झुलसा और संक्रमण के मामले" },
  'health_preservation': { EN: "Crop health preservation", HI: "फसल स्वास्थ्य संरक्षण" },
  'verified_samples': { EN: "Verified healthy samples", HI: "सत्यापित स्वस्थ नमूने" }
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
