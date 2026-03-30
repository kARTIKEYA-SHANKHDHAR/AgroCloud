import React, { createContext, useContext, useState } from "react";

/* ─────────────────────────────────────────
   All landing-page translations live here.
   Add more languages by adding a new key.
───────────────────────────────────────── */
const translations = {
  en: {
    /* Top bar */
    topBarLeft: "🌿 A GLA University Academic Initiative · Mathura, U.P.",
    topBarRight: "Cloud-Based Smart Irrigation · Mini Project 2025",

    /* Nav */
    navFeatures: "Features",
    navAbout: "About",
    navLogin: "Log in",
    navGetStarted: "Get started",
    appSubtitle: "Smart Irrigation Prediction System",

    /* Hero badge */
    heroBadge: "🎓 GLA University · Department of Computer Science",

    /* Hero heading (split into two parts for styling) */
    heroHeading1: "Smart irrigation,",
    heroHeading2: "powered by AI.",

    /* Hero body */
    heroBody1: "AgroCloud is a cloud-based prediction system developed at GLA University to help farmers decide",
    heroBodyBold: "when to irrigate",
    heroBody2: "using machine learning — reducing water usage while protecting crop yields.",

    /* CTAs */
    ctaPrimary: "Start as a farmer →",
    ctaSecondary: "Log in",
    techStack: "Built with Random Forest ML · Firebase · React + Vite",

    /* Feature cards */
    feat1Title: "Real-time insights",
    feat1Desc: "Instant irrigation recommendations based on temperature, humidity, rainfall, crop & soil data.",
    feat2Title: "Cloud-native",
    feat2Desc: "Secure Firebase auth, Firestore storage, and analytics dashboards for farmers and admins.",
    feat3Title: "Analytics",
    feat3Desc: "Track historical predictions and water savings with interactive charts and trend analysis.",
    feat4Title: "Role-based access",
    feat4Desc: "Dedicated dashboards for farmers and administrators with secure role-based routing.",

    /* Snapshot card */
    snapshotBadge: "Live snapshot",
    snapshotSubtitle: "Example irrigation insight from a farm cluster.",
    snapRow1Label: "Soil moisture band",
    snapRow1Value: "Optimal",
    snapRow2Label: "Irrigation today",
    snapRow2Value: "Not required",
    snapRow3Label: "Predicted water saved",
    snapRow3Value: "~18%",
    snapRow4Label: "Crop",
    snapRow4Value: "Wheat",
    snapRow5Label: "Soil type",
    snapRow5Value: "Loamy",
    snapshotCta1: "Ready to modernize your irrigation?",
    snapshotCta2: "Sign up free",

    /* GLA badge */
    glaBadgeLine1: "GLA University, Mathura",
    glaBadgeLine2: "B.Tech CSE · Mini Project · 2025",

    /* Footer */
    footerBrand: "AgroCloud — A GLA University Project",
    footerRights: "© 2025 GLA University, Mathura · All rights reserved.",

    /* Sidebar / Navigation */
    sideDashboard: "Dashboard",
    sidePrediction: "Prediction",
    sideAnalytics: "Analytics",
    sideProfile: "Profile",
    sideAdminDashboard: "Admin Dashboard",
    sidePlatformAnalytics: "Platform Analytics",
    sideAdministration: "Administration",
    sideFarmerPortal: "Farmer Portal",
    logout: "Log out",
    userGuest: "Guest",
    roleAdmin: "Administrator",
    roleFarmer: "Farmer",
    backToHome: "← Home",

    /* Dashboard */
    dashTitle: "Farmer Dashboard",
    dashSubtitle: "Monitor your irrigation recommendations and weather-driven trends.",
    dashTotalPreds: "Total predictions",
    dashTotalPredsHint: "All irrigation checks you requested.",
    dashIrrigationNeeded: "Irrigation needed",
    dashIrrigationNeededHint: "Times the model recommended irrigation.",
    dashWaterSaved: "Water saved opportunities",
    dashWaterSavedHint: "Times irrigation was not required.",
    dashDecisionsChart: "Irrigation decisions over time",
    dashDecisionsDesc: "Daily view of when irrigation was or wasn't needed.",
    dashRecentPreds: "Recent predictions",
    dashRecentPredsDesc: "Latest irrigation calls generated for your fields.",
    dashNoPreds: "No predictions yet. Run your first prediction from the Prediction page.",

    /* Prediction Page */
    predTitle: "Irrigation prediction",
    predSubtitle: "Enter field conditions to predict whether irrigation is needed.",
    predFieldCond: "Field conditions",
    predTemp: "Temperature (°C)",
    predHumid: "Humidity (%)",
    predRain: "Rainfall (mm)",
    predCrop: "Crop",
    predSoil: "Soil type",
    predRunBtn: "Run prediction",
    predRunning: "Predicting...",
    predResultTitle: "Prediction result",
    predResultDesc: "The model analyses your inputs using a Random Forest classifier trained on historical irrigation data.",
    predResultWait: "Submit field conditions to see whether irrigation is needed today.",
    predRecommendation: "Recommendation",
    predNote: "Note: Always combine AI guidance with your on-field observations and agronomy best practices.",

    /* Analytics Page */
    anaYourTitle: "Your irrigation analytics",
    anaPlatformTitle: "Platform analytics",
    anaYourSubtitle: "See how your irrigation needs evolve over time.",
    anaPlatformSubtitle: "Understand irrigation trends and crop patterns across the platform.",
    anaHistory: "Your irrigation history",
    anaHistoryDesc: "How often irrigation was required or skipped.",
    anaNoHistory: "No prediction history yet. Run predictions to see analytics.",
  },

  hi: {
    /* Top bar */
    topBarLeft: "🌿 GLA विश्वविद्यालय की शैक्षणिक पहल · मथुरा, उ.प्र.",
    topBarRight: "क्लाउड-आधारित स्मार्ट सिंचाई · लघु परियोजना 2025",

    /* Nav */
    navFeatures: "विशेषताएँ",
    navAbout: "परिचय",
    navLogin: "लॉग इन",
    navGetStarted: "शुरू करें",
    appSubtitle: "स्मार्ट सिंचाई पूर्वानुमान प्रणाली",

    /* Hero badge */
    heroBadge: "🎓 GLA विश्वविद्यालय · कंप्यूटर विज्ञान विभाग",

    /* Hero heading */
    heroHeading1: "स्मार्ट सिंचाई,",
    heroHeading2: "AI द्वारा संचालित।",

    /* Hero body */
    heroBody1: "AgroCloud एक क्लाउड-आधारित पूर्वानुमान प्रणाली है जो GLA विश्वविद्यालय में विकसित की गई है। यह किसानों को यह तय करने में सहायता करती है कि",
    heroBodyBold: "कब सिंचाई करें",
    heroBody2: "मशीन लर्निंग का उपयोग करके — पानी की खपत कम करते हुए फसल की उपज की रक्षा करना।",

    /* CTAs */
    ctaPrimary: "किसान के रूप में शुरू करें →",
    ctaSecondary: "लॉग इन",
    techStack: "Random Forest ML · Firebase · React + Vite के साथ निर्मित",

    /* Feature cards */
    feat1Title: "रियल-टाइम अंतर्दृष्टि",
    feat1Desc: "तापमान, आर्द्रता, वर्षा, फसल और मिट्टी के आधार पर तत्काल सिंचाई सिफारिशें।",
    feat2Title: "क्लाउड-नेटिव",
    feat2Desc: "सुरक्षित Firebase प्रमाणीकरण, Firestore स्टोरेज और किसानों व व्यवस्थापकों के लिए एनालिटिक्स डैशबोर्ड।",
    feat3Title: "एनालिटिक्स",
    feat3Desc: "इंटरएक्टिव चार्ट और ट्रेंड विश्लेषण के साथ ऐतिहासिक पूर्वानुमान और जल बचत को ट्रैक करें।",
    feat4Title: "भूमिका-आधारित पहुंच",
    feat4Desc: "सुरक्षित भूमिका-आधारित रूटिंग के साथ किसानों और व्यवस्थापकों के लिए समर्पित डैशबोर्ड।",

    /* Snapshot card */
    snapshotBadge: "लाइव स्नैपशॉट",
    snapshotSubtitle: "एक खेत समूह से सिंचाई की जानकारी का उदाहरण।",
    snapRow1Label: "मिट्टी की नमी",
    snapRow1Value: "अनुकूल",
    snapRow2Label: "आज की सिंचाई",
    snapRow2Value: "आवश्यक नहीं",
    snapRow3Label: "अनुमानित जल बचत",
    snapRow3Value: "~18%",
    snapRow4Label: "फसल",
    snapRow4Value: "गेहूँ",
    snapRow5Label: "मिट्टी का प्रकार",
    snapRow5Value: "दोमट",
    snapshotCta1: "अपनी सिंचाई को आधुनिक बनाने के लिए तैयार हैं?",
    snapshotCta2: "मुफ्त में साइन अप करें",

    /* GLA badge */
    glaBadgeLine1: "GLA विश्वविद्यालय, मथुरा",
    glaBadgeLine2: "B.Tech CSE · लघु परियोजना · 2025",

    /* Footer */
    footerBrand: "AgroCloud — एक GLA विश्वविद्यालय परियोजना",
    footerRights: "© 2025 GLA विश्वविद्यालय, मथुरा · सर्वाधिकार सुरक्षित।",

    /* Sidebar / Navigation */
    sideDashboard: "डैशबोर्ड",
    sidePrediction: "पूर्वानुमान",
    sideAnalytics: "एनालिटिक्स",
    sideProfile: "प्रोफ़ाइल",
    sideAdminDashboard: "एडमिन डैशबोर्ड",
    sidePlatformAnalytics: "प्लेटफॉर्म एनालिटिक्स",
    sideAdministration: "प्रशासन",
    sideFarmerPortal: "किसान पोर्टल",
    logout: "लॉग आउट",
    userGuest: "अतिथि",
    roleAdmin: "व्यवस्थापक",
    roleFarmer: "किसान",
    backToHome: "← होम",

    /* Dashboard */
    dashTitle: "किसान डैशबोर्ड",
    dashSubtitle: "अपनी सिंचाई सिफारिशों और मौसम आधारित प्रवृत्तियों की निगरानी करें।",
    dashTotalPreds: "कुल पूर्वानुमान",
    dashTotalPredsHint: "आपके द्वारा अनुरोधित सभी सिंचाई जांच।",
    dashIrrigationNeeded: "सिंचाई आवश्यक",
    dashIrrigationNeededHint: "जब मॉडल ने सिंचाई की सिफारिश की।",
    dashWaterSaved: "जल बचत के अवसर",
    dashWaterSavedHint: "जब सिंचाई की आवश्यकता नहीं थी।",
    dashDecisionsChart: "समय के साथ सिंचाई के निर्णय",
    dashDecisionsDesc: "सिंचाई कब आवश्यक थी या नहीं थी, इसका दैनिक दृश्य।",
    dashRecentPreds: "हाल के पूर्वानुमान",
    dashRecentPredsDesc: "आपके खेतों के लिए उत्पन्न नवीनतम सिंचाई कॉल।",
    dashNoPreds: "अभी तक कोई पूर्वानुमान नहीं। पूर्वानुमान पृष्ठ से अपना पहला पूर्वानुमान चलाएं।",

    /* Prediction Page */
    predTitle: "सिंचाई पूर्वानुमान",
    predSubtitle: "सिंचाई की आवश्यकता है या नहीं, इसका पूर्वानुमान लगाने के लिए खेत की स्थिति दर्ज करें।",
    predFieldCond: "खेत की स्थिति",
    predTemp: "तापमान (°C)",
    predHumid: "आर्द्रता (%)",
    predRain: "वर्षा (mm)",
    predCrop: "फसल",
    predSoil: "मिट्टी का प्रकार",
    predRunBtn: "पूर्वानुमान चलाएं",
    predRunning: "पूर्वानुमान लगा रहा है...",
    predResultTitle: "पूर्वानुमान परिणाम",
    predResultDesc: "मॉडल ऐतिहासिक सिंचाई डेटा पर प्रशिक्षित रैंडम फॉरेस्ट क्लासिफायर का उपयोग करके आपके इनपुट का विश्लेषण करता है।",
    predResultWait: "आज सिंचाई की आवश्यकता है या नहीं, यह देखने के लिए खेत की स्थिति जमा करें।",
    predRecommendation: "सिफारिश",
    predNote: "नोट: हमेशा एआई मार्गदर्शन को अपने ऑन-फील्ड अवलोकन और कृषि सर्वोत्तम प्रथाओं के साथ जोड़ें।",

    /* Analytics Page */
    anaYourTitle: "आपकी सिंचाई एनालिटिक्स",
    anaPlatformTitle: "प्लेटफॉर्म एनालिटिक्स",
    anaYourSubtitle: "देखें कि समय के साथ आपकी सिंचाई की ज़रूरतें कैसे विकसित होती हैं।",
    anaPlatformSubtitle: "पूरे प्लेटफॉर्म पर सिंचाई के रुझान और फसल पैटर्न को समझें।",
    anaHistory: "आपका सिंचाई इतिहास",
    anaHistoryDesc: "सिंचाई की कितनी बार आवश्यकता थी या नहीं।",
    anaNoHistory: "अभी तक कोई पूर्वानुमान इतिहास नहीं है। एनालिटिक्स देखने के लिए पूर्वानुमान चलाएं।",
  },
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState("en");
  const t = translations[lang];
  const toggleLang = (l) => setLang(l);

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};

export default LanguageContext;
