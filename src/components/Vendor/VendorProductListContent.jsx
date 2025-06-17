import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const VendorProductListContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('monthly');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [activeContextMenu, setActiveContextMenu] = useState(null);

  // Placeholder product data - will be replaced with DB data
  const [products] = useState([
    {
      id: '#12490',
      name: 'Adire Fabric',
      description: 'Tie-and-dye fabric',
      image: '/images/adire-fabric-pattern.jpg', // Updated path to public folder
      quantity: 10,
      date: 'Dec 10, 2024',
      price: 300000,
      status: 'In Stock',
      statusColor: '#28b446'
    }
  ]);

  // Filter products based on active tab and search
  const filteredProducts = useMemo(() => {
    let filtered = products;

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

    return filtered;
  }, [products, activeTab, searchTerm]);

  const getTabCount = (tab) => {
    switch(tab) {
      case 'all': return products.length;
      case 'available': return products.filter(p => p.status === 'In Stock').length;
      case 'disabled': return products.filter(p => p.status === 'Out Of Stock').length;
      default: return 0;
    }
  };

  const handleAddProduct = () => {
    navigate('/vendor/products/add');
  };

  const handleEditProduct = (product) => {
    console.log('Edit product:', product);
    navigate(`/vendor/products/edit/${product.id.replace('#', '')}`);
    setActiveContextMenu(null);
  };

  const handleRestockProduct = (product) => {
    console.log('Restock product:', product);
    // Implement restock functionality
    setActiveContextMenu(null);
  };

  const handleDeleteProduct = (product) => {
    console.log('Delete product:', product);
    if (window.confirm('Are you sure you want to delete this product?')) {
      // Implement delete functionality
    }
    setActiveContextMenu(null);
  };

  const toggleContextMenu = (productId) => {
    setActiveContextMenu(activeContextMenu === productId ? null : productId);
  };

  // Context Menu Component
  const ContextMenu = ({ product, isVisible }) => {
    if (!isVisible) return null;

    return (
      <div className="absolute right-0 top-8 w-[135px] bg-[#f9f9f9] rounded-[7px] shadow-[0px_7px_8px_-2px_rgba(0,0,0,0.15)] p-[15px_16px] z-20">
        <div className="flex flex-col gap-[10px]">
          {/* Edit */}
          <div 
            className="flex items-center gap-[15px] cursor-pointer hover:bg-gray-100 p-1 rounded"
            onClick={() => handleEditProduct(product)}
          >
            <div className="w-[15px] h-[15px] text-[#2e2e2e]">✏️</div>
            <span className="text-[16px] leading-[120%] text-[#2e2e2e]">Edit</span>
          </div>

          {/* Restock */}
          <div 
            className="flex items-center gap-[12px] cursor-pointer hover:bg-gray-100 p-1 rounded"
            onClick={() => handleRestockProduct(product)}
          >
            <div className="w-[18px] h-[18px] text-[#2e2e2e]">📦</div>
            <span className="text-[16px] leading-[120%] text-[#2e2e2e]">Restock</span>
          </div>

          {/* Delete */}
          <div 
            className="flex items-end gap-[9px] cursor-pointer hover:bg-gray-100 p-1 rounded"
            onClick={() => handleDeleteProduct(product)}
          >
            <div className="w-[21px] h-[21px] text-[#cd0000]">🗑️</div>
            <span className="text-[16px] leading-[120%] text-[#cd0000]">Delete</span>
          </div>
        </div>
      </div>
    );
  };

  const ProductRow = ({ product, index }) => (
    <div className="flex items-center py-4 border-b border-[#e8e8e8] last:border-b-0">
      {/* Product Image & Info */}
      <div className="flex items-center gap-[62px] flex-1">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-[86px] h-[66px] rounded-lg object-cover"
        />
        
        <div className="flex items-center gap-[59px] flex-1">
          {/* Product Name */}
          <div className="w-[101px]">
            <div className="font-medium text-[12px] leading-[150%]">{product.name}</div>
            <div className="font-medium text-[12px] leading-[150%] text-gray-600">{product.description}</div>
          </div>

          {/* ID & Quantity */}
          <div className="flex items-center gap-[44px]">
            <div className="w-[163px] flex justify-between">
              <span className="font-medium text-[12px] leading-[150%]">{product.id}</span>
              <span className="font-medium text-[12px] leading-[150%] w-[57px]">{product.quantity} Pcs</span>
            </div>

            {/* Date & Price */}
            <div className="flex items-center gap-[28px]">
              <span className="font-medium text-[12px] leading-[150%] w-[75px]">{product.date}</span>
              <div className="flex items-center">
                <span className="text-[12px]">₦</span>
                <span className="font-medium text-[12px] leading-[150%] text-[#111]">{product.price.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status & Actions */}
      <div className="flex items-center gap-[30px]">
        <div className="flex items-center bg-white rounded-lg px-3 py-1 shadow-sm">
          <div 
            className="w-2 h-2 rounded-full mr-2"
            style={{ backgroundColor: product.statusColor }}
          />
          <span className="text-[12px] font-medium leading-[150%]">{product.status}</span>
        </div>
        
        <div className="relative">
          <button 
            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded"
            onClick={() => toggleContextMenu(product.id)}
          >
            <div className="flex flex-col gap-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full" />
              <div className="w-1 h-1 bg-gray-400 rounded-full" />
              <div className="w-1 h-1 bg-gray-400 rounded-full" />
            </div>
          </button>
          
          <ContextMenu 
            product={product} 
            isVisible={activeContextMenu === product.id} 
          />
        </div>
      </div>
    </div>
  );

  // Close context menu when clicking outside
  const handleOutsideClick = () => {
    setActiveContextMenu(null);
  };

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
        <div className="bg-white rounded-[10px] p-6" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[24px] font-bold leading-[150%]">Product List</h2>
            
            <div className="relative">
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
          <div className="flex items-center text-[12px] font-semibold text-black border-b border-[#e8e8e8] pb-2 mb-4">
            <div className="w-[151px]">Product Image</div>
            <div className="flex items-center gap-1">
              <span>Product Name</span>
              <svg className="w-2 h-2" viewBox="0 0 10 10">
                <path d="M5 0L9 4H1L5 0Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="ml-[90px] flex items-center gap-1">
              <span>ID</span>
              <svg className="w-3 h-3" viewBox="0 0 12 12">
                <path d="M6 0L6 12M0 6L12 6" stroke="currentColor" strokeWidth="1"/>
              </svg>
            </div>
            <div className="ml-[85px]">Qty</div>
            <div className="ml-[44px]">Date</div>
            <div className="ml-[28px] flex items-center gap-1">
              <span>Price per yard</span>
              <svg className="w-2 h-2" viewBox="0 0 10 10">
                <path d="M5 0L9 4H1L5 0Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="ml-[63px] flex items-center gap-1">
              <span>Status</span>
              <svg className="w-2 h-2" viewBox="0 0 10 10">
                <path d="M5 0L9 4H1L5 0Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="ml-[46px]">Action</div>
          </div>

          {/* Product Rows */}
          <div className="space-y-0">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <ProductRow key={`${product.id}-${index}`} product={product} index={index} />
              ))
            ) : (
              /* Empty State */
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-[18px] font-semibold text-gray-600 mb-2">No products yet</h3>
                <p className="text-gray-500 text-[14px] mb-4">Start by adding your first product to your store</p>
                <button
                  onClick={handleAddProduct}
                  className="px-4 py-2 bg-[#2e2e2e] text-[#edff8c] rounded-[5px] font-semibold"
                >
                  Add Your First Product
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProductListContent;