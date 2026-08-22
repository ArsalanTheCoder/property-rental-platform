import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { PropertySummary } from "@/types";
import { addFavorite, getFavorites, removeFavorite } from "@/api/favorites";
import { useAuth } from "./AuthContext";

interface FavoritesContextValue {
  favoriteProperties: PropertySummary[];
  isFavorite: (propertyId: string) => boolean;
  toggleFavorite: (propertyId: string) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favoriteProperties, setFavoriteProperties] = useState<PropertySummary[]>([]);

  const refreshFavorites = async () => {
    if (!user) {
      setFavoriteProperties([]);
      return;
    }
    const properties = await getFavorites();
    setFavoriteProperties(properties);
  };

  // Favorites live on the backend, not on the user object, so they
  // need their own fetch whenever the signed-in user changes.
  useEffect(() => {
    refreshFavorites();
  }, [user]);

  const isFavorite = (propertyId: string) =>
    favoriteProperties.some((property) => property.id === propertyId);

  const toggleFavorite = async (propertyId: string) => {
    if (!user) return;

    const alreadySaved = isFavorite(propertyId);

    if (alreadySaved) {
      // Optimistically remove, then confirm with the backend.
      const previous = favoriteProperties;
      setFavoriteProperties((current) => current.filter((property) => property.id !== propertyId));
      try {
        await removeFavorite(propertyId);
      } catch (error) {
        setFavoriteProperties(previous);
      }
      return;
    }

    // Adding requires the full property object for the favorites
    // list, which we do not have on hand from a heart-icon tap, so
    // confirm with the backend first and then refresh the list.
    try {
      await addFavorite(propertyId);
      await refreshFavorites();
    } catch (error) {
      // No optimistic state to roll back here.
    }
  };

  return (
    <FavoritesContext.Provider
      value={{ favoriteProperties, isFavorite, toggleFavorite, refreshFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used inside a FavoritesProvider");
  }
  return context;
}
