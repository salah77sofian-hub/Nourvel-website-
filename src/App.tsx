/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Search, Menu, X, Leaf, MapPin, Star, ArrowRight, CheckCircle2, Loader2, Globe, Instagram, Facebook, MessageCircle, PlaySquare, ShieldCheck, Mountain, Flower2, FlaskConical, Heart, Truck, Droplets, Scale, Sparkles, AlertCircle, Droplet, Palette } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useProductContext } from './context/ProductContext';
import { useLanguage } from './context/LanguageContext';
import { Admin } from './pages/Admin';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'MISSING_API_KEY' });

// --- DATA ---
// Products are now managed by ProductContext

const INGREDIENTS = [
    { name: 'Argan Oil', origin: 'From the forests of Tizi Ouzou, Kabylie', desc: "Called 'liquid gold' for centuries, our cold-pressed argan oil delivers intense moisture and antioxidant protection without clogging pores. The richest source of Vitamin E in nature.", icon: <Leaf className="w-16 h-16" /> },
    { name: 'Rhassoul Clay', origin: 'From the Atlas Mountains, Northeast Algeria', desc: "Used in Algerian hammams for 1,400 years, this volcanic mineral clay draws out impurities from deep within pores, balances sebum production, and leaves skin impossibly smooth.", icon: <Mountain className="w-16 h-16" /> },
    { name: 'Rosa Damascena', origin: 'From the highlands of Sétif & Batna', desc: "Distilled at dawn when the petals hold their maximum essence, our Algerian rosewater soothes inflammation, tones, and delivers a natural radiance that no synthetic ingredient can replicate.", icon: <Flower2 className="w-16 h-16" /> }
];

const REVIEWS = [
    { name: 'Yasmine B.', location: 'Algiers', text: "I've tried every French cleanser on the market. Nothing has made my skin feel this clean and this comfortable at the same time. The rhassoul cleanser is magic." },
    { name: 'Nadia K.', location: 'Oran', text: "The fact that it's Algerian-made and this high quality makes me so proud. The serum completely changed my skin texture in 3 weeks." },
    { name: 'Sara M.', location: 'Constantine', text: "I have extremely sensitive skin that reacts to everything. Nourvel is the first brand where I've had zero reactions and actual results." }
];

// --- COMPONENTS ---

const FadeIn: React.FC<{ children: React.ReactNode, delay?: number, className?: string, key?: React.Key }> = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    const langs: ('en' | 'fr' | 'ar')[] = ['en', 'fr', 'ar'];
    const nextIndex = (langs.indexOf(language) + 1) % langs.length;
    setLanguage(langs[nextIndex]);
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-surface/80 backdrop-blur-md border-b border-border-warm py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer">
              <Link to="/" className="flex items-center gap-2">
                <Leaf className="w-6 h-6 text-primary" />
                <span className="font-serif text-2xl md:text-3xl tracking-wide text-primary font-semibold">Nourvel</span>
              </Link>
            </div>
            <div className="hidden md:flex gap-6 items-center uppercase tracking-[0.15em] text-[13px] font-medium text-ink-soft">
              <Link to="/" className="cursor-pointer hover:text-primary transition-colors">{t('home')}</Link>
              <button onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })} className="cursor-pointer hover:text-primary transition-colors">{t('shop')}</button>
              <button onClick={() => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })} className="cursor-pointer hover:text-primary transition-colors">{t('ourStory')}</button>
              <button onClick={() => document.getElementById('guide')?.scrollIntoView({ behavior: 'smooth' })} className="cursor-pointer hover:text-primary transition-colors">{t('skinGuide')}</button>
              {import.meta.env.VITE_HIDE_ADMIN !== 'true' && (
                <Link to="/admin" className="cursor-pointer hover:text-primary transition-colors flex items-center gap-1 text-gold"><ShieldCheck className="w-4 h-4"/> Admin</Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div onClick={toggleLanguage} className="flex items-center gap-2 text-ink-soft text-sm uppercase tracking-widest cursor-pointer hover:text-primary transition-colors">
              <Globe className="w-5 h-5" /> <span className="hidden md:inline">{language}</span>
            </div>
            <Search className="w-5 h-5 text-ink-soft cursor-pointer hover:text-primary transition-colors" />
            <div className="relative cursor-pointer group">
              <ShoppingCart className="w-5 h-5 text-ink-soft group-hover:text-primary transition-colors" />
              <div className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">0</div>
            </div>
            <Menu className="w-6 h-6 text-ink md:hidden cursor-pointer" onClick={() => setIsMobileMenuOpen(true)} />
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: typeof window !== 'undefined' && document.dir === 'rtl' ? '-100%' : '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: typeof window !== 'undefined' && document.dir === 'rtl' ? '-100%' : '100%' }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-0 z-50 bg-background flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="font-serif text-3xl tracking-wide text-primary">Nourvel</span>
              <X className="w-8 h-8 text-ink cursor-pointer" onClick={() => setIsMobileMenuOpen(false)} />
            </div>
            <div className="flex flex-col gap-8 text-2xl font-serif text-ink">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="cursor-pointer hover:text-primary">{t('home')}</Link>
              <button onClick={() => { setIsMobileMenuOpen(false); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-left cursor-pointer hover:text-primary">{t('shop')}</button>
              <button onClick={() => { setIsMobileMenuOpen(false); document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-left cursor-pointer hover:text-primary">{t('ourStory')}</button>
              {import.meta.env.VITE_HIDE_ADMIN !== 'true' && (
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="cursor-pointer hover:text-primary text-gold flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6" /> Admin
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Hero = () => {
  const { siteContent } = useProductContext();
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen pt-24 md:pt-0 flex items-center bg-background overflow-hidden">
      {/* Decorative botanical watermark SVG */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none text-primary">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <path d="M20,100 C40,50 80,40 100,0 C80,20 60,80 20,100 Z" fill="currentColor"/>
          <path d="M50,100 C60,60 90,50 100,20 C80,30 70,80 50,100 Z" fill="currentColor"/>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center z-10">
        <div className="md:col-span-7 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex items-center gap-2 bg-surface border border-border-warm rounded-full px-4 py-1.5 w-max">
              <span className="text-sm">🇩🇿</span>
              <span className="text-xs uppercase tracking-[0.15em] font-medium text-primary">{t('proudlyAlgerian')}</span>
            </div>
            <h1 className="font-serif text-[42px] leading-[1.1] md:text-[72px] text-primary whitespace-pre-line">
              {siteContent.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-ink-soft max-w-lg mb-4 leading-relaxed font-light whitespace-pre-line">
              {siteContent.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white uppercase tracking-[0.15em] text-sm font-medium px-8 py-4 rounded-full hover:bg-opacity-90 transition-all ripple text-center">
                {t('discover')}
              </button>
              <button onClick={() => document.getElementById('guide')?.scrollIntoView({ behavior: 'smooth' })} className="border border-primary text-primary uppercase tracking-[0.15em] text-sm font-medium px-8 py-4 rounded-full hover:bg-surface transition-all text-center">
                {t('takeQuiz')}
              </button>
            </div>
          </motion.div>
        </div>
        
        <div className="md:col-span-5 h-[50vh] md:h-[80vh] w-full relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-full h-full rounded-t-full rounded-b-[40px] bg-gradient-to-tr from-surface to-[#F8EFE0] shadow-2xl relative overflow-hidden flex items-center justify-center p-8 border border-border-warm"
          >
             <div className="text-center flex flex-col items-center gap-4 text-ink-soft opacity-60">
                <Leaf className="w-16 h-16" />
                <span className="font-serif text-xl">Argan Collection</span>
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const TrustBar = () => {
  const { t } = useLanguage();
  const items = [
    { icon: <Leaf className="w-5 h-5"/>, text: '100% Algerian Formulas' },
    { icon: <FlaskConical className="w-5 h-5"/>, text: 'Dermatologist Tested' },
    { icon: <Heart className="w-5 h-5"/>, text: 'Paraben & Sulfate Free' },
    { icon: <Truck className="w-5 h-5"/>, text: 'Delivery Across Algeria' }
  ];
  return (
    <div className="bg-primary w-full py-5 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
        {items.map((item, i) => (
          <React.Fragment key={i}>
            <div className="flex items-center gap-3 text-white">
              <span className="text-lg">{item.icon}</span>
              <span className="uppercase tracking-[0.12em] text-[13px] font-medium">{item.text}</span>
            </div>
            {i !== items.length - 1 && <div className="hidden md:block w-px h-8 bg-white/20" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const ProductSection = () => {
  const { products } = useProductContext();
  const { t } = useLanguage();
  const filters = ['All', 'Cleansers', 'Toners', 'Moisturizers', 'Masks', 'Serums'];
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredProducts = products.filter(p => activeFilter === 'All' || p.category === activeFilter);

  const getTranslatedFilter = (filter: string) => {
    switch (filter) {
      case 'All': return t('allProducts');
      case 'Cleansers': return t('cleansers');
      case 'Toners': return t('toners');
      case 'Moisturizers': return t('moisturizers');
      case 'Masks': return t('masks');
      case 'Serums': return t('serums');
      default: return filter;
    }
  };

  return (
    <section id="shop" className="py-24 bg-background px-6">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="flex flex-col items-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-primary mb-10 text-center">{t('theCollection')}</h2>
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2 rounded-full uppercase tracking-widest text-xs md:text-sm transition-all duration-300 ${
                  activeFilter === filter 
                  ? 'bg-primary text-white' 
                  : 'bg-transparent text-ink-soft hover:bg-surface border border-transparent'
                }`}
              >
                {getTranslatedFilter(filter)}
              </button>
            ))}
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={product.id}
                className="group bg-surface rounded-[24px] p-6 cursor-pointer flex flex-col relative transition-all duration-500 hover:-translate-y-[6px] hover:shadow-xl border border-border-warm"
              >
                {product.badge && (
                  <div className="absolute top-4 right-4 bg-secondary text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full z-10">
                    {product.badge}
                  </div>
                )}
                {product.imageUrl ? (
                  <div className="h-[180px] w-full rounded-2xl bg-border-warm mb-6 flex items-center justify-center overflow-hidden">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-[180px] w-full rounded-2xl bg-gradient-to-br from-[#EAE0D0] to-[#E0D5C5] mb-6 flex items-center justify-center">
                    <span className="font-serif text-2xl text-ink/20 opacity-0 group-hover:opacity-100 transition-opacity">Nourvel</span>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.skinTypes.map(type => (
                    <span key={type} className="bg-border-warm/50 text-ink-soft text-[10px] uppercase font-semibold tracking-wider px-2 py-1 rounded-full">
                      {type}
                    </span>
                  ))}
                </div>

                <div className="flex gap-1 text-gold mb-2">
                  <Star fill="currentColor" className="w-3 h-3" />
                  <Star fill="currentColor" className="w-3 h-3" />
                  <Star fill="currentColor" className="w-3 h-3" />
                  <Star fill="currentColor" className="w-3 h-3" />
                  <Star fill="currentColor" className="w-3 h-3" />
                  <span className="text-ink-soft text-[11px] ml-1">(4.8)</span>
                </div>

                <h3 className="font-serif text-xl text-primary leading-tight mb-2 flex-grow">{product.name}</h3>
                <p className="text-sm text-ink-soft mb-6 font-light">{product.benefit}</p>
                
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-medium text-lg text-primary">{product.price}</span>
                </div>

                <button className="absolute bottom-6 left-6 right-6 bg-primary text-white uppercase tracking-widest text-[11px] font-bold py-3 px-4 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  {t('addToCart')}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const AISkinFinder = () => {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [skinType, setSkinType] = useState('');
  const [concern, setConcern] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const SKIN_TYPES = [
    { id: 'Oily', icon: <Droplets className="w-6 h-6" /> }, { id: 'Dry', icon: <Flower2 className="w-6 h-6" /> },
    { id: 'Combination', icon: <Scale className="w-6 h-6" /> }, { id: 'Normal', icon: <Sparkles className="w-6 h-6" /> },
    { id: 'Sensitive', icon: <Leaf className="w-6 h-6" /> }
  ];

  const CONCERNS = [
    { id: 'Acne & Breakouts', icon: <AlertCircle className="w-6 h-6" /> }, { id: 'Dullness', icon: <Star className="w-6 h-6" /> },
    { id: 'Dehydration', icon: <Droplet className="w-6 h-6" /> }, { id: 'Large Pores', icon: <Sparkles className="w-6 h-6" /> },
    { id: 'Uneven Tone', icon: <Palette className="w-6 h-6" /> }
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setStep(3);
    
    // Simulate slight delay for UX
    await new Promise(res => setTimeout(res, 1000));

    const systemInstruction = `You are Nora, Nourvel's expert skincare advisor. 
Nourvel is a premium Algerian skincare brand using local botanicals: argan oil, rhassoul clay, rosewater, Atlas herbs. 
When given a skin type and concern, respond with:
1. A warm 1-sentence greeting acknowledging their skin profile
2. A "Your Skin Profile:" title with a creative profile name (e.g. "The Sensitive Glow Seeker")
3. "Your Morning Ritual:" with 2 steps using Nourvel products
4. "Your Evening Ritual:" with 2 steps using Nourvel products  
5. "Why this works:" — 2 sentences explaining the Algerian ingredient science
Keep total response under 120 words. Be warm, expert, and proud of Algerian ingredients.
Format with clear line breaks. Never recommend non-Nourvel products.`;

    const prompt = `My skin type is: ${skinType}. My main concern is: ${concern}.`;

    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-pro',
          contents: prompt,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 300
          }
        });
        setResult(response.text);
    } catch (error) {
        console.error("AI Generation Error", error);
        setResult(`Welcome to Nourvel! I understand you are dealing with ${concern} and have ${skinType} skin.\n\nYour Skin Profile: The Desert Rose\n\nYour Morning Ritual:\n1. Cleanse with the Argan Oil Gentle Milk Cleanser to start pure.\n2. Hydrate with the Kabylie Herb Soothing Moisturizer.\n\nYour Evening Ritual:\n1. Deep clean with the Rhassoul Purifying Foam Cleanser.\n2. Repair overnight with the Sahara Gold Nourishing Serum.\n\nWhy this works: Our Algerian Rhassoul clay gently extracts impurities without stripping moisture, while Argan oil rebuilds the barrier overnight.`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <section id="guide" className="py-24 bg-surface/50 border-y border-border-warm px-6 relative overflow-hidden">
      <div className="absolute -left-32 -top-32 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
      <div className="absolute right-0 bottom-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl translate-y-1/2" />

      <div className="max-w-3xl mx-auto relative z-10 text-center flex flex-col items-center">
        <FadeIn>
          <h2 className="font-serif text-4xl mb-4 text-primary">{t('findRitual')}</h2>
          <p className="text-ink-soft text-lg mb-12">{t('aiSubtitle')}</p>
        </FadeIn>

        <div className="w-full bg-background rounded-[32px] p-8 md:p-12 shadow-sm border border-border-warm min-h-[400px] flex flex-col justify-center items-center relative transition-all duration-500">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full">
                <h3 className="font-serif text-2xl mb-8 text-ink">{t('skinTypeQ')}</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {SKIN_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => { setSkinType(type.id); setStep(2); }}
                      className="bg-surface hover:bg-border-warm text-ink rounded-2xl px-6 py-4 flex flex-col items-center gap-2 transition-colors w-[130px]"
                    >
                      <span className="text-2xl">{type.icon}</span>
                      <span className="text-sm font-medium">{type.id}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full">
                <h3 className="font-serif text-2xl mb-8 text-ink">{t('concernQ')}</h3>
                <div className="flex flex-wrap justify-center gap-4 mb-10">
                  {CONCERNS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setConcern(c.id)}
                      className={`rounded-2xl px-6 py-4 flex flex-col items-center gap-2 transition-all w-[140px] border-2 ${concern === c.id ? 'border-primary bg-primary/5' : 'border-transparent bg-surface hover:bg-border-warm'}`}
                    >
                      <span className="text-2xl">{c.icon}</span>
                      <span className="text-sm font-medium text-center leading-tight">{c.id}</span>
                    </button>
                  ))}
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={!concern}
                  className="bg-primary text-white uppercase tracking-widest text-sm font-bold py-4 px-10 rounded-full hover:bg-opacity-90 disabled:opacity-50 transition-all"
                >
                  {t('getRitual')}
                </button>
                <div className="mt-4">
                  <button onClick={() => setStep(1)} className="text-ink-soft text-sm underline hover:text-primary">{t('back')}</button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full text-left flex flex-col items-center">
                {loading ? (
                  <div className="flex flex-col items-center gap-6 py-12">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-surface border-t-secondary rounded-full animate-spin"></div>
                      <Leaf className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="font-serif text-xl animate-pulse text-primary">{t('noraDesigning')}</p>
                  </div>
                ) : (
                  <div className="w-full relative">
                    <div className="text-ink leading-relaxed whitespace-pre-wrap font-serif text-[17px] md:text-lg text-left p-2 rounded-xl">
                      {result}
                    </div>
                    <div className="flex justify-center gap-4 mt-10">
                       <button onClick={() => { setStep(1); setSkinType(''); setConcern(''); }} className="uppercase tracking-widest text-[11px] font-bold py-3 px-6 rounded-full border border-primary text-primary hover:bg-surface transition-all">
                        {t('noraStartOver')}
                      </button>
                       <button className="bg-primary text-white uppercase tracking-widest text-[11px] font-bold py-3 px-6 rounded-full hover:bg-opacity-90 transition-all flex items-center gap-2">
                        {t('shop')}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const IngredientsSpotlight = () => {
  const { t } = useLanguage();
  return (
    <section className="py-24 bg-background px-6">
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <h2 className="font-serif text-4xl md:text-5xl text-primary text-center mb-16">{t('ingredientsStory')}</h2>
        </FadeIn>
        <div className="flex flex-col gap-6">
          {INGREDIENTS.map((ing, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className={`flex flex-col md:flex-row items-center gap-8 p-8 md:p-12 rounded-[32px] border-l-[6px] border-gold border-y border-r border-border-warm ${i % 2 === 0 ? 'bg-surface' : 'bg-background shadow-sm'}`}>
                <div className="text-[72px] md:text-[80px] leading-none shrink-0">{ing.icon}</div>
                <div className="flex-grow text-center md:text-left">
                  <h3 className="font-serif text-3xl text-primary mb-1">{ing.name}</h3>
                  <div className="text-secondary text-xs font-semibold uppercase tracking-widest mb-4 flex justify-center md:justify-start items-center gap-1">
                    <MapPin className="w-3 h-3" /> {ing.origin}
                  </div>
                  <p className="text-ink-soft leading-relaxed">{ing.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

const BrandStory = () => {
  const { siteContent } = useProductContext();
  const { t } = useLanguage();

  return (
    <section id="story" className="py-24 bg-surface px-6 relative">
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden">
        <span className="font-serif text-[40vw] text-primary whitespace-nowrap leading-none right-0 absolute select-none">
          نقاء
        </span>
      </div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        <FadeIn>
           <div className="w-full aspect-[4/5] bg-gradient-to-tr from-border-warm to-gold/20 rounded-[40px] overflow-hidden flex items-center justify-center shadow-2xl relative border-8 border-background">
             <div className="text-center font-serif text-2xl text-primary/40">Lab Photo Placeholder</div>
           </div>
        </FadeIn>
        
        <FadeIn delay={0.2} className="flex flex-col gap-6 lg:pr-12">
          <span className="uppercase tracking-[0.2em] font-semibold text-secondary text-sm">{t('ourStory')}</span>
          <h2 className="font-serif text-4xl md:text-5xl text-primary leading-tight whitespace-pre-line">
            {siteContent.storyTitle}
          </h2>
          <div className="text-ink-soft space-y-6 text-lg font-light leading-relaxed">
            <p>
              {siteContent.storyText1}
            </p>
            <p>
              {siteContent.storyText2}
            </p>
          </div>
          <button className="text-secondary hover:text-primary font-medium tracking-wide flex items-center gap-2 w-max transition-colors mt-4 pb-1 border-b-2 border-secondary/30 hover:border-primary">
            {t('readStory')} <ArrowRight className="w-4 h-4" />
          </button>
        </FadeIn>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const { t } = useLanguage();
  return (
    <section className="py-24 bg-background px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <h2 className="font-serif text-4xl md:text-5xl text-primary text-center mb-16">{t('whatTheySay')}</h2>
        </FadeIn>
        
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-12 hide-scrollbar md:grid md:grid-cols-3">
          {REVIEWS.map((review, i) => (
            <FadeIn key={i} delay={i * 0.1} className="snap-center shrink-0 w-[85vw] md:w-auto">
              <div className="bg-surface rounded-[24px] p-8 h-full flex flex-col border border-border-warm shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-1 text-gold mb-6">
                  {[1,2,3,4,5].map(s => <Star key={s} fill="currentColor" className="w-4 h-4" />)}
                </div>
                <p className="font-serif italic text-xl leading-relaxed text-ink mb-8 flex-grow">"{review.text}"</p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-serif font-bold text-lg">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium text-ink flex items-center gap-1 tracking-wide">
                      {review.name} <CheckCircle2 className="w-3 h-3 text-secondary" />
                    </h4>
                    <p className="text-xs text-ink-soft uppercase tracking-wider">{review.location}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.4}>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-ink-soft mt-4">
            <span className="font-semibold text-ink">4.9/5 average rating</span>
            <span className="hidden md:inline text-border-warm">•</span>
            <span>2,400+ Algerian customers</span>
            <span className="hidden md:inline text-border-warm">•</span>
            <span>98% would recommend 🇩🇿</span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

const Newsletter = () => {
  const { t } = useLanguage();
  return (
    <section className="bg-primary text-white py-24 px-6 relative overflow-hidden">
      {/* Botanical SVG Decoration */}
      <svg className="absolute right-0 top-0 h-full w-auto opacity-5 text-white transform translate-x-1/4 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="xRightYMid meet">
        <path d="M50,100 C60,60 90,50 100,20 C80,30 70,80 50,100 Z" fill="currentColor"/>
      </svg>
      
      <div className="max-w-3xl mx-auto text-center relative z-10 flex flex-col items-center">
        <FadeIn>
          <h2 className="font-serif text-4xl md:text-5xl mb-6">{t('joinCircle')}</h2>
          <p className="text-white/80 text-lg mb-10 max-w-lg mx-auto font-light leading-relaxed">
            {t('joinDesc')}
          </p>
          <form className="flex flex-col sm:flex-row w-full max-w-md mx-auto gap-3" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder={t('emailPlaceholder')} 
              required
              className="flex-grow px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 transition-colors"
            />
            <button type="submit" className="bg-secondary hover:bg-secondary/90 text-white uppercase tracking-widest text-sm font-bold py-4 px-8 rounded-full transition-all whitespace-nowrap">
              {t('join')}
            </button>
          </form>
          <p className="text-xs text-white/50 mt-6 tracking-wide">{t('noSpam')} 🇩🇿</p>
        </FadeIn>
      </div>
    </section>
  );
}

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-background pt-20 pb-8 px-6 border-t border-border-warm">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
               <Leaf className="w-5 h-5 text-primary" />
               <span className="font-serif text-2xl text-primary font-semibold">Nourvel</span>
            </div>
            <p className="text-ink-soft text-sm mb-6 leading-relaxed">{t('footerTagline')}</p>
            <p className="text-xs uppercase tracking-widest font-semibold text-secondary">{t('madeWithLove')}</p>
          </div>
          
          <div>
            <h4 className="font-serif text-lg text-primary mb-6">{t('shop')}</h4>
            <ul className="space-y-4 text-sm text-ink-soft font-light">
               <li><a href="#" className="hover:text-primary transition-colors">{t('allProducts')}</a></li>
               <li><a href="#" className="hover:text-primary transition-colors">{t('cleansers')}</a></li>
               <li><a href="#" className="hover:text-primary transition-colors">{t('moisturizers')}</a></li>
               <li><a href="#" className="hover:text-primary transition-colors">Kits</a></li>
               <li><a href="#" className="hover:text-primary transition-colors">Bestsellers</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-serif text-lg text-primary mb-6">{t('company')}</h4>
            <ul className="space-y-4 text-sm text-ink-soft font-light">
               <li><a href="#" className="hover:text-primary transition-colors">{t('ourStory')}</a></li>
               <li><a href="#" className="hover:text-primary transition-colors">Ingredients</a></li>
               <li><a href="#" className="hover:text-primary transition-colors">{t('skinGuide')}</a></li>
               <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
               <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-serif text-lg text-primary mb-6">{t('helpContact')}</h4>
            <ul className="space-y-4 text-sm text-ink-soft font-light">
               <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
               <li><a href="#" className="hover:text-primary transition-colors">Shipping Info</a></li>
               <li><a href="#" className="hover:text-primary transition-colors">Returns</a></li>
               <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
               <li><a href="#" className="text-primary hover:text-primary/70 font-medium transition-colors">WhatsApp: +213 (0) 555 12 34 56</a></li>
            </ul>
            <div className="mt-8 flex gap-3">
               {[
                 { id: 'instagram', icon: Instagram },
                 { id: 'facebook', icon: Facebook },
                 { id: 'tiktok', icon: PlaySquare },
                 { id: 'whatsapp', icon: MessageCircle }
               ].map(social => (
                 <div key={social.id} className="w-10 h-10 rounded-full bg-surface hover:bg-border-warm flex items-center justify-center cursor-pointer transition-colors text-primary">
                    <social.icon className="w-4 h-4" />
                 </div>
               ))}
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border-warm flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-ink-soft font-light">
          <p>{t('allRights')}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">{t('privacy')}</a>
            <a href="#" className="hover:text-primary transition-colors">{t('terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <div className="min-h-screen text-ink overflow-x-hidden selection:bg-gold/30 flex flex-col">
      <NavBar />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <TrustBar />
              <ProductSection />
              <AISkinFinder />
              <IngredientsSpotlight />
              <BrandStory />
              <Testimonials />
              <Newsletter />
            </>
          } />
          {import.meta.env.VITE_HIDE_ADMIN !== 'true' && (
            <Route path="/admin" element={<Admin />} />
          )}
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
