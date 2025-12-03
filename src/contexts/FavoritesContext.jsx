import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import favoriteService from '../services/favoriteService';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    setLoading(true);
    try {
      const response = await favoriteService.getFavorites();
      setFavorites(response.favorites || []);
    } catch (error) {
      console.error('Failed to load favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const addToFavorites = useCallback(async (productId) => {
    if (!isAuthenticated) return false;

    try {
      await favoriteService.addToFavorites(productId);
      // Refresh favorites from API to get the full object structure
      await loadFavorites();
      return true;
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      return false;
    }
  }, [isAuthenticated, loadFavorites]);

  const removeFromFavorites = useCallback(async (productId) => {
    if (!isAuthenticated) return false;

    try {
      await favoriteService.removeFromFavorites(productId);
      // Refresh favorites from API to get the updated list
      await loadFavorites();
      return true;
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      return false;
    }
  }, [isAuthenticated, loadFavorites]);

  const isFavorite = useCallback((productId) => {
    // Handle both cases: favorites as objects with product field, or as strings
    return favorites.some(fav => {
      if (typeof fav === 'string') {
        return fav === productId;
      }
      return fav.product?.productId === productId || fav._id === productId;
    });
  }, [favorites]);

  const toggleFavorite = useCallback(async (productId) => {
    const isFav = isFavorite(productId);
    if (isFav) {
      return await removeFromFavorites(productId);
    } else {
      return await addToFavorites(productId);
    }
  }, [isFavorite, addToFavorites, removeFromFavorites]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Update context to properly save favorites

  // Ensure favorites are properly stored
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Favorites updated:', favorites);
    }
    
    // Make sure localStorage persists correctly
    if (favorites.length > 0) {
      localStorage.setItem('fashion-app-favorites', JSON.stringify(favorites));
    }
  }, [favorites]);

  const value = {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    refreshFavorites: loadFavorites
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesProvider;