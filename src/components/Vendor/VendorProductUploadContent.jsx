import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const VendorProductUploadContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    productName: '',
    status: true, // Available by default
    pricePerYard: '',
    quantity: '',
    materialType: '',
    pattern: '',
    idNumber: '',
    description: '',
    images: []
  });

  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);
  const [showPatternDropdown, setShowPatternDropdown] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Utility function to compress image with better quality control
  const compressImage = (file, maxWidth = 300, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = (width * maxWidth) / height;
            height = maxWidth;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // File upload handlers
  const handleFileSelect = async (files) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    // Limit file size (5MB per file)
    const validFiles = imageFiles.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    try {
      // Process images with compression
      const imagePromises = validFiles.map(async (file) => {
        const compressedImage = await compressImage(file);
        return {
          file,
          preview: compressedImage,
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size
        };
      });

      const newImages = await Promise.all(imagePromises);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 4) // Limit to 4 images
      }));
    } catch (error) {
      console.error('Error processing images:', error);
      alert('Error processing images. Please try again.');
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files?.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files?.length > 0) {
      handleFileSelect(files);
    }
  };

  const removeImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const handleToggleStatus = () => {
    setFormData(prev => ({ ...prev, status: !prev.status }));
  };

  // Improved utility function to check localStorage space
  const checkLocalStorageSpace = (data) => {
    try {
      const dataString = JSON.stringify(data);
      const testKey = 'test_storage_' + Date.now();
      
      // Try to store the data
      localStorage.setItem(testKey, dataString);
      localStorage.removeItem(testKey);
      
      // Also check if we're approaching the limit (leave some buffer)
      const currentSize = JSON.stringify(localStorage).length;
      const maxSize = 5 * 1024 * 1024; // 5MB typical limit
      
      return currentSize < maxSize * 0.8; // Use only 80% of available space
    } catch (e) {
      console.warn('Storage space check failed:', e.message);
      return false;
    }
  };

  // Simplified utility function to clean old products if storage is full
  const cleanOldProducts = () => {
    try {
      const existingProducts = JSON.parse(localStorage.getItem('vendorProducts') || '[]');
      // Keep only the 5 most recent products to free up more space
      const recentProducts = existingProducts.slice(0, 5);
      localStorage.setItem('vendorProducts', JSON.stringify(recentProducts));
      console.log(`Cleaned old products, kept ${recentProducts.length} recent items`);
      return recentProducts;
    } catch (error) {
      console.error('Error cleaning old products:', error);
      localStorage.removeItem('vendorProducts');
      return [];
    }
  };

  const handlePublishProduct = useCallback(() => {
    // Validate required fields
    if (!formData.productName.trim()) {
      alert('Please enter a product name');
      return;
    }
    if (!formData.pricePerYard.trim()) {
      alert('Please enter a price');
      return;
    }
    if (formData.images.length === 0) {
      alert('Please upload at least one image');
      return;
    }

    // Create new product with current timestamp
    const now = new Date();
    const newProduct = {
      id: `#${Math.floor(Math.random() * 100000)}`,
      name: formData.productName,
      description: formData.description || 'Custom fabric',
      // Use the first uploaded image (compressed)
      image: formData.images[0]?.preview || '/api/placeholder/86/66',
      images: formData.images.map(img => ({
        id: img.id,
        preview: img.preview,
        name: img.name,
        size: img.size
      })), // Store all images
      imageCount: formData.images.length,
      quantity: parseInt(formData.quantity) || 1,
      date: now.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      uploadDate: now.toISOString(),
      price: parseFloat(formData.pricePerYard) || 0,
      status: formData.status ? 'In Stock' : 'Out Of Stock',
      statusColor: formData.status ? '#28b446' : '#cd0000',
      materialType: formData.materialType,
      pattern: formData.pattern,
      idNumber: formData.idNumber,
      isLocalProduct: true
    };

    console.log('Attempting to store product:', newProduct.name, 'with image size:', newProduct.image?.length || 0);

    try {
      // Get existing products
      let existingProducts = JSON.parse(localStorage.getItem('vendorProducts') || '[]');
      
      // Try a simple approach first - just add the product
      existingProducts.unshift(newProduct);
      
      try {
        localStorage.setItem('vendorProducts', JSON.stringify(existingProducts));
        console.log('✅ Product stored successfully with images');
        
        // Navigate to product listing page
        navigate('/vendor/products', {
          state: {
            message: 'Product uploaded successfully! Images are compressed and stored locally for demonstration.',
            type: 'success',
            productAdded: true
          }
        });
        
      } catch (storageError) {
        console.warn('⚠️ Initial storage failed, trying with cleanup:', storageError.message);
        
        // Clean old products and try again
        existingProducts = cleanOldProducts();
        existingProducts.unshift(newProduct);
        
        try {
          localStorage.setItem('vendorProducts', JSON.stringify(existingProducts));
          console.log('✅ Product stored after cleanup');
          
          navigate('/vendor/products', {
            state: {
              message: 'Product uploaded successfully! Old products were cleaned to make space.',
              type: 'success',
              productAdded: true
            }
          });
          
        } catch (secondError) {
          console.warn('⚠️ Storage failed even after cleanup, using fallback');
          throw secondError;
        }
      }

    } catch (error) {
      console.error('❌ Storage error, using fallback:', error);
      
      // Ultimate fallback: store without images but keep metadata
      try {
        const fallbackProduct = {
          ...newProduct,
          image: '/api/placeholder/86/66',
          images: [], // Clear images to save space
          imageCount: formData.images.length,
          hasStorageIssue: true
        };
        
        const existingProducts = JSON.parse(localStorage.getItem('vendorProducts') || '[]');
        // Only keep 3 most recent to make sure we have space
        const limitedProducts = existingProducts.slice(0, 3);
        limitedProducts.unshift(fallbackProduct);
        
        localStorage.setItem('vendorProducts', JSON.stringify(limitedProducts));
        
        navigate('/vendor/products', {
          state: {
            message: 'Product uploaded successfully! Due to storage limitations, images are shown as placeholders. This will be resolved with backend integration.',
            type: 'warning',
            productAdded: true
          }
        });
        
      } catch (fallbackError) {
        console.error('❌ Even fallback storage failed:', fallbackError);
        alert('Unable to store product due to browser storage limitations. Please clear your browser data and try again with smaller images.');
      }
    }
  }, [formData, navigate]);

  const handleCancel = () => {
    // Confirm before leaving if form has data
    const hasData = Object.values(formData).some(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'boolean') return false; // Don't consider status toggle
      return value !== '';
    });

    if (hasData) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }

    navigate('/vendor/products');
  };

  const materialTypes = ['Cotton', 'Linen', 'Silk', 'Lace', 'Wool', 'Polyester', 'Chiffon', 'Satin'];
  const patterns = ['Solid', 'Striped', 'Floral', 'Geometric', 'Polka Dot', 'Abstract', 'Paisley', 'Plaid'];

  return (
    <div className="min-h-screen bg-[#d8dfe9]">
      {/* Header */}
      <header className="bg-white border-b border-black/8 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Welcome Section */}
          <div>
            <h1 className="text-[32px] font-bold text-[#3e3e3e] leading-[150%]">
              Welcome {user?.firstName || user?.storeName || 'Vendor'}
            </h1>
            <p className="text-[16px] text-[#2e2e2e] leading-[120%] w-[312px]">
              Add new products to your store inventory
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
        {/* Page Title and Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[24px] font-bold text-black leading-[150%]">
            Add New Product
          </h2>
          
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-3 bg-[#f9f9f9] text-[#b2b2b2] rounded-[5px] border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePublishProduct}
              className="px-4 py-3 bg-[#2e2e2e] text-[#edff8c] rounded-[5px] font-semibold hover:bg-[#1a1a1a] transition-colors"
            >
              Publish Product
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Form Section */}
          <div className="col-span-7 bg-[#f9f9f9] rounded-[10px] p-6">
            <div className="space-y-6">
              {/* Product Name and Status */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold mb-2">Product name</label>
                  <input
                    type="text"
                    placeholder="Enter Product name"
                    value={formData.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                    className="w-full h-[52px] px-4 bg-white border border-[#ccc] rounded-[8px] text-black placeholder-[#afacac] outline-none focus:border-[#2e2e2e] transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block font-semibold mb-2">Status</label>
                  <div className="flex items-center h-[52px] px-4 bg-white border border-[#ccc] rounded-[8px]">
                    <span className="flex-1 text-black">
                      {formData.status ? 'Available' : 'Unavailable'}
                    </span>
                    <div className="relative">
                      <button
                        onClick={handleToggleStatus}
                        className={`w-[50px] h-[27px] rounded-[27px] relative transition-colors duration-200 ${
                          formData.status ? 'bg-[#28b446]' : 'bg-[#ccc]'
                        }`}
                      >
                        <div className={`w-[21px] h-[24px] bg-white rounded-full absolute top-[1.5px] transition-all duration-200 ${
                          formData.status ? 'right-[2px]' : 'left-[2px]'
                        }`}></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price and Quantity */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold mb-2">Price Per Yard</label>
                  <div className="flex items-center h-[52px] px-4 bg-white border border-[#ccc] rounded-[8px] gap-2 focus-within:border-[#2e2e2e]">
                    <div className="w-6 h-6 text-[#666] flex-shrink-0">₦</div>
                    <input
                      type="number"
                      placeholder="Enter Price"
                      value={formData.pricePerYard}
                      onChange={(e) => handleInputChange('pricePerYard', e.target.value)}
                      className="flex-1 outline-none text-black placeholder-[#afacac] bg-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block font-semibold mb-2">
                    <span className="font-semibold">Quantity </span>
                    <span className="font-medium text-[#aeaeae]">(In yards)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Enter quantity"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    className="w-full h-[52px] px-4 bg-white border border-[#ccc] rounded-[8px] text-black placeholder-[#afacac] outline-none focus:border-[#2e2e2e] transition-colors"
                  />
                </div>
              </div>

              {/* Material Type and Pattern */}
              <div className="grid grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block font-semibold mb-2">Material Type</label>
                  <div
                    onClick={() => {
                      setShowMaterialDropdown(!showMaterialDropdown);
                      setShowPatternDropdown(false);
                    }}
                    className="flex items-center justify-between h-[52px] px-4 bg-[#f9f9f9] border border-[#ccc] rounded-[8px] cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <span className={`${formData.materialType ? 'text-black' : 'text-[#aeaeae]'}`}>
                      {formData.materialType || 'Choose Material'}
                    </span>
                    <svg className={`w-[10px] h-[5px] transition-transform ${showMaterialDropdown ? 'rotate-180' : ''}`} viewBox="0 0 10 5">
                      <path d="M0 0L5 5L10 0" fill="#aeaeae"/>
                    </svg>
                  </div>
                  
                  {showMaterialDropdown && (
                    <div className="absolute top-full left-0 w-full bg-white border border-[#ccc] rounded-[8px] mt-1 z-20 shadow-lg max-h-48 overflow-y-auto">
                      {materialTypes.map((type) => (
                        <div
                          key={type}
                          onClick={() => {
                            handleInputChange('materialType', type);
                            setShowMaterialDropdown(false);
                          }}
                          className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-black"
                        >
                          {type}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <label className="block font-semibold mb-2">Pattern</label>
                  <div
                    onClick={() => {
                      setShowPatternDropdown(!showPatternDropdown);
                      setShowMaterialDropdown(false);
                    }}
                    className="flex items-center justify-between h-[51px] px-4 bg-[#f9f9f9] border-[1.5px] border-[#ccc] rounded-[5px] cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <span className={`${formData.pattern ? 'text-black' : 'text-[#aeaeae]'}`}>
                      {formData.pattern || 'Choose Pattern'}
                    </span>
                    <svg className={`w-[10px] h-[5px] transition-transform ${showPatternDropdown ? 'rotate-180' : ''}`} viewBox="0 0 10 5">
                      <path d="M0 0L5 5L10 0" fill="#aeaeae"/>
                    </svg>
                  </div>
                  
                  {showPatternDropdown && (
                    <div className="absolute top-full left-0 w-full bg-white border border-[#ccc] rounded-[8px] mt-1 z-20 shadow-lg max-h-48 overflow-y-auto">
                      {patterns.map((pattern) => (
                        <div
                          key={pattern}
                          onClick={() => {
                            handleInputChange('pattern', pattern);
                            setShowPatternDropdown(false);
                          }}
                          className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-black"
                        >
                          {pattern}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ID Number */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold mb-2">ID Number</label>
                  <input
                    type="text"
                    placeholder="Enter ID number"
                    value={formData.idNumber}
                    onChange={(e) => handleInputChange('idNumber', e.target.value)}
                    className="w-full h-[52px] px-4 bg-white border border-[#ccc] rounded-[8px] text-black placeholder-[#afacac] outline-none focus:border-[#2e2e2e] transition-colors"
                  />
                </div>
                <div></div> {/* Empty space to maintain grid layout */}
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold mb-2">Description</label>
                <div className="bg-white border-[0.5px] border-[#cfd3d4] rounded-[8px] p-2">
                  {/* Toolbar */}
                  <div className="flex items-center justify-between mb-4 px-2 border-b border-gray-200 pb-2">
                    <div className="flex items-center gap-4">
                      {/* Text formatting buttons */}
                      <div className="flex gap-2">
                        <button className="w-6 h-6 font-bold text-gray-600 hover:text-black hover:bg-gray-100 rounded flex items-center justify-center">B</button>
                        <button className="w-6 h-6 underline text-gray-600 hover:text-black hover:bg-gray-100 rounded flex items-center justify-center">U</button>
                        <button className="w-6 h-6 italic text-gray-600 hover:text-black hover:bg-gray-100 rounded flex items-center justify-center">I</button>
                      </div>
                      
                      {/* Alignment buttons */}
                      <div className="flex gap-2">
                        <button className="w-6 h-6 text-gray-600 hover:text-black hover:bg-gray-100 rounded flex items-center justify-center">≡</button>
                        <button className="w-6 h-6 text-gray-600 hover:text-black hover:bg-gray-100 rounded flex items-center justify-center">⫷</button>
                        <button className="w-6 h-6 text-gray-600 hover:text-black hover:bg-gray-100 rounded flex items-center justify-center">⫸</button>
                      </div>
                      
                      {/* Link button */}
                      <button className="w-6 h-6 text-gray-600 hover:text-black hover:bg-gray-100 rounded flex items-center justify-center">🔗</button>
                    </div>
                  </div>
                  
                  {/* Text area */}
                  <textarea
                    placeholder="Your text goes here"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full h-20 resize-none outline-none text-black placeholder-[#abafb1] bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Upload Section */}
          <div className="col-span-5 bg-[#f9f9f9] rounded-[10px] p-6">
            <h3 className="text-[20px] font-bold mb-6 leading-[150%]">Upload Image</h3>
            
            {/* Storage Warning */}
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-700">
                <strong>Demo Mode:</strong> Images are compressed and stored locally for demonstration. Full resolution images will be supported with backend integration.
              </p>
            </div>
            
            {/* Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-[12px] h-[200px] flex flex-col items-center justify-center mb-6 cursor-pointer transition-colors ${
                isDragOver 
                  ? 'border-[#347ae2] bg-blue-50' 
                  : 'border-black hover:border-[#347ae2] hover:bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
            >
              <div className="w-[48px] h-[48px] mb-3 text-gray-400">
                <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" stroke="currentColor">
                  <path d="M24 12L24 36M12 24L36 24" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="24" cy="24" r="20" strokeWidth="2" strokeDasharray="2,2"/>
                </svg>
              </div>
              <p className="text-center text-sm">
                <span className="text-[#0f0f0f]">Drag & drop files or </span>
                <span className="text-[#347ae2] underline font-medium">Browse</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF (Max 5MB each)</p>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Image Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
              {formData.images.map((image, index) => (
                <div key={image.id} className="relative w-20 h-16 bg-gray-200 rounded-[5px] overflow-hidden group">
                  <img 
                    src={image.preview} 
                    alt={`Product ${index + 1}`} 
                    className="w-full h-full object-cover" 
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(image.id);
                    }}
                    className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                    {Math.round(image.size / 1024)}KB
                  </div>
                </div>
              ))}
              
              {/* Empty slots */}
              {Array.from({ length: 4 - formData.images.length }).map((_, index) => (
                <div 
                  key={`empty-${index}`} 
                  className="w-20 h-16 bg-gray-100 rounded-[5px] border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={handleBrowseClick}
                >
                  <span className="text-gray-400 text-lg">+</span>
                </div>
              ))}
            </div>
            
            {formData.images.length > 0 && (
              <p className="text-xs text-gray-600 mt-2">
                {formData.images.length}/4 images • Compressed for demo
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProductUploadContent;