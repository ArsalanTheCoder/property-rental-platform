import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MapPin, Bed, Bath, Maximize2 } from 'lucide-react';
import { Badge } from '../common/Badge';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const PropertyCard = ({ property }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToast } = useToast();

  const propertyId = property._id || property.propertyId || property.id;
  const favorite = isFavorite(propertyId);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      addToast('Please login to save properties to your favorites', 'info');
      navigate('/login');
      return;
    }

    toggleFavorite(propertyId);
  };

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(property.price);

  const displayLocation = typeof property.location === 'object'
    ? [property.location?.address, property.location?.city].filter(Boolean).join(', ')
    : property.location;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-glow transition-all duration-300 flex flex-col h-full"
    >
      {/* Property Image Cover */}
      <div className="relative h-60 w-full overflow-hidden bg-slate-950">
        <img
          src={property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
          <Badge variant="brand" size="sm" className="shadow-md backdrop-blur-md">
            {property.propertyType}
          </Badge>
          {property.furnished && (
            <Badge variant="default" size="sm" className="shadow-md backdrop-blur-md bg-slate-900/80 text-white border-none">
              {property.furnished}
            </Badge>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3.5 right-3.5 p-2.5 rounded-full bg-slate-900/60 backdrop-blur-md text-white hover:bg-white hover:text-rose-500 transition-all duration-200 shadow-md group/btn"
          aria-label="Save to favorites"
        >
          <motion.div whileTap={{ scale: 1.3 }}>
            <Heart
              className={`w-4 h-4 transition-colors ${
                favorite ? 'fill-rose-500 text-rose-500' : 'text-white group-hover/btn:text-rose-500'
              }`}
            />
          </motion.div>
        </button>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-baseline justify-between text-white">
          <div>
            <span className="text-xl font-extrabold tracking-tight">{formattedPrice}</span>
            <span className="text-xs font-medium text-slate-300"> / month</span>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/90 text-white">
            Available
          </span>
        </div>
      </div>

      {/* Property Details Body */}
      <div className="p-5 flex flex-col justify-between flex-1 gap-4">
        <div className="flex flex-col gap-2">
          {/* Location Line */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{displayLocation || 'Prime Location'}</span>
          </div>

          {/* Title */}
          <Link to={`/properties/${propertyId}`}>
            <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-500 transition-colors">
              {property.title}
            </h3>
          </Link>

          {/* Short Description */}
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {property.description}
          </p>
        </div>

        {/* Specs Icons Bar */}
        <div className="pt-3 border-t border-slate-100 dark:border-dark-border grid grid-cols-3 gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-slate-400" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4 text-slate-400" />
            <span>{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-slate-400" />
            <span>{property.areaSqFt || 1800} sqft</span>
          </div>
        </div>

        {/* View Details Action Link */}
        <Link
          to={`/properties/${propertyId}`}
          className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs text-center hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500 dark:hover:text-white transition-all duration-200"
        >
          View Property Details
        </Link>
      </div>
    </motion.div>
  );
};
