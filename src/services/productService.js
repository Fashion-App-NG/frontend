const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

class ProductService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api`;
    this.cache = {}; // Add this line
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Product Service Base URL:', this.baseURL);
    }
  }

  // ✅ FIXED: Use consistent token key and add debugging
  getAuthHeaders() {
    const token = localStorage.getItem('token'); // ✅ Use same key as vendorService
    
    // ✅ ALWAYS LOG FOR DEBUGGING 401 ISSUES
    console.log('🔑 ProductService getAuthHeaders called:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 30) || 'none',
      source: 'localStorage.getItem("token")'
    });

    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 ProductService Authorization header added:', {
        headerPresent: !!headers['Authorization'],
        headerLength: headers['Authorization']?.length || 0
      });
    } else {
      console.error('❌ ProductService: No token available - Authorization header NOT added');
    }

    return headers;
  }

  async testConnection() {
    try {
      console.log('🔄 Testing API connection to:', this.baseURL);
      
      const response = await fetch(`${this.baseURL}/product`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Connection test response status:', response.status);
      return response.status < 500;
      
    } catch (error) {
      console.error('❌ API connection test failed:', error);
      return false;
    }
  }

  // ✅ FIX: Enhanced getAllProducts with better error handling
  async getAllProducts(filters = {}) {
    // ✅ FIX: Create cache key from plain object, not URLSearchParams
    const cacheKey = filters instanceof URLSearchParams 
      ? filters.toString() 
      : JSON.stringify(filters);
      
    if (this.cache[cacheKey]) {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Returning products from cache:', cacheKey);
      }
      return this.cache[cacheKey];
    }

    try {
      console.log('🔄 Loading products with filters:', filters);
      
      // ✅ Handle both URLSearchParams objects and plain objects
      let queryString = '';
      
      if (filters instanceof URLSearchParams) {
        // It's already a URLSearchParams object, just convert to string
        queryString = filters.toString();
      } else if (typeof filters === 'object' && filters !== null) {
        // It's a plain object, build URLSearchParams from it
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            params.append(key, String(value));
          }
        });
        queryString = params.toString();
      }

      const url = queryString 
        ? `${this.baseURL}/product?${queryString}` 
        : `${this.baseURL}/product`;
      
      console.log('📡 API URL:', url);
      console.log('🔍 Query string:', queryString); // ✅ NEW: Debug log

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Store in cache
      this.cache[cacheKey] = data;

      if (data.products && data.products.length > 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Sample product vendor data:', {
            firstProduct: data.products[0],
            vendorField: data.products[0].vendor,
            vendorIdField: data.products[0].vendorId,
            createdByField: data.products[0].createdBy
          });
        }
      }
      
      if (data.products && Array.isArray(data.products)) {
        data.products = data.products.map((product, index) => ({
          ...product,
          id: product.id || product._id || product.productId || `product-${index}`,
          display: product.display !== false,
          status: this.normalizeProductStatus(product),
          vendor: product.vendor || {
            id: product.vendorId,
            name: product.vendorName || product.createdBy?.name,
            storeName: product.vendorStoreName || product.createdBy?.storeName
          }
        })).filter(product => product.display !== false);
      }

      // ✅ Apply same pattern to all debug logs
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Products fetched:', data.products?.length || 0);
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      
      // ✅ FIX: Return structured error response instead of throwing
      return { 
        products: [], 
        error: error.message,
        message: 'Failed to load products. Please try again.' 
      };
    }
  }

  // ✅ Enhanced getVendorProducts with response logging and pagination support
  async getVendorProducts(vendorId, page = 1, limit = 20) {
    try {
      // ✅ FIX: Wrap in development guard
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 ProductService getVendorProducts starting:', {
          vendorId,
          page,
          limit,
          timestamp: new Date().toISOString()
        });
      }

      const headers = this.getAuthHeaders();
      
      // ✅ ALWAYS LOG FINAL HEADERS BEFORE REQUEST
      console.log('📨 ProductService Final request headers:', {
        headers: JSON.stringify(headers, null, 2),
        hasAuthHeader: !!headers.Authorization,
        authHeaderStart: headers.Authorization?.substring(0, 20) || 'none'
      });

      console.log('🌐 ProductService Making fetch request...');

      // ✅ Add pagination query params
      const url = new URL(`${this.baseURL}/product/vendor/${vendorId}`);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('limit', limit.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(30000)
      });
      
      // ✅ ALWAYS LOG RESPONSE
      console.log('📡 ProductService Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });

      // ✅ ENHANCED: Log the actual backend response structure
      if (process.env.NODE_ENV === 'development') {
        const responseBody = await response.clone().json().catch(() => null);
        console.log('🔍 Backend response for vendor products:', {
          success: responseBody?.success,
          productsCount: responseBody?.products?.length || 0,
          sampleProductFields: responseBody?.products?.[0] ? Object.keys(responseBody.products[0]) : [],
          sampleProduct: responseBody?.products?.[0],
          rawResponse: responseBody
        });
      }

      if (!response.ok) {
        console.error('❌ ProductService HTTP Error Response:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        });

        if (response.status === 401) {
          console.error('🔒 ProductService 401 Authentication Error:', {
            tokenWasProvided: !!localStorage.getItem('token'),
            headerWasSet: !!headers.Authorization,
            allStorageKeys: Object.keys(localStorage)
          });
          
          localStorage.removeItem('token');
          throw new Error('Authentication failed. Please log in again.');
        }

        if (response.status === 404) {
          console.log('📭 No products found for vendor:', vendorId);
          return { products: [], message: 'No products found' };
        }
        throw new Error(`HTTP ${response.status}: Failed to fetch vendor products`);
      }

      const data = await response.json();
      
      // ✅ FIXED: Normalize vendor product status too
      if (data.products && Array.isArray(data.products)) {
        data.products = data.products.map(product => ({
          ...product,
          status: this.normalizeProductStatus(product)
        }));
      }
      
      console.log('✅ ProductService Success response:', {
        hasProducts: !!data.products,
        productCount: data.products?.length || 0
      });

      return data;
    } catch (error) {
      console.error('❌ ProductService getVendorProducts error:', {
        message: error.message,
        name: error.name,
        vendorId
      });
      
      throw error;
    }
  }

  async getProductById(productId) {
    try {
      console.log('🔄 Fetching product by ID:', productId);
      
      const response = await fetch(`${this.baseURL}/product/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Product not found (${response.status})`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Use default error message
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // ✅ Ensure product has proper ID
      if (data.product) {
        data.product.id = data.product.id || data.product._id || data.product.productId || productId;
      }

      console.log('✅ Product fetched:', data.product?.name);
      return data;
    } catch (error) {
      console.error('❌ Error fetching product:', error);
      throw error;
    }
  }
  
  async getProduct(productId) {
    return this.getProductById(productId);
  }

  getImageUrl(imagePath, fallback = '/api/placeholder/300/200') {
    // ✅ FIX: Add proper type checking
    if (!imagePath) return fallback;
    
    // Handle string paths
    if (typeof imagePath === 'string') {
      if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
        return imagePath;
      }
      return `${API_BASE_URL}/uploads/${imagePath}`;
    }
    
    // Handle object paths (e.g., {url: "..."})
    if (typeof imagePath === 'object' && imagePath.url) {
      if (typeof imagePath.url === 'string') {
        if (imagePath.url.startsWith('http') || imagePath.url.startsWith('data:')) {
          return imagePath.url;
        }
        return `${API_BASE_URL}/uploads/${imagePath.url}`;
      }
    }
    
    // Fallback for any other type
    return fallback;
  }

  async createProduct(productData) {
    try {
      console.log('🔄 Creating product:', productData.name);
      
      const response = await fetch(`${this.baseURL}/product`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(productData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create product');
      }

      console.log('✅ Product created:', data.product?.id);
      return data;
    } catch (error) {
      console.error('❌ Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(productId, productData) {
    try {
      console.log('🔄 Updating product:', productId);
      
      const response = await fetch(`${this.baseURL}/product/${productId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(productData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update product');
      }

      console.log('✅ Product updated:', data.product?.id);
      return data;
    } catch (error) {
      console.error('❌ Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(productId) {
    try {
      console.log('🔄 Deleting product:', productId);
      
      const response = await fetch(`${this.baseURL}/product/${productId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete product');
      }

      console.log('✅ Product deleted:', productId);
      return data;
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      throw error;
    }
  }

  // ✅ ADD: Missing formatPrice method
  formatPrice(price) {
    if (!price) return 'Price not available';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  }

  // ✅ NEW: Normalize product status across different API responses
  normalizeProductStatus(product) {
    // Check various status indicators
    if (product.status === 'available' || 
        product.status === 'in_stock' || 
        product.status === 'In Stock') {
      return 'In Stock';
    }
    
    if (product.display === false || 
        product.status === 'unavailable' || 
        product.status === 'out_of_stock' ||
        product.status === 'Out of Stock') {
      return 'Out of Stock';
    }
    
    // Check quantity as fallback
    if (product.quantity && parseInt(product.quantity) > 0) {
      return 'In Stock';
    }
    
    // Default to available unless explicitly marked otherwise
    return 'In Stock';
  }
}

// ✅ FIX: Remove the undefined products reference
const productServiceInstance = new ProductService();
export default productServiceInstance;