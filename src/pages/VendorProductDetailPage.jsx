import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ProductActionDropdown } from '../components/Vendor/ProductActionDropdown';
import { RestockModal } from '../components/Vendor/RestockModal';
import { useAuth } from '../contexts/AuthContext';
import { useVendorProducts } from '../hooks/useVendorProducts';
import productService from '../services/productService';

const VendorProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { products, updateProduct, loading } = useVendorProducts();
  
  const [product, setProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [productLoading, setProductLoading] = useState(true);

  // ✅ ENHANCED: Better product finding with multiple ID matching strategies
  useEffect(() => {
    const findProduct = async () => {
      console.log('🔍 Looking for product with ID:', id);
      console.log('📦 Available products:', products.length);
      
      // Strategy 1: Try to find in loaded products first
      let foundProduct = products.find(p => {
        const productId = p.id || p._id;
        const matches = productId === id || 
                       productId?.toString() === id || 
                       productId?.toString().includes(id) ||
                       id?.toString().includes(productId?.toString());
        
        if (matches) {
          console.log('✅ Found product in loaded products:', p.name);
        }
        return matches;
      });
      
      // Strategy 2: If not found in loaded products, try direct API call
      if (!foundProduct && user?.id) {
        console.log('🌐 Product not found in loaded products, trying direct API call...');
        try {
          setProductLoading(true);
          
          // Try to get the specific product directly
          const response = await productService.getVendorProducts(user.id);
          
          if (response.products) {
            console.log('📊 API returned products:', response.products.length);
            
            foundProduct = response.products.find(p => {
              const productId = p.id || p._id;
              const matches = productId === id || 
                             productId?.toString() === id ||
                             productId?.toString().includes(id) ||
                             id?.toString().includes(productId?.toString());
              
              if (matches) {
                console.log('✅ Found product via API:', p.name);
              }
              return matches;
            });
            
            if (!foundProduct) {
              console.log('❌ Product not found in API response');
              console.log('Available product IDs:', response.products.map(p => p.id || p._id));
            }
          }
        } catch (error) {
          console.error('❌ Error fetching product from API:', error);
        } finally {
          setProductLoading(false);
        }
      } else {
        setProductLoading(false);
      }
      
      if (foundProduct) {
        console.log('🎉 Setting product:', foundProduct.name);
        setProduct(foundProduct);
      } else {
        console.log('💥 No product found with ID:', id);
        setProduct(null);
      }
    };

    if (id) {
      findProduct();
    }
  }, [id, products, user?.id]);

  const getProductImage = (product) => {
    if (product?.image && product.image.startsWith('data:image/')) {
      return product.image;
    }
    
    if (product?.image && typeof product.image === 'string') {
      if (product.image.startsWith('http')) {
        return product.image;
      }
      if (product.image.startsWith('/')) {
        return `${process.env.REACT_APP_API_BASE_URL}${product.image}`;
      }
      return `${process.env.REACT_APP_API_BASE_URL}/uploads/${product.image}`;
    }
    
    if (product?.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === 'string') {
        if (firstImage.startsWith('http') || firstImage.startsWith('data:')) {
          return firstImage;
        }
        return `${process.env.REACT_APP_API_BASE_URL}/uploads/${firstImage}`;
      }
      if (typeof firstImage === 'object' && firstImage.url) {
        return firstImage.url;
      }
    }
    
    return null;
  };

  const handleProductAction = (product, action) => {
    console.log('🎯 Product action triggered:', action, 'for product:', product.name);
    const productId = product.id || product._id;
    
    if (!productId) {
      console.error('❌ No product ID found for action:', action);
      return;
    }
    
    console.log('📍 Using product ID:', productId);
    setSelectedProduct(product);
    
    switch (action) {
      case 'edit':
        console.log('✏️ Navigating to edit page:', `/vendor/products/${productId}/edit`);
        navigate(`/vendor/products/${productId}/edit`);
        break;
      case 'restock':
        console.log('📦 Opening restock modal');
        setShowRestockModal(true);
        break;
      case 'hide':
        console.log('🙈 Hide product action');
        handleHideProduct(product);
        break;
      default:
        console.log('❓ Unknown action:', action);
        break;
    }
  };

  const handleHideProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to hide "${product.name}"?`)) {
      return;
    }

    try {
      const productId = product.id || product._id;
      await updateProduct(productId, { display: false, status: 'INACTIVE' });
      
      // Navigate back to products list
      navigate('/vendor/products');
    } catch (error) {
      console.error('Failed to hide product:', error);
    }
  };

  const handleRestock = async (stockData) => {
    try {
      const productId = selectedProduct.id || selectedProduct._id;
      console.log('📈 Updating stock for product:', productId);
      
      await updateProduct(productId, {
        quantity: stockData.newQuantity,
        stockHistory: [
          ...(selectedProduct.stockHistory || []),
          {
            date: new Date().toISOString(),
            previousQuantity: selectedProduct.quantity || 0,
            newQuantity: stockData.newQuantity,
            change: stockData.change,
            reason: stockData.reason,
            notes: stockData.notes
          }
        ]
      });
      
      setShowRestockModal(false);
      setSelectedProduct(null);
      
      // Refresh the current product data
      setProduct(prev => ({
        ...prev,
        quantity: stockData.newQuantity
      }));
      
      console.log('✅ Stock updated successfully');
    } catch (error) {
      console.error('❌ Failed to update stock:', error);
    }
  };

  // Show loading state
  if (loading || productLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show not found state
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-2">The product you're looking for doesn't exist or may have been removed.</p>
          <p className="text-sm text-gray-500 mb-6">Product ID: {id}</p>
          
          {/* Debug Info */}
          <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left max-w-md mx-auto">
            <h3 className="font-medium text-gray-800 mb-2">Debug Info:</h3>
            <p className="text-xs text-gray-600">Searched ID: {id}</p>
            <p className="text-xs text-gray-600">Available products: {products.length}</p>
            <p className="text-xs text-gray-600">User ID: {user?.id}</p>
          </div>
          
          <Link
            to="/vendor/products"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const productImage = getProductImage(product);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/vendor/products"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Products
          </Link>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="md:flex">
            {/* Product Image */}
            <div className="md:w-1/2">
              <div className="aspect-square bg-gray-200">
                {!imageError && productImage ? (
                  <img 
                    src={productImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="md:w-1/2 p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  <p className="text-gray-600">{product.materialType || 'Fabric'}</p>
                </div>
                <ProductActionDropdown
                  product={product}
                  onAction={handleProductAction}
                />
              </div>

              <div className="space-y-6">
                {/* Price */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Price per Yard</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {product.pricePerYard || product.price ? 
                      new Intl.NumberFormat('en-NG', {
                        style: 'currency',
                        currency: 'NGN',
                        minimumFractionDigits: 0
                      }).format(product.pricePerYard || product.price) 
                      : 'Not set'
                    }
                  </p>
                </div>

                {/* Quantity */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Stock</h3>
                  <p className="text-xl text-gray-700">{product.quantity || 0} pieces</p>
                </div>

                {/* Status */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Status</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                    product.display 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      product.display ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    {product.display ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Description */}
                {product.description && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700">{product.description}</p>
                  </div>
                )}

                {/* Product ID */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Product ID</h3>
                  <p className="text-gray-700">#{(product.id || product._id)?.toString().slice(-4) || 'N/A'}</p>
                  <p className="text-xs text-gray-500">Full ID: {product.id || product._id}</p>
                </div>

                {/* Actions */}
                <div className="flex space-x-4 pt-6">
                  <button
                    onClick={() => handleProductAction(product, 'edit')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit Product
                  </button>
                  <button
                    onClick={() => handleProductAction(product, 'restock')}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Restock
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restock Modal */}
      <RestockModal
        isOpen={showRestockModal}
        onClose={() => {
          setShowRestockModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onRestock={handleRestock}
      />
    </>
  );
};

export default VendorProductDetailPage;