import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, LayoutGrid, List, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { PropertyGrid } from '../components/property/PropertyGrid';
import { PropertyFilters } from '../components/property/PropertyFilters';
import { propertyService } from '../services/propertyService';

export const PropertyList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Parse filters from URL searchParams (RFC-003-B parameter alignment)
  const getFiltersFromURL = () => ({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || searchParams.get('location') || '',
    propertyType: searchParams.get('propertyType') || 'all',
    bedrooms: searchParams.get('bedrooms') || 'all',
    bathrooms: searchParams.get('bathrooms') || 'all',
    maxPrice: searchParams.get('maxPrice') || '6000',
    minPrice: searchParams.get('minPrice') || '',
    furnished: searchParams.get('furnished') || 'all',
    sort: searchParams.get('sort') || searchParams.get('sortBy') || 'newest',
    amenities: searchParams.getAll('amenities') || []
  });

  const [filters, setFilters] = useState(getFiltersFromURL());

  // Sync state to URL and fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const queryParams = {};
        if (filters.search) queryParams.search = filters.search;
        if (filters.city && filters.city !== 'all') queryParams.city = filters.city;
        if (filters.propertyType && filters.propertyType !== 'all') queryParams.propertyType = filters.propertyType;
        if (filters.bedrooms && filters.bedrooms !== 'all') queryParams.bedrooms = filters.bedrooms;
        if (filters.maxPrice) queryParams.maxPrice = filters.maxPrice;
        if (filters.minPrice) queryParams.minPrice = filters.minPrice;
        if (filters.furnished && filters.furnished !== 'all') queryParams.furnished = filters.furnished;
        if (filters.sort) queryParams.sort = filters.sort;

        const res = await propertyService.getProperties(queryParams);
        if (res.success && Array.isArray(res.properties)) {
          setProperties(res.properties);
        }
      } catch (err) {
        console.warn('Error fetching property list:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [searchParams]);

  const updateFilters = (newFilters) => {
    setFilters(newFilters);
    const params = new URLSearchParams();

    Object.entries(newFilters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((val) => params.append(key, val));
      } else if (value && value !== 'all') {
        params.set(key, value);
      }
    });

    setSearchParams(params);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      search: '',
      city: '',
      propertyType: 'all',
      bedrooms: 'all',
      bathrooms: 'all',
      maxPrice: '6000',
      minPrice: '',
      furnished: 'all',
      sort: 'newest',
      amenities: []
    };
    setFilters(defaultFilters);
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Explore Rental Properties
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing {properties.length} verified published residences. Filter by location, price, and specs.
          </p>
        </div>

        {/* Top Control Bar: Search Input, View Mode Toggle, Sorting Select */}
        <div className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border p-4 rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Keyword Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => updateFilters({ ...filters, search: e.target.value })}
              placeholder="Search title, city, location..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-dark-border text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              <SlidersHorizontal className="w-4 h-4 text-brand-500" />
              <span>Filters</span>
            </button>

            {/* Sort Select (RFC-003-B options) */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={filters.sort}
                onChange={(e) => updateFilters({ ...filters, sort: e.target.value })}
                className="py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-dark-border text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="newest">Sort by: Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="bedrooms_desc">Bedrooms: Most First</option>
              </select>
            </div>

            {/* Grid / List View Toggle */}
            <div className="hidden sm:flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-dark-card text-brand-500 shadow-sm'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-dark-card text-brand-500 shadow-sm'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Catalog Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <PropertyFilters
              filters={filters}
              onChange={updateFilters}
              onReset={handleResetFilters}
            />
          </div>

          {/* Mobile Collapsible Filter Drawer */}
          {mobileFilterOpen && (
            <div className="lg:hidden col-span-1">
              <PropertyFilters
                filters={filters}
                onChange={updateFilters}
                onReset={handleResetFilters}
              />
            </div>
          )}

          {/* Property Cards Grid */}
          <div className="lg:col-span-9">
            <PropertyGrid
              properties={properties}
              loading={loading}
              viewMode={viewMode}
              onResetFilters={handleResetFilters}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
