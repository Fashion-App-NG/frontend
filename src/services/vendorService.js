const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

class VendorService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api`;
  }

  // Enhanced auth token retrieval
  getAuthToken() {
    // Try multiple token sources
    const vendorToken = localStorage.getItem('vendorToken');
    const authToken = localStorage.getItem('authToken');
    const token = vendorToken || authToken;
    
    // ✅ Fix: Gate debug logs behind development environment
    if (process.env.NODE_ENV === 'development') {
      console.log('🔑 Token retrieval debug:', {
        vendorToken: vendorToken ? `${vendorToken.substring(0, 20)}...` : 'None',
        authToken: authToken ? `${authToken.substring(0, 20)}...` : 'None',
        finalToken: token ? `${token.substring(0, 20)}...` : 'None'
      });
    }
    
    return token;
  }

  // Create headers with auth token
  getHeaders() {
    const token = this.getAuthToken();
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      // ✅ Fix: Gate debug logs behind development environment
      if (process.env.NODE_ENV === 'development') {
        console.log('🔑 Adding Authorization header:', `Bearer ${token.substring(0, 20)}...`);
      }
    } else {
      console.warn('⚠️ No auth token available for request');
    }
    
    return headers;
  }

  // Handle API response
  async handleResponse(response) {
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { message: `HTTP ${response.status}: ${response.statusText}` };
    }
    
    if (!response.ok) {
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        data
      });
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  }

  // ✅ FIXED: Get vendor's products with proper auth
  async getVendorProducts(vendorId) {
    try {
      console.log('🔍 Fetching products for vendor:', vendorId);
      console.log('🌐 Using endpoint:', `${this.baseURL}/product/vendor/${vendorId}`);
      
      const token = this.getAuthToken();
      console.log('🔑 Auth token available:', !!token);
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const response = await fetch(`${this.baseURL}/product/vendor/${vendorId}`, {
        method: 'GET',
        headers: this.getHeaders() // ✅ NOW includes Authorization header
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Request headers:', this.getHeaders());

      const data = await this.handleResponse(response);
      console.log('✅ Vendor products response:', data);
      
      // ✅ Map _id to id for frontend compatibility
      if (data.products && Array.isArray(data.products)) {
        data.products = data.products.map(product => ({
          ...product,
          id: product._id // Map MongoDB _id to id
        }));
      }
      
      return data;
      
    } catch (error) {
      console.error('❌ Get vendor products error:', error);
      
      // Handle 404 specifically (no products found)
      if (error.message.includes('404')) {
        console.log('📭 No products found for vendor (404)');
        return {
          success: false,
          message: 'No products found for this vendor',
          products: [],
          count: 0,
          vendorId: vendorId
        };
      }
      
      throw error;
    }
  }

  // Get current user helper
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  // ✅ UPDATED: Create product with proper multipart/form-data handling
  async createProduct(productData) {
    try {
      console.log('📤 Creating product with data:', productData);
      
      // Ensure vendor ID is included
      const currentUser = this.getCurrentUser();
      if (!productData.vendorId && currentUser?.id) {
        productData.vendorId = currentUser.id;
        console.log('✅ Added vendor ID from current user:', currentUser.id);
      }

      // ✅ Check if we have actual image files or just preview URLs
      const hasImageFiles = productData.images && 
        productData.images.some(img => img instanceof File || (img.file instanceof File));

      let response;

      if (hasImageFiles) {
        // ✅ Use multipart/form-data for image uploads
        const formData = new FormData();

        // Add text fields
        formData.append('name', productData.name);
        formData.append('pricePerYard', productData.pricePerYard.toString());
        formData.append('quantity', productData.quantity.toString());
        formData.append('materialType', productData.materialType.toLowerCase());
        formData.append('vendorId', productData.vendorId);
        formData.append('idNumber', productData.idNumber || `PRD-${Date.now()}`);
        formData.append('description', productData.description || '');
        formData.append('pattern', productData.pattern || 'solid');
        formData.append('status', productData.status === true ? 'available' : 'unavailable');

        // ✅ Add image files with correct field name
        productData.images.forEach((imageItem, index) => {
          if (imageItem.file instanceof File) {
            formData.append('images', imageItem.file);
          } else if (imageItem instanceof File) {
            formData.append('images', imageItem);
          }
        });

        console.log('🌐 Using multipart/form-data endpoint:', `${this.baseURL}/product`);
        
        // ✅ Different headers for multipart (no Content-Type header - let browser set it)
        const headers = {};
        const token = this.getAuthToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        response = await fetch(`${this.baseURL}/product`, {
          method: 'POST',
          headers: headers, // No Content-Type for multipart
          body: formData
        });

      } else {
        // ✅ Use JSON for products without image files
        const jsonData = {
          name: productData.name,
          pricePerYard: productData.pricePerYard,
          quantity: productData.quantity,
          materialType: productData.materialType.toLowerCase(),
          vendorId: productData.vendorId,
          idNumber: productData.idNumber || `PRD-${Date.now()}`,
          description: productData.description || '',
          pattern: productData.pattern || 'solid',
          status: productData.status === true ? 'available' : 'unavailable',
          images: productData.images || []
        };

        console.log('🌐 Using JSON endpoint:', `${this.baseURL}/product`);
        console.log('📦 JSON product data:', jsonData);
        
        response = await fetch(`${this.baseURL}/product`, {
          method: 'POST',
          headers: this.getHeaders(), // Standard JSON headers
          body: JSON.stringify(jsonData)
        });
      }

      const result = await this.handleResponse(response);
      console.log('✅ Product created successfully:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Create product error:', error);
      throw error;
    }
  }

  // ✅ Helper method to get headers without Content-Type (for multipart)
  getHeadersWithoutContentType() {
    const headers = {};
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Update product - fix the endpoint and data format
  async updateProduct(productId, updateData) {
    try {
      console.log('📝 Updating product:', productId, 'with data:', updateData);
      
      // ✅ Ensure we have a valid product ID
      if (!productId || productId === 'undefined') {
        throw new Error('Invalid product ID provided');
      }
      
      // Clean the update data - remove any undefined fields
      const cleanUpdateData = {};
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined && updateData[key] !== '') {
          cleanUpdateData[key] = updateData[key];
        }
      });
      
      console.log('🌐 Using endpoint:', `${this.baseURL}/product/${productId}`);
      console.log('📦 Clean update data:', cleanUpdateData);
      
      const response = await fetch(`${this.baseURL}/product/${productId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(cleanUpdateData)
      });

      const result = await this.handleResponse(response);
      console.log('✅ Product updated successfully:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Update product error:', error);
      throw error;
    }
  }

  // Hide product (soft delete)
  async hideProduct(productId) {
    try {
      console.log('🙈 Hiding product:', productId);
      console.log('🌐 Using endpoint:', `${this.baseURL}/product/${productId}/hide`);
      
      const response = await fetch(`${this.baseURL}/product/${productId}/hide`, {
        method: 'PUT',
        headers: this.getHeaders()
      });

      const result = await this.handleResponse(response);
      console.log('✅ Product hidden successfully:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Hide product error:', error);
      throw error;
    }
  }

  // Test connection
  async testConnection() {
    try {
      console.log('🔍 Testing API connection to:', `${this.baseURL}/product`);
      const response = await fetch(`${this.baseURL}/product`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('📡 Test response status:', response.status);
      return response.ok;
    } catch (error) {
      console.error('❌ API connection test failed:', error);
      return false;
    }
  }
}

const vendorService = new VendorService();
export default vendorService;