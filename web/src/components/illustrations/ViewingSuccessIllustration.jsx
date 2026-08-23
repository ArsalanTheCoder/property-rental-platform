import React from 'react';
import { motion } from 'framer-motion';

export const ViewingSuccessIllustration = () => {
  return (
    <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
      <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10"
      >
        {/* Calendar Backdrop */}
        <rect x="30" y="40" width="100" height="90" rx="16" fill="#1e293b" stroke="#10b981" strokeWidth="4" />
        <path d="M30 65 H130" stroke="#10b981" strokeWidth="4" />
        
        {/* Calendar Ring Hooks */}
        <rect x="50" y="30" width="10" height="20" rx="5" fill="#f59e0b" />
        <rect x="100" y="30" width="10" height="20" rx="5" fill="#f59e0b" />

        {/* Checkmark Badge */}
        <motion.circle
          cx="80"
          cy="95"
          r="26"
          fill="#10b981"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />

        <motion.path
          d="M 68 95 L 76 103 L 94 85"
          stroke="#ffffff"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        />

        {/* Floating Confetti Stars */}
        <motion.circle
          cx="20"
          cy="40"
          r="4"
          fill="#fbbf24"
          animate={{ y: [-4, 4, -4], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.circle
          cx="140"
          cy="50"
          r="5"
          fill="#34d399"
          animate={{ y: [4, -4, 4], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
      </svg>
    </div>
  );
};
