import React from 'react';
import { motion } from 'framer-motion';

export const HeroHouseIllustration = () => {
  return (
    <div className="relative w-full max-w-xl mx-auto flex items-center justify-center p-4">
      {/* Dynamic Background Glow Halo */}
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/20 via-emerald-400/10 to-amber-400/20 rounded-full blur-3xl opacity-70 animate-pulse-slow" />

      {/* SVG Container */}
      <svg
        viewBox="0 0 600 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-2xl relative z-10"
      >
        {/* Floating Clouds Background Animation */}
        <motion.g
          animate={{ x: [-15, 20, -15] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path
            d="M80 100 C80 85, 100 75, 120 85 C130 70, 160 70, 175 85 C190 85, 200 100, 190 115 C175 125, 95 125, 80 100 Z"
            fill="currentColor"
            className="text-slate-200/50 dark:text-slate-700/40"
          />
        </motion.g>

        <motion.g
          animate={{ x: [20, -25, 20] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path
            d="M400 70 C400 55, 420 45, 440 55 C450 40, 480 40, 495 55 C510 55, 520 70, 510 85 C495 95, 415 95, 400 70 Z"
            fill="currentColor"
            className="text-slate-200/40 dark:text-slate-700/30"
          />
        </motion.g>

        {/* Decorative Sun / Warm Aura */}
        <motion.circle
          cx="480"
          cy="120"
          r="40"
          fill="url(#sun-gradient)"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Ground Base Oval Platform */}
        <ellipse cx="300" cy="430" rx="250" ry="35" fill="currentColor" className="text-slate-200 dark:text-slate-800" />
        <ellipse cx="300" cy="430" rx="230" ry="25" fill="currentColor" className="text-emerald-500/10 dark:text-emerald-500/20" />

        {/* Modern House Main Structure */}
        {/* Main Base Block */}
        <rect x="180" y="240" width="240" height="170" rx="12" fill="url(#building-body)" />

        {/* Secondary Upper Cantilever Block */}
        <rect x="230" y="160" width="160" height="100" rx="10" fill="url(#building-top)" className="shadow-2xl" />

        {/* Roof overhang line */}
        <rect x="220" y="152" width="180" height="12" rx="4" fill="#0f172a" />

        {/* Glass Windows with subtle animated glow */}
        <motion.rect
          x="250"
          y="180"
          width="50"
          height="60"
          rx="6"
          fill="url(#window-glow)"
          animate={{ opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        <motion.rect
          x="320"
          y="180"
          width="50"
          height="60"
          rx="6"
          fill="url(#window-glow)"
          animate={{ opacity: [0.9, 0.7, 0.9] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* Ground Floor Glass Door */}
        <rect x="270" y="310" width="60" height="100" rx="4" fill="#1e293b" />
        <rect x="275" y="315" width="23" height="90" rx="2" fill="url(#window-glow)" opacity="0.9" />
        <rect x="302" y="315" width="23" height="90" rx="2" fill="url(#window-glow)" opacity="0.9" />

        {/* Side Decorative Slats */}
        <rect x="200" y="270" width="50" height="8" rx="4" fill="#10b981" />
        <rect x="200" y="290" width="50" height="8" rx="4" fill="#10b981" opacity="0.8" />
        <rect x="200" y="310" width="50" height="8" rx="4" fill="#10b981" opacity="0.6" />

        {/* Trees & Landscaping */}
        {/* Left Tree */}
        <circle cx="130" cy="370" r="30" fill="#059669" />
        <circle cx="140" cy="350" r="24" fill="#10b981" />
        <rect x="132" y="390" width="8" height="35" rx="4" fill="#78350f" />

        {/* Right Tree */}
        <circle cx="450" cy="360" r="35" fill="#047857" />
        <circle cx="460" cy="335" r="28" fill="#34d399" />
        <rect x="452" y="380" width="10" height="45" rx="5" fill="#78350f" />

        {/* Floating Location Pin Marker with pulse */}
        <motion.g
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Pin Shadow */}
          <ellipse cx="300" cy="140" rx="20" ry="6" fill="#000" opacity="0.2" />

          {/* Location Pin */}
          <path
            d="M300 60 C283 60 270 73 270 90 C270 115 300 135 300 135 C300 135 330 115 330 90 C330 73 317 60 300 60 Z"
            fill="url(#pin-gradient)"
          />
          <circle cx="300" cy="90" r="10" fill="#ffffff" />
          <path d="M296 90 L300 84 L304 90 M300 85 L300 95" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
        </motion.g>

        {/* Floating Sparkles & Decorative Particles */}
        <motion.circle
          cx="160"
          cy="180"
          r="4"
          fill="#f59e0b"
          animate={{ y: [-5, 5, -5], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        <motion.circle
          cx="440"
          cy="220"
          r="5"
          fill="#10b981"
          animate={{ y: [5, -8, 5], opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 3.2, repeat: Infinity }}
        />

        {/* SVG Gradients Definition */}
        <defs>
          <linearGradient id="sun-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          <linearGradient id="building-body" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="building-top" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          <linearGradient id="window-glow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          <linearGradient id="pin-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
