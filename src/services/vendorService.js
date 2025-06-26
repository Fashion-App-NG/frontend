const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002';

class VendorService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api`;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Vendor Service Base URL:', this.baseURL);
    }
  }

  // ✅ CRITICAL: Always log token state (not gated) for debugging 401 issues
  getAuthToken() {
    const token = localStorage.getItem('token');
    
    // ✅ ALWAYS LOG FOR 401 DEBUGGING
    console.log('🔑 VendorService getAuthToken called:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 30) || 'none',
      source: 'localStorage.getItem("token")'
    });
    
    return token;
  }

  getAuthHeaders() {
    const token = this.getAuthToken();
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      // ✅ ALWAYS LOG HEADER CONSTRUCTION
      console.log('🔑 Authorization header added:', {
        headerPresent: !!headers['Authorization'],
        headerLength: headers['Authorization']?.length || 0
      });
    } else {
      // ✅ ALWAYS LOG MISSING TOKEN
      console.error('❌ No token available - Authorization header NOT added');
    }
    
    return headers;
  }

  async getVendorProducts(vendorId) {
    try {
      if (!vendorId) {
        throw new Error('Vendor ID is required');
      }

      // ✅ ALWAYS LOG REQUEST START
      console.log('🔄 getVendorProducts starting:', {
        vendorId,
        url: `${this.baseURL}/product/vendor/${vendorId}`,
        timestamp: new Date().toISOString()
      });

      const token = this.getAuthToken();
      // ✅ ALWAYS LOG TOKEN CHECK
      console.log('🔑 Token check in getVendorProducts:', {
        hasToken: !!token,
        tokenLength: token?.length || 0
      });

      const headers = this.getAuthHeaders();
      
      // ✅ ALWAYS LOG FINAL HEADERS
      console.log('📨 Final request headers:', {
        headers: JSON.stringify(headers, null, 2),
        hasAuthHeader: !!headers.Authorization,
        authHeaderStart: headers.Authorization?.substring(0, 20) || 'none'
      });

      console.log('🌐 Making fetch request...');

      const response = await fetch(`${this.baseURL}/product/vendor/${vendorId}`, {
        method: 'GET',
        headers
      });

      // ✅ ALWAYS LOG RESPONSE
      console.log('📡 Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });

      if (!response.ok) {
        console.error('❌ HTTP Error Response:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        });

        if (response.status === 401) {
          console.error('🔒 401 Authentication Error - checking token state:', {
            tokenWasProvided: !!token,
            headerWasSet: !!headers.Authorization,
            tokenStillInStorage: !!localStorage.getItem('token')
          });
          
          localStorage.removeItem('token');
          throw new Error('Authentication failed. Please log in again.');
        }
        
        throw new Error(`HTTP ${response.status}: Failed to fetch vendor products`);
      }

      const data = await response.json();
      
      console.log('✅ Success response:', {
        hasProducts: !!data.products,
        productCount: data.products?.length || 0
      });

      return data;
    } catch (error) {
      console.error('❌ getVendorProducts error:', {
        message: error.message,
        name: error.name,
        vendorId
      });
      
      throw error;
    }
  }

  async createProduct(productData) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('📤 Creating product:', productData.name);
      }

      const hasImageFiles = productData.images && 
        productData.images.some(img => img instanceof File || (img.file instanceof File));

      let response;

      if (hasImageFiles) {
        // Multipart form data for images
        const formData = new FormData();
        
        // Add text fields
        formData.append('name', productData.name);
        formData.append('pricePerYard', productData.pricePerYard.toString());
        formData.append('quantity', productData.quantity.toString());
        formData.append('materialType', productData.materialType);
        formData.append('vendorId', productData.vendorId);
        formData.append('idNumber', productData.idNumber || `PRD-${Date.now()}`);
        formData.append('description', productData.description || '');
        formData.append('pattern', productData.pattern || 'solid');
        formData.append('status', productData.status === true ? 'available' : 'unavailable');

        // Add image files
        productData.images.forEach((imageItem) => {
          if (imageItem.file instanceof File) {
            formData.append('images', imageItem.file);
          } else if (imageItem instanceof File) {
            formData.append('images', imageItem);
          }
        });

        const token = this.getAuthToken();
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        response = await fetch(`${this.baseURL}/product`, {
          method: 'POST',
          headers,
          body: formData
        });
      } else {
        // JSON data for products without images
        const jsonData = {
          name: productData.name,
          pricePerYard: productData.pricePerYard,
          quantity: productData.quantity,
          materialType: productData.materialType,
          vendorId: productData.vendorId,
          idNumber: productData.idNumber || `PRD-${Date.now()}`,
          description: productData.description || '',
          pattern: productData.pattern || 'solid',
          status: productData.status === true ? 'available' : 'unavailable',
          images: productData.images || []
        };

        response = await fetch(`${this.baseURL}/product`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(jsonData)
        });
      }

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Authentication failed. Please log in again.');
        }
        
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Product created successfully:', result.product?.name || 'Unknown');
      }

      return result;
    } catch (error) {
      console.error('❌ Error creating product:', error.message);
      throw error;
    }
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
      console.error('❌ API connection test failed:', error.message);
      return false;
    }
  }

  async createBulkProducts(productsData, options = {}) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('📤 Creating bulk products:', productsData.length, 'products');
      }
      
      if (productsData.length > 100) {
        throw new Error('Bulk upload limited to 100 products at once');
      }

      // Check if any products have image files
      const hasImageFiles = productsData.some(product => 
        product.images && product.images.some(img => img.file instanceof File)
      );

      let response;

      if (hasImageFiles) {
        // Use multipart/form-data for products with images
        const formData = new FormData();

        // Add products array as JSON
        const productsJson = productsData.map((product, index) => ({
          name: product.name || product.productName,
          pricePerYard: parseFloat(product.pricePerYard),
          quantity: parseInt(product.quantity),
          materialType: product.materialType.toLowerCase(),
          vendorId: product.vendorId || this.getCurrentUser()?.id,
          idNumber: product.idNumber || `PRD-${Date.now()}-${index}`,
          description: product.description || 'Bulk uploaded product',
          pattern: product.pattern || 'solid',
          status: product.status === true || product.status === 'available' ? 'available' : 'unavailable'
        }));

        formData.append('products', JSON.stringify(productsJson));

        // Add images with product association
        productsData.forEach((product, productIndex) => {
          if (product.images && product.images.length > 0) {
            product.images.forEach((imageItem, imageIndex) => {
              if (imageItem.file instanceof File) {
                formData.append(`images[${productIndex}][${imageIndex}]`, imageItem.file);
              }
            });
          }
        });

        const headers = {};
        const token = this.getAuthToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        response = await fetch(`${this.baseURL}/product`, {
          method: 'POST',
          headers: headers,
          body: formData
        });

      } else {
        // Use JSON for products without images
        const jsonData = productsData.map((product, index) => ({
          name: product.name || product.productName,
          pricePerYard: parseFloat(product.pricePerYard),
          quantity: parseInt(product.quantity),
          materialType: product.materialType.toLowerCase(),
          vendorId: product.vendorId || this.getCurrentUser()?.id,
          idNumber: product.idNumber || `PRD-${Date.now()}-${index}`,
          description: product.description || 'Bulk uploaded product',
          pattern: product.pattern || 'solid',
          status: product.status === true || product.status === 'available' ? 'available' : 'unavailable'
        }));

        response = await fetch(`${this.baseURL}/product`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(jsonData)
        });
      }

      const result = await this.handleResponse(response);
      console.log('✅ Bulk products created:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Bulk create products error:', error.message);
      throw error;
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