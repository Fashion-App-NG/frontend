import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const VendorProductListContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('monthly');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [products, setProducts] = useState([]);
  const [activeContextMenu, setActiveContextMenu] = useState(null);

  // Load products from localStorage
  const loadProducts = useCallback(() => {
    const localProducts = JSON.parse(localStorage.getItem('vendorProducts') || '[]');
    
    // If no local products, show a sample product as demonstration
    if (localProducts.length === 0) {
      const sampleProduct = {
        id: '#SAMPLE',
        name: 'Sample Product',
        description: 'Upload your first product to see it here',
        image: '/api/placeholder/86/66',
        quantity: 0,
        date: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        uploadDate: new Date().toISOString(),
        price: 0,
        status: 'Sample',
        statusColor: '#9ca3af',
        isLocalProduct: false,
        isSample: true
      };
      return [sampleProduct];
    }
    
    return localProducts;
  }, []);

  // Initialize products
  useEffect(() => {
    setProducts(loadProducts());
  }, [loadProducts]);

  // Check for success message from product upload
  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      setMessageType(location.state.type || 'info');
      
      // If a product was added, refresh the product list
      if (location.state?.productAdded) {
        setProducts(loadProducts());
      }
      
      // Clear the state to prevent message from showing again on refresh
      navigate(location.pathname, { replace: true, state: {} });
      
      // Auto-hide message after 8 seconds (longer for the detailed message)
      const timer = setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate, location.pathname, loadProducts]);

  // Handle clicking outside dropdowns
  const handleOutsideClick = useCallback((e) => {
    if (!e.target.closest('.dropdown-container')) {
      setShowSortDropdown(false);
      setActiveContextMenu(null);
    }
  }, []);

  // Filter products based on active tab and search
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => !p.isSample); // Remove sample products from filtering

    // Filter by tab
    if (activeTab === 'available') {
      filtered = filtered.filter(p => p.status === 'In Stock');
    } else if (activeTab === 'disabled') {
      filtered = filtered.filter(p => p.status === 'Out Of Stock');
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.uploadDate || a.date);
      const dateB = new Date(b.uploadDate || b.date);
      return dateB - dateA;
    });

    return filtered;
  }, [products, activeTab, searchTerm]);

  // Get dynamic counts
  const getTabCount = (tab) => {
    const nonSampleProducts = products.filter(p => !p.isSample);
    
    switch(tab) {
      case 'all': 
        return nonSampleProducts.length;
      case 'available': 
        return nonSampleProducts.filter(p => p.status === 'In Stock').length;
      case 'disabled': 
        return nonSampleProducts.filter(p => p.status === 'Out Of Stock').length;
      default: 
        return 0;
    }
  };

  const handleAddProduct = () => {
    navigate('/vendor/products/add');
  };

  // Context menu handlers
  const handleContextMenuAction = (action, product) => {
    setActiveContextMenu(null);
    
    switch(action) {
      case 'edit':
        // Navigate to edit page (placeholder for now)
        alert(`Edit ${product.name} - Feature coming soon!`);
        break;
      case 'restock':
        // Handle restock
        alert(`Restock ${product.name} - Feature coming soon!`);
        break;
      case 'delete':
        // Handle delete
        if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
          const updatedProducts = products.filter(p => p.id !== product.id);
          setProducts(updatedProducts);
          localStorage.setItem('vendorProducts', JSON.stringify(updatedProducts.filter(p => !p.isSample)));
          setMessage(`Product "${product.name}" has been deleted successfully.`);
          setMessageType('success');
          
          // Auto-hide message
          setTimeout(() => {
            setMessage('');
            setMessageType('');
          }, 3000);
        }
        break;
      default:
        break;
    }
  };

  const ProductRow = ({ product, index }) => {
    const [imageError, setImageError] = useState(false);
    
    const handleImageError = (e) => {
      console.log('Image failed to load for product:', product.name, 'src:', e.target.src);
      setImageError(true);
    };

    const getDisplayImage = () => {
      // If there was an image error, use placeholder
      if (imageError) {
        return '/api/placeholder/86/66';
      }
      
      // For local products with uploaded images
      if (product.isLocalProduct && product.image && product.image.startsWith('data:image/')) {
        return product.image;
      }
      
      // For products with storage issues
      if (product.hasStorageIssue) {
        return '/api/placeholder/86/66';
      }
      
      // Default fallback
      return product.image || '/api/placeholder/86/66';
    };

    return (
      <div className="grid grid-cols-12 gap-4 items-center py-4 border-b border-[#e8e8e8] last:border-b-0 min-h-[80px]">
        {/* Product Image - Col 1 */}
        <div className="col-span-1 flex justify-center">
          <div className="relative">
            <img 
              src={getDisplayImage()}
              alt={product.name}
              className="w-[86px] h-[66px] rounded-lg object-cover bg-gray-100"
              onError={handleImageError}
              onLoad={() => console.log('Image loaded successfully for:', product.name)}
            />
            
            {/* Show storage issue indicator */}
            {product.hasStorageIssue && (
              <div className="absolute -top-1 -left-1 bg-yellow-500 text-white text-xs rounded px-1 font-semibold">
                !
              </div>
            )}
            
            {/* Show image count badge if multiple images */}
            {product.imageCount > 1 && (
              <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {product.imageCount}
              </div>
            )}
            
            {/* Show "NEW" badge for uploaded products */}
            {product.isLocalProduct && !product.hasStorageIssue && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs rounded px-1 font-semibold">
                NEW
              </div>
            )}
          </div>
        </div>

        {/* Product Name - Col 2-3 */}
        <div className="col-span-2">
          <div className="font-medium text-[14px] leading-[150%] text-black">{product.name}</div>
          <div className="font-normal text-[12px] leading-[150%] text-gray-600">{product.description}</div>
          {/* Show material type if available */}
          {product.materialType && (
            <div className="text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1 inline-block">
              {product.materialType}
            </div>
          )}
          {/* Show storage issue warning */}
          {product.hasStorageIssue && (
            <div className="text-[10px] text-yellow-600 bg-yellow-50 px-2 py-1 rounded mt-1 inline-block">
              Limited storage
            </div>
          )}
        </div>

        {/* ID - Col 4 */}
        <div className="col-span-1">
          <span className="font-medium text-[14px] leading-[150%] text-black">{product.id}</span>
        </div>

        {/* Quantity - Col 5 */}
        <div className="col-span-1 text-center">
          <span className="font-medium text-[14px] leading-[150%] text-black">{product.quantity} Pcs</span>
        </div>

        {/* Date - Col 6 */}
        <div className="col-span-1 text-center">
          <span className="font-medium text-[14px] leading-[150%] text-black">{product.date}</span>
        </div>

        {/* Price - Col 7 */}
        <div className="col-span-2 text-center">
          <div className="flex items-center justify-center">
            <span className="text-[14px] text-black">₦</span>
            <span className="font-medium text-[14px] leading-[150%] text-black ml-1">
              {product.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Status - Col 8 */}
        <div className="col-span-1 flex justify-center">
          <div className="flex items-center bg-white rounded-lg px-3 py-2 shadow-sm border">
            <div 
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: product.statusColor }}
            />
            <span className="text-[12px] font-medium leading-[150%]">{product.status}</span>
          </div>
        </div>

        {/* Action - Col 9 */}
        <div className="col-span-1 flex justify-center relative">
          <div className="dropdown-container">
            <button 
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setActiveContextMenu(activeContextMenu === product.id ? null : product.id)}
            >
              <div className="flex flex-col gap-1">
                <div className="w-1 h-1 bg-gray-600 rounded-full" />
                <div className="w-1 h-1 bg-gray-600 rounded-full" />
                <div className="w-1 h-1 bg-gray-600 rounded-full" />
              </div>
            </button>
            
            {/* Context Menu */}
            {activeContextMenu === product.id && (
              <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-20 min-w-[120px]">
                <button
                  onClick={() => handleContextMenuAction('edit', product)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-[14px] flex items-center gap-2 border-b border-gray-100"
                >
                  <span>✏️</span>
                  Edit
                </button>
                <button
                  onClick={() => handleContextMenuAction('restock', product)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-[14px] flex items-center gap-2 border-b border-gray-100"
                >
                  <span>🔄</span>
                  Restock
                </button>
                <button
                  onClick={() => handleContextMenuAction('delete', product)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-[14px] flex items-center gap-2 text-red-600"
                >
                  <span>🗑️</span>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Show sample product message when no products exist
  const showSample = products.length === 1 && products[0]?.isSample;

  return (
    <div className="min-h-screen bg-[#d8dfe9]" onClick={handleOutsideClick}>
      {/* Header */}
      <header className="bg-white border-b border-black/8 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Welcome Section */}
          <div>
            <h1 className="text-[32px] font-bold text-[#3e3e3e] leading-[150%]">
              Welcome {user?.firstName || user?.storeName || 'Vendor'}
            </h1>
            <p className="text-[16px] text-[#2e2e2e] leading-[120%] w-[312px]">
              Here is the information about all your products
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-[284px]">
            <div className="flex items-center bg-[#f5f5f5] rounded-[50px] px-3 py-2 gap-2">
              <div className="w-6 h-6 text-[#9e9e9e]">🔍</div>
              <input 
                type="text" 
                placeholder="Search"
                className="flex-1 bg-transparent outline-none text-[#9e9e9e] text-[16px]"
              />
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 text-gray-600">🔔</div>
            <div className="w-9 h-9 rounded-full bg-gray-300 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                {(user?.firstName?.[0] || user?.storeName?.[0] || 'V').toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        {/* Success/Info Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            messageType === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700'
              : messageType === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : messageType === 'warning'
              ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
              : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            <div className="flex items-start gap-2">
              {messageType === 'success' && (
                <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              <div>
                <p className="font-medium text-sm">{message}</p>
              </div>
              <button 
                onClick={() => setMessage('')}
                className="ml-auto text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Empty State for No Products */}
        {showSample && (
          <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">No Products Yet</h3>
              <p className="text-blue-700 mb-4">
                Start by uploading your first product to see it listed here. Your products will be stored locally for demonstration purposes.
              </p>
              <button
                onClick={handleAddProduct}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload Your First Product
              </button>
            </div>
          </div>
        )}

        {/* Search & Actions */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Search Products */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400">
                🔍
              </div>
              <input
                type="text"
                placeholder="Search Products.."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#f9f9f9] rounded-lg border-none outline-none text-[14px] text-[#2e2e2e] w-[200px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-3 bg-[#f9f9f9] text-[#b2b2b2] rounded-[5px] border text-[16px]">
              Bulk Upload
            </button>
            <button
              onClick={handleAddProduct}
              className="px-3 py-3 bg-[#2e2e2e] text-[#edff8c] rounded-[5px] font-semibold flex items-center gap-1"
            >
              <span className="text-lg">+</span>
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-[5px] text-[16px] ${
              activeTab === 'all' 
                ? 'bg-[#f9f9f9] text-black border' 
                : 'bg-[#f9f9f9] text-[#b2b2b2]'
            }`}
          >
            All Products ({getTabCount('all')})
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 rounded-[5px] text-[16px] ${
              activeTab === 'available' 
                ? 'bg-[#f9f9f9] text-black border' 
                : 'bg-[#f9f9f9] text-[#b2b2b2]'
            }`}
          >
            Available ({getTabCount('available')})
          </button>
          <button
            onClick={() => setActiveTab('disabled')}
            className={`px-4 py-2 rounded-[5px] text-[16px] ${
              activeTab === 'disabled' 
                ? 'bg-[#f9f9f9] text-black border' 
                : 'bg-[#f9f9f9] text-[#b2b2b2]'
            }`}
          >
            Disabled ({getTabCount('disabled')})
          </button>

          {/* Filter Button */}
          <button className="ml-auto px-3 py-2 bg-[#f9f9f9] text-[#b2b2b2] rounded-[5px] flex items-center gap-2">
            <div className="w-[22px] h-[22px]">⚙️</div>
            <span>Filter</span>
          </button>
        </div>

        {/* Product List */}
        <div className="bg-white rounded-[10px] p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[24px] font-bold leading-[150%]">Product List</h2>
            
            <div className="relative dropdown-container">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-1 bg-white border rounded-lg px-3 py-1 shadow-sm"
              >
                <span className="text-[12px] font-medium">Monthly</span>
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 6l4 4 4-4H4z"/>
                </svg>
              </button>
              
              {showSortDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-[120px]">
                  <button className="w-full px-3 py-2 text-left hover:bg-gray-50 text-[12px]">Monthly</button>
                  <button className="w-full px-3 py-2 text-left hover:bg-gray-50 text-[12px]">Weekly</button>
                  <button className="w-full px-3 py-2 text-left hover:bg-gray-50 text-[12px]">Daily</button>
                </div>
              )}
            </div>
          </div>

          {/* Table Header */}
          {!showSample && (
            <div className="grid grid-cols-12 gap-4 items-center text-[14px] font-semibold text-black border-b border-[#e8e8e8] pb-3 mb-4">
              <div className="col-span-1 text-center">Product Image</div>
              <div className="col-span-2 flex items-center gap-1">
                <span>Product Name</span>
                <svg className="w-3 h-3" viewBox="0 0 10 10">
                  <path d="M5 0L9 4H1L5 0Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="col-span-1 flex items-center gap-1">
                <span>ID</span>
                <svg className="w-3 h-3" viewBox="0 0 12 12">
                  <path d="M6 0L6 12M0 6L12 6" stroke="currentColor" strokeWidth="1"/>
                </svg>
              </div>
              <div className="col-span-1 text-center">Qty</div>
              <div className="col-span-1 text-center">Date</div>
              <div className="col-span-2 text-center flex items-center justify-center gap-1">
                <span>Price per yard</span>
                <svg className="w-3 h-3" viewBox="0 0 10 10">
                  <path d="M5 0L9 4H1L5 0Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="col-span-1 text-center flex items-center justify-center gap-1">
                <span>Status</span>
                <svg className="w-3 h-3" viewBox="0 0 10 10">
                  <path d="M5 0L9 4H1L5 0Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="col-span-1 text-center">Action</div>
            </div>
          )}

          {/* Product Rows */}
          {!showSample && (
            <div className="space-y-0">
              {filteredProducts.map((product, index) => (
                <ProductRow key={`${product.id}-${index}`} product={product} index={index} />
              ))}
            </div>
          )}

          {/* Empty State for Filtered Results */}
          {!showSample && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-[16px]">
                {searchTerm ? `No products found for "${searchTerm}"` : 'No products found for this filter'}
              </p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-blue-600 hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorProductListContent;