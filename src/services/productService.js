const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

class ProductService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api`;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Product Service Base URL:', this.baseURL);
    }
  }

  getAuthHeaders() {
    const token = localStorage.getItem('authToken') || localStorage.getItem('vendorToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
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
    try {
      console.log('🔄 Loading products with filters:', filters);
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.toString().trim()) {
          params.append(key, value);
        }
      });

      const url = `${this.baseURL}/product${params.toString() ? `?${params}` : ''}`;
      console.log('📡 API URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        // ✅ Add timeout to prevent infinite loading
        signal: AbortSignal.timeout(30000) // 30 second timeout
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
      
      // ✅ FIX: Ensure products have proper IDs
      if (data.products && Array.isArray(data.products)) {
        data.products = data.products.map((product, index) => ({
          ...product,
          // Ensure each product has an ID
          id: product.id || product._id || product.productId || `product-${index}`,
          // Ensure display field exists
          display: product.display !== false
        })).filter(product => product.display !== false);
      }

      console.log('✅ Products fetched:', data.products?.length || 0);
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

  async getVendorProducts(vendorId) {
    try {
      console.log('🔄 Fetching vendor products for:', vendorId);
      
      const response = await fetch(`${this.baseURL}/product/vendor/${vendorId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(30000)
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('📭 No products found for vendor:', vendorId);
          return { products: [], message: 'No products found' };
        }
        throw new Error(`HTTP ${response.status}: Failed to fetch vendor products`);
      }
      
      const data = await response.json();
      
      // ✅ Ensure vendor products have proper IDs
      if (data.products && Array.isArray(data.products)) {
        data.products = data.products.map((product, index) => ({
          ...product,
          id: product.id || product._id || product.productId || `vendor-product-${index}`
        }));
      }
      
      console.log('✅ Vendor products fetched:', data.products?.length || 0);
      return data;
      
    } catch (error) {
      console.error('❌ Error fetching vendor products:', error);
      return { products: [], error: error.message };
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
}

const productServiceInstance = new ProductService();
export default productServiceInstance;