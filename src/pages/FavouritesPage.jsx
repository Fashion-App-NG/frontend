import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import ProductCard from '../components/Product/ProductCard';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import productService from '../services/productService';

const FavouritesPage = () => {
  const { favorites, loading: favoritesLoading, refreshFavorites } = useFavorites();
  const { isAuthenticated } = useAuth();
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('my favorites', favorites);

  // ✅ Hooks must come BEFORE any conditional returns
  useEffect(() => {
    const loadFavoriteProducts = async () => {
      // Skip if not authenticated
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        if (favorites.length === 0) {
          setFavoriteProducts([]);
          setLoading(false);
          return;
        }
        
        // Filter out invalid favorites and extract productIds
        const validFavorites = favorites.filter(favorite => {
          // Handle both cases: favorite as object with product field, or as string
          if (typeof favorite === 'string') {
            return favorite; // It's a productId string
          }
          return favorite.product?.productId; // It's an object with product field
        });

        const productPromises = validFavorites.map(favorite => {
          // Extract productId based on favorite structure
          const productId = typeof favorite === 'string' 
            ? favorite 
            : favorite.product?.productId;
          return productService.getProductById(productId);
        });

        console.log('productPromises', productPromises);
        
        const products = await Promise.all(productPromises);
        const validProducts = products
          .filter(response => response && !response.error)
          .map(response => response.product);
        
        setFavoriteProducts(validProducts);
      } catch (error) {
        console.error('Failed to load favorite products:', error);
        setError('Unable to load your favorite products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (!favoritesLoading) {
      loadFavoriteProducts();
    }
  }, [favorites, favoritesLoading, isAuthenticated]);

  // Refresh favorites on page load
  useEffect(() => {
    if (isAuthenticated) {
      refreshFavorites();
    }
  }, [refreshFavorites, isAuthenticated]);

  const handleProductClick = (product) => {
    window.location.href = `/product/${product._id || product.id}`;
  };

  // ✅ Conditional redirect AFTER all hooks
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Favorites</h1>
        
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {!loading && !error && favoriteProducts.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h2 className="text-xl font-medium text-gray-900 mb-2">No favorites yet</h2>
            <p className="text-gray-600 mb-6">Heart products while browsing to save them here</p>
            <Link to="/shopper/browse" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Browse Products
            </Link>
          </div>
        )}
        
        {!loading && !error && favoriteProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteProducts.map(product => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                showVendorInfo={true}
                onClick={handleProductClick}
                showFavoriteButton={true}
                showAddToCartButton={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavouritesPage;