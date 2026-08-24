import React from 'react';
import { motion } from 'framer-motion';
import { PropertyCard } from './PropertyCard';
import { PropertyCardSkeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';

export const PropertyGrid = ({
  properties = [],
  loading = false,
  viewMode = 'grid',
  onResetFilters
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <PropertyCardSkeleton key={n} />
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <EmptyState
        title="No Matching Properties"
        description="We couldn't find any rental properties matching your current search parameters. Try broadening your location or price range."
        actionText="Reset Filters"
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'flex flex-col gap-6'
      }
    >
      {properties.map((property, idx) => (
        <PropertyCard key={property.propertyId || property.id || idx} property={property} />
      ))}
    </div>
  );
};
