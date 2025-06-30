// src/components/Vendor/VendorHybridBulkUpload.jsx - Updated component
import Papa from 'papaparse';
import { useCallback, useRef, useState } from 'react'; // ✅ Add useRef import
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import VendorService from '../../services/vendorService';

export const VendorHybridBulkUpload = () => {
  const { user } = useAuth();
  
  // ✅ Debug logging
  console.log('🔍 VendorHybridBulkUpload - Auth state:', {
    user: user,
    isVendor: user?.role === 'vendor',
    userId: user?.id,
    vendorToken: !!localStorage.getItem('vendorToken'),
    authToken: !!localStorage.getItem('authToken')
  });

  const navigate = useNavigate();
  
  const [step, setStep] = useState('method'); // 'method', 'csv', 'form', 'images', 'review', 'uploading'
  const [products, setProducts] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [validationWarnings, setValidationWarnings] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, message: '' });
  // ✅ Remove unused imageFiles state if not being used in the component
  // const [imageFiles, setImageFiles] = useState({});
  
  const materialTypes = ['Cotton', 'Linen', 'Silk', 'Lace', 'Wool', 'Polyester', 'Chiffon', 'Satin'];
  const patterns = ['Solid', 'Striped', 'Floral', 'Geometric', 'Polka Dot', 'Abstract', 'Paisley', 'Plaid'];

  // Handle method selection
  const handleMethodSelect = (method) => {
    if (method === 'csv') {
      setStep('csv');
    } else {
      // Manual form - start with one empty product
      setProducts([createEmptyProduct()]);
      setStep('form');
    }
  };

  // Create empty product structure
  const createEmptyProduct = () => ({
    id: Date.now() + Math.random(),
    name: '',
    pricePerYard: '',
    quantity: '1',
    materialType: '',
    pattern: 'solid',
    idNumber: '',
    description: '',
    status: true,
    images: [],
    errors: []
  });

  // Download CSV template
  const downloadCSVTemplate = () => {
    try {
      const csvContent = VendorService.generateCSVTemplate();  // No 'new'
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

  // Handle CSV upload
  const handleCSVUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log('📊 Parsed CSV data:', results.data);
        
        if (results.errors.length > 0) {
          const parseErrors = results.errors.map(err => `Row ${err.row + 1}: ${err.message}`);
          setValidationErrors(parseErrors);
          return;
        }

        // Validate CSV structure
        const validation = VendorService.validateCSVData(results.data);  // No 'new'
        setValidationErrors(validation.errors);
        setValidationWarnings(validation.warnings);

        if (validation.errors.length === 0) {
          // Convert CSV data to product format
          const convertedProducts = results.data.map((row, index) => ({
            id: Date.now() + index,
            name: row.name || '',
            pricePerYard: row.pricePerYard || '',
            quantity: row.quantity || '1',
            materialType: row.materialType || '',
            pattern: row.pattern || 'solid',
            idNumber: row.idNumber || '',
            description: row.description || '',
            status: row.status === 'available' || row.status === true,
            csvImages: [row.image1, row.image2, row.image3, row.image4].filter(Boolean),
            images: [],
            errors: []
          }));

          setProducts(convertedProducts);
          setCsvFile(file);
          setStep('form');
        }
      },
      error: (error) => {
        setValidationErrors([`CSV parsing error: ${error.message}`]);
      }
    });
  }, []);

  // Handle manual form updates
  const updateProduct = (productId, field, value) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, [field]: value, errors: [] }
        : product
    ));
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
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  // Handle image uploads
  const handleImageUpload = async (productId, files) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) return;

    try {
      const imagePromises = imageFiles.map(async (file) => ({
        file: file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size
      }));

      const newImages = await Promise.all(imagePromises);
      
      setProducts(prev => prev.map(product =>
        product.id === productId
          ? { ...product, images: [...product.images, ...newImages].slice(0, 4) }
          : product
      ));
    } catch (error) {
      console.error('Error processing images:', error);
      alert('Error processing images. Please try again.');
    }
  };

  // Handle bulk image upload with filename matching
  const handleBulkImageUpload = async (files) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    console.log('📷 Processing bulk images:', imageFiles.map(f => f.name));
    
    // Create image mapping by filename
    const imageMap = {};
    imageFiles.forEach(file => {
      imageMap[file.name] = file;
    });

    // Match images to products
    const updatedProducts = products.map(product => {
      const matchedImages = [];
      
      // Check for CSV-specified images
      if (product.csvImages) {
        product.csvImages.forEach(imageName => {
          if (imageMap[imageName]) {
            matchedImages.push({
              file: imageMap[imageName],
              preview: URL.createObjectURL(imageMap[imageName]),
              id: Math.random().toString(36).substr(2, 9),
              name: imageName,
              size: imageMap[imageName].size
            });
          }
        });
      }
      
      return {
        ...product,
        images: [...product.images, ...matchedImages].slice(0, 4)
      };
    });

    setProducts(updatedProducts);
    setStep('review');
  };

  // Validate products before upload
  const validateProducts = () => {
    const errors = [];
    
    products.forEach((product, index) => {
      const productErrors = [];
      
      if (!product.name?.trim()) productErrors.push('Product name is required');
      if (!product.pricePerYard || isNaN(parseFloat(product.pricePerYard))) productErrors.push('Valid price is required');
      if (!product.quantity || isNaN(parseInt(product.quantity))) productErrors.push('Valid quantity is required');
      if (!product.materialType) productErrors.push('Material type is required');
      
      if (productErrors.length > 0) {
        errors.push(`Product ${index + 1}: ${productErrors.join(', ')}`);
      }
    });
    
    if (errors.length > 0) {
      alert(`Please fix the following errors:\n\n${errors.join('\n')}`);
      return false;
    }
    
    return true;
  };

  // Handle final upload
  const handleFinalUpload = async () => {
    if (!validateProducts()) return;
    
    try {
      setStep('uploading');
      setUploadProgress({ current: 0, total: 1, message: 'Preparing bulk upload...' });

      // ✅ Prepare bulk data for unified API
      const bulkProductsData = products.map((product, index) => ({
        name: product.name.trim(),
        pricePerYard: parseFloat(product.pricePerYard),
        quantity: parseInt(product.quantity),
        materialType: product.materialType,
        vendorId: user?.id,
        idNumber: product.idNumber?.trim() || `PRD-${Date.now()}-${index}`,
        description: product.description?.trim() || 'Bulk uploaded product',
        pattern: product.pattern || 'Solid',
        status: product.status,
        images: product.images || [] // All matched images included
      }));

      console.log('🚀 Sending bulk data to unified API:', {
        productCount: bulkProductsData.length,
        totalImages: bulkProductsData.reduce((sum, p) => sum + (p.images?.length || 0), 0),
        productsWithImages: bulkProductsData.filter(p => p.images?.length > 0).length
      });

      setUploadProgress({ current: 0, total: 1, message: 'Uploading all products...' });

      // ✅ Use unified API for bulk upload
      const result = await VendorService.createBulkProducts(bulkProductsData);
      
      setUploadProgress({ current: 1, total: 1, message: 'Upload complete!' });

      // Handle response
      if (result.errorCount && result.errorCount > 0) {
        // Partial success
        navigate('/vendor/products', { 
          state: { 
            message: `Bulk upload completed: ${result.createdCount} successful, ${result.errorCount} failed.`,
            type: 'warning',
            bulkUpload: true,
            uploadResults: result
          }
        });
      } else {
        // Full success
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
      
      // ✅ Fallback to individual uploads if unified API fails
      await handleFallbackIndividualUpload();
    }
  };

  // ✅ Fallback method for when unified API fails
  const handleFallbackIndividualUpload = async () => {
    console.log('🔄 Falling back to individual uploads...');
    
    const results = [];
    const errors = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      setUploadProgress({ 
        current: i + 1, 
        total: products.length, 
        message: `Uploading product ${i + 1}: ${product.name}...` 
      });

      try {
        const productData = {
          name: product.name.trim(),
          pricePerYard: parseFloat(product.pricePerYard),
          quantity: parseInt(product.quantity),
          materialType: product.materialType,
          vendorId: user?.id,
          idNumber: product.idNumber?.trim() || `PRD-${Date.now()}-${i}`,
          description: product.description?.trim() || 'Bulk uploaded product',
          pattern: product.pattern || 'Solid',
          status: product.status,
          images: product.images || []
        };

        const response = await VendorService.createSingleProduct(productData);
        results.push({ index: i, name: product.name, success: true });

      } catch (error) {
        console.error(`❌ Failed to upload product ${i + 1}:`, error);
        errors.push({ index: i, name: product.name, error: error.message });
      }
    }

    // Handle mixed results
    const successCount = results.length;
    const errorCount = errors.length;

    if (successCount > 0) {
      navigate('/vendor/products', { 
        state: { 
          message: `Bulk upload completed: ${successCount} successful, ${errorCount} failed.`,
          type: successCount === products.length ? 'success' : 'warning',
          bulkUpload: true,
          uploadResults: { successCount, errorCount, errors }
        }
      });
    } else {
      alert('All products failed to upload. Please check the errors and try again.');
      setStep('review');
    }
  };

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
            validationWarnings={validationWarnings}
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

// Product Form Step Component  
const ProductFormStep = ({ 
  products, 
  materialTypes, 
  patterns, 
  onUpdate, 
  onAdd, 
  onRemove, 
  onImageUpload,
  onNext, 
  onBack,
  validationWarnings 
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
    
    {/* Validation Warnings */}
    {validationWarnings.length > 0 && (
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">Warnings:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          {validationWarnings.map((warning, index) => (
            <li key={index}>• {warning}</li>
          ))}
        </ul>
      </div>
    )}
    
    {/* Products List */}
    <div className="space-y-6">
      {products.map((product, index) => (
        <ProductFormRow
          key={product.id}
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

// Individual Product Form Row
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
            onClick={() => onRemove(product.id)}
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
            onChange={(e) => onUpdate(product.id, 'name', e.target.value)}
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
            type="number"
            step="0.01"
            min="0"
            value={product.pricePerYard}
            onChange={(e) => onUpdate(product.id, 'pricePerYard', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity (Yards) *
          </label>
          <input
            type="number"
            min="0"
            value={product.quantity}
            onChange={(e) => onUpdate(product.id, 'quantity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="1"
          />
        </div>

        {/* Material Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Material Type *
          </label>
          <select
            value={product.materialType}
            onChange={(e) => onUpdate(product.id, 'materialType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select material</option>
            {materialTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Pattern */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pattern
          </label>
          <select
            value={product.pattern}
            onChange={(e) => onUpdate(product.id, 'pattern', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {patterns.map(pattern => (
              <option key={pattern} value={pattern}>{pattern}</option>
            ))}
          </select>
        </div>

        {/* ID Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product ID
          </label>
          <input
            type="text"
            value={product.idNumber}
            onChange={(e) => onUpdate(product.id, 'idNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Auto-generated if empty"
          />
        </div>
      </div>

      {/* Description */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={product.description}
          onChange={(e) => onUpdate(product.id, 'description', e.target.value)}
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
                  onUpdate(product.id, 'images', product.images.filter(img => img.id !== image.id));
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
            onChange={(e) => onImageUpload(product.id, e.target.files)}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

// Bulk Image Upload Step
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
const ReviewStep = ({ products, onUpload, onBack }) => (
  <div className="max-w-6xl mx-auto">
    <div className="bg-white rounded-lg p-8 shadow-sm border">
      <h2 className="text-2xl font-semibold mb-6">Review Products</h2>
      
      <div className="mb-6">
        <p className="text-gray-600">
          Review your {products.length} products before uploading. You can go back to make changes if needed.
        </p>
      </div>
      
      {/* Products Summary */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {products.map((product, index) => (
          <div key={product.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold">{product.name || `Product ${index + 1}`}</h4>
                <p className="text-gray-600">
                  ₦{product.pricePerYard} • {product.quantity} yards • {product.materialType}
                </p>
                {product.description && (
                  <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                )}
              </div>
              <div className="flex gap-2">
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
          Upload {products.length} Products
        </button>
      </div>
    </div>
  </div>
);

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

export default VendorHybridBulkUpload;