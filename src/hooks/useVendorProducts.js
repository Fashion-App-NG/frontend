import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import productService from '../services/productService';

export const useVendorProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);

  /**
   * Load vendor products with filters
   * @param {Object} filters - Filter parameters
   */
  const loadVendorProducts = useCallback(async (filters = {}) => {
    if (!user?.id) {
      console.warn('No user ID available for loading products');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Loading vendor products for vendor:', user.id);
      console.log('📊 Filters:', filters);

      const response = await productService.getVendorProducts(user.id, filters);
      
      console.log('✅ Vendor products loaded:', response);

      if (response.success) {
        setProducts(response.products || []);
        setTotalProducts(response.totalCount || response.products?.length || 0);
      } else {
        throw new Error(response.message || 'Failed to load products');
      }
    } catch (err) {
      console.error('❌ Error loading vendor products:', err);
      setError(err.message || 'Failed to load products');
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Update a single product
   * @param {Object} updatedProduct - Updated product data
   */
  const updateProduct = useCallback(async (productId, updates) => {
    try {
      console.log('🔄 Updating product:', productId, updates);
      
      const response = await productService.updateProduct(productId, updates);
      
      if (response.success) {
        // Update local state
        setProducts(prevProducts =>
          prevProducts.map(p =>
            (p._id === productId || p.id === productId)
              ? { ...p, ...updates }
              : p
          )
        );
        return response;
      } else {
        throw new Error(response.message || 'Failed to update product');
      }
    } catch (err) {
      console.error('❌ Error updating product:', err);
      throw err;
    }
  }, []);

  /**
   * Delete a product
   * @param {string} productId - Product ID to delete
   */
  const deleteProduct = useCallback(async (productId) => {
    try {
      console.log('🗑️ Deleting product:', productId);
      
      const response = await productService.deleteProduct(productId);
      
      if (response.success) {
        // Remove from local state
        setProducts(prevProducts =>
          prevProducts.filter(p => p._id !== productId && p.id !== productId)
        );
        setTotalProducts(prev => Math.max(0, prev - 1));
        return response;
      } else {
        throw new Error(response.message || 'Failed to delete product');
      }
    } catch (err) {
      console.error('❌ Error deleting product:', err);
      throw err;
    }
  }, []);

  /**
   * Restock a product
   * @param {string} productId - Product ID
   * @param {number} quantity - Quantity to add
   */
  const restockProduct = useCallback(async (productId, quantity) => {
    try {
      console.log('📦 Restocking product:', productId, 'Quantity:', quantity);
      
      // Call your restock endpoint
      const response = await productService.updateProduct(productId, {
        $inc: { stock: quantity }
      });
      
      if (response.success) {
        // Update local state
        setProducts(prevProducts =>
          prevProducts.map(p =>
            (p._id === productId || p.id === productId)
              ? { ...p, stock: (p.stock || 0) + quantity }
              : p
          )
        );
        return response;
      } else {
        throw new Error(response.message || 'Failed to restock product');
      }
    } catch (err) {
      console.error('❌ Error restocking product:', err);
      throw err;
    }
  }, []);

  /**
   * Toggle product status (active/inactive)
   * @param {string} productId - Product ID
   * @param {boolean} status - New status
   */
  const toggleProductStatus = useCallback(async (productId, status) => {
    try {
      console.log('🔄 Toggling product status:', productId, status);
      
      const response = await productService.updateProduct(productId, {
        status: status ? 'ACTIVE' : 'INACTIVE',
        isActive: status,
        display: status
      });
      
      if (response.success) {
        // Update local state
        setProducts(prevProducts =>
          prevProducts.map(p =>
            (p._id === productId || p.id === productId)
              ? { ...p, status: status ? 'ACTIVE' : 'INACTIVE', isActive: status, display: status }
              : p
          )
        );
        return response;
      } else {
        throw new Error(response.message || 'Failed to update product status');
      }
    } catch (err) {
      console.error('❌ Error toggling product status:', err);
      throw err;
    }
  }, []);

  return {
    products,
    loading,
    error,
    totalProducts,
    loadVendorProducts,
    updateProduct,
    deleteProduct,
    restockProduct,
    toggleProductStatus
  };
};

export default useVendorProducts;