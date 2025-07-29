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
      setFavorites(prev => [...prev, productId]);
      return true;
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      return false;
    }
  }, [isAuthenticated]);

  const removeFromFavorites = useCallback(async (productId) => {
    if (!isAuthenticated) return false;

    try {
      await favoriteService.removeFromFavorites(productId);
      setFavorites(prev => prev.filter(id => id !== productId));
      return true;
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      return false;
    }
  }, [isAuthenticated]);

  const toggleFavorite = useCallback(async (productId) => {
    const isFavorite = favorites.includes(productId);
    if (isFavorite) {
      return await removeFromFavorites(productId);
    } else {
      return await addToFavorites(productId);
    }
  }, [favorites, addToFavorites, removeFromFavorites]);

  const isFavorite = useCallback((productId) => {
    return favorites.includes(productId);
  }, [favorites]);

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