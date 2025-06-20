import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import VendorService from '../../services/vendorService';
import { handleError } from '../../utils/errorHandler';
import TokenDebug from './TokenDebug';
import VendorProductEditModal from './VendorProductEditModal';

export const VendorProductListContent = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Modal and dropdown states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

  // Restock modal state
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockingProduct, setRestockingProduct] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState('');

  // ✅ Enhanced load products function with Cloudinary image support
  const loadProducts = useCallback(async () => {
    if (!user?.id) {
      console.warn('⚠️ No user ID available for loading products');
      console.log('🔍 Current user object:', user);
      setLoading(false);
      setError('User authentication required. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Clear localStorage products to force API usage
      localStorage.removeItem('vendorProducts');
      console.log('🗑️ Cleared localStorage products');
      
      console.log('🚀 Starting API call for vendor:', user.id);
      
      // Test API connection first
      const connectionOk = await VendorService.testConnection();
      console.log('🌐 API connection test:', connectionOk ? 'SUCCESS' : 'FAILED');
      
      if (!connectionOk) {
        throw new Error('Backend API is not responding. Please ensure the server is running on http://localhost:3001');
      }
      
      // Make the API call
      const response = await VendorService.getVendorProducts(user.id);
      console.log('📦 Raw API Response:', response);
      
      if (response && response.products && Array.isArray(response.products)) {
        // ✅ Transform API data for the UI with Cloudinary image support
        const transformedProducts = response.products.map(product => ({
          id: product.id || product._id,
          name: product.name,
          description: product.description || 'No description available',
          // ✅ Use Cloudinary images if available, fallback to placeholder
          images: product.images || [],
          primaryImage: product.images && product.images.length > 0 
            ? product.images[0].url 
            : '/api/placeholder/86/66',
          quantity: product.quantity || 0,
          date: product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }) : new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          uploadDate: product.createdAt || new Date().toISOString(),
          price: product.pricePerYard || 0,
          status: product.display !== false ? 'In Stock' : 'Out Of Stock',
          statusColor: product.display !== false ? '#28b446' : '#cd0000',
          materialType: product.materialType,
          pattern: product.pattern,
          idNumber: product.idNumber,
          display: product.display !== false,
          isApiProduct: true
        }));
        
        setProducts(transformedProducts);
        console.log(`✅ Successfully loaded ${transformedProducts.length} products from API`);
        
        if (transformedProducts.length === 0) {
          setMessage('No products found. Click "Add Product" to create your first product.');
          setMessageType('info');
        }
        
      } else {
        setProducts([]);
        console.log('📭 No products found for vendor');
        setMessage('No products found. Click "Add Product" to create your first product.');
        setMessageType('info');
      }
      
    } catch (error) {
      console.error('❌ Failed to load products from API:', error);
      setError(`Failed to load products: ${error.message}`);
      setProducts([]);
      setMessage(`Unable to load products: ${error.message}`);
      setMessageType('error');
      
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load products when component mounts or user changes
  useEffect(() => {
    console.log('👤 User effect triggered:', user);
    if (user?.id) {
      console.log('🔑 User ID available, loading products...');
      loadProducts();
    } else {
      console.log('⚠️ No user ID, skipping product load');
      setLoading(false);
    }
  }, [user?.id, loadProducts]);

  // Handle messages from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      setMessageType(location.state.type || 'info');
      
      navigate(location.pathname, { replace: true, state: {} });
      
      const timer = setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate, location.pathname]);

  // Handle dropdown toggle
  const handleDropdownToggle = (event, productId) => {
    event.stopPropagation();
    
    if (showDropdown === productId) {
      setShowDropdown(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        x: rect.left - 100,
        y: rect.bottom + 5
      });
      setShowDropdown(productId);
    }
  };

  // Handle outside click to close dropdown
  const handleOutsideClick = useCallback(() => {
    if (showDropdown) {
      setShowDropdown(null);
    }
  }, [showDropdown]);

  // Add event listener for outside clicks
  useEffect(() => {
    if (showDropdown) {
      document.addEventListener('click', handleOutsideClick);
      return () => document.removeEventListener('click', handleOutsideClick);
    }
  }, [showDropdown, handleOutsideClick]);

  // Edit product handler - ensure we have valid ID
  const handleEditProduct = (product) => {
    console.log('🔍 Editing product:', product);
    
    // ✅ Ensure product has a valid ID
    if (!product.id && !product._id) {
      console.error('❌ Product missing ID:', product);
      setMessage('Error: Product ID not found');
      setMessageType('error');
      return;
    }
    
    // ✅ Ensure product has id field (map _id if needed)
    const productWithId = {
      ...product,
      id: product.id || product._id
    };
    
    setEditingProduct(productWithId);
    setShowEditModal(true);
    setShowDropdown(null);
  };

  // Delete product handler - fix ID usage
  const handleDeleteProduct = async (productId, productName) => {
    try {
      // ✅ Validate product ID
      if (!productId || productId === 'undefined') {
        throw new Error('Invalid product ID');
      }
      
      if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) {
        return;
      }

      console.log('🗑️ Deleting product:', productId);
      await VendorService.hideProduct(productId);
      
      await loadProducts();
      setShowDropdown(null);
      
      setMessage(`Product "${productName}" deleted successfully!`);
      setMessageType('success');
      
    } catch (error) {
      console.error('❌ Failed to delete product:', error);
      const errorInfo = handleError(error, { context: 'deleteProduct' });
      setMessage(`Failed to delete product: ${errorInfo.message}`);
      setMessageType('error');
    }
  };

  // Save edited product - add validation
  const handleEditSave = async (updateData) => {
    try {
      // ✅ Validate product ID exists
      if (!editingProduct?.id) {
        throw new Error('No product ID available for update');
      }
      
      console.log('📝 Attempting to update product:', editingProduct.id);
      console.log('📦 Update data:', updateData);
      
      const result = await VendorService.updateProduct(editingProduct.id, updateData);
      console.log('✅ Product updated:', result);
      
      // Reload products to get fresh data
      await loadProducts();
      
      // Close modal
      setShowEditModal(false);
      setEditingProduct(null);
      
      // Show success message
      setMessage(`Product "${updateData.name}" updated successfully!`);
      setMessageType('success');
      
      // Auto-hide message after 3 seconds
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Failed to update product:', error);
      
      // Don't close modal on error, let user see the error and try again
      const errorInfo = handleError(error, { context: 'updateProduct' });
      setMessage(`Failed to update product: ${errorInfo.message}`);
      setMessageType('error');
      
      // Re-throw so the modal can handle it
      throw error;
    }
  };

  // Quantity update handler - fix ID usage
  const handleQuantityUpdate = async (product, quantity) => {
    try {
      // ✅ Validate product ID
      const productId = product.id || product._id;
      if (!productId) {
        throw new Error('Product ID not found');
      }
      
      console.log('📦 Updating quantity for product:', productId, 'to:', quantity);
      await VendorService.updateProduct(productId, { quantity });
      
      await loadProducts();
      setShowDropdown(null);
      
      setMessage(`Quantity updated to ${quantity} for "${product.name}"`);
      setMessageType('success');
      
    } catch (error) {
      console.error('❌ Failed to update quantity:', error);
      const errorInfo = handleError(error, { context: 'updateQuantity' });
      setMessage(`Failed to update quantity: ${errorInfo.message}`);
      setMessageType('error');
    }
  };

  // ✅ NEW: Handle restock with addition logic
  const handleRestockProduct = (product) => {
    console.log('📦 Restocking product:', product);
    
    const productWithId = {
      ...product,
      id: product.id || product._id
    };
    
    setRestockingProduct(productWithId);
    setRestockQuantity('');
    setShowRestockModal(true);
    setShowDropdown(null);
  };

  // ✅ NEW: Save restock - ADD to existing quantity
  const handleRestockSave = async () => {
    try {
      if (!restockingProduct?.id) {
        throw new Error('No product ID available for restock');
      }

      const addQuantity = parseInt(restockQuantity);
      if (isNaN(addQuantity) || addQuantity <= 0) {
        setMessage('Please enter a valid quantity to add');
        setMessageType('error');
        return;
      }

      // ✅ Calculate NEW total quantity (current + additional)
      const currentQuantity = parseInt(restockingProduct.quantity) || 0;
      const newTotalQuantity = currentQuantity + addQuantity;
      
      console.log('📦 Restocking:', {
        productId: restockingProduct.id,
        currentQuantity,
        addingQuantity: addQuantity,
        newTotalQuantity
      });

      // ✅ Send the NEW TOTAL to the database
      const result = await VendorService.updateProduct(restockingProduct.id, { 
        quantity: newTotalQuantity 
      });
      
      console.log('✅ Product restocked:', result);
      
      // Reload products to get fresh data
      await loadProducts();
      
      // Close modal
      setShowRestockModal(false);
      setRestockingProduct(null);
      setRestockQuantity('');
      
      // Show success message
      setMessage(`Added ${addQuantity} yards to "${restockingProduct.name}". New total: ${newTotalQuantity} yards`);
      setMessageType('success');
      
      // Auto-hide message after 4 seconds
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 4000);
      
    } catch (error) {
      console.error('❌ Failed to restock product:', error);
      const errorInfo = handleError(error, { context: 'restockProduct' });
      setMessage(`Failed to restock product: ${errorInfo.message}`);
      setMessageType('error');
    }
  };

  // ✅ Cancel restock
  const handleRestockCancel = () => {
    setShowRestockModal(false);
    setRestockingProduct(null);
    setRestockQuantity('');
  };

  // ✅ Add logout handler
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  // ✅ ADD THIS: ProductImageDisplay Component Definition
  const ProductImageDisplay = ({ product }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
      console.warn('🖼️ Image failed to load:', product.images?.[currentImageIndex]?.url);
      setImageError(true);
    };

    const handleImageLoad = () => {
      setImageError(false);
    };

    // If no images or image error, show placeholder
    if (!product.images || product.images.length === 0 || imageError) {
      return (
        <div className="h-20 w-24 rounded-lg border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      );
    }

    return (
      <div className="relative h-20 w-24 group">
        {/* ✅ Main product image using Cloudinary URL */}
        <img 
          className="h-20 w-24 rounded-lg object-cover border-2 border-gray-200 shadow-sm transition-opacity duration-200" 
          src={product.images[currentImageIndex].url}
          alt={`${product.name} - Image ${currentImageIndex + 1}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading="lazy"
        />
        
        {/* ✅ Multiple images indicator and navigation */}
        {product.images.length > 1 && (
          <>
            {/* Image counter */}
            <div className="absolute top-1 right-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              {currentImageIndex + 1}/{product.images.length}
            </div>
            
            {/* Navigation arrows (visible on hover) */}
            <div className="absolute inset-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {currentImageIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => prev - 1);
                  }}
                  className="ml-1 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              
              {currentImageIndex < product.images.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => prev + 1);
                  }}
                  className="mr-1 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#d8dfe9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#d8dfe9]" onClick={handleOutsideClick}>
      {/* Debug Components - Development Only */}
      <TokenDebug />

      {/* Header - same as before */}
      <header className="bg-white border-b border-black/8 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Welcome Section */}
          <div>
            <h1 className="text-[32px] font-bold text-[#3e3e3e] leading-[150%]">
              Welcome {user?.firstName || user?.storeName || 'Vendor'}
            </h1>
            <p className="text-[16px] text-[#2e2e2e] leading-[120%]">
              Here is the information about all your products
            </p>
          </div>

          {/* Center: Search Bar */}
          <div className="w-[284px]">
            <div className="flex items-center bg-[#f5f5f5] rounded-[50px] px-3 py-2 gap-2">
              <div className="w-6 h-6 text-[#9e9e9e]">🔍</div>
              <input 
                type="text" 
                placeholder="Search products..."
                className="flex-1 bg-transparent outline-none text-[#9e9e9e] text-[16px]"
              />
            </div>
          </div>

          {/* ✅ Right: Actions & User Profile */}
          <div className="flex items-center gap-4">
            {/* Add Product Button */}
            <button
              onClick={() => navigate('/vendor/products/add')}
              className="px-4 py-2 bg-[#2e2e2e] text-[#edff8c] rounded-[5px] font-semibold hover:bg-[#1a1a1a] transition-colors"
            >
              + Add Product
            </button>

            {/* Dark Mode Toggle */}
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Toggle dark mode"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5 5-5H15m-6 0H4l5 5-5 5h5m3-10v10" />
              </svg>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-300 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {(user?.firstName?.[0] || user?.storeName?.[0] || 'V').toUpperCase()}
                </div>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Messages - same as before */}
      {(message || error) && (
        <div className="px-6 py-4">
          <div className={`p-4 rounded-lg ${
            messageType === 'error' || error 
              ? 'bg-red-50 border border-red-200 text-red-700' 
              : messageType === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-blue-50 border border-blue-200 text-blue-700'
          }`}>
            {error || message}
            {error && (
              <button
                onClick={() => setError(null)}
                className="ml-4 text-sm font-medium underline hover:no-underline"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        {products.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first product to your store.</p>
              <button
                onClick={() => navigate('/vendor/products/add')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Add Your First Product
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Product Image
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Qty (Yards)
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Upload Date
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Price per Yard
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      {/* ✅ Updated Product Image Cell with Cloudinary support */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex-shrink-0">
                          <ProductImageDisplay product={product} />
                        </div>
                      </td>

                      {/* ✅ Enhanced Product Name & Details with image count */}
                      <td className="px-6 py-5">
                        <div className="max-w-xs">
                          <div className="text-base font-bold text-gray-900 mb-2 leading-tight">
                            {product.name}
                            {/* ✅ Show image count badge */}
                            {product.images && product.images.length > 0 && (
                              <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                📷 {product.images.length}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mb-2 leading-relaxed">
                            {product.description}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {product.materialType && (
                              <span className="inline-block px-3 py-1 text-sm font-semibold bg-blue-100 text-blue-800 rounded-full">
                                {product.materialType}
                              </span>
                            )}
                            {product.pattern && (
                              <span className="inline-block px-3 py-1 text-sm font-semibold bg-purple-100 text-purple-800 rounded-full">
                                {product.pattern}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* ✅ ID Number - Enhanced */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900 font-mono">
                          {product.idNumber || product.id}
                        </div>
                      </td>

                      {/* ✅ Quantity - Enhanced */}
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {product.quantity}
                        </div>
                        <div className="text-sm font-medium text-gray-500">
                          yards
                        </div>
                      </td>

                      {/* ✅ Upload Date - Enhanced */}
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <div className="text-sm font-semibold text-gray-900">
                          {product.date}
                        </div>
                      </td>

                      {/* ✅ Price per Yard - Enhanced */}
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <div className="text-lg font-bold text-gray-900">
                          ₦{typeof product.price === 'number' ? product.price.toLocaleString() : product.price}
                        </div>
                      </td>

                      {/* ✅ Status - Enhanced */}
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <span 
                          className="inline-flex px-4 py-2 text-sm font-bold rounded-full"
                          style={{ 
                            backgroundColor: product.statusColor === '#28b446' ? '#dcfce7' : '#fee2e2',
                            color: product.statusColor 
                          }}
                        >
                          {product.status}
                        </span>
                      </td>

                      {/* Action Dropdown - Same as before */}
                      <td className="px-6 py-5 whitespace-nowrap text-center relative">
                        <button
                          onClick={(e) => handleDropdownToggle(e, product.id)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          aria-label="More options"
                        >
                          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {showDropdown === product.id && (
                          <div 
                            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                            style={{
                              position: 'fixed',
                              left: dropdownPosition.x,
                              top: dropdownPosition.y
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit Product
                            </button>
                            <button
                              onClick={() => handleRestockProduct(product)}
                              className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Restock (+Add)
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete Product
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <VendorProductEditModal
        product={editingProduct}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProduct(null);
        }}
        onSave={handleEditSave}
      />

      {/* Restock Modal - same as before */}
      {showRestockModal && restockingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-lg mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Restock Product</h3>
              <button
                onClick={handleRestockCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-xl">×</span>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Product: <strong>{restockingProduct.name}</strong></p>
              <p className="text-sm text-gray-600 mb-4">
                Current Stock: <strong className="text-blue-600">{restockingProduct.quantity} yards</strong>
              </p>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Quantity (yards) *
              </label>
              <input
                type="number"
                min="1"
                value={restockQuantity}
                onChange={(e) => setRestockQuantity(e.target.value)}
                placeholder="Enter yards to add"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {/* ✅ Crystal clear preview of the calculation */}
              {restockQuantity && !isNaN(parseInt(restockQuantity)) && parseInt(restockQuantity) > 0 && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Preview:</strong><br/>
                    Current: {restockingProduct.quantity} yards<br/>
                    Adding: +{parseInt(restockQuantity)} yards<br/>
                    <strong>New Total: {parseInt(restockingProduct.quantity) + parseInt(restockQuantity)} yards</strong>
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleRestockCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRestockSave}
                disabled={!restockQuantity || isNaN(parseInt(restockQuantity)) || parseInt(restockQuantity) <= 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProductListContent;