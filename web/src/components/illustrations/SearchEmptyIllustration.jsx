import React from 'react';
import { motion } from 'framer-motion';

export const SearchEmptyIllustration = () => {
  return (
    <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
      <div className="absolute inset-0 bg-brand-500/10 rounded-full blur-2xl animate-pulse" />
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10"
      >
        {/* House Wireframe Outline */}
        <path
          d="M50 140 V95 L100 55 L150 95 V140 H50 Z"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-300 dark:text-slate-700"
        />
        <rect
          x="85"
          y="110"
          width="30"
          height="30"
          rx="4"
          stroke="currentColor"
          strokeWidth="5"
          className="text-slate-300 dark:text-slate-700"
        />

        {/* Animated Magnifying Glass with Floating Pin */}
        <motion.g
          animate={{
            y: [-6, 6, -6],
            rotate: [-4, 4, -4]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Glass Lens Circle */}
          <circle cx="115" cy="100" r="35" fill="none" stroke="#10b981" strokeWidth="8" />
          <line x1="140" y1="125" x2="170" y2="155" stroke="#10b981" strokeWidth="10" strokeLinecap="round" />

          {/* Question Pin Inside Lens */}
          <circle cx="115" cy="100" r="8" fill="#f59e0b" />
        </motion.g>

        {/* Floating Sparkles */}
        <motion.circle
          cx="45"
          cy="65"
          r="4"
          fill="#10b981"
          animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        <motion.circle
          cx="160"
          cy="50"
          r="5"
          fill="#fbbf24"
          animate={{ scale: [1, 0.7, 1], opacity: [0.8, 0.4, 0.8] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </svg>
    </div>
  );
};
