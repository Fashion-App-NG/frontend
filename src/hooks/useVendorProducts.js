import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import VendorService from '../services/vendorService';

export const useVendorProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Transform API product to component format
  const transformApiProduct = useCallback((apiProduct) => ({
    id: apiProduct.id,
    name: apiProduct.name,
    description: apiProduct.description || 'No description available',
    image: apiProduct.image || '/api/placeholder/86/66',
    quantity: apiProduct.quantity || 0,
    date: apiProduct.createdAt ? new Date(apiProduct.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }) : 'Unknown',
    uploadDate: apiProduct.createdAt || new Date().toISOString(),
    price: apiProduct.pricePerYard || 0,
    status: apiProduct.display ? 'In Stock' : 'Out Of Stock',
    statusColor: apiProduct.display ? '#28b446' : '#cd0000',
    materialType: apiProduct.materialType,
    pattern: apiProduct.pattern,
    idNumber: apiProduct.idNumber,
    display: apiProduct.display,
    isApiProduct: true
  }), []);

  // Load products from API
  const loadProducts = useCallback(async () => {
    if (!user?.id) {
      console.warn('No user ID available for loading products');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await VendorService.getVendorProducts(user.id);
      
      if (response.success && response.products) {
        const transformedProducts = response.products.map(transformApiProduct);
        setProducts(transformedProducts);
        console.log(`✅ Loaded ${transformedProducts.length} products from API`);
      } else {
        setProducts([]);
        console.log('No products found for vendor');
      }
    } catch (error) {
      console.error('❌ Failed to load products:', error);
      setError(error.message);
      
      // Fallback to localStorage if API fails
      try {
        const localProducts = JSON.parse(localStorage.getItem('vendorProducts') || '[]');
        const validateProduct = (product) => ({
          id: product.id || null,
          name: product.name || 'Unknown Product',
          description: product.description || 'No description available',
          image: product.image || '/api/placeholder/86/66',
          quantity: product.quantity || 0,
          date: product.date || 'Unknown',
          uploadDate: product.uploadDate || new Date().toISOString(),
          price: product.price || 0,
          status: product.status || 'Out Of Stock',
          statusColor: product.statusColor || '#cd0000',
          materialType: product.materialType || null,
          pattern: product.pattern || null,
          idNumber: product.idNumber || null,
          display: product.display || false,
          isApiProduct: product.isApiProduct || false,
        });
        const sanitizedProducts = Array.isArray(localProducts)
          ? localProducts.map(validateProduct)
          : [];
        if (sanitizedProducts.length > 0) {
          setProducts(sanitizedProducts);
          console.log('📦 Loaded products from localStorage as fallback');
        } else {
          setProducts([]);
        }
      } catch (localError) {
        console.error('Failed to load from localStorage:', localError);
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, transformApiProduct]);

  // Create product
  const createProduct = useCallback(async (productData) => {
    try {
      if (!user?.id) {
        throw new Error('User ID is required');
      }

      setLoading(true);
      setError(null);

      // Transform and validate product data
      const transformedData = VendorService.transformProductData(productData, user.id);
      VendorService.validateProductData(transformedData);

      // Create product via API
      const response = await VendorService.createProduct(transformedData);
      
      if (response.message) {
        // Refresh products list
        await loadProducts();
        return response;
      }
    } catch (error) {
      console.error('Failed to create product:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.id, loadProducts]);

  // Update product
  const updateProduct = useCallback(async (productId, updateData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await VendorService.updateProduct(productId, updateData);
      
      if (response.message) {
        // Refresh products list
        await loadProducts();
        return response;
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadProducts]);

  // Hide product (soft delete)
  const hideProduct = useCallback(async (productId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await VendorService.hideProduct(productId);
      
      if (response.message) {
        // Refresh products list
        await loadProducts();
        return response;
      }
    } catch (error) {
      console.error('Failed to hide product:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadProducts]);

  // Auto-load products when user is available
  useEffect(() => {
    if (user?.id) {
      loadProducts();
    }
  }, [user?.id, loadProducts]);

  return {
    products,
    loading,
    error,
    loadProducts,
    createProduct,
    updateProduct,
    hideProduct,
    setError: (errorMessage) => setError(errorMessage)
  };
};


const VendorProductEditModal = ({ product, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    pricePerYard: '',
    quantity: '',
    description: '',
    materialType: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Material type options
  const materialTypes = [
    'cotton', 'silk', 'wool', 'linen', 'polyester', 
    'nylon', 'rayon', 'cashmere', 'denim', 'leather'
  ];

  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        pricePerYard: product.price || '',
        quantity: product.quantity || '',
        description: product.description || '',
        materialType: product.materialType || ''
      });
      setErrors({});
    }
  }, [product]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.pricePerYard || parseFloat(formData.pricePerYard) <= 0) {
      newErrors.pricePerYard = 'Valid price is required';
    }

    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Valid quantity is required';
    }

    if (!formData.materialType) {
      newErrors.materialType = 'Material type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const updateData = {
        name: formData.name.trim(),
        pricePerYard: parseFloat(formData.pricePerYard),
        quantity: parseInt(formData.quantity),
        materialType: formData.materialType.toLowerCase()
      };

      if (formData.description.trim()) {
        updateData.description = formData.description.trim();
      }

      await onSave(updateData);
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors({ general: error.message || 'Failed to save product' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Edit Product
            </h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter product name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Price per Yard */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price per Yard (₦) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.pricePerYard}
              onChange={(e) => handleInputChange('pricePerYard', e.target.value)}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.pricePerYard ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.pricePerYard && (
              <p className="mt-1 text-sm text-red-600">{errors.pricePerYard}</p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity (Pieces) *
            </label>
            <input
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.quantity ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
            )}
          </div>

          {/* Material Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Material Type *
            </label>
            <select
              value={formData.materialType}
              onChange={(e) => handleInputChange('materialType', e.target.value)}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.materialType ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select material type</option>
              {materialTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            {errors.materialType && (
              <p className="mt-1 text-sm text-red-600">{errors.materialType}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={loading}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Optional product description"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default useVendorProducts;