import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'fr' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const translations = {
  en: {
    home: 'Home',
    shop: 'Shop',
    ourStory: 'Our Story',
    skinGuide: 'Skin Guide',
    admin: 'Admin',
    discover: 'Discover the Collection',
    takeQuiz: 'Take the Skin Quiz',
    proudlyAlgerian: 'Proudly Algerian',
    allProducts: 'All Products',
    cleansers: 'Cleansers',
    toners: 'Toners',
    moisturizers: 'Moisturizers',
    masks: 'Masks',
    serums: 'Serums',
    addToCart: 'Add to Cart',
    theCollection: 'The Collection',
    findRitual: 'Find your perfect Nourvel ritual',
    ingredientsStory: 'Ingredients with a story',
    madeInAlgeria: 'Made in Algeria',
    readStory: 'Read Our Full Story',
    whatTheySay: 'What Algerian women are saying',
    joinCircle: 'Join the Nourvel circle',
    joinDesc: 'Skincare rituals, ingredient secrets & exclusive offers. Delivered to your inbox.',
    join: 'Join',
    emailPlaceholder: 'Your email address',
    noSpam: 'No spam. Unsubscribe anytime.',
    footerTagline: 'Pure roots. Modern radiance.',
    madeWithLove: 'Made with 🤍 in Algeria',
    company: 'Company',
    helpContact: 'Help & Contact',
    allRights: '© 2026 Nourvel. All rights reserved.',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    aiSubtitle: 'Answer 2 quick questions — our AI skincare expert does the rest.',
    skinTypeQ: 'What\'s your skin type?',
    concernQ: 'What\'s your main concern?',
    getRitual: 'Get My Ritual',
    back: 'Back',
    noraDesigning: 'Nora is designing your ritual...',
    noraStartOver: 'Start Over',
  },
  fr: {
    home: 'Accueil',
    shop: 'Boutique',
    ourStory: 'Notre Histoire',
    skinGuide: 'Guide de Peau',
    admin: 'Admin',
    discover: 'Découvrir la Collection',
    takeQuiz: 'Faire le Test',
    proudlyAlgerian: 'Fièrement Algérien',
    allProducts: 'Tous les Produits',
    cleansers: 'Nettoyants',
    toners: 'Toniques',
    moisturizers: 'Hydratants',
    masks: 'Masques',
    serums: 'Sérums',
    addToCart: 'Ajouter au Panier',
    theCollection: 'La Collection',
    findRitual: 'Trouvez votre rituel parfait',
    ingredientsStory: 'Des ingrédients avec une histoire',
    madeInAlgeria: 'Fabriqué en Algérie',
    readStory: 'Lire Notre Histoire',
    whatTheySay: 'Témoignages de nos clientes',
    joinCircle: 'Rejoignez le cercle Nourvel',
    joinDesc: 'Rituels de soin, secrets d\'ingrédients et offres exclusives. Directement dans votre boîte de réception.',
    join: 'Rejoindre',
    emailPlaceholder: 'Votre adresse e-mail',
    noSpam: 'Pas de spam. Désabonnez-vous à tout moment.',
    footerTagline: 'Racines pures. Éclat moderne.',
    madeWithLove: 'Fait avec 🤍 en Algérie',
    company: 'Entreprise',
    helpContact: 'Aide & Contact',
    allRights: '© 2026 Nourvel. Tous droits réservés.',
    privacy: 'Politique de Confidentialité',
    terms: 'Conditions de Service',
    aiSubtitle: 'Répondez à 2 questions rapides - notre experte fera le reste.',
    skinTypeQ: 'Quel est votre type de peau ?',
    concernQ: 'Quelle est votre préoccupation principale ?',
    getRitual: 'Obtenir mon Rituel',
    back: 'Retour',
    noraDesigning: 'Nora conçoit votre rituel...',
    noraStartOver: 'Recommencer',
  },
  ar: {
    home: 'الرئيسية',
    shop: 'المتجر',
    ourStory: 'قصتنا',
    skinGuide: 'دليل البشرة',
    admin: 'الإدارة',
    discover: 'اكتشف المجموعة',
    takeQuiz: 'احصل على تحليل لبشرتك',
    proudlyAlgerian: 'فخر جزائري',
    allProducts: 'كل المنتجات',
    cleansers: 'غسول',
    toners: 'تونر',
    moisturizers: 'مرطبات',
    masks: 'ماسكات',
    serums: 'سيروم',
    addToCart: 'أضف للسلة',
    theCollection: 'المجموعة',
    findRitual: 'ابحث عن الروتين المثالي',
    ingredientsStory: 'مكونات تروي قصة',
    madeInAlgeria: 'صنع في الجزائر',
    readStory: 'اقرأ قصتنا الكاملة',
    whatTheySay: 'ماذا تقول النساء عن منتجاتنا',
    joinCircle: 'انضم إلى عائلة نورفيل',
    joinDesc: 'أسرار العناية بالبشرة، عروض حصرية، وكل جديد.. مباشرة في بريدك.',
    join: 'انضم',
    emailPlaceholder: 'بريدك الإلكتروني',
    noSpam: 'لا رسائل مزعجة. يمكنك إلغاء الاشتراك في أي وقت.',
    footerTagline: 'جذور نقية. إشراقة عصرية.',
    madeWithLove: 'صنع بـ 🤍 في الجزائر',
    company: 'الشركة',
    helpContact: 'المساعدة',
    allRights: '© 2026 Nourvel. جميع الحقوق محفوظة.',
    privacy: 'سياسة الخصوصية',
    terms: 'شروط الخدمة',
    aiSubtitle: 'أجب عن سؤالين سريعين - وخبيرتنا في العناية بالبشرة ستتكفل بالباقي.',
    skinTypeQ: 'ما هو نوع بشرتك؟',
    concernQ: 'ما هي مشكلة بشرتك الرئيسية؟',
    getRitual: 'احصل على روتيني',
    back: 'رجوع',
    noraDesigning: 'نورا تصمم روتينك...',
    noraStartOver: 'ابدأ من جديد',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string) => {
    return (translations[language] as any)[key] || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      <div dir={dir}>{children}</div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
