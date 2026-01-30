export const translations = {
  en: {
    // Navigation
    home: "Home",
    reportIssue: "Report Issue",
    myReports: "My Reports",
    dashboard: "Dashboard",
    citizenDashboard: "Dashboard",
    adminDashboard: "Admin Dashboard",
    
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
    donate: "Donate",
    volunteer: "Volunteer",
    register: "Register",
    viewAll: "View All",
    
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
    
    // New Features
    donations: "Donations",
    volunteering: "Volunteering",
    localStalls: "Local Stalls",
    discounts: "Discounts",
    emergencyAlerts: "Emergency Alerts",
    publicUpdates: "Public Updates",
    camps: "Camps",
    events: "Community Events",
    meetups: "Meetups",
    
    // Donations
    makeDonation: "Make a Donation",
    donationAmount: "Amount",
    donationPurpose: "Purpose",
    anonymousDonation: "Make this donation anonymous",
    totalDonations: "Total Donations",
    
    // Volunteering
    becomeVolunteer: "Become a Volunteer",
    yourSkills: "Your Skills",
    availability: "Availability",
    activeVolunteers: "Active Volunteers",
    
    // Stalls
    localBusinesses: "Local Businesses",
    discountOffers: "Discount Offers",
    
    // Events
    upcomingEvents: "Upcoming Events",
    registerForEvent: "Register for Event",
    eventDetails: "Event Details",
    participants: "Participants",
    
    // Alerts
    activeAlerts: "Active Alerts",
    criticalAlert: "Critical Alert",
    highAlert: "High Priority",
    mediumAlert: "Medium Priority",
    lowAlert: "Low Priority",
  },
  hi: {
    // Navigation
    home: "होम",
    reportIssue: "समस्या रिपोर्ट करें",
    myReports: "मेरी रिपोर्ट्स",
    dashboard: "डैशबोर्ड",
    citizenDashboard: "डैशबोर्ड",
    adminDashboard: "व्यवस्थापक डैशबोर्ड",
    
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
    donate: "दान करें",
    volunteer: "स्वयंसेवा करें",
    register: "पंजीकरण करें",
    viewAll: "सभी देखें",
    
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
    
    // New Features
    donations: "दान",
    volunteering: "स्वयंसेवा",
    localStalls: "स्थानीय दुकानें",
    discounts: "छूट",
    emergencyAlerts: "आपातकालीन अलर्ट",
    publicUpdates: "सार्वजनिक अपडेट",
    camps: "शिविर",
    events: "सामुदायिक कार्यक्रम",
    meetups: "मीटअप",
    
    // Donations
    makeDonation: "दान करें",
    donationAmount: "राशि",
    donationPurpose: "उद्देश्य",
    anonymousDonation: "इस दान को गुमनाम रखें",
    totalDonations: "कुल दान",
    
    // Volunteering
    becomeVolunteer: "स्वयंसेवक बनें",
    yourSkills: "आपके कौशल",
    availability: "उपलब्धता",
    activeVolunteers: "सक्रिय स्वयंसेवक",
    
    // Stalls
    localBusinesses: "स्थानीय व्यवसाय",
    discountOffers: "छूट ऑफर",
    
    // Events
    upcomingEvents: "आगामी कार्यक्रम",
    registerForEvent: "कार्यक्रम के लिए पंजीकरण करें",
    eventDetails: "कार्यक्रम विवरण",
    participants: "प्रतिभागी",
    
    // Alerts
    activeAlerts: "सक्रिय अलर्ट",
    criticalAlert: "गंभीर अलर्ट",
    highAlert: "उच्च प्राथमिकता",
    mediumAlert: "मध्यम प्राथमिकता",
    lowAlert: "कम प्राथमिकता",
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

export function t(key: TranslationKey, language: Language = "en"): string {
  return translations[language][key];
}
