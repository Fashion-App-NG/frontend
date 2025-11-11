import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import vendorService from '../../services/vendorService';

export const VendorProductUploadContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    productName: '',
    status: true, // Available by default
    pricePerYard: '',
    quantity: '1',
    materialType: '',
    pattern: '',
    idNumber: '',
    description: '',
    images: []
  });

  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);
  const [showPatternDropdown, setShowPatternDropdown] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
      // ✅ Process images while preserving File objects
      const imagePromises = validFiles.map(async (file) => {
        const compressedPreview = await compressImage(file); // For display only
        return {
          file: file, // ✅ Preserve original File object for upload
          preview: compressedPreview, // For UI display
          id: Math.random().toString(36).slice(2, 9),
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

  const handleSubmit = async () => {
    // Validation
    if (!formData.productName.trim()) {
      alert('Please enter a product name');
      return;
    }

    if (!formData.pricePerYard || parseFloat(formData.pricePerYard) <= 0) {
      alert('Please enter a valid price');
      return;
    }

    if (!formData.materialType) {
      alert('Please select a material type');
      return;
    }

    try {
      setIsUploading(true);

      // ✅ FIX: Wrap single product in array to match bulk upload format
      const productData = [{
        name: formData.productName.trim(),
        pricePerYard: parseFloat(formData.pricePerYard),
        quantity: parseInt(formData.quantity) || 1,
        materialType: formData.materialType,
        vendorId: user?.id,
        idNumber: formData.idNumber?.trim() || `PRD-${Date.now()}`,
        description: formData.description?.trim() || 'Product description',
        pattern: formData.pattern || 'Solid',
        status: formData.status ? 'Available' : 'Unavailable',
        images: formData.images || [] // ✅ Images already processed with File objects
      }];

      console.log('📤 Sending product array to API:', {
        productCount: productData.length,
        totalImages: productData[0].images.length,
        firstProduct: productData[0]
      });

      // ✅ Use createBulkProducts (which accepts arrays) instead of createSingleProduct
      const result = await vendorService.createBulkProducts(productData);

      console.log('✅ Upload successful:', result);

      // Reset form
      setFormData({
        productName: '',
        status: true,
        pricePerYard: '',
        quantity: '1',
        materialType: '',
        pattern: '',
        idNumber: '',
        description: '',
        images: []
      });

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Navigate with success message
      navigate('/vendor/products', {
        state: {
          message: result.createdCount === 1 
            ? 'Product uploaded successfully!' 
            : `${result.createdCount} products uploaded successfully!`,
          type: 'success'
        }
      });

    } catch (error) {
      console.error('❌ Upload failed:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

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
              disabled={isUploading}
              className="px-6 py-3 bg-[#f9f9f9] text-[#b2b2b2] rounded-[5px] border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUploading}
              className="px-4 py-3 bg-[#2e2e2e] text-[#edff8c] rounded-[5px] font-semibold hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#edff8c]"></div>
                  Publishing...
                </>
              ) : (
                'Publish Product'
              )}
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
                      {formData.pattern || 'Choose Pattern (defaults to Solid)'}
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