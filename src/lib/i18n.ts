export const translations = {
  en: {
    // Navigation
    home: "Home",
    reportIssue: "Report Issue",
    myReports: "My Reports",
    dashboard: "Dashboard",
    
    // Issue Categories
    waste: "Waste Management",
    roads: "Roads & Infrastructure",
    streetlights: "Street Lights",
    water: "Water Supply",
    other: "Other",
    
    // Actions
    submit: "Submit",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    assign: "Assign",
    
    // Status
    submitted: "Submitted",
    acknowledged: "Acknowledged",
    inProgress: "In Progress",
    resolved: "Resolved",
    
    // Forms
    description: "Description",
    location: "Location",
    category: "Category",
    photo: "Photo",
    voiceNote: "Voice Note",
    
    // Common
    loading: "Loading...",
    error: "Error occurred",
    success: "Success",
    
    // Dashboard
    totalIssues: "Total Issues",
    pendingIssues: "Pending Issues",
    resolvedIssues: "Resolved Issues",
    averageResolutionTime: "Avg Resolution Time",
  },
  hi: {
    // Navigation
    home: "होम",
    reportIssue: "समस्या रिपोर्ट करें",
    myReports: "मेरी रिपोर्ट्स",
    dashboard: "डैशबोर्ड",
    
    // Issue Categories
    waste: "कचरा प्रबंधन",
    roads: "सड़क और बुनियादी ढांचा",
    streetlights: "स्ट्रीट लाइट्स",
    water: "पानी की आपूर्ति",
    other: "अन्य",
    
    // Actions
    submit: "सबमिट करें",
    cancel: "रद्द करें",
    save: "सेव करें",
    edit: "संपादित करें",
    delete: "हटाएं",
    assign: "असाइन करें",
    
    // Status
    submitted: "सबमिट किया गया",
    acknowledged: "स्वीकार किया गया",
    inProgress: "प्रगति में",
    resolved: "हल किया गया",
    
    // Forms
    description: "विवरण",
    location: "स्थान",
    category: "श्रेणी",
    photo: "फोटो",
    voiceNote: "वॉयस नोट",
    
    // Common
    loading: "लोड हो रहा है...",
    error: "त्रुटि हुई",
    success: "सफलता",
    
    // Dashboard
    totalIssues: "कुल समस्याएं",
    pendingIssues: "लंबित समस्याएं",
    resolvedIssues: "हल की गई समस्याएं",
    averageResolutionTime: "औसत समाधान समय",
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

export function t(key: TranslationKey, language: Language = "en"): string {
  return translations[language][key];
}