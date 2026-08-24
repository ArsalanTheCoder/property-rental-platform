import React, { createContext, useContext, useState, useEffect } from 'react';
import { favoriteService } from '../services/favoriteService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFavs = async () => {
      if (!isAuthenticated) {
        setFavorites([]);
        return;
      }
      setLoading(true);
      try {
        const res = await favoriteService.getFavorites();
        if (res.success && Array.isArray(res.favorites)) {
          // Normalize IDs to extract the underlying propertyId correctly
          const favIds = res.favorites
            .map((f) => {
              if (typeof f === 'string') return f;
              if (f.property && typeof f.property === 'object') {
                return f.property._id || f.property.propertyId || f.property.id;
              }
              return f.propertyId || f._id || f.id;
            })
            .filter(Boolean);
          setFavorites(favIds);
        }
      } catch (err) {
        console.warn('Error fetching favorites:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavs();
  }, [isAuthenticated]);

  const toggleFavorite = async (propertyId) => {
    if (!isAuthenticated) {
      addToast('Please login to save properties to your favorites', 'info');
      return false;
    }

    const isCurrentlyFav = favorites.includes(propertyId);

    // Optimistic UI state update
    setFavorites((prev) =>
      isCurrentlyFav ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]
    );

    try {
      const res = await favoriteService.toggleFavorite(propertyId, isCurrentlyFav);
      if (res.success) {
        addToast(
          res.isFavorited
            ? 'Property saved to favorites'
            : 'Property removed from favorites',
          'success'
        );
      }
      return true;
    } catch (err) {
      // Revert state on error
      setFavorites((prev) =>
        isCurrentlyFav ? [...prev, propertyId] : prev.filter((id) => id !== propertyId)
      );
      addToast(err.message || 'Failed to update favorites', 'error');
      return false;
    }
  };

  const isFavorite = (propertyId) => favorites.includes(propertyId);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
