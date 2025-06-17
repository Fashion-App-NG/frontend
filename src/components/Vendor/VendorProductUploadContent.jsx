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
    date: '',
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

  // File upload handlers
  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    // Create preview URLs
    const imagePromises = imageFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve({
          file,
          preview: e.target.result,
          id: Math.random().toString(36).substr(2, 9)
        });
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(newImages => {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 4) // Limit to 4 images
      }));
    });
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

    // Add product publishing logic here
    console.log('Publishing product:', formData);
    
    // Show success message
    alert('Product published successfully!');
    
    // Navigate back to vendor dashboard
    navigate('/vendor/dashboard');
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

    navigate('/vendor/dashboard');
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
        {/* Page Title and Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[24px] font-bold text-black leading-[150%]">
            Add Products
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

              {/* Price and Date */}
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
                  <label className="block font-semibold mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full h-[52px] px-4 bg-white border border-[#ccc] rounded-[8px] text-black outline-none focus:border-[#2e2e2e] transition-colors"
                  />
                </div>
              </div>

              {/* Quantity and Material Type */}
              <div className="grid grid-cols-2 gap-6">
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
              </div>

              {/* Pattern and ID Number */}
              <div className="grid grid-cols-2 gap-6">
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
            
            {/* Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-[12px] h-[250px] flex flex-col items-center justify-center mb-6 cursor-pointer transition-colors ${
                isDragOver 
                  ? 'border-[#347ae2] bg-blue-50' 
                  : 'border-black hover:border-[#347ae2] hover:bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
            >
              <div className="w-[60px] h-[60px] mb-4 text-gray-400">
                <svg viewBox="0 0 60 60" className="w-full h-full" fill="none" stroke="currentColor">
                  <path d="M30 15L30 45M15 30L45 30" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="30" cy="30" r="25" strokeWidth="2" strokeDasharray="2,2"/>
                </svg>
              </div>
              <p className="text-center">
                <span className="text-[#0f0f0f]">Drag & drop files or </span>
                <span className="text-[#347ae2] underline font-medium">Browse</span>
              </p>
              <p className="text-xs text-gray-500 mt-2">Supports: JPG, PNG, GIF (Max 5MB each)</p>
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
                <div key={image.id} className="relative w-24 h-20 bg-gray-200 rounded-[5px] overflow-hidden group">
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
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {/* Empty slots */}
              {Array.from({ length: 4 - formData.images.length }).map((_, index) => (
                <div 
                  key={`empty-${index}`} 
                  className="w-24 h-20 bg-gray-100 rounded-[5px] border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={handleBrowseClick}
                >
                  <span className="text-gray-400 text-2xl">+</span>
                </div>
              ))}
            </div>
            
            {formData.images.length > 0 && (
              <p className="text-xs text-gray-600 mt-2">
                {formData.images.length}/4 images uploaded
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProductUploadContent;