import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  Bot,
  CalendarCheck,
  Search,
  ArrowRight,
  Building2,
  CheckCircle2,
  Users,
  Award,
  Compass,
  MapPin,
  Heart,
  KeyRound,
  MessageSquare
} from 'lucide-react';
import { SearchBar } from '../components/property/SearchBar';
import { PropertyCard } from '../components/property/PropertyCard';
import { PropertyCardSkeleton } from '../components/common/Skeleton';
import { Button } from '../components/common/Button';
import { propertyService } from '../services/propertyService';

export const Home = () => {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await propertyService.getFeaturedProperties();
        if (res.success && Array.isArray(res.properties)) {
          setFeaturedProperties(res.properties);
        }
      } catch (err) {
        console.warn('Failed to load featured properties:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  const categoryChips = [
    { label: 'All Listings', path: '/properties' },
    { label: 'Apartments', path: '/properties?propertyType=Apartment' },
    { label: 'Penthouses', path: '/properties?propertyType=Penthouse' },
    { label: 'Villas', path: '/properties?propertyType=Villa' },
    { label: 'Furnished Homes', path: '/properties?furnished=true' },
  ];

  const features = [
    {
      icon: ShieldCheck,
      title: 'Verified Listings',
      description: 'Every villa, penthouse, and apartment passes rigorous physical inspection and ownership verification.'
    },
    {
      icon: Bot,
      title: 'Grounded AI Assistant',
      description: 'Instant property-specific answers regarding lease terms, maintenance, amenities, and room dimensions.'
    },
    {
      icon: CalendarCheck,
      title: 'Seamless Tour Bookings',
      description: 'Schedule in-person property tours in seconds and track real-time confirmation timelines.'
    },
    {
      icon: Award,
      title: 'Zero Hidden Fees',
      description: 'Transparent monthly rental pricing in Pakistani Rupees (PKR) with direct landlord connections.'
    }
  ];

  const steps = [
    {
      num: '01',
      title: 'Discover & Refine',
      desc: 'Filter properties by location, bedrooms, furnished condition, and monthly budget.',
      icon: Compass
    },
    {
      num: '02',
      title: 'Inspect Photo Galleries',
      desc: 'Browse architectural photo galleries, room specifications, and amenity breakdowns.',
      icon: Building2
    },
    {
      num: '03',
      title: 'Ask AI Concierge',
      desc: 'Ask questions in natural language and receive grounded answers from property documents.',
      icon: Bot
    },
    {
      num: '04',
      title: 'Schedule In-Person Tour',
      desc: 'Select preferred dates and times to tour the home before finalizing your lease.',
      icon: KeyRound
    }
  ];

  const sampleAiQuestions = [
    'Are utilities and maintenance included in the rent?',
    'Is dedicated parking allocated with this unit?',
    'What are the security deposit and lease duration terms?'
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Ambient Gradient Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto gap-6">
            {/* Top Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>Pakistan's Premier AI-Powered Rental Marketplace</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12]"
            >
              Find a rental that <br className="hidden sm:inline" />
              <span className="gradient-text">feels like home.</span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-2xl"
            >
              Explore curated apartments, penthouses, and luxury villas with verified photos, instant AI property answers, and effortless tour scheduling.
            </motion.p>

            {/* Luxury SearchBar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-full pt-4 max-w-4xl"
            >
              <SearchBar />

              {/* Category Quick Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Popular:</span>
                {categoryChips.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => navigate(chip.path)}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-sm"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Platform Stats Counter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-3 gap-6 sm:gap-12 pt-10 border-t border-slate-200/80 dark:border-slate-800/80 w-full max-w-2xl"
            >
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">100%</span>
                <span className="block text-xs font-semibold text-slate-400 mt-0.5">Verified Listings</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">Groq AI</span>
                <span className="block text-xs font-semibold text-slate-400 mt-0.5">Instant Q&A Insights</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Rs. PKR</span>
                <span className="block text-xs font-semibold text-slate-400 mt-0.5">Transparent Pricing</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED LISTINGS SHOWCASE */}
      <section className="py-20 bg-slate-100/60 dark:bg-slate-950/40 border-y border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Handpicked Selection</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Featured Rental Properties
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
                Explore our highest-rated residences available for immediate viewing tours.
              </p>
            </div>

            <Link
              to="/properties"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500 transition-all shadow-sm w-fit"
            >
              <span>View All Properties</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <PropertyCardSkeleton key={n} />
              ))}
            </div>
          ) : featuredProperties.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center max-w-lg mx-auto">
              <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Listings Updating</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Properties published by administrators will appear here in real time.
              </p>
              <Link to="/properties">
                <Button variant="primary" size="sm">Explore Directory</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.slice(0, 6).map((property) => (
                <PropertyCard key={property._id || property.propertyId || property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. INTERACTIVE AI CHATBOT HIGHLIGHT */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-8 sm:p-14 border border-slate-800 shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              <div className="lg:col-span-7 flex flex-col gap-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold w-fit">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <span>Grounded AI Property Assistant</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                  Instant answers. <br />
                  <span className="text-emerald-400">Zero guesswork.</span>
                </h2>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                  Every property on HAVEN includes a dedicated AI Concierge loaded strictly with its verified lease details, room dimensions, pet policies, and amenities.
                </p>

                {/* Sample Prompt Chips */}
                <div className="flex flex-col gap-2 pt-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Example Questions Tenants Ask:</p>
                  {sampleAiQuestions.map((q) => (
                    <div
                      key={q}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-slate-200"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>"{q}"</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold mb-4 shadow-lg shadow-emerald-500/30">
                  <Bot className="w-8 h-8 text-slate-950" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Powered by Groq LLM Engine</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6 max-w-xs">
                  Experience ~400ms ultra-fast inference with strict anti-hallucination guardrails.
                </p>
                <Link to="/properties">
                  <Button variant="primary" size="lg" icon={ArrowRight}>
                    Try on Any Property
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOUR-STEP HOW IT WORKS */}
      <section className="py-20 bg-slate-100/60 dark:bg-slate-950/40 border-y border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
              <Compass className="w-4 h-4" />
              <span>Simple 4-Step Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              How HAVEN Works
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              From discovery to physical tour in under two minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.num}
                  className="flex flex-col gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <StepIcon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION FOOTER BANNER */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white p-10 sm:p-16 text-center flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-2xl leading-tight">
              Ready to find your next dream home?
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base max-w-xl">
              Browse our complete catalog of verified rentals or ask our AI assistant for personalized suggestions.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-2">
              <Link to="/properties">
                <button className="px-8 py-3.5 rounded-2xl bg-white text-emerald-800 font-bold text-sm shadow-xl hover:bg-emerald-50 hover:shadow-2xl transition-all">
                  Browse Properties
                </button>
              </Link>
              <Link to="/signup">
                <button className="px-8 py-3.5 rounded-2xl bg-emerald-800/80 hover:bg-emerald-800 border border-emerald-400/40 text-white font-bold text-sm shadow-xl transition-all">
                  Create Free Account
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
