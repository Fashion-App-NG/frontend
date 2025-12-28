import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify'; // ✅ ADD: Import toast
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
  const [imageErrors, setImageErrors] = useState({});
  const [productLoading, setProductLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  // ✅ ADD: Reset selectedImage when product changes
  useEffect(() => {
    setSelectedImage(0);
  }, [product?.id]);

  useEffect(() => {
    const findProduct = async () => {
      // Strategy 1: Try to find in loaded products first
      let foundProduct = products.find(p => {
        const productId = p.id || p._id;
        return productId === id || 
               productId?.toString() === id || 
               productId?.toString().includes(id) ||
               id?.toString().includes(productId?.toString());
      });
      
      // Strategy 2: If not found in loaded products, try direct API call
      if (!foundProduct && user?.id) {
        try {
          setProductLoading(true);
          const response = await productService.getVendorProducts(user.id);
          
          if (response.products) {
            foundProduct = response.products.find(p => {
              const productId = p.id || p._id;
              return productId === id || 
                     productId?.toString() === id ||
                     productId?.toString().includes(id) ||
                     id?.toString().includes(productId?.toString());
            });
          }
        } catch (error) {
          console.error('Error fetching product:', error);
        } finally {
          setProductLoading(false);
        }
      } else {
        setProductLoading(false);
      }
      
      setProduct(foundProduct || null);
    };

    if (id) {
      findProduct();
    }
  }, [id, products, user?.id]);

  const handleProductAction = (product, action) => {
    const productId = product.id || product._id;
    
    if (!productId) {
      console.error('No product ID found');
      return;
    }

    switch (action) {
      case 'edit':
        navigate(`/vendor/products/${productId}/edit`);
        break;
      case 'restock':
        setSelectedProduct(product);
        setShowRestockModal(true);
        break;
      case 'hide':
        handleHideProduct(productId);
        break;
      default:
        break;
    }
  };

  const handleHideProduct = async (productId) => {
    try {
      await updateProduct(productId, {
        display: false,
        status: 'Unavailable'
      });
      
      navigate('/vendor/products', {
        state: { message: 'Product hidden successfully', type: 'success' }
      });
    } catch (error) {
      console.error('Failed to hide product:', error);
      alert('Failed to hide product. Please try again.');
    }
  };

  const handleRestock = async (stockData) => {
    try {
      // ✅ FIX: Remove unused variables
      const { productId, change, newQuantity } = stockData;
      
      const product = products.find(p => (p.id || p._id) === productId);
      if (!product) return;

      const currentQuantity = parseInt(product.quantity) || 0;
      const additionalQuantity = parseInt(change) || 0;
      const finalQuantity = newQuantity !== undefined ? newQuantity : currentQuantity + additionalQuantity;

      const updates = {
        quantity: finalQuantity,
        status: finalQuantity > 0 ? 'Available' : 'Unavailable',
        display: true
      };

      await updateProduct(productId, updates);

      const updatedProduct = {
        ...product,
        ...updates
      };
      setProduct(updatedProduct);
      setShowRestockModal(false);
      setSelectedProduct(null);

      toast.success(`Successfully restocked! New quantity: ${finalQuantity} yards`);
    } catch (error) {
      console.error('Failed to update stock:', error);
      toast.error('Failed to update stock. Please try again.');
    }
  };

  // Replace the debug useEffect (around line 147-170)

  // ✅ DEBUG: Log the FULL URLs to check for duplicates
  useEffect(() => {
    if (product) {
      console.log('🖼️ RAW PRODUCT DATA:', {
        productId: product.id || product._id,
        productName: product.name,
        imagesLength: product.images?.length,
      });
      
      // ✅ Log FULL URLs to see if they're duplicates
      if (product.images && Array.isArray(product.images)) {
        console.log('🖼️ ALL IMAGE URLs:');
        product.images.forEach((img, idx) => {
          const url = typeof img === 'object' ? img.url : img;
          console.log(`  Image ${idx}: ${url}`);
        });
        
        // ✅ Check for duplicates
        const urls = product.images.map(img => typeof img === 'object' ? img.url : img);
        const uniqueUrls = [...new Set(urls)];
        console.log(`🖼️ DUPLICATE CHECK: ${urls.length} total, ${uniqueUrls.length} unique`);
        
        if (urls.length !== uniqueUrls.length) {
          console.log('⚠️ DUPLICATES FOUND IN DATABASE DATA!');
          console.log('Duplicate URLs:', urls.filter((url, idx) => urls.indexOf(url) !== idx));
        }
      }
      
      // ✅ Also log what getProductImages returns
      const extracted = getProductImages(product);
      console.log('🖼️ getProductImages() returned:', extracted.length, 'images');
      extracted.forEach((url, idx) => {
        console.log(`  Extracted ${idx}: ${url}`);
      });
    }
  }, [product]);

  // ✅ ADD: Get all images from product
  const getProductImages = (product) => {
    if (!product) return ['/assets/img/placeholder.png'];
    
    // Handle images array
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images.map(img => {
        if (typeof img === 'object' && img.url) {
          return img.url;
        }
        if (typeof img === 'string') {
          return img;
        }
        return '/assets/img/placeholder.png';
      });
    }
    
    // Single image fallback
    if (product.image) {
      if (typeof product.image === 'object' && product.image.url) {
        return [product.image.url];
      }
      if (typeof product.image === 'string') {
        return [product.image];
      }
    }
    
    return ['/assets/img/placeholder.png'];
  };

  // Show loading state
  if (loading || productLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or may have been removed.</p>
          
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

  const productImages = getProductImages(product);

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
            {/* Product Image Gallery */}
            <div className="md:w-1/2 p-4">
              {/* Main Image */}
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4">
                {!imageErrors[selectedImage] && productImages[selectedImage] ? (
                  <img 
                    src={productImages[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={() => {
                      // ✅ FIX: Per-image error handling
                      setImageErrors(prev => ({ ...prev, [selectedImage]: true }));
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Thumbnail Grid */}
              {productImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square bg-gray-200 rounded-lg overflow-hidden transition-all ${
                        selectedImage === index 
                          ? 'ring-2 ring-blue-500 ring-offset-2' 
                          : 'hover:ring-2 hover:ring-gray-300'
                      }`}
                    >
                      {!imageErrors[`thumb-${index}`] ? (
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={() => {
                            // ✅ FIX: Per-thumbnail error handling
                            setImageErrors(prev => ({ ...prev, [`thumb-${index}`]: true }));
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Image counter */}
              {productImages.length > 1 && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  Image {selectedImage + 1} of {productImages.length}
                </p>
              )}
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