import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import vendorService from '../../services/vendorService';
import VendorProfileCheck from '../VendorProfileCheck';
// ✅ ADD THIS IMPORT at the top
import { toast } from 'react-toastify';

export const VendorProductUploadContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // ✅ FIX: Remove unused variable - VendorProfileCheck handles validation
  // const profileCompleted = user?.profileCompleted ?? true;

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

  // ✅ IMPROVED: Detect mobile and compress more aggressively
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  const compressImage = (file, maxWidth = isMobile ? 800 : 1200, quality = isMobile ? 0.7 : 0.85) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        
        // ✅ More aggressive mobile compression
        const targetWidth = isMobile ? 800 : 1200;
        
        if (width > height) {
          if (width > targetWidth) {
            height = (height * targetWidth) / width;
            width = targetWidth;
          }
        } else {
          if (height > targetWidth) {
            width = (width * targetWidth) / height;
            height = targetWidth;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // ✅ Try different quality levels until under 2MB
        let currentQuality = quality;
        let compressedDataUrl = canvas.toDataURL('image/jpeg', currentQuality);
        
        // ✅ Reduce quality if file is still too large
        while (compressedDataUrl.length > 2 * 1024 * 1024 && currentQuality > 0.3) {
          currentQuality -= 0.1;
          compressedDataUrl = canvas.toDataURL('image/jpeg', currentQuality);
        }
        
        console.log(`📸 Compressed ${file.name}: ${(file.size / 1024).toFixed(0)}KB → ${(compressedDataUrl.length / 1024).toFixed(0)}KB (quality: ${currentQuality.toFixed(1)})`);
        
        resolve(compressedDataUrl);
      };
      
      img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
      img.src = URL.createObjectURL(file);
    });
  };

  // File upload handlers
  const handleFileSelect = async (files) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    // ✅ Mobile-specific limit (lower)
    const maxFileSize = isMobile ? 8 * 1024 * 1024 : 10 * 1024 * 1024; // 8MB mobile, 10MB desktop
    
    const validFiles = imageFiles.filter(file => {
      if (file.size > maxFileSize) {
        toast.warning(
          `${file.name} is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). ` +
          `Max ${(maxFileSize / (1024 * 1024)).toFixed(0)}MB per image.`,
          { autoClose: 5000 }
        );
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    try {
      const imagePromises = validFiles.map(async (file) => {
        const compressedPreview = await compressImage(file);
        
        // ✅ Convert base64 back to Blob for smaller size
        const base64Data = compressedPreview.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const compressedBlob = new Blob([byteArray], { type: 'image/jpeg' });
        const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });
        
        return {
          file: compressedFile, // ✅ Use compressed File object
          preview: compressedPreview,
          id: Math.random().toString(36).slice(2, 9),
          name: file.name,
          size: compressedFile.size // ✅ Show compressed size
        };
      });

      const newImages = await Promise.all(imagePromises);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 4)
      }));
      
      // ✅ Show success message with sizes
      const totalSize = newImages.reduce((sum, img) => sum + img.size, 0);
      toast.success(
        `${newImages.length} image(s) compressed and ready (${(totalSize / (1024 * 1024)).toFixed(1)}MB total)`,
        { autoClose: 3000 }
      );
      
    } catch (error) {
      console.error('Error processing images:', error);
      toast.error('Error processing images. Please try smaller files.');
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

  // ✅ Wrap handleSubmit in useCallback
  const handleSubmit = useCallback(async () => {
    // Validation
    if (!formData.productName.trim()) {
      toast.warning('Please enter a product name');
      return;
    }

    if (!formData.pricePerYard || parseFloat(formData.pricePerYard) <= 0) {
      toast.warning('Please enter a valid price');
      return;
    }

    if (!formData.materialType) {
      toast.warning('Please select a material type');
      return;
    }

    if (formData.images.length === 0) {
      toast.warning('Please upload at least one image');
      return;
    }

    try {
      setIsUploading(true);

      // ✅ ADD: Calculate total upload size
      const totalImageSize = formData.images.reduce((sum, img) => sum + (img.size || 0), 0);
      const totalSizeMB = (totalImageSize / (1024 * 1024)).toFixed(2);
      
      console.log('📦 Upload Info:', {
        imageCount: formData.images.length,
        totalSizeMB: totalSizeMB,
        individualSizes: formData.images.map(img => ({
          name: img.name,
          sizeKB: Math.round(img.size / 1024)
        }))
      });

      // ✅ ADD: Warn if total size is large
      if (totalImageSize > 10 * 1024 * 1024) { // 10MB total
        toast.warning(
          `Large upload: ${totalSizeMB}MB total. This may fail on slower connections.`,
          { autoClose: 5000 }
        );
      }

      const productData = [{
        name: formData.productName.trim(),
        pricePerYard: parseFloat(formData.pricePerYard),
        quantity: parseInt(formData.quantity) || 1,
        materialType: formData.materialType,
        vendorId: user?.id,
        idNumber: formData.idNumber?.trim() || `PRD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        description: formData.description?.trim() || 'Product description',
        pattern: formData.pattern || 'Solid',
        status: formData.status ? 'Available' : 'Unavailable',
        images: formData.images || []
      }];

      const result = await vendorService.createBulkProducts(productData);

      // Reset form on success
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

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

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
      
      // ✅ IMPROVED: Better error messages with size context
      let errorMessage = error.message;
      
      if (error.message === 'Failed to fetch') {
        const totalImageSize = formData.images.reduce((sum, img) => sum + (img.size || 0), 0);
        const totalSizeMB = (totalImageSize / (1024 * 1024)).toFixed(2);
        
        errorMessage = `Upload failed (${formData.images.length} images, ${totalSizeMB}MB total). `;
        
        if (totalImageSize > 10 * 1024 * 1024) {
          errorMessage += 'Your images are too large. Try uploading fewer or smaller images.';
        } else {
          errorMessage += 'Please check your internet connection and try again.';
        }
      } else if (error.message.includes('413') || error.message.includes('Payload Too Large')) {
        const totalImageSize = formData.images.reduce((sum, img) => sum + (img.size || 0), 0);
        const totalSizeMB = (totalImageSize / (1024 * 1024)).toFixed(2);
        errorMessage = `Upload too large (${totalSizeMB}MB). Maximum is 10MB total. Please reduce image sizes or upload fewer images.`;
      }
      
      toast.error(errorMessage, {
        autoClose: 7000,
        style: { fontSize: '14px' }
      });
    } finally {
      setIsUploading(false);
    }
  }, [formData, user, navigate]);

  // ✅ Add handleCancel function
  const handleCancel = () => {
    const hasData = formData.productName.trim() !== '' || 
                    formData.pricePerYard !== '' || 
                    formData.images.length > 0 ||
                    formData.description.trim() !== '';

    if (hasData) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
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
        <VendorProfileCheck />  {/* ✅ ADD THIS */}
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
              disabled={isUploading} // ✅ REMOVED: profileCompleted check - validation happens in VendorProfileCheck component
              className={`px-6 py-2.5 text-base font-medium rounded-lg transition-colors ${
                isUploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'text-[#edff8c] bg-[#2e2e2e] hover:bg-gray-800'
              }`}
            >
              {isUploading ? 'Publishing...' : 'Publish Product'}
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

          {/* Right Image Upload Section */}
          <div className="col-span-5 space-y-6">
            <div className="bg-[#f9f9f9] rounded-[10px] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[20px] font-bold leading-[150%]">Upload Image</h3>
                {/* ✅ Upload size indicator */}
                {formData.images.length > 0 && (
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    formData.images.reduce((sum, img) => sum + img.size, 0) > 10 * 1024 * 1024
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {(formData.images.reduce((sum, img) => sum + img.size, 0) / (1024 * 1024)).toFixed(1)}MB / 10MB
                  </span>
                )}
              </div>

              {/* ✅ Upload guidelines */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 mb-1">
                  <strong>📸 Image Guidelines:</strong>
                </p>
                <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
                  <li>Max 5MB per image</li>
                  <li>Max 10MB total for all images</li>
                  <li>Up to 4 images allowed</li>
                  <li>JPG, PNG, GIF formats</li>
                </ul>
              </div>
              
              {/* ✅ CLASSIC UPLOAD AREA - Big dotted circle with + */}
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

              {/* ✅ IMPROVED IMAGE PREVIEWS - Larger thumbnails in 2x2 grid */}
              {formData.images.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {formData.images.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.preview}
                          alt={image.name}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(image.id);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          ×
                        </button>
                        {/* ✅ Size badge with color coding */}
                        <div className="absolute bottom-2 left-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            image.size > 5 * 1024 * 1024 
                              ? 'bg-red-500 text-white' 
                              : image.size > 3 * 1024 * 1024
                              ? 'bg-yellow-500 text-white'
                              : 'bg-gray-800 text-white'
                          }`}>
                            {(image.size / 1024).toFixed(0)}KB
                          </span>
                        </div>
                        {/* ✅ Warning for oversized files */}
                        {image.size > 5 * 1024 * 1024 && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                            ⚠️ Too large
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* ✅ Add more slots (empty + boxes) */}
                    {Array.from({ length: 4 - formData.images.length }).map((_, index) => (
                      <div 
                        key={`empty-${index}`} 
                        className="h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
                        onClick={handleBrowseClick}
                      >
                        <span className="text-gray-400 text-4xl">+</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* ✅ Total size summary */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">
                      {formData.images.length}/4 images uploaded
                    </span>
                    <span className={`font-medium ${
                      formData.images.reduce((sum, img) => sum + img.size, 0) > 10 * 1024 * 1024
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}>
                      Total: {(formData.images.reduce((sum, img) => sum + img.size, 0) / (1024 * 1024)).toFixed(2)}MB
                    </span>
                  </div>
                </div>
              ) : (
                /* ✅ CLASSIC 4 EMPTY SLOTS - When no images uploaded */
                <div className="grid grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div 
                      key={`placeholder-${index}`} 
                      className="w-20 h-16 bg-gray-100 rounded-[5px] border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                      onClick={handleBrowseClick}
                    >
                      <span className="text-gray-400 text-lg">+</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProductUploadContent;