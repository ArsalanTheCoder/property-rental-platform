import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, RotateCcw } from 'lucide-react';
import { PropertyCard } from '../components/property/PropertyCard';
import { PropertyCardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { useFavorites } from '../context/FavoritesContext';
import { favoriteService } from '../services/favoriteService';
import { propertyService } from '../services/propertyService';

export const Favorites = () => {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const [favoriteProperties, setFavoriteProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchFavoritesData = async () => {
    setLoading(true);
    setError(false);
    try {
      const favRes = await favoriteService.getFavorites();
      if (favRes.success && Array.isArray(favRes.favorites)) {
        // If favorites array returned full property objects from backend
        if (favRes.favorites.length > 0 && typeof favRes.favorites[0] === 'object' && favRes.favorites[0].title) {
          setFavoriteProperties(favRes.favorites);
        } else {
          // If array of IDs returned, fetch details
          const favIds = favRes.favorites.map(f => (typeof f === 'object' ? (f._id || f.propertyId || f.id) : f));
          const allRes = await propertyService.getProperties();
          if (allRes.success && Array.isArray(allRes.properties)) {
            const matched = allRes.properties.filter((p) =>
              favIds.includes(p._id || p.propertyId || p.id)
            );
            setFavoriteProperties(matched);
          }
        }
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavoritesData();
  }, [favorites]);

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 mb-8">
          <div className="flex items-center gap-2 text-brand-500 font-bold text-xs uppercase tracking-wider">
            <Heart className="w-4 h-4 fill-brand-500" />
            <span>Saved Portfolio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Favorite Properties
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {favoriteProperties.length} saved rental properties ready for review and viewing requests.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <PropertyCardSkeleton key={n} />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-dark-card rounded-3xl border border-slate-200 dark:border-dark-border text-center max-w-md mx-auto my-12">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Unable to load saved properties
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              A temporary issue occurred while communicating with the server.
            </p>
            <Button variant="primary" icon={RotateCcw} onClick={fetchFavoritesData}>
              Retry Loading Favorites
            </Button>
          </div>
        ) : favoriteProperties.length === 0 ? (
          <EmptyState
            title="No saved properties yet"
            description="You haven't saved any rental properties to your portfolio yet. Click the heart icon on any property card to save it here."
            actionText="Explore Properties"
            onAction={() => navigate('/properties')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteProperties.map((prop) => (
              <PropertyCard key={prop._id || prop.propertyId || prop.id} property={prop} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
