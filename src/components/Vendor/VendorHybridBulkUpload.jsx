import Papa from 'papaparse';
import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import VendorService from '../../services/vendorService';

export const VendorHybridBulkUpload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const isDev = process.env.NODE_ENV === 'development';
  
  const [step, setStep] = useState('method');
  const [products, setProducts] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, message: '' });
  const [imageMatchingResults, setImageMatchingResults] = useState([]);
  
  const materialTypes = ['Cotton', 'Linen', 'Silk', 'Lace', 'Wool', 'Polyester', 'Chiffon', 'Satin'];
  const patterns = ['Solid', 'Striped', 'Floral', 'Geometric', 'Polka Dot', 'Abstract', 'Paisley', 'Plaid'];

  // ✅ Enhanced price validation function
  const validateAndCleanPrice = (priceStr) => {
    if (!priceStr || priceStr.toString().trim() === '') return { isValid: false, value: 0, error: 'Price is required' };
    
    // Convert to string and clean
    let cleanPrice = priceStr.toString().trim();
    
    // Remove currency symbols (₦, $, €, £, etc.)
    cleanPrice = cleanPrice.replace(/[₦$€£¥₹₽]/g, '');
    
    // Remove commas (thousand separators)
    cleanPrice = cleanPrice.replace(/,/g, '');
    
    // Check if it's a valid number after cleaning
    const numValue = parseFloat(cleanPrice);
    
    if (isNaN(numValue) || numValue <= 0) {
      return { 
        isValid: false, 
        value: 0, 
        error: 'Price must be a valid positive number' 
      };
    }
    
    return { isValid: true, value: numValue, error: null };
  };

  // ✅ Enhanced quantity validation function
  const validateAndCleanQuantity = (quantityStr) => {
    if (!quantityStr || quantityStr.toString().trim() === '') return { isValid: false, value: 0, error: 'Quantity is required' };
    
    // Convert to string and clean
    let cleanQuantity = quantityStr.toString().trim();
    
    // Remove commas (thousand separators)
    cleanQuantity = cleanQuantity.replace(/,/g, '');
    
    // Check if it's a valid integer
    const numValue = parseInt(cleanQuantity, 10);
    
    if (isNaN(numValue) || numValue <= 0) {
      return { 
        isValid: false, 
        value: 0, 
        error: 'Quantity must be a valid positive number' 
      };
    }
    
    return { isValid: true, value: numValue, error: null };
  };

  // ✅ Enhanced diagnostic logging for image tracking
  const logImageState = (stage, products, productId = null) => {
    if (!isDev) return;
    
    console.log(`🔍 IMAGE TRACKING - ${stage}:`, {
      timestamp: new Date().toISOString(),
      stage,
      productId,
      totalProducts: products.length,
      productsWithImages: products.filter(p => p.images && p.images.length > 0).length,
      imageBreakdown: products.map(p => ({
        tempId: p.tempId,
        name: p.name,
        imageCount: p.images?.length || 0,
        hasImagesArray: !!p.images,
        csvImages: p.csvImages?.length || 0,
        imageDetails: p.images?.map(img => ({
          id: img.id,
          name: img.name,
          hasFile: img.file instanceof File,
          fileSize: img.file?.size,
          hasPreview: !!img.preview
        })) || []
      }))
    });
  };

  // ✅ Enhanced product validation
  const validateProduct = useCallback((product) => {
    if (isDev) {
      console.log('🔍 VALIDATION STAGE 1 - validateProduct called:', {
        productName: product.name,
        inputImageCount: product.images?.length || 0,
        hasImagesArray: !!product.images
      });
    }
    
    const errors = [];
    
    // Name validation
    if (!product.name || product.name.trim() === '') {
      errors.push('Product name is required');
    }
    
    // Price validation
    const priceValidation = validateAndCleanPrice(product.pricePerYard);
    if (!priceValidation.isValid) {
      errors.push(`Price: ${priceValidation.error}`);
    }
    
    // Quantity validation
    const quantityValidation = validateAndCleanQuantity(product.quantity);
    if (!quantityValidation.isValid) {
      errors.push(`Quantity: ${quantityValidation.error}`);
    }
    
    // ✅ CRITICAL: Preserve images in cleaned product
    const cleanedProduct = {
      ...product,
      pricePerYard: priceValidation.value,
      quantity: quantityValidation.value,
      name: product.name?.trim(),
      materialType: product.materialType?.trim() || '',
      pattern: product.pattern || 'solid',
      description: product.description?.trim() || '',
      status: product.status !== false,
      images: product.images || [] // ✅ EXPLICITLY preserve images
    };
    
    if (isDev) {
      console.log('🔍 VALIDATION STAGE 2 - validateProduct result:', {
        productName: product.name,
        isValid: errors.length === 0,
        errors,
        inputImageCount: product.images?.length || 0,
        outputImageCount: cleanedProduct.images?.length || 0,
        imagesPreserved: (product.images?.length || 0) === (cleanedProduct.images?.length || 0)
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      cleanedProduct
    };
  }, [isDev]);

  // Create empty product structure (✅ Removed ID field)
  const createEmptyProduct = () => ({
    tempId: Date.now() + Math.random(), // Internal ID for React keys
    name: '',
    pricePerYard: '',
    quantity: '1',
    materialType: '',
    pattern: 'solid',
    description: '',
    status: true,
    images: [],
    errors: []
  });

  // Handle method selection
  const handleMethodSelect = (method) => {
    if (method === 'csv') {
      setStep('csv');
    } else {
      setProducts([createEmptyProduct()]);
      setStep('form');
    }
  };

  // ✅ Updated CSV template without ID field
  const downloadCSVTemplate = () => {
    try {
      const headers = [
        'name',
        'pricePerYard', 
        'quantity',
        'materialType',
        'pattern',
        'description',
        'status',
        'image1',
        'image2', 
        'image3',
        'image4'
      ];
      
      const sampleData = [
        [
          'Premium Cotton Fabric',
          '1,500.00', // Example with comma
          '50',
          'Cotton',
          'Solid',
          'High-quality cotton fabric perfect for dresses',
          'available',
          'cotton-fabric-1.jpg',
          'cotton-fabric-2.jpg',
          '',
          ''
        ],
        [
          'Silk Floral Print',
          '₦3,500', // Example with currency symbol
          '25',
          'Silk',
          'Floral',
          'Beautiful silk with floral patterns',
          'available',
          'silk-floral-1.jpg',
          '',
          '',
          ''
        ]
      ];
      
      const csvContent = [headers, ...sampleData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'bulk_product_template.csv';
      link.click();
    } catch (error) {
      console.error('Error generating CSV template:', error);
      alert('Error generating template. Please try again.');
    }
  };

  // ✅ Enhanced CSV upload with better validation
  const handleCSVUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (isDev) {
          console.log('📊 Parsed CSV data:', results.data);
        }
        
        if (results.errors.length > 0) {
          const parseErrors = results.errors.map(err => `Row ${err.row + 1}: ${err.message}`);
          setValidationErrors(parseErrors);
          return;
        }

        // Convert CSV data to product format with validation
        const convertedProducts = [];
        const errors = [];
        
        results.data.forEach((row, index) => {
          const product = {
            tempId: Date.now() + index,
            name: row.name || '',
            pricePerYard: row.pricePerYard || '',
            quantity: row.quantity || '1',
            materialType: row.materialType || '',
            pattern: row.pattern || 'Solid',
            description: row.description || '',
            // ✅ FIX: Default to 'available' status, especially for blank values
            status: row.status === 'unavailable' || row.status === 'false' || row.status === false ? false : true,
            csvImages: [row.image1, row.image2, row.image3, row.image4].filter(Boolean),
            images: [],
            errors: []
          };
          
          // Validate each product
          const validation = validateProduct(product);
          if (validation.isValid) {
            convertedProducts.push(validation.cleanedProduct);
          } else {
            errors.push(`Row ${index + 2}: ${validation.errors.join(', ')}`);
          }
        });

        if (errors.length > 0) {
          setValidationErrors(errors);
          return;
        }

        setProducts(convertedProducts);
        setCsvFile(file);
        setValidationErrors([]);
        setStep('form');
        
        if (isDev) {
          console.log('✅ CSV processed successfully:', {
            totalProducts: convertedProducts.length,
            productsWithImages: convertedProducts.filter(p => p.csvImages?.length > 0).length
          });
        }
      },
      error: (error) => {
        setValidationErrors([`CSV parsing error: ${error.message}`]);
      }
    });
  }, [isDev, validateProduct]);

  // ✅ Enhanced manual form updates with validation
  const updateProduct = (productId, field, value) => {
    setProducts(prev => {
      const updated = prev.map(product => {
        if (product.tempId !== productId) return product;
        
        const updatedProduct = { ...product, [field]: value };
        
        // Real-time validation for price and quantity
        if (field === 'pricePerYard') {
          const priceValidation = validateAndCleanPrice(value);
          updatedProduct.priceValidationError = priceValidation.error;
        }
        
        if (field === 'quantity') {
          const quantityValidation = validateAndCleanQuantity(value);
          updatedProduct.quantityValidationError = quantityValidation.error;
        }
        
        // ✅ Log image field updates specifically
        if (field === 'images' && isDev) {
          console.log('🔍 updateProduct - images field updated:', {
            productId,
            previousImageCount: product.images?.length || 0,
            newImageCount: value?.length || 0,
            imageChange: (value?.length || 0) - (product.images?.length || 0)
          });
        }
        
        return { ...updatedProduct, errors: [] };
      });
      
      // Log after any product update that might affect images
      if (field === 'images') {
        logImageState('AFTER updateProduct (images)', updated, productId);
      }
      
      return updated;
    });
  };

  // Add new product row
  const addProduct = () => {
    if (products.length >= 100) {
      alert('Maximum 100 products allowed per bulk upload');
      return;
    }
    setProducts(prev => [...prev, createEmptyProduct()]);
  };

  // Remove product row
  const removeProduct = (productId) => {
    if (products.length === 1) {
      alert('At least one product is required');
      return;
    }
    setProducts(prev => prev.filter(p => p.tempId !== productId));
  };

  // ✅ Enhanced image upload handling
  const handleImageUpload = async (productId, files) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (isDev) {
      console.log('📷 STAGE 1 - handleImageUpload called:', {
        productId,
        totalFiles: fileArray.length,
        imageFiles: imageFiles.length,
        fileNames: imageFiles.map(f => f.name),
        fileSizes: imageFiles.map(f => f.size)
      });
    }
    
    if (imageFiles.length === 0) {
      if (isDev) {
        console.warn('⚠️ STAGE 1 - No valid image files found');
      }
      return;
    }

    // Log BEFORE processing
    logImageState('BEFORE Individual Image Upload', products, productId);

    try {
      const imagePromises = imageFiles.map(async (file) => {
        const imageObj = {
          file: file,
          preview: URL.createObjectURL(file),
          id: Math.random().toString(36).slice(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        };
        
        if (isDev) {
          console.log('📷 STAGE 2 - Created image object:', {
            id: imageObj.id,
            name: imageObj.name,
            size: imageObj.size,
            hasFile: imageObj.file instanceof File,
            hasPreview: !!imageObj.preview
          });
        }
        
        return imageObj;
      });

      const newImages = await Promise.all(imagePromises);
      
      if (isDev) {
        console.log('📷 STAGE 3 - All images processed:', {
          newImageCount: newImages.length,
          newImages: newImages.map(img => ({ id: img.id, name: img.name, hasFile: img.file instanceof File }))
        });
      }
      
      // ✅ CRITICAL: Track state update
      setProducts(prev => {
        const updated = prev.map(product => {
          if (product.tempId === productId) {
            const updatedProduct = { 
              ...product, 
              images: [...(product.images || []), ...newImages].slice(0, 4) 
            };
            
            if (isDev) {
              console.log('📷 STAGE 4 - Updating product:', {
                productId,
                previousImageCount: product.images?.length || 0,
                newImageCount: newImages.length,
                finalImageCount: updatedProduct.images.length
              });
            }
            
            return updatedProduct;
          }
          return product;
        });
        
        // Log AFTER state update
        logImageState('AFTER Individual Image Upload', updated, productId);
        
        return updated;
      });
      
    } catch (error) {
      if (isDev) {
        console.error('💥 STAGE ERROR - Image upload failed:', error);
      }
      console.error('Error processing images:', error);
      alert('Error processing images. Please try again.');
    }
  };

  // ✅ Helper function to determine match type
  const getMatchType = (csvName, fileName) => {
    if (csvName === fileName) return 'exact';
    if (csvName.toLowerCase() === fileName.toLowerCase()) return 'case-insensitive';
    if (fileName.includes(csvName) || csvName.includes(fileName.replace(/\.[^/.]+$/, ''))) return 'partial';
    if (csvName.replace(/_/g, '-') === fileName.replace(/\.[^/.]+$/, '') || 
        csvName.replace(/-/g, '_') === fileName.replace(/\.[^/.]+$/, '')) return 'separator-variation';
    return 'extension-added';
  };

  // ✅ Enhanced bulk image upload with matching verification step
  const handleBulkImageUpload = async (files) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (isDev) {
      console.log('📷 BULK STAGE 1 - handleBulkImageUpload called:', {
        totalFiles: fileArray.length,
        imageFiles: imageFiles.length,
        fileNames: imageFiles.map(f => f.name)
      });
    }
    
    // Log BEFORE processing
    logImageState('BEFORE Bulk Image Upload', products);
    
    // Create image mapping by filename (with and without extensions)
    const imageMap = {};
    imageFiles.forEach(file => {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
    
      // Map both full filename and name without extension
      imageMap[file.name] = file;
      imageMap[nameWithoutExt] = file;
    
      // Also map common variations
      imageMap[file.name.toLowerCase()] = file;
      imageMap[nameWithoutExt.toLowerCase()] = file;
    });

    // ✅ NEW: Create detailed matching results for verification step
    const matchingResults = [];

    // Match images to products with detailed tracking
    const updatedProducts = products.map((product, productIndex) => {
      const matchedImages = [];
      const productMatchingResult = {
        productName: product.name,
        productIndex: productIndex + 1,
        csvImages: product.csvImages || [],
        matches: [],
        missingImages: []
      };
      
      if (product.csvImages) {
        product.csvImages.forEach((imageName) => {
          // Try multiple matching strategies
          let matchedFile = 
            imageMap[imageName] ||
            imageMap[imageName.toLowerCase()] ||
            imageMap[`${imageName}.jpg`] ||
            imageMap[`${imageName}.png`] ||
            imageMap[`${imageName}.jpeg`] ||
            imageMap[imageName.replace(/_/g, '-')] ||
            imageMap[imageName.replace(/-/g, '_')];
        
          if (matchedFile) {
            const matchedImage = {
              file: matchedFile,
              preview: URL.createObjectURL(matchedFile),
              id: Math.random().toString(36).slice(2, 9),
              name: imageName,
              size: matchedFile.size,
              type: matchedFile.type
            };
            
            matchedImages.push(matchedImage);
            
            // ✅ Track matching details
            productMatchingResult.matches.push({
              csvName: imageName,
              actualFileName: matchedFile.name,
              isExactMatch: imageName === matchedFile.name,
              matchType: getMatchType(imageName, matchedFile.name),
              fileSize: matchedFile.size,
              fileType: matchedFile.type
            });
            
            if (isDev) {
              console.log(`✅ BULK STAGE 4 - Successfully matched: ${imageName} -> ${matchedFile.name}`);
            }
          } else {
            // ✅ Track missing images
            productMatchingResult.missingImages.push(imageName);
            
            if (isDev) {
              console.warn(`⚠️ BULK STAGE 4 - CSV image not found: ${imageName}`);
            }
          }
        });
      }

      matchingResults.push(productMatchingResult);

      const finalProduct = {
        ...product,
        images: [...(product.images || []), ...matchedImages].slice(0, 4)
      };
      
      return finalProduct;
    });

    // ✅ Store matching results for verification step
    setImageMatchingResults(matchingResults);
    setProducts(updatedProducts);
    
    // ✅ Go to verification step instead of directly to review
    setStep('image-verification');
  };

  // ✅ Enhanced final validation before upload
  const validateAllProducts = () => {
    if (isDev) {
      console.log('🔍 FINAL VALIDATION - validateAllProducts called');
    }
    
    // Log BEFORE validation
    logImageState('BEFORE Final Validation', products);
    
    const errors = [];
    const validatedProducts = [];
    
    products.forEach((product, index) => {
      const validation = validateProduct(product);
      
      if (!validation.isValid) {
        errors.push(`Product ${index + 1}: ${validation.errors.join(', ')}`);
      } else {
        validatedProducts.push(validation.cleanedProduct);
      }
    });
    
    // Log AFTER validation
    logImageState('AFTER Final Validation', validatedProducts);
    
    if (isDev) {
      console.log('🔍 FINAL VALIDATION - validateAllProducts result:', {
        totalProducts: products.length,
        validProducts: validatedProducts.length,
        errors: errors.length,
        imageComparison: {
          beforeValidation: products.reduce((sum, p) => sum + (p.images?.length || 0), 0),
          afterValidation: validatedProducts.reduce((sum, p) => sum + (p.images?.length || 0), 0)
        }
      });
    }
    
    return { isValid: errors.length === 0, errors, validatedProducts };
  };

  // ✅ Enhanced bulk upload method
  const handleFinalUpload = async () => {
    const validation = validateAllProducts();
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    const productsWithoutImages = validation.validatedProducts.filter(p => !p.images || p.images.length === 0);
    
    if (productsWithoutImages.length > 0) {
      const productNames = productsWithoutImages.map(p => p.name).join(', ');
      const proceedWithoutImages = window.confirm(
        `⚠️ Image Warning\n\n${productsWithoutImages.length} product(s) have no images:\n${productNames}\n\nDo you want to proceed without images for these products?\n\nClick "OK" to proceed or "Cancel" to go back and add images.`
      );
      
      if (!proceedWithoutImages) {
        return;
      }
    }

    try {
      setStep('uploading');
      setUploadProgress({ current: 0, total: 1, message: 'Preparing unified upload...' });

      const bulkProductsData = validation.validatedProducts.map((product, index) => ({
        name: product.name.trim(),
        pricePerYard: parseFloat(product.pricePerYard),
        quantity: parseInt(product.quantity),
        materialType: product.materialType,
        vendorId: user?.id,
        idNumber: product.idNumber?.trim() || `PRD-${Date.now()}-${index}`,
        description: product.description?.trim() || 'Bulk uploaded product',
        pattern: product.pattern || 'Solid',
        status: product.status,
        images: product.images || []
      }));

      console.log('🚀 Sending bulk data to unified API:', {
        productCount: bulkProductsData.length,
        totalImages: bulkProductsData.reduce((sum, p) => sum + (p.images?.length || 0), 0),
        productsWithImages: bulkProductsData.filter(p => p.images?.length > 0).length
      });

      setUploadProgress({ current: 0, total: 1, message: 'Uploading all products...' });

      const result = await VendorService.createBulkProducts(bulkProductsData);
      
      setUploadProgress({ current: 1, total: 1, message: 'Upload complete!' });

      if (result.errorCount && result.errorCount > 0) {
        navigate('/vendor/products', { 
          state: { 
            message: `Bulk upload completed: ${result.createdCount} successful, ${result.errorCount} failed.`,
            type: 'warning',
            bulkUpload: true,
            uploadResults: result
          }
        });
      } else {
        navigate('/vendor/products', { 
          state: { 
            message: `Successfully uploaded ${result.count || bulkProductsData.length} products via bulk upload!`,
            type: 'success',
            bulkUpload: true,
            uploadResults: result
          }
        });
      }

    } catch (error) {
      console.error('❌ Bulk upload failed:', error);
      
      setValidationErrors([
        'Upload failed with error:',
        error.message || 'Unknown error occurred',
        'Please check the console for details and try again.'
      ]);
      setStep('review');
    }
  };

  // ✅ Main component render
  return (
    <div className="min-h-screen bg-[#d8dfe9]">
      {/* Header */}
      <header className="bg-white border-b border-black/8 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-bold text-[#3e3e3e] leading-[150%]">
              Bulk Product Upload
            </h1>
            <p className="text-[16px] text-[#2e2e2e] leading-[120%]">
              Upload multiple products using CSV or manual entry
            </p>
          </div>
          
          <button
            onClick={() => navigate('/vendor/products')}
            className="px-6 py-3 bg-[#f9f9f9] text-[#b2b2b2] rounded-[5px] border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </header>

      <div className="p-6">
        {step === 'method' && (
          <MethodSelectionStep 
            onMethodSelect={handleMethodSelect}
            onDownloadTemplate={downloadCSVTemplate}
          />
        )}
        
        {step === 'csv' && (
          <CSVUploadStep 
            onFileUpload={handleCSVUpload}
            validationErrors={validationErrors}
            onBack={() => setStep('method')}
          />
        )}
        
        {step === 'form' && (
          <ProductFormStep 
            products={products}
            materialTypes={materialTypes}
            patterns={patterns}
            onUpdate={updateProduct}
            onAdd={addProduct}
            onRemove={removeProduct}
            onImageUpload={handleImageUpload}
            onNext={() => products.some(p => p.csvImages?.length > 0) ? setStep('images') : setStep('review')}
            onBack={() => setStep(csvFile ? 'csv' : 'method')}
          />
        )}
        
        {step === 'images' && (
          <BulkImageUploadStep 
            products={products}
            onBulkImageUpload={handleBulkImageUpload}
            onSkip={() => setStep('review')}
            onBack={() => setStep('form')}
          />
        )}

        {step === 'image-verification' && imageMatchingResults.length > 0 && (
          <ImageVerificationStep 
            matchingResults={imageMatchingResults}
            onConfirm={() => setStep('review')}
            onBack={() => setStep('images')}
          />
        )}
        
        {step === 'review' && (
          <ReviewStep 
            products={products}
            onUpload={handleFinalUpload}
            onBack={() => setStep('form')}
          />
        )}
        
        {step === 'uploading' && (
          <UploadingStep 
            progress={uploadProgress}
          />
        )}
      </div>
    </div>
  );
};

// Method Selection Step Component
const MethodSelectionStep = ({ onMethodSelect, onDownloadTemplate }) => (
  <div className="max-w-4xl mx-auto">
    <div className="grid md:grid-cols-2 gap-8">
      {/* CSV Upload Option */}
      <div className="bg-white rounded-lg p-8 shadow-sm border">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Upload CSV File</h3>
          <p className="text-gray-600 mb-6">
            Prepare your products in Excel/CSV format and upload for bulk processing
          </p>
          
          <div className="space-y-3">
            <button
              onClick={onDownloadTemplate}
              className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Download Template
            </button>
            <button
              onClick={() => onMethodSelect('csv')}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload CSV File
            </button>
          </div>
        </div>
      </div>

      {/* Manual Entry Option */}
      <div className="bg-white rounded-lg p-8 shadow-sm border">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Manual Entry</h3>
          <p className="text-gray-600 mb-6">
            Enter product details manually using our intuitive form interface
          </p>
          
          <button
            onClick={() => onMethodSelect('manual')}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Start Manual Entry
          </button>
        </div>
      </div>
    </div>
  </div>
);

// CSV Upload Step Component
const CSVUploadStep = ({ onFileUpload, validationErrors, onBack }) => {
  const fileInputRef = useRef(null);
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg p-8 shadow-sm border">
        <h2 className="text-2xl font-semibold mb-6">Upload CSV File</h2>
        
        {/* File Upload Area */}
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-lg text-gray-600 mb-2">Click to upload CSV file</p>
          <p className="text-sm text-gray-500">Supports .csv files only</p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={onFileUpload}
          className="hidden"
        />
        
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">Validation Errors:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex justify-between mt-6">
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ Enhanced Product Form Step with null safety
const ProductFormStep = ({ 
  products = [], // ✅ Default to empty array to prevent undefined error
  materialTypes, 
  patterns, 
  onUpdate, 
  onAdd, 
  onRemove, 
  onImageUpload,
  onNext, 
  onBack
}) => (
  <div className="max-w-6xl mx-auto">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-semibold">Product Details ({products.length}/100)</h2>
      <button
        onClick={onAdd}
        disabled={products.length >= 100}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        + Add Product
      </button>
    </div>
    
    {/* Products List */}
    <div className="space-y-6">
      {products.map((product, index) => (
        <ProductFormRow
          key={product.tempId}
          product={product}
          index={index}
          materialTypes={materialTypes}
          patterns={patterns}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onImageUpload={onImageUpload}
          canRemove={products.length > 1}
        />
      ))}
    </div>
    
    <div className="flex justify-between mt-8">
      <button
        onClick={onBack}
        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Back
      </button>
      <button
        onClick={onNext}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Next: Images
      </button>
    </div>
  </div>
);

// ✅ Enhanced Individual Product Form Row with flexible material/pattern inputs
const ProductFormRow = ({ 
  product, 
  index, 
  materialTypes, 
  patterns, 
  onUpdate, 
  onRemove, 
  onImageUpload, 
  canRemove 
}) => {
  const fileInputRef = useRef(null);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Product {index + 1}</h3>
        {canRemove && (
          <button
            onClick={() => onRemove(product.tempId)}
            className="text-red-600 hover:text-red-800"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            type="text"
            value={product.name}
            onChange={(e) => onUpdate(product.tempId, 'name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter product name"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price per Yard (₦) *
          </label>
          <input
            type="text"
            value={product.pricePerYard}
            onChange={(e) => onUpdate(product.tempId, 'pricePerYard', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
              product.priceValidationError ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., 1,500 or ₦1,500.00"
          />
          {product.priceValidationError && (
            <p className="text-sm text-red-600 mt-1">{product.priceValidationError}</p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity (Yards) *
          </label>
          <input
            type="text"
            value={product.quantity}
            onChange={(e) => onUpdate(product.tempId, 'quantity', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
              product.quantityValidationError ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., 100 or 1,000"
          />
          {product.quantityValidationError && (
            <p className="text-sm text-red-600 mt-1">{product.quantityValidationError}</p>
          )}
        </div>

        {/* ✅ Enhanced Material Type - Dropdown with Custom Option */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Material Type
          </label>
          <div className="space-y-2">
            <select
              value={materialTypes.includes(product.materialType) ? product.materialType : 'custom'}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  // Don't change the value if custom is selected, let them type
                } else {
                  onUpdate(product.tempId, 'materialType', e.target.value);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select material</option>
              {materialTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
              <option value="custom">Custom (type below)</option>
            </select>
            {(!materialTypes.includes(product.materialType) || product.materialType === '') && (
              <input
                type="text"
                value={product.materialType}
                onChange={(e) => onUpdate(product.tempId, 'materialType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter custom material type"
              />
            )}
          </div>
        </div>

        {/* ✅ Enhanced Pattern - Dropdown with Custom Option */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pattern
          </label>
          <div className="space-y-2">
            <select
              value={patterns.includes(product.pattern) ? product.pattern : 'custom'}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  // Don't change the value if custom is selected, let them type
                } else {
                  onUpdate(product.tempId, 'pattern', e.target.value);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {patterns.map(pattern => (
                <option key={pattern} value={pattern}>{pattern}</option>
              ))}
              <option value="custom">Custom (type below)</option>
            </select>
            {!patterns.includes(product.pattern) && (
              <input
                type="text"
                value={product.pattern}
                onChange={(e) => onUpdate(product.tempId, 'pattern', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter custom pattern"
              />
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={product.status}
            onChange={(e) => onUpdate(product.tempId, 'status', e.target.value === 'true')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={true}>Available</option>
            <option value={false}>Unavailable</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={product.description}
          onChange={(e) => onUpdate(product.tempId, 'description', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Product description..."
        />
      </div>

      {/* CSV Images Info */}
      {product.csvImages && product.csvImages.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>CSV Images:</strong> {product.csvImages.join(', ')}
          </p>
        </div>
      )}

      {/* Images */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Images (Max 4)
        </label>
        
        <div className="flex gap-3 items-center">
          {product.images.map((image) => (
            <div key={image.id} className="relative w-16 h-16 bg-gray-200 rounded-lg overflow-hidden group">
              <img 
                src={image.preview} 
                alt="Product" 
                className="w-full h-full object-cover" 
              />
              <button
                onClick={() => {
                  onUpdate(product.tempId, 'images', product.images.filter(img => img.id !== image.id));
                }}
                className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
              >
                ×
              </button>
            </div>
          ))}
          
          {product.images.length < 4 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
            >
              <span className="text-gray-400 text-lg">+</span>
            </button>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => onImageUpload(product.tempId, e.target.files)}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

// ✅ RESTORED: Bulk Image Upload Step
const BulkImageUploadStep = ({ products, onBulkImageUpload, onSkip, onBack }) => {
  const fileInputRef = useRef(null);
  
  const csvImageNames = products
    .flatMap(p => p.csvImages || [])
    .filter((name, index, arr) => arr.indexOf(name) === index);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg p-8 shadow-sm border">
        <h2 className="text-2xl font-semibold mb-6">Upload Images</h2>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Upload all product images at once. Images will be automatically matched to products based on filenames.
          </p>
          
          {csvImageNames.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg mb-4">
              <h4 className="font-semibold text-blue-800 mb-2">Expected Image Files:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-blue-700">
                {csvImageNames.map(name => (
                  <div key={name} className="bg-white px-2 py-1 rounded">
                    {name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Bulk Upload Area */}
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-lg text-gray-600 mb-2">Click to upload images</p>
          <p className="text-sm text-gray-500">Select multiple image files</p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => onBulkImageUpload(e.target.files)}
          className="hidden"
        />
        
        <div className="flex justify-between mt-6">
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={onSkip}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Skip Images
          </button>
        </div>
      </div>
    </div>
  );
};

// Review Step
const ReviewStep = ({ products, onUpload, onBack }) => {
  const productsWithoutImages = products.filter(p => !p.images || p.images.length === 0);
  const totalImages = products.reduce((sum, p) => sum + (p.images?.length || 0), 0);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg p-8 shadow-sm border">
        <h2 className="text-2xl font-semibold mb-6">Review Products</h2>
        
        <div className="mb-6">
          <p className="text-gray-600">
            Review your {products.length} products before uploading. Total images: {totalImages}
          </p>
          
          {/* ✅ Image Warning */}
          {productsWithoutImages.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Image Warning</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    {productsWithoutImages.length} product(s) have no images. Products without images may have lower visibility to customers.
                  </p>
                  <details className="mt-2">
                    <summary className="text-sm font-medium text-yellow-800 cursor-pointer">
                      View products without images ({productsWithoutImages.length})
                    </summary>
                    <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                      {productsWithoutImages.map(product => (
                        <li key={product.tempId}>{product.name}</li>
                      ))}
                    </ul>
                  </details>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Products Summary */}
        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
          {products.map((product, index) => (
            <div key={product.tempId} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold flex items-center">
                    {product.name || `Product ${index + 1}`}
                    {(!product.images || product.images.length === 0) && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        No images
                      </span>
                    )}
                  </h4>
                  <p className="text-gray-600">
                    ₦{product.pricePerYard.toLocaleString()} • {product.quantity} yards • {product.materialType || 'No material specified'}
                  </p>
                  {product.description && (
                    <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Status: <span className="font-medium">{product.status ? 'Available' : 'Unavailable'}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  {product.images && product.images.length > 0 ? (
                    <>
                      {product.images.slice(0, 3).map(image => (
                        <img 
                          key={image.id}
                          src={image.preview} 
                          alt="Product" 
                          className="w-12 h-12 object-cover rounded"
                        />
                      ))}
                      {product.images.length > 3 && (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs">
                          +{product.images.length - 3}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Edit
          </button>
          <button
            onClick={onUpload}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Upload {products.length} Products {totalImages > 0 && `(${totalImages} images)`}
          </button>
        </div>
      </div>
    </div>
  );
};

// Uploading Step
const UploadingStep = ({ progress }) => (
  <div className="max-w-2xl mx-auto">
    <div className="bg-white rounded-lg p-8 shadow-sm border text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
      
      <h2 className="text-2xl font-semibold mb-4">Uploading Products...</h2>
      
      <p className="text-gray-600 mb-6">{progress.message}</p>
      
      {progress.total > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
            style={{ width: `${(progress.current / progress.total) * 100}%` }}
          ></div>
        </div>
      )}
      
      <p className="text-sm text-gray-500">
        Please don't close this window while uploading...
      </p>
    </div>
  </div>
);

// Image Verification Step Component
const ImageVerificationStep = ({ matchingResults, onConfirm, onBack }) => {
  const totalExpected = matchingResults.reduce((sum, result) => sum + result.csvImages.length, 0);
  const totalMatched = matchingResults.reduce((sum, result) => sum + result.matches.length, 0);
  const totalMissing = matchingResults.reduce((sum, result) => sum + result.missingImages.length, 0);
  
  const hasPartialMatches = matchingResults.some(result => 
    result.matches.some(match => !match.isExactMatch)
  );
  const hasMissingImages = totalMissing > 0;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg p-8 shadow-sm border">
        <h2 className="text-2xl font-semibold mb-6">Image Matching Verification</h2>
        
        {/* Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-3">Matching Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <div className="text-2xl font-bold text-green-800">{totalMatched}</div>
              <div className="text-sm text-green-700">Images Matched</div>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <div className="text-2xl font-bold text-red-800">{totalMissing}</div>
              <div className="text-sm text-red-700">Images Missing</div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <div className="text-2xl font-bold text-blue-800">{totalExpected}</div>
              <div className="text-sm text-blue-700">Total Expected</div>
            </div>
          </div>
        </div>

        {/* Warning for missing images */}
        {hasMissingImages && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-red-800">Missing Images Detected</h4>
                <p className="text-sm text-red-700 mt-1">
                  {totalMissing} image(s) specified in your CSV could not be found in the uploaded files.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Partial matches warning */}
        {hasPartialMatches && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Partial Matches Found</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Some images were matched using filename variations (case changes, extensions, etc.).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Detailed matching results */}
        <div className="space-y-6 mb-6 max-h-96 overflow-y-auto">
          {matchingResults.map((result, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center">
                Product {result.productIndex}: {result.productName}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({result.matches.length}/{result.csvImages.length} images matched)
                </span>
              </h4>
              
              {/* Matched images */}
              {result.matches.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-green-700 mb-2">✅ Matched Images:</h5>
                  <div className="space-y-2">
                    {result.matches.map((match, matchIndex) => (
                      <div key={matchIndex} className="flex items-center justify-between p-2 bg-green-50 rounded text-sm">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">{match.csvName}</span>
                          {!match.isExactMatch && (
                            <>
                              <span className="text-gray-500">→</span>
                              <span className="text-green-700">{match.actualFileName}</span>
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                {match.matchType}
                              </span>
                            </>
                          )}
                                               </div>
                        <div className="text-gray-500 text-xs">
                          {(match.fileSize / 1024 / 1024).toFixed(2)}MB
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Missing images */}
              {result.missingImages.length >  0 && (
                <div>
                  <h5 className="text-sm font-medium text-red-700 mb-2">❌ Missing Images:</h5>
                  <div className="space-y-1">
                    {result.missingImages.map((missingImage, missingIndex) => (
                      <div key={missingIndex} className="p-2 bg-red-50 rounded text-sm text-red-700">
                        {missingImage}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Images
          </button>
          <button
            onClick={onConfirm}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Continue to Review ({totalMatched} images will be uploaded)
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorHybridBulkUpload;