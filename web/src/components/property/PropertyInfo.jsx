import React from 'react';
import { MapPin, Bed, Bath, Maximize2, Check, Home } from 'lucide-react';
import { Badge } from '../common/Badge';

export const PropertyInfo = ({ property }) => {
  const displayLocation = typeof property.location === 'object'
    ? [property.location?.address, property.location?.city].filter(Boolean).join(', ')
    : property.location;

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Title & Header Section */}
      <div className="flex flex-col gap-3 pb-6 border-b border-slate-200 dark:border-dark-border">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="brand" size="md">{property.propertyType}</Badge>
          <Badge variant="gold" size="md">{property.furnished ? 'Furnished' : 'Unfurnished'}</Badge>
          <Badge variant="confirmed" size="md">Available Now</Badge>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          {property.title}
        </h1>

        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
          <span>{displayLocation || 'Prime Location'}</span>
        </div>
      </div>

      {/* Main Specs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
            <Bed className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-400 uppercase">Bedrooms</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">{property.bedrooms} Beds</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
            <Bath className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-400 uppercase">Bathrooms</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">{property.bathrooms} Baths</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
            <Maximize2 className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-400 uppercase">Area</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">{property.areaSqFt || 2400} sqft</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
            <Home className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-400 uppercase">Condition</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">{property.furnished ? 'Furnished' : 'Unfurnished'}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Property Description
        </h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
          {property.description}
        </p>
      </div>

      {/* Amenities Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Included Features & Amenities</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(property.amenities || []).map((amenity, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border text-sm font-semibold text-slate-800 dark:text-slate-200 shadow-sm"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>{amenity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
