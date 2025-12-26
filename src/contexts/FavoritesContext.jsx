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
      
      // ✅ FIX: Extract productId from favorite objects
      const productIds = (response.favorites || []).map(fav => {
        // Handle both object format and string format
        if (typeof fav === 'object' && fav.productId) {
          // If productId is nested object, get its _id
          return typeof fav.productId === 'object' ? fav.productId._id : fav.productId;
        }
        // If it's already a string, return it
        return fav;
      }).filter(Boolean); // Remove any null/undefined values
      
      console.log('✅ Favorites loaded:', productIds);
      setFavorites(productIds);
    } catch (error) {
      console.error('Failed to load favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const addToFavorites = useCallback(async (productId) => {
    if (!isAuthenticated) return false;

    // ✅ FIX: Check if already favorited before adding
    if (favorites.includes(productId)) {
      console.log('Product already in favorites:', productId);
      return true; // Return true since it's already favorited
    }

    try {
      await favoriteService.addToFavorites(productId);
      setFavorites(prev => [...prev, productId]);
      return true;
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      return false;
    }
  }, [isAuthenticated, favorites]);

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
    
    // ✅ FIX: Better toggle logic
    if (isFavorite) {
      console.log('Removing from favorites:', productId);
      return await removeFromFavorites(productId);
    } else {
      console.log('Adding to favorites:', productId);
      return await addToFavorites(productId);
    }
  }, [favorites, addToFavorites, removeFromFavorites]);

  const isFavorite = useCallback((productId) => {
    return favorites.includes(productId);
  }, [favorites]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Favorites updated:', favorites);
    }
    
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