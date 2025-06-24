const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002';

class ProductService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api`;
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Product Service Base URL:', this.baseURL);
    }
  }

  // Get all public products with optional filters
  async getAllProducts(filters = {}) {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      // Add filters if provided
      if (filters.materialType) queryParams.append('materialType', filters.materialType);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.pattern) queryParams.append('pattern', filters.pattern);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
      
      const url = `${this.baseURL}/product${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      console.log('🔄 Fetching products:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products');
      }
      
      console.log('✅ Products fetched:', data.products?.length || 0);
      return data;
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      throw error;
    }
  }

  // Get single product by ID
  async getProduct(productId) {
    try {
      console.log('🔄 Fetching product:', productId);
      
      const response = await fetch(`${this.baseURL}/product/${productId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Product not found');
      }
      
      console.log('✅ Product fetched:', data.product?.name);
      return data;
    } catch (error) {
      console.error('❌ Error fetching product:', error);
      throw error;
    }
  }

  // Get vendor products (for vendor dashboard)
  async getVendorProducts(vendorId) {
    try {
      console.log('🔄 Fetching vendor products for:', vendorId);
      
      const response = await fetch(`${this.baseURL}/product/vendor/${vendorId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch vendor products');
      }
      
      console.log('✅ Vendor products fetched:', data.products?.length || 0);
      return data;
    } catch (error) {
      console.error('❌ Error fetching vendor products:', error);
      throw error;
    }
  }

  // Update product (vendor only)
  async updateProduct(productId, productData) {
    try {
      console.log('🔄 Updating product:', productId);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseURL}/product/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update product');
      }
      
      console.log('✅ Product updated:', data.product?.name);
      return data;
    } catch (error) {
      console.error('❌ Error updating product:', error);
      throw error;
    }
  }

  // Hide product (soft delete)
  async hideProduct(productId) {
    try {
      console.log('🔄 Hiding product:', productId);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseURL}/product/${productId}/hide`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to hide product');
      }
      
      console.log('✅ Product hidden:', productId);
      return data;
    } catch (error) {
      console.error('❌ Error hiding product:', error);
      throw error;
    }
  }

  // Utility method to get image URL with fallback
  getImageUrl(imageObj, fallback = '/api/placeholder/300/200') {
    if (!imageObj) return fallback;
    
    // Handle different image object formats
    if (typeof imageObj === 'string') return imageObj;
    if (imageObj.url) return imageObj.url;
    if (imageObj.preview) return imageObj.preview;
    
    return fallback;
  }

  // Format price for display
  formatPrice(price) {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  }
}

export default new ProductService();