import React from 'react';
import { motion } from 'framer-motion';

export const AIAvatarIllustration = ({ size = "md", isTyping = false }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-11 h-11",
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  return (
    <div className={`relative ${sizeClasses[size] || sizeClasses.md} flex items-center justify-center shrink-0`}>
      {/* Outer Breathing Ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-500 via-emerald-400 to-amber-400 opacity-60 blur-sm"
        animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* SVG Avatar Node */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-md"
      >
        {/* Core Sphere */}
        <circle cx="50" cy="50" r="42" fill="url(#ai-core)" stroke="#ffffff" strokeWidth="3" opacity="0.9" />

        {/* Floating Ring Orbit */}
        <motion.ellipse
          cx="50"
          cy="50"
          rx="32"
          ry="14"
          fill="none"
          stroke="#6ee7b7"
          strokeWidth="3"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />

        {/* AI Eyes / Sensor Nodes */}
        <motion.circle
          cx="38"
          cy="46"
          r="5"
          fill="#ffffff"
          animate={isTyping ? { scale: [1, 1.4, 1] } : {}}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <motion.circle
          cx="62"
          cy="46"
          r="5"
          fill="#ffffff"
          animate={isTyping ? { scale: [1, 1.4, 1] } : {}}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
        />

        {/* Smiling Digital Arc */}
        <path
          d="M 38 64 Q 50 74 62 64"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Top Antenna Sparkle */}
        <circle cx="50" cy="18" r="4" fill="#fbbf24" />

        <defs>
          <linearGradient id="ai-core" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
