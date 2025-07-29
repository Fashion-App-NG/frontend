const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

class CartService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api`;
    this.activeRequests = new Set();
    if (process.env.NODE_ENV === 'development') {
      console.log('🛒 Cart Service Base URL:', this.baseURL);
    }
  }

  getAuthToken() {
    return localStorage.getItem('token');
  }

  getGuestSessionToken() {
    return localStorage.getItem('guestSessionToken');
  }

  async createGuestSession() {
    // Use guestSessionService to create and store token
    const guestSessionService = (await import('./guestSessionService')).default;
    return await guestSessionService.getOrCreateGuestSession();
  }

  getAuthHeaders() {
    const token = this.getAuthToken();
    const guestToken = this.getGuestSessionToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      if (process.env.NODE_ENV === 'development') {
        console.log('🔑 Using user authentication');
      }
    } else if (guestToken) {
      headers['Authorization'] = `Bearer ${guestToken}`;
      if (process.env.NODE_ENV === 'development') {
        console.log('👤 Using guest session:', guestToken);
      }
    }
    return headers;
  }

  async getCart() {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Fetching cart contents...');
      }
      if (!this.getAuthToken() && !this.getGuestSessionToken()) {
        await this.createGuestSession();
      }
      const headers = this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/cart`, { method: 'GET', headers });
      if (!response.ok) {
        if (response.status === 404) {
          return { success: true, cart: { items: [], totalAmount: 0, itemCount: 0, id: null } };
        }
        throw new Error(`Failed to fetch cart: ${response.status}`);
      }
      const data = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Cart fetched:', data.cart);
      }
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch cart:', error);
      throw error;
    }
  }

  async addItem(productData) {
    const requestKey = `add-${productData.productId || productData.id}`;
    if (this.activeRequests.has(requestKey)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Duplicate add-to-cart request blocked:', requestKey);
      }
      throw new Error('Request already in progress');
    }
    this.activeRequests.add(requestKey);
    try {
      if (!this.getAuthToken() && !this.getGuestSessionToken()) {
        await this.createGuestSession();
      }
      const headers = this.getAuthHeaders();
      const requestBody = {
        productId: productData.productId || productData.id || productData._id,
        name: productData.name,
        pricePerYard: parseFloat(productData.pricePerYard || productData.price || 0),
        quantity: parseInt(productData.quantity || 1),
        materialType: productData.materialType || 'Unknown',
        pattern: productData.pattern || 'Unknown',
        image: productData.image || productData.imageUrl || '',
        vendorId: productData.vendorId || productData.vendor?.id,
        vendorName: productData.vendorName || productData.vendor?.name || 'Unknown Vendor'
      };
      if (process.env.NODE_ENV === 'development') {
        console.log('[DEBUG] cartService.addItem called with:', requestBody);
      }
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
        console.log('✅ Item added to cart:', data.cart);
      }
      return data;
    } catch (error) {
      console.error('❌ Failed to add item to cart:', error);
      throw error;
    } finally {
      this.activeRequests.delete(requestKey);
    }
  }

  async updateQuantity(productId, quantity) {
    try {
      const headers = this.getAuthHeaders();
      const requestBody = { quantity: parseInt(quantity) };
      const response = await fetch(`${this.baseURL}/cart/update/${productId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to update cart item: ${response.status}`);
      }
      const data = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Cart item quantity updated:', data.cart);
      }
      return data;
    } catch (error) {
      console.error('❌ Failed to update cart item:', error);
      throw error;
    }
  }

  async removeItem(productId) {
    try {
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
        console.log('✅ Item removed from cart:', data.cart);
      }
      return data;
    } catch (error) {
      console.error('❌ Failed to remove item from cart:', error);
      throw error;
    }
  }

  async clearCart() {
    try {
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

  async mergeGuestCart(guestSessionId) {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('User must be authenticated to merge guest cart');
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
      localStorage.removeItem('guestSessionId');
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Guest cart merged successfully:', data.cart);
      }
      return data;
    } catch (error) {
      console.error('❌ Failed to merge guest cart:', error);
      throw error;
    }
  }

  clearGuestSession() {
    localStorage.removeItem('guestSessionId');
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Guest session cleared');
    }
  }
}

const cartServiceInstance = new CartService();
export default cartServiceInstance;