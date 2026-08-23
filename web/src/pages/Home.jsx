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
  Award
} from 'lucide-react';
import { HeroHouseIllustration } from '../components/illustrations/HeroHouseIllustration';
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

  const features = [
    {
      icon: ShieldCheck,
      title: 'Verified Listings',
      description: 'Every villa, penthouse, and apartment passes rigorous physical inspection standards.'
    },
    {
      icon: Bot,
      title: 'Smart AI Assistance',
      description: 'Instant context-aware AI answers regarding property lease terms, amenities, and room dimensions.'
    },
    {
      icon: CalendarCheck,
      title: 'Seamless Viewings',
      description: 'Schedule in-person property tours in seconds and track real-time confirmation timelines.'
    },
    {
      icon: Award,
      title: 'Premium Experience',
      description: 'Architectural photography, transparent pricing, and zero hidden platform commission fees.'
    }
  ];

  const steps = [
    {
      num: '01',
      title: 'Discover & Filter',
      desc: 'Browse handpicked properties by location, bedrooms, furnished status, and price range.'
    },
    {
      num: '02',
      title: 'Explore Galleries',
      desc: 'View high-definition architectural photo galleries, room specs, and neighborhood maps.'
    },
    {
      num: '03',
      title: 'Ask AI Concierge',
      desc: 'Get instant answers about the specific property from our contextually loaded AI assistant.'
    },
    {
      num: '04',
      title: 'Schedule Viewing',
      desc: 'Select your preferred time slot and submit a viewing request with status tracking.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
        {/* Background Gradient Orbs */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy & Search */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 flex flex-col gap-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 dark:bg-brand-950/60 border border-brand-500/30 text-brand-600 dark:text-brand-400 text-xs font-bold w-fit">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <span>Next-Gen Property Rental Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                Find a place that <span className="gradient-text">feels like home.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-xl">
                Discover luxury penthouses, modern apartments, and private villas. Powered by context-aware AI insights and effortless viewing requests.
              </p>

              {/* Integrated SearchBar Component */}
              <div className="pt-2">
                <SearchBar />
              </div>

              {/* Quick Stats Bar */}
              <div className="pt-4 grid grid-cols-3 gap-6 border-t border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">1,200+</span>
                  <span className="block text-xs font-semibold text-slate-400">Verified Homes</span>
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">99.4%</span>
                  <span className="block text-xs font-semibold text-slate-400">Viewing Satisfaction</span>
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-brand-500">24/7</span>
                  <span className="block text-xs font-semibold text-slate-400">AI Concierge</span>
                </div>
              </div>
            </motion.div>

            {/* Right 2D Animated Hero House Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 flex justify-center"
            >
              <HeroHouseIllustration />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED PROPERTIES SECTION */}
      <section className="py-20 bg-slate-100/60 dark:bg-dark-card/40 border-y border-slate-200/60 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-500">Curated Collection</span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Featured Rental Properties
              </h2>
            </div>

            <Link to="/properties">
              <Button variant="outline" icon={ArrowRight}>
                Explore All Properties
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <PropertyCardSkeleton key={n} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((prop) => (
                <PropertyCard key={prop.propertyId || prop.id} property={prop} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. WHY CHOOSE US SECTION */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-500">Platform Excellence</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              Why Modern Tenants Choose HAVEN
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
              Built with precision UX to remove friction from searching, inquiring, and touring properties.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col gap-4 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{feat.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (SCROLL ANIMATED) */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Step-By-Step Journey</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              How HAVEN Works for Tenants
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl flex flex-col gap-4 relative"
              >
                <span className="text-4xl font-black text-brand-400 opacity-60">{step.num}</span>
                <h3 className="text-xl font-bold text-white">{step.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. AI ASSISTANT SPOTLIGHT SECTION */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-brand-950 via-slate-900 to-slate-950 border border-brand-800/60 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex flex-col gap-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-bold w-fit">
                <Bot className="w-4 h-4 text-brand-400" />
                <span>Property-Contextual AI Assistant</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Have questions about a property? <span className="text-brand-400">Ask AI.</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                No need to guess furnished conditions or monthly utility costs. Open the property details page and trigger our contextually aware assistant to ask questions instantly.
              </p>
              <div className="pt-2">
                <Link to="/properties">
                  <Button variant="primary" icon={ArrowRight}>
                    Try AI Assistant on Properties
                  </Button>
                </Link>
              </div>
            </div>

            {/* AI Assistant Chat Preview Graphic */}
            <div className="w-full max-w-sm bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-400 pb-2 border-b border-slate-800">
                <Sparkles className="w-4 h-4" />
                <span>Context: The Grand Horizon Penthouse</span>
              </div>
              <div className="bg-brand-500/20 text-brand-200 text-xs p-2.5 rounded-xl ml-auto">
                Is this property furnished?
              </div>
              <div className="bg-slate-800 text-slate-200 text-xs p-2.5 rounded-xl mr-auto leading-relaxed border border-slate-700">
                Yes! The rental condition is **Furnished** with Italian marble finishes and custom sofa sets included.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA SECTION */}
      <section className="py-20 bg-slate-100/70 dark:bg-dark-card/50">
        <div className="max-w-4xl mx-auto px-4 text-center flex flex-col items-center gap-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Ready to find your next home?
          </h2>
          <p className="text-base text-slate-500 dark:text-slate-400 max-w-xl">
            Explore verified properties across top locations with interactive search filters and simple viewing requests.
          </p>
          <Link to="/properties">
            <Button variant="primary" size="lg" icon={ArrowRight}>
              Explore Properties Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
