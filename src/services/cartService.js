const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

class CartService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api`;
    this.activeRequests = new Set(); // ✅ Track active requests
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🛒 Cart Service Base URL:', this.baseURL);
    }
  }

  // ✅ Get authentication token
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // ✅ Get guest session ID
  getGuestSessionId() {
    return localStorage.getItem('guestSessionId');
  }

  // ✅ Create guest session for unauthenticated users
  async createGuestSession() {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Creating guest session...');
      }

      const response = await fetch(`${this.baseURL}/session/guest-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Failed to create guest session: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.sessionId) {
        localStorage.setItem('guestSessionId', data.sessionId);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Guest session created:', data.sessionId);
        }
        
        return data.sessionId;
      }

      throw new Error('No session ID received from server');
    } catch (error) {
      console.error('❌ Failed to create guest session:', error);
      
      // Fallback: generate local session ID
      const fallbackSessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('guestSessionId', fallbackSessionId);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Using fallback guest session:', fallbackSessionId);
      }
      
      return fallbackSessionId;
    }
  }

  // ✅ Get authorization header (user token or guest session)
  getAuthHeaders() {
    const token = this.getAuthToken();
    const guestSessionId = this.getGuestSessionId();
    
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔑 Using user authentication');
      }
    } else if (guestSessionId) {
      // For guest sessions, we might need to pass session ID differently
      // This depends on backend implementation
      headers['X-Guest-Session'] = guestSessionId;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('👤 Using guest session:', guestSessionId);
      }
    }

    return headers;
  }

  // ✅ Get cart contents
  async getCart() {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Fetching cart contents...');
      }

      const headers = this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/cart`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        if (response.status === 404) {
          // No cart exists yet - return empty cart
          return {
            success: true,
            cart: {
              items: [],
              totalAmount: 0,
              itemCount: 0,
              id: null
            }
          };
        }
        throw new Error(`Failed to fetch cart: ${response.status}`);
      }

      const data = await response.json();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Cart fetched:', {
          itemCount: data.cart?.itemCount || 0,
          totalAmount: data.cart?.totalAmount || 0
        });
      }

      return data;
    } catch (error) {
      console.error('❌ Failed to fetch cart:', error);
      throw error;
    }
  }

  // ✅ Get cart item count only
  async getCartCount() {
    try {
      const headers = this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/cart/count`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { success: true, itemCount: 0 };
        }
        throw new Error(`Failed to fetch cart count: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch cart count:', error);
      // Return 0 on error to prevent UI issues
      return { success: false, itemCount: 0 };
    }
  }

  // ✅ Add item to cart
  async addItem(productData) {
    const requestKey = `add-${productData.productId || productData.id}`;
    
    // ✅ Prevent duplicate requests
    if (this.activeRequests.has(requestKey)) {
      console.log('🔍 DEBUGGING - Duplicate request blocked for:', requestKey);
      throw new Error('Request already in progress');
    }
    
    this.activeRequests.add(requestKey);
    
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Adding item to cart:', {
          productId: productData.productId || productData.id,
          name: productData.name,
          quantity: productData.quantity || 1
        });
      }

      // Ensure we have guest session if not authenticated
      if (!this.getAuthToken() && !this.getGuestSessionId()) {
        await this.createGuestSession();
      }

      const headers = this.getAuthHeaders();
      
      // ✅ FIX: Proper data normalization
      const requestBody = {
        productId: productData.productId || productData.id || productData._id,
        name: productData.name,
        pricePerYard: parseFloat(productData.pricePerYard || productData.price || 0),
        quantity: parseInt(productData.quantity || 1),
        // ✅ FIX: Use actual material type from product
        materialType: productData.materialType || 'Unknown',
        // ✅ FIX: Use actual pattern from product
        pattern: productData.pattern || 'Unknown',
        image: productData.image || productData.imageUrl || '',
        vendorId: productData.vendorId,
        // ✅ FIX: Use actual vendor name or fallback appropriately
        vendorName: productData.vendorName || productData.vendor?.name || 'Unknown Vendor'
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('📤 Cart add request body:', requestBody);
      }

      // ✅ DEBUGGING: Log exact request details
      console.log('🔍 DEBUGGING - Exact request details:', {
        url: `${this.baseURL}/cart/add`,
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
        bodyParsed: requestBody
      });
      
      // ✅ DEBUGGING: Validate request body
      const validation = {
        hasProductId: !!requestBody.productId,
        hasName: !!requestBody.name,
        priceIsNumber: typeof requestBody.pricePerYard === 'number',
        quantityIsNumber: typeof requestBody.quantity === 'number',
        allRequiredFields: !!requestBody.productId && !!requestBody.name
      };
      console.log('🔍 DEBUGGING - Request validation:', validation);

      const response = await fetch(`${this.baseURL}/cart/add`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to add item to cart: ${response.status}`);
      }

      const data = await response.json();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Item added to cart:', {
          totalItems: data.cart?.itemCount || 0,
          totalAmount: data.cart?.totalAmount || 0
        });
      }

      return data;
    } catch (error) {
      console.error('❌ Failed to add item to cart:', error);
      throw error;
    } finally {
      this.activeRequests.delete(requestKey);
    }
  }

  // ✅ Update cart item quantity
  async updateQuantity(productId, quantity) {
    try {
      console.log('🔍 CART SERVICE UPDATE QUANTITY - Start:', {
        productId,
        quantity,
        quantityType: typeof quantity
      });

      const headers = this.getAuthHeaders();
      
      const requestBody = { quantity: parseInt(quantity) };
      console.log('🔍 CART SERVICE - Request details:', {
        url: `${this.baseURL}/cart/update/${productId}`,
        headers,
        body: requestBody
      });

      const response = await fetch(`${this.baseURL}/cart/update/${productId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(requestBody)
      });

      console.log('🔍 CART SERVICE - Raw response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔍 CART SERVICE - Error response body:', errorText);
        
        const errorData = JSON.parse(errorText).catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to update cart item: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('🔍 CART SERVICE - Success response data:', {
        success: data.success,
        message: data.message,
        cart: data.cart,
        cartItems: data.cart?.items?.map(item => ({
          id: item.id,
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          pricePerYard: item.pricePerYard,
          price: item.price
        }))
      });

      return data;
    } catch (error) {
      console.error('❌ CART SERVICE - Update quantity error:', {
        error: error.message,
        stack: error.stack,
        productId,
        quantity
      });
      throw error;
    }
  }

  // ✅ Remove item from cart
  async removeItem(productId) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Removing item from cart:', productId);
      }

      const headers = this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/cart/remove/${productId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to remove item from cart: ${response.status}`);
      }

      const data = await response.json();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Item removed from cart:', {
          productId,
          remainingItems: data.cart?.itemCount || 0
        });
      }

      return data;
    } catch (error) {
      console.error('❌ Failed to remove item from cart:', error);
      throw error;
    }
  }

  // ✅ Clear entire cart
  async clearCart() {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Clearing entire cart...');
      }

      const headers = this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/cart/clear`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to clear cart: ${response.status}`);
      }

      const data = await response.json();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Cart cleared successfully');
      }

      return data;
    } catch (error) {
      console.error('❌ Failed to clear cart:', error);
      throw error;
    }
  }

  // ✅ Merge guest cart with user cart (called after login)
  async mergeGuestCart(guestSessionId) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Merging guest cart with user cart:', guestSessionId);
      }

      const token = this.getAuthToken();
      if (!token) {
        throw new Error('User must be authenticated to merge guest cart');
      }

      const response = await fetch(`${this.baseURL}/cart/merge-guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ guestSessionId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to merge guest cart: ${response.status}`);
      }

      const data = await response.json();
      
      // Clear guest session ID after successful merge
      localStorage.removeItem('guestSessionId');
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Guest cart merged successfully:', {
          finalItemCount: data.cart?.itemCount || 0,
          finalAmount: data.cart?.totalAmount || 0
        });
      }

      return data;
    } catch (error) {
      console.error('❌ Failed to merge guest cart:', error);
      throw error;
    }
  }

  // ✅ Clear guest session (called on logout)
  clearGuestSession() {
    localStorage.removeItem('guestSessionId');
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Guest session cleared');
    }
  }

  // ✅ Test cart API connection
  async testConnection() {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Testing cart API connection...');
      }

      const headers = this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/cart/count`, {
        method: 'GET',
        headers
      });

      const isConnected = response.ok || response.status === 404; // 404 is acceptable (no cart yet)
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📡 Cart API connection test:', {
          status: response.status,
          connected: isConnected
        });
      }

      return isConnected;
    } catch (error) {
      console.error('❌ Cart API connection test failed:', error);
      return false;
    }
  }

  // Add this method to test basic connectivity

  async debugConnectivity() {
    try {
      console.log('🔍 Testing basic connectivity...');
      
      // Test 1: Basic API connection
      const basicResponse = await fetch(`${this.baseURL}/cart`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      console.log('🔍 Basic GET /cart response:', {
        status: basicResponse.status,
        headers: Object.fromEntries(basicResponse.headers.entries()),
        ok: basicResponse.ok
      });
      
      // Test 2: Try a simple POST to see if it's method-specific
      const postResponse = await fetch(`${this.baseURL}/cart/add`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          test: true,
          productId: 'test-123',
          name: 'Test Product',
          pricePerYard: 100,
          quantity: 1
        })
      });
      
      console.log('🔍 Test POST /cart/add response:', {
        status: postResponse.status,
        headers: Object.fromEntries(postResponse.headers.entries()),
        ok: postResponse.ok
      });
      
      if (!postResponse.ok) {
        const errorText = await postResponse.text();
        console.log('🔍 POST Error response body:', errorText);
      }
      
    } catch (error) {
      console.error('🔍 Connectivity test failed:', error);
    }
  }
}

const cartServiceInstance = new CartService();
export default cartServiceInstance;