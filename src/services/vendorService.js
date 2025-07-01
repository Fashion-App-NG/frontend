const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

class VendorService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api`;

    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Vendor Service Base URL:', this.baseURL);
    }
  }

  // ✅ Gate authentication debugging to development
  getAuthToken() {
    const token = localStorage.getItem('token');

    if (process.env.NODE_ENV === 'development') {
      console.log('🔑 VendorService getAuthToken called:', {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        tokenStart: token?.substring(0, 30) || 'none',
        source: 'localStorage.getItem("token")'
      });
    }

    return token;
  }

  getAuthHeaders() {
    const token = this.getAuthToken();
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;

      if (process.env.NODE_ENV === 'development') {
        console.log('🔑 Authorization header added:', {
          headerPresent: !!headers['Authorization'],
          headerLength: headers['Authorization']?.length || 0
        });
      }
    } else if (process.env.NODE_ENV === 'development') {
      console.error('❌ No token available - Authorization header NOT added');
    }

    return headers;
  }

  async getVendorProducts(vendorId) {
    try {
      if (!vendorId) {
        throw new Error('Vendor ID is required');
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 getVendorProducts starting:', {
          vendorId,
          url: `${this.baseURL}/product/vendor/${vendorId}`,
          timestamp: new Date().toISOString()
        });
      }

      const token = this.getAuthToken();

      if (process.env.NODE_ENV === 'development') {
        console.log('🔑 Token check in getVendorProducts:', {
          hasToken: !!token,
          tokenLength: token?.length || 0
        });
      }

      const headers = this.getAuthHeaders();

      if (process.env.NODE_ENV === 'development') {
        console.log('📨 Final request headers:', {
          headers: JSON.stringify(headers, null, 2),
          hasAuthHeader: !!headers.Authorization,
          authHeaderStart: headers.Authorization?.substring(0, 20) || 'none'
        });

        console.log('🌐 Making fetch request...');
      }

      const response = await fetch(`${this.baseURL}/product/vendor/${vendorId}`, {
        method: 'GET',
        headers
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('📡 Response received:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          url: response.url
        });
      }

      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ HTTP Error Response:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url
          });
        }

        if (response.status === 401) {
          if (process.env.NODE_ENV === 'development') {
            console.error('🔒 401 Authentication Error - checking token state:', {
              tokenWasProvided: !!token,
              headerWasSet: !!headers.Authorization,
              tokenStillInStorage: !!localStorage.getItem('token')
            });
          }

          localStorage.removeItem('token');
          throw new Error('Authentication failed. Please log in again.');
        }

        throw new Error(`HTTP ${response.status}: Failed to fetch vendor products`);
      }

      const data = await response.json();

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Success response:', {
          hasProducts: !!data.products,
          productCount: data.products?.length || 0
        });
      }

      return data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ getVendorProducts error:', {
          message: error.message,
          name: error.name,
          vendorId
        });
      }

      throw error;
    }
  }

  // ✅ Convert File objects to base64 with tag support
  async convertFileToBase64(file, tag = 'main', originalFilename = null) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          data: reader.result,
          filename: originalFilename || file.name,
          tag: tag
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ✅ Unified product creation method
  async createProduct(productData) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Switching to multipart form-data fallback');
      }
      return await this.createProductMultipart(productData);
    } catch (multipartError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Multipart method failed');
        console.error('Multipart error:', multipartError.message);
      }

      throw multipartError;
    }
  }

  // ✅ JSON method (primary)
  async createProductJSON(productData) {
    try {
      const isArray = Array.isArray(productData);
      const productsArray = isArray ? productData : [productData];

      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Creating ${productsArray.length} product(s) via unified JSON API`);
      }

      // ✅ Process all products and convert images to base64
      const processedProducts = await Promise.all(
        productsArray.map(async (product, index) => {
          const processedProduct = {
            name: product.name,
            pricePerYard: product.pricePerYard.toString(),
            quantity: product.quantity.toString(),
            materialType: product.materialType,
            vendorId: product.vendorId,
            idNumber: product.idNumber || `PRD-${Date.now()}-${index}`,
            description: product.description || 'Product description',
            pattern: product.pattern || 'Solid',
            status: product.status === true || product.status === 'available' ? 'ACTIVE' : 'INACTIVE',
            images: []
          };

          // ✅ Convert images to base64 format
          if (product.images && product.images.length > 0) {
            const imagePromises = product.images.map(async (imageItem, imgIndex) => {
              let file = null;
              let tag = 'main';
              let filename = null;

              if (imageItem.file instanceof File) {
                file = imageItem.file;
                filename = imageItem.name || file.name;
                tag = imgIndex === 0 ? 'main' : 'detail';
              } else if (imageItem instanceof File) {
                file = imageItem;
                filename = file.name;
                tag = imgIndex === 0 ? 'main' : 'detail';
              }

              if (file) {
                return await this.convertFileToBase64(file, tag, filename);
              }

              return null;
            });

            const convertedImages = await Promise.all(imagePromises);
            processedProduct.images = convertedImages.filter(img => img !== null);
          }

          return processedProduct;
        })
      );

      const requestBody = {
        products: processedProducts
      };

      const payloadString = JSON.stringify(requestBody);
      const payloadSizeKB = Math.round(payloadString.length / 1024);

      if (process.env.NODE_ENV === 'development') {
        console.log('📤 Sending JSON request:', {
          productCount: processedProducts.length,
          endpoint: `${this.baseURL}/product`,
          hasImages: processedProducts.some(p => p.images.length > 0),
          totalImages: processedProducts.reduce((sum, p) => sum + p.images.length, 0),
          payloadSizeKB: payloadSizeKB
        });

        if (payloadSizeKB > 1024) {
          console.warn(`⚠️ Large JSON payload: ${payloadSizeKB}KB - will fallback to multipart if this fails`);
        }
      }

      const response = await fetch(`${this.baseURL}/product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: payloadString
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));

        if (process.env.NODE_ENV === 'development') {
          console.error('❌ JSON API request failed:', {
            status: response.status,
            statusText: response.statusText,
            errorMessage: errorData.message,
            payloadSizeKB: payloadSizeKB
          });
        }

        throw new Error(errorData.message || `HTTP ${response.status}: Failed to create product(s) via JSON API`);
      }

      const data = await response.json();

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ JSON product creation successful:', {
          message: data.message,
          count: data.count || 1,
          createdCount: data.createdCount,
          errorCount: data.errorCount
        });
      }

      return data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ JSON product creation failed:', error);
      }
      throw error;
    }
  }

  // ✅ Enhanced multipart method with better error handling
  async createProductMultipart(productData) {
    try {
      const isArray = Array.isArray(productData);
      const productsArray = isArray ? productData : [productData];

      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 VendorService.createProductMultipart called with ${productsArray.length} product(s)`);
        console.log('📊 Auth context:', {
          hasAuthToken: !!this.getAuthToken(),
          baseURL: this.baseURL
        });
      }

      if (productsArray.length > 1) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Multipart fallback: Processing products individually to avoid payload issues');
        }

        const results = [];
        const errors = []; // ✅ ADD: Initialize errors array here

        for (let i = 0; i < productsArray.length; i++) {
          try {
            const singleResult = await this.processSingleProduct(productsArray[i]); // ✅ Non-recursive call
            results.push(singleResult);
            
            if (process.env.NODE_ENV === 'development') {
              console.log(`✅ Product ${i + 1}/${productsArray.length} created successfully`);
            }
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error(`❌ Product ${i + 1}/${productsArray.length} failed:`, error.message);
            }
            errors.push({ index: i, error: error.message });
          }
        }

        // ✅ ADD: Check if all products failed before returning success
        if (results.length === 0) {
          throw new Error(`All ${productsArray.length} products failed in multipart fallback`);
        }

        return {
          success: true,
          message: `Multipart fallback completed: ${results.length} successful, ${errors.length} failed`,
          count: results.length,
          createdCount: results.length,
          errorCount: errors.length,
          products: results.map(r => r.product).filter(Boolean),
          errors: errors // ✅ Include errors array
        };
      }

      // Single product case - use helper method
      return await this.processSingleProduct(productData);
      
    } catch (error) {
      throw error;
    }
  }

  // ✅ ADD: Non-recursive helper method
  async processSingleProduct(productData) {
    const formData = new FormData();
    
    // Add product fields with fallbacks
    formData.append('name', productData.name);
    formData.append('pricePerYard', productData.pricePerYard.toString());
    formData.append('quantity', productData.quantity.toString());
    formData.append('materialType', productData.materialType);
    formData.append('vendorId', productData.vendorId);
    formData.append('idNumber', productData.idNumber || `PRD-${Date.now()}`);
    formData.append('description', productData.description);
    formData.append('pattern', productData.pattern);
    formData.append('status', productData.status);

    // ✅ FIX: Handle both image formats
    if (productData.images && productData.images.length > 0) {
      productData.images.forEach((imageItem, index) => {
        // Handle File objects wrapped in objects (e.g., {file: File, name: 'image.jpg'})
        if (imageItem.file instanceof File) {
          formData.append('images', imageItem.file);
        }
        // ✅ RESTORE: Handle bare File objects in array
        else if (imageItem instanceof File) {
          formData.append('images', imageItem);
        }
      });
    }

    const response = await fetch(`${this.baseURL}/product`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.getAuthToken()}` },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP ${response.status}: Failed to create product`);
    }

    return await response.json();
  }

  // ✅ Wrapper methods
  async createSingleProduct(productData) {
    return this.createProduct(productData);
  }

  async createBulkProducts(productsArray) {
    if (!Array.isArray(productsArray)) {
      throw new Error('Bulk products must be provided as an array');
    }
    return this.createProduct(productsArray);
  }

  async testConnection() {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Testing API connection to:', `${this.baseURL}/product`);
      }

      const response = await fetch(`${this.baseURL}/product`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('📡 Test response status:', response.status);
      }

      return response.ok;
    } catch (error) {
      // ✅ Keep error logging for production debugging
      console.error('❌ API connection test failed:', error.message);
      return false;
    }
  }

  // ✅ NEW: Generate CSV template for download
  generateCSVTemplate() {
    const headers = [
      'name', 'pricePerYard', 'quantity', 'materialType', 'pattern',
      'description', 'idNumber', 'status', 'image1', 'image2', 'image3', 'image4'
    ];

    const sampleData = [
      {
        name: 'Premium Cotton Fabric',
        pricePerYard: 25.99,
        quantity: 100,
        materialType: 'cotton',
        pattern: 'solid',
        description: 'High quality cotton fabric perfect for garments',
        idNumber: 'PRD001',
        status: 'available',
        image1: 'cotton_fabric_1.jpg',
        image2: 'cotton_fabric_2.jpg',
        image3: '',
        image4: ''
      },
      {
        name: 'Silk Floral Print',
        pricePerYard: 45.99,
        quantity: 50,
        materialType: 'silk',
        pattern: 'floral',
        description: 'Beautiful silk fabric with floral pattern',
        idNumber: 'PRD002',
        status: 'available',
        image1: 'silk_floral_1.jpg',
        image2: '',
        image3: '',
        image4: ''
      }
    ];

    // Convert to CSV string
    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => headers.map(header => {
        const value = row[header] || '';
        // Escape commas and quotes in values
        if (value.toString().includes(',') || value.toString().includes('"')) {
          return `"${value.toString().replace(/"/g, '""')}"`;
        }
        return value;
      }).join(','))
    ].join('\n');

    return csvContent;
  }

  // ✅ NEW: Validate CSV data structure
  validateCSVData(csvData) {
    const errors = [];
    const warnings = [];

    if (!Array.isArray(csvData) || csvData.length === 0) {
      errors.push('CSV must contain at least one product');
      return { errors, warnings };
    }

    csvData.forEach((product, index) => {
      const rowNum = index + 2; // +2 because of header row and 0-based index

      // Required field validation
      if (!product.name?.trim()) {
        errors.push(`Row ${rowNum}: Product name is required`);
      }

      if (!product.pricePerYard || isNaN(parseFloat(product.pricePerYard))) {
        errors.push(`Row ${rowNum}: Valid price per yard is required`);
      } else if (parseFloat(product.pricePerYard) <= 0) {
        errors.push(`Row ${rowNum}: Price must be greater than 0`);
      }

      if (!product.quantity || isNaN(parseInt(product.quantity))) {
        errors.push(`Row ${rowNum}: Valid quantity is required`);
      } else if (parseInt(product.quantity) < 0) {
        errors.push(`Row ${rowNum}: Quantity cannot be negative`);
      }

      if (!product.materialType?.trim()) {
        errors.push(`Row ${rowNum}: Material type is required`);
      }

      // Validate material type against allowed values
      const validMaterials = ['cotton', 'linen', 'silk', 'lace', 'wool', 'polyester', 'chiffon', 'satin'];
      if (product.materialType && !validMaterials.includes(product.materialType.toLowerCase())) {
        warnings.push(`Row ${rowNum}: Material type "${product.materialType}" may not be recognized. Valid options: ${validMaterials.join(', ')}`);
      }

      // Image warnings
      const imageNames = [product.image1, product.image2, product.image3, product.image4].filter(Boolean);
      if (imageNames.length === 0) {
        warnings.push(`Row ${rowNum}: No images specified for "${product.name}"`);
      }

      // Duplicate ID check
      if (product.idNumber) {
        const duplicateIndex = csvData.findIndex((other, otherIndex) =>
          otherIndex !== index && other.idNumber === product.idNumber
        );
        if (duplicateIndex !== -1) {
          errors.push(`Row ${rowNum}: Duplicate product ID "${product.idNumber}" (also found in row ${duplicateIndex + 2})`);
        }
      }
    });

    return { errors, warnings };
  }

  // ✅ NEW: Get current user helper
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
}

const vendorServiceInstance = new VendorService();
export default vendorServiceInstance;