import { CART_TOTAL_TOLERANCE } from '../constants/cart';
import { getPriceWithPlatformFee } from '../utils/formatPrice';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

class CartService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api`;
    this.activeRequests = new Set();
    this.apiCallLog = [];
    this.rateLimitWarningShown = false;
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

  // Update the processCartResponse method to preserve basePrice and platformFee

  processCartResponse(response) {
    if (!response || !response.items) {
      return response;
    }
    
    // Ensure each item has basePrice and platformFee fields
    response.items.forEach(item => {
      // If we have platformFeeAmount from the API, use it
      if (response.platformFeeAmount && !item.platformFee) {
        const itemRatio = item.pricePerYard / response.totalAmount;
        item.platformFee = Math.round(response.platformFeeAmount * itemRatio);
        item.basePrice = item.pricePerYard - item.platformFee;
      } else if (!item.platformFee) {
        // Otherwise use a default calculation
        item.platformFee = Math.round(item.pricePerYard * 0.08); // Assuming 8% fee
        item.basePrice = item.pricePerYard - item.platformFee;
      }
    });
    
    // Validate against API total
    const calculatedTotal = response.items.reduce((sum, item) => {
      return sum + (item.pricePerYard * item.quantity);
    }, 0);
    
    if (Math.abs(calculatedTotal - response.totalAmount) > CART_TOTAL_TOLERANCE) {
      console.warn('API cart total mismatch!', {
        calculated: calculatedTotal,
        received: response.totalAmount,
        difference: calculatedTotal - response.totalAmount
      });
      // Force correct total
      response.totalAmount = calculatedTotal;
    }
    
    return response;
  }

  async handleUnauthorized() {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Unauthorized request detected - token may be expired');
    }
    
    // Clear invalid tokens
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('guestSessionToken');
    
    // Redirect to login
    window.location.href = '/user-type-selection';
  }

  async getCart() {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Fetching cart contents...');
      }
      
      await this.ensureValidAuth();
      
      const headers = this.getAuthHeaders();
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Cart request headers:', {
          hasAuth: !!headers.Authorization,
          authType: headers.Authorization ? (headers.Authorization.includes('Bearer') ? 'Bearer' : 'Other') : 'None'
        });
      }

      const response = await fetch(`${this.baseURL}/cart`, { 
        method: 'GET', 
        headers 
      });
      
      if (response.status === 401) {
        // ✅ User token expired - force re-login
        const userToken = this.getAuthToken();
        if (userToken) {
          await this.handleUnauthorized();
          throw new Error('Session expired. Please log in again.');
        }
        
        // Guest session recovery
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Recovering guest session...');
        }
        try {
          localStorage.removeItem('guestSessionToken');
          await this.createGuestSession();
          
          const newHeaders = this.getAuthHeaders();
          const retryResponse = await fetch(`${this.baseURL}/cart`, { 
            method: 'GET', 
            headers: newHeaders 
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            if (process.env.NODE_ENV === 'development') {
              console.log('✅ Cart recovered successfully:', retryData.cart);
            }
            return this.processCartResponse(retryData);
          } else if (retryResponse.status === 404) {
            return { success: true, cart: { items: [], totalAmount: 0, itemCount: 0, id: null } };
          }
          
          throw new Error(`Recovery failed: ${retryResponse.status}`);
          
        } catch (recoveryError) {
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ Guest session recovery failed:', recoveryError);
          }
          return { success: true, cart: { items: [], totalAmount: 0, itemCount: 0, id: null } };
        }
      }
      
      if (!response.ok) {
        if (response.status === 404) {
          return { success: true, cart: { items: [], totalAmount: 0, itemCount: 0, id: null } };
        }
        throw new Error(`Failed to fetch cart: ${response.status}`);
      }
      
      const data = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Cart fetched successfully:', data.cart);
      }
      return this.processCartResponse(data);
      
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Failed to fetch cart:', error);
      }
      
      // Don't swallow session expired errors
      if (error.message.includes('Session expired')) {
        throw error;
      }
      
      return { success: true, cart: { items: [], totalAmount: 0, itemCount: 0, id: null } };
    }
  }

  // ✅ NEW: Ensure valid authentication before requests
  async ensureValidAuth() {
    const userToken = this.getAuthToken();
    const guestToken = this.getGuestSessionToken();
    
    if (!userToken && !guestToken) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 No tokens found, creating guest session...');
      }
      await this.createGuestSession();
      return;
    }
    
    // Validate guest token if no user token
    if (!userToken && guestToken) {
      const guestSessionService = (await import('./guestSessionService')).default;
      const isValid = await guestSessionService.validateToken(guestToken);
      
      if (!isValid) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Guest token expired, creating new session...');
        }
        localStorage.removeItem('guestSessionToken');
        await this.createGuestSession();
      }
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
        pricePerYard: parseFloat(getPriceWithPlatformFee(productData)),
        basePrice: parseFloat(productData.pricePerYard || productData.price || 0),
        platformFee: productData.platformFee?.amount || 0,
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
      
      // ✅ Handle 401 for add to cart
      if (response.status === 401) {
        await this.handleUnauthorized();
        throw new Error('Session expired. Please log in again.');
      }
      
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
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Failed to add item to cart:', error);
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Failed to update cart item:', error);
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Failed to remove item from cart:', error);
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Failed to clear cart:', error);
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Failed to merge guest cart:', error);
      }
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