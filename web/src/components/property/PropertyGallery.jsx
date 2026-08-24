import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, X, Image as ImageIcon } from 'lucide-react';

export const PropertyGallery = ({ images = [], title = 'Property Image' }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const galleryImages = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
  ];

  const handleNext = (e) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Main Showcase Image */}
      <div className="relative h-80 sm:h-[450px] w-full rounded-3xl overflow-hidden bg-slate-950 shadow-xl group">
        <motion.img
          key={selectedIndex}
          src={galleryImages[selectedIndex]}
          alt={`${title} - Photo ${selectedIndex + 1}`}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setLightboxOpen(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/20 pointer-events-none" />

        {/* Fullscreen Trigger */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute top-4 right-4 p-3 rounded-full bg-slate-900/60 backdrop-blur-md text-white hover:bg-white hover:text-slate-900 transition-colors shadow-lg"
          title="Open Fullscreen Lightbox"
        >
          <Maximize2 className="w-5 h-5" />
        </button>

        {/* Gallery Counter */}
        <div className="absolute bottom-4 left-4 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-brand-400" />
          <span>{selectedIndex + 1} / {galleryImages.length}</span>
        </div>

        {/* Navigation Arrows */}
        {galleryImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/60 backdrop-blur-md text-white hover:bg-brand-500 transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/60 backdrop-blur-md text-white hover:bg-brand-500 transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {galleryImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {galleryImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative h-20 w-28 shrink-0 rounded-xl overflow-hidden transition-all duration-200 border-2 ${
                selectedIndex === idx
                  ? 'border-brand-500 ring-4 ring-brand-500/20 scale-105'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Overlay Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-8"
          >
            {/* Lightbox Header */}
            <div className="w-full max-w-6xl flex items-center justify-between text-white">
              <span className="font-bold text-lg">{title}</span>
              <button
                onClick={() => setLightboxOpen(false)}
                className="p-2 rounded-full bg-slate-800 text-white hover:bg-rose-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Lightbox Main Image */}
            <div className="relative w-full max-w-5xl h-[70vh] flex items-center justify-center">
              <img
                src={galleryImages[selectedIndex]}
                alt="Fullscreen Property Photo"
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              />

              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 p-3 rounded-full bg-slate-800/80 text-white hover:bg-brand-500 transition-colors"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-2 p-3 rounded-full bg-slate-800/80 text-white hover:bg-brand-500 transition-colors"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}
            </div>

            {/* Lightbox Footer Counter */}
            <div className="text-slate-400 font-semibold text-sm">
              Photo {selectedIndex + 1} of {galleryImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
