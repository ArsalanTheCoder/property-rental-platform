import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Building, DollarSign, Filter } from 'lucide-react';
import { Button } from '../common/Button';

export const SearchBar = ({ onSearch, initialValues = {} }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState(initialValues.search || '');
  const [location, setLocation] = useState(initialValues.location || '');
  const [propertyType, setPropertyType] = useState(initialValues.propertyType || 'all');
  const [maxPrice, setMaxPrice] = useState(initialValues.maxPrice || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (search.trim()) params.set('search', search.trim());
    if (location.trim() && location !== 'all') params.set('location', location.trim());
    if (propertyType && propertyType !== 'all') params.set('propertyType', propertyType);
    if (maxPrice) params.set('maxPrice', maxPrice);

    if (onSearch) {
      onSearch(Object.fromEntries(params));
    } else {
      navigate(`/properties?${params.toString()}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-white/90 dark:bg-dark-card/90 backdrop-blur-xl border border-slate-200/80 dark:border-dark-border p-3 sm:p-4 rounded-3xl shadow-2xl flex flex-col lg:flex-row gap-3 items-center"
    >
      {/* Search Input */}
      <div className="flex-1 w-full flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
        <Search className="w-5 h-5 text-brand-500 shrink-0" />
        <div className="flex flex-col flex-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Keyword / Title</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="e.g. Luxury Penthouse, Horizon Villa..."
            className="bg-transparent text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Location Dropdown / Input */}
      <div className="flex-1 w-full flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
        <MapPin className="w-5 h-5 text-brand-500 shrink-0" />
        <div className="flex flex-col flex-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, Area, Sector..."
            className="bg-transparent text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Property Type Select */}
      <div className="w-full lg:w-48 flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
        <Building className="w-5 h-5 text-brand-500 shrink-0" />
        <div className="flex flex-col flex-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Type</label>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="bg-transparent text-sm font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer w-full"
          >
            <option value="all" className="bg-white dark:bg-slate-900">All Types</option>
            <option value="Apartment" className="bg-white dark:bg-slate-900">Apartment</option>
            <option value="Villa" className="bg-white dark:bg-slate-900">Villa</option>
            <option value="Penthouse" className="bg-white dark:bg-slate-900">Penthouse</option>
            <option value="House" className="bg-white dark:bg-slate-900">House</option>
            <option value="Studio" className="bg-white dark:bg-slate-900">Studio</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <Button type="submit" variant="primary" size="lg" icon={Search} className="w-full lg:w-auto shrink-0 shadow-xl">
        Search Properties
      </Button>
    </form>
  );
};
