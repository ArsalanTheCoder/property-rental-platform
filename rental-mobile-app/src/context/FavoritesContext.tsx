import React, { createContext, useContext, useState, ReactNode } from "react";
import { addFavorite, removeFavorite } from "@/api/favorites";
import { useAuth } from "./AuthContext";

interface FavoritesContextValue {
  favoriteIds: string[];
  isFavorite: (propertyId: string) => boolean;
  toggleFavorite: (propertyId: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>(user?.favorites ?? []);

  const isFavorite = (propertyId: string) => favoriteIds.includes(propertyId);

  const toggleFavorite = async (propertyId: string) => {
    if (!user) return;

    const alreadySaved = favoriteIds.includes(propertyId);

    // Update the UI immediately, then confirm with the backend.
    // If the request fails we roll the change back.
    setFavoriteIds((current) =>
      alreadySaved ? current.filter((id) => id !== propertyId) : [...current, propertyId]
    );

    try {
      if (alreadySaved) {
        await removeFavorite(user.userId, propertyId);
      } else {
        await addFavorite(user.userId, propertyId);
      }
    } catch (error) {
      setFavoriteIds((current) =>
        alreadySaved ? [...current, propertyId] : current.filter((id) => id !== propertyId)
      );
    }
  };

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggleFavorite }}>
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
