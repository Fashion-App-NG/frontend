const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002'; // ✅ Changed from 3002 to 3001

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
    
    console.log('🔑 Token retrieval debug:', {
      vendorToken: vendorToken ? `${vendorToken.substring(0, 20)}...` : 'None',
      authToken: authToken ? `${authToken.substring(0, 20)}...` : 'None',
      finalToken: token ? `${token.substring(0, 20)}...` : 'None'
    });
    
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
      console.log('🔑 Adding Authorization header:', `Bearer ${token.substring(0, 20)}...`);
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

  // ✅ FIXED: Create single product with ALL required fields
  async createProduct(productData) {
    try {
      console.log('📤 Creating product with data:', productData);
      
      // Ensure vendor ID is included
      const currentUser = this.getCurrentUser();
      if (!productData.vendorId && currentUser?.id) {
        productData.vendorId = currentUser.id;
        console.log('✅ Added vendor ID from current user:', currentUser.id);
      }

      // ✅ Map frontend status to backend format
      let backendStatus = 'available'; // default
      if (productData.status === true || productData.status === 'true') {
        backendStatus = 'available';
      } else if (productData.status === false || productData.status === 'false') {
        backendStatus = 'unavailable';
      } else if (typeof productData.status === 'string') {
        backendStatus = productData.status.toLowerCase();
      }

      // ✅ Ensure ALL required fields are present
      const completeProductData = {
        name: productData.name,
        pricePerYard: productData.pricePerYard,
        quantity: productData.quantity,
        materialType: productData.materialType,
        vendorId: productData.vendorId,
        idNumber: productData.idNumber || `PRD-${Date.now()}`,
        description: productData.description || '', // Required but can be empty
        pattern: productData.pattern || '', // Required but can be empty
        status: backendStatus, // Required field
        images: productData.images || [] // Optional field
      };

      console.log('🌐 Using endpoint:', `${this.baseURL}/product`);
      console.log('📦 Complete product data:', completeProductData);
      
      const response = await fetch(`${this.baseURL}/product`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(completeProductData)
      });

      const result = await this.handleResponse(response);
      console.log('✅ Product created successfully:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Create product error:', error);
      throw error;
    }
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