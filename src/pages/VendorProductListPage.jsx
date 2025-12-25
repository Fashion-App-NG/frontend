import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProductViewToggle from '../components/Product/ProductViewToggle';
import ProductCard from '../components/Product/VendorProductCard';
import { ProductActionDropdown } from '../components/Vendor/ProductActionDropdown';
import { RestockModal } from '../components/Vendor/RestockModal';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useVendorProducts } from '../hooks/useVendorProducts';

export const getProductStatus = (product) => {
  if (
    product.status === 'INACTIVE' ||
    product.status === 'inactive' ||
    product.status === false ||
    product.status === 'unavailable'
  ) {
    return false;
  }
  
  if (
    product.status === 'ACTIVE' ||
    product.status === 'active' ||
    product.status === true ||
    product.status === 'available' ||
    product.isActive === true ||
    product.active === true ||
    product.available === true
  ) {
    return true;
  }
  
  if (product.display === false) {
    return false;
  }
  
  return product.display === true || product.display === 'true';
};

export const getProductImage = (product) => {
  if (product.image && typeof product.image === 'string' && product.image.startsWith('data:image/')) {
    return product.image;
  }
  
  if (product.image && typeof product.image === 'string') {
    if (product.image.startsWith('http')) {
      return product.image;
    }
    return `${process.env.REACT_APP_API_BASE_URL}/uploads/${product.image}`;
  }
  
  if (product.image && typeof product.image === 'object' && product.image.url) {
    return product.image.url;
  }
  
  if (product.images && product.images.length > 0) {
    const firstImage = product.images[0];
    if (typeof firstImage === 'string') {
      if (firstImage.startsWith('http')) {
        return firstImage;
      }
      return `${process.env.REACT_APP_API_BASE_URL}/uploads/${firstImage}`;
    }
    if (typeof firstImage === 'object' && firstImage.url) {
      return firstImage.url;
    }
  }
  
  return '/placeholder-product.png';
};

const VendorProductListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // ✅ Auth check
  const { user, loading: authLoading, isAuthorized } = useRequireAuth({
    requiredRole: 'vendor',
    redirectTo: '/login/vendor'
  });

  // ✅ Use vendor products hook
  const { 
    products, 
    loading: productsLoading, 
    error, 
    totalProducts, 
    loadVendorProducts,
    deleteProduct,
    toggleProductStatus,
    restockProduct
  } = useVendorProducts();

  const [viewMode, setViewMode] = useState('grid');
  const [activeFilterTab, setActiveFilterTab] = useState('all');
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    status: searchParams.get('status') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });

  // ✅ Load products when filters or tab changes
  useEffect(() => {
    if (!isAuthorized || !user?.id) return;

    const filterParams = {
      ...filters,
      status: activeFilterTab === 'all' ? '' : 
              activeFilterTab === 'active' ? 'ACTIVE' :
              activeFilterTab === 'inactive' ? 'INACTIVE' :
              activeFilterTab === 'out-of-stock' ? 'OUT_OF_STOCK' : ''
    };

    loadVendorProducts(filterParams);
  }, [user?.id, isAuthorized, filters, activeFilterTab, loadVendorProducts]);

  const getFilterCounts = () => {
    return {
      all: totalProducts || 0,
      active: products.filter(p => getProductStatus(p) === true).length,
      inactive: products.filter(p => getProductStatus(p) === false).length,
      'out-of-stock': products.filter(p => p.stock === 0 || p.stockCount === 0).length
    };
  };

  const handleProductAction = async (action, product) => {
    const productId = product._id || product.id;

    switch (action) {
      case 'edit':
        navigate(`/vendor/products/edit/${productId}`);
        break;
        
      case 'restock':
        setSelectedProduct(product);
        setRestockModalOpen(true);
        break;
        
      case 'delete':
        if (window.confirm('Are you sure you want to delete this product?')) {
          try {
            await deleteProduct(productId);
            toast.success('Product deleted successfully');
          } catch (err) {
            toast.error(err.message || 'Failed to delete product');
          }
        }
        break;
        
      case 'toggle-status':
        try {
          const newStatus = !getProductStatus(product);
          await toggleProductStatus(productId, newStatus);
          toast.success(`Product ${newStatus ? 'activated' : 'deactivated'} successfully`);
        } catch (err) {
          toast.error(err.message || 'Failed to update product status');
        }
        break;
        
      default:
        console.warn('Unknown action:', action);
    }
  };

  const handleRestockSubmit = async (quantity) => {
    if (!selectedProduct) return;

    try {
      const productId = selectedProduct._id || selectedProduct.id;
      await restockProduct(productId, quantity);
      toast.success('Product restocked successfully');
      setRestockModalOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      toast.error(err.message || 'Failed to restock product');
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  // ✅ Show loading while auth checks
  if (authLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const filterCounts = getFilterCounts();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
            <p className="text-gray-600 mt-1">{totalProducts} total products</p>
          </div>
          <Link
            to="/vendor/products/add"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Add New Product
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {['all', 'active', 'inactive', 'out-of-stock'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFilterTab(tab)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeFilterTab === tab
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                <span className="ml-2 text-xs text-gray-500">({filterCounts[tab]})</span>
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="p-4 flex gap-4">
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <ProductViewToggle viewMode={viewMode} onChange={setViewMode} />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {productsLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* Products Grid */}
        {!productsLoading && !error && (
          <>
            {products.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Start by adding your first product</p>
                <Link
                  to="/vendor/products/add"
                  className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
                >
                  Add Product
                </Link>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                {products.map(product => (
                  <ProductCard
                    key={product._id || product.id}
                    product={product}
                    viewMode={viewMode}
                    onAction={(action) => handleProductAction(action, product)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Restock Modal */}
      {restockModalOpen && selectedProduct && (
        <RestockModal
          product={selectedProduct}
          onClose={() => {
            setRestockModalOpen(false);
            setSelectedProduct(null);
          }}
          onSubmit={handleRestockSubmit}
        />
      )}
    </div>
  );
};

export default VendorProductListPage;