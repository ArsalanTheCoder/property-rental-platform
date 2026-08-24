import React from 'react';
import { RotateCcw, SlidersHorizontal, Check } from 'lucide-react';
import { Button } from '../common/Button';

const AMENITY_OPTIONS = [
  "Swimming Pool",
  "High-Speed WiFi",
  "Gym",
  "Private Parking",
  "24/7 Security",
  "Balcony",
  "Central Air Conditioning",
  "Private Garden",
  "Smart Home Automation",
  "Pet Friendly"
];

export const PropertyFilters = ({ filters, onChange, onReset }) => {
  const handleBedChange = (val) => {
    onChange({ ...filters, bedrooms: filters.bedrooms === val ? 'all' : val });
  };

  const handleFurnishedChange = (val) => {
    onChange({ ...filters, furnished: filters.furnished === val ? 'all' : val });
  };

  const handleAmenityToggle = (amenity) => {
    const current = filters.amenities || [];
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    onChange({ ...filters, amenities: updated });
  };

  return (
    <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-6 flex flex-col gap-6 shadow-sm sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-dark-border">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <SlidersHorizontal className="w-5 h-5 text-brand-500" />
          <span>Refine Search</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-slate-400 hover:text-brand-500 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Property Type */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Property Type
        </label>
        <select
          value={filters.propertyType || 'all'}
          onChange={(e) => onChange({ ...filters, propertyType: e.target.value })}
          className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
        >
          <option value="all">All Types</option>
          <option value="Apartment">Apartment</option>
          <option value="Villa">Villa</option>
          <option value="Penthouse">Penthouse</option>
          <option value="House">House</option>
          <option value="Studio">Studio</option>
        </select>
      </div>

      {/* Max Monthly Price */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          <span>Max Monthly Rent</span>
          <span className="text-brand-500 font-extrabold text-sm">
            ${Number(filters.maxPrice || 6000).toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min="500"
          max="6000"
          step="100"
          value={filters.maxPrice || 6000}
          onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
          className="w-full accent-brand-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
          <span>$500</span>
          <span>$6,000+</span>
        </div>
      </div>

      {/* Bedrooms Counter Buttons */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Bedrooms
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {['all', '1', '2', '3', '4+'].map((val) => {
            const active = (filters.bedrooms || 'all') === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => handleBedChange(val)}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  active
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {val === 'all' ? 'Any' : val}
              </button>
            );
          })}
        </div>
      </div>

      {/* Furnished Status */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Furnished Condition
        </label>
        <div className="flex flex-col gap-1.5">
          {['all', 'Furnished', 'Semi-Furnished', 'Unfurnished'].map((cond) => {
            const active = (filters.furnished || 'all') === cond;
            return (
              <button
                key={cond}
                type="button"
                onClick={() => handleFurnishedChange(cond)}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-brand-500/10 border border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-dark-border text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <span>{cond === 'all' ? 'Any Furnishing' : cond}</span>
                {active && <Check className="w-4 h-4 text-brand-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Key Amenities */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Amenities
        </label>
        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
          {AMENITY_OPTIONS.map((amenity) => {
            const checked = (filters.amenities || []).includes(amenity);
            return (
              <button
                key={amenity}
                type="button"
                onClick={() => handleAmenityToggle(amenity)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  checked
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {amenity}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
