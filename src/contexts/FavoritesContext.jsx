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
    // ✅ FIX: Only load favorites for shoppers, not vendors or admins
    if (!isAuthenticated || !user) return;
    
    // ✅ Skip favorites for non-shopper roles
    if (user.role && user.role !== 'shopper') {
      if (process.env.NODE_ENV === 'development') {
        console.log('⏭️ Skipping favorites load for non-shopper role:', user.role);
      }
      return;
    }

    setLoading(true);
    try {
      const response = await favoriteService.getFavorites();
      
      // Extract productId from favorite objects
      const productIds = (response.favorites || []).map(fav => {
        if (typeof fav === 'object' && fav.productId) {
          return typeof fav.productId === 'object' ? fav.productId._id : fav.productId;
        }
        return fav;
      }).filter(Boolean);
      
      console.log('✅ Favorites loaded:', productIds);
      setFavorites(productIds);
    } catch (error) {
      // ✅ Only log error in development, don't spam console
      if (process.env.NODE_ENV === 'development') {
        console.log('ℹ️ Favorites not available:', error.message);
      }
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const addToFavorites = useCallback(async (productId) => {
    // ✅ FIX: Only allow shoppers to add favorites
    if (!isAuthenticated || !user || user.role !== 'shopper') {
      if (process.env.NODE_ENV === 'development') {
        console.log('⏭️ Cannot add favorites - not a shopper');
      }
      return false;
    }

    if (favorites.includes(productId)) {
      console.log('Product already in favorites:', productId);
      return true;
    }

    try {
      await favoriteService.addToFavorites(productId);
      setFavorites(prev => [...prev, productId]);
      return true;
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      return false;
    }
  }, [isAuthenticated, user, favorites]);

  const removeFromFavorites = useCallback(async (productId) => {
    // ✅ FIX: Only allow shoppers to remove favorites
    if (!isAuthenticated || !user || user.role !== 'shopper') return false;

    try {
      await favoriteService.removeFromFavorites(productId);
      setFavorites(prev => prev.filter(id => id !== productId));
      return true;
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      return false;
    }
  }, [isAuthenticated, user]);

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