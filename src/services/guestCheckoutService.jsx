const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002';

class GuestCheckoutService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api`;
  }

  // ✅ Guest-specific: Use guest token from localStorage
  getAuthHeaders() {
    const guestToken = localStorage.getItem('guestSessionToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': guestToken ? `Bearer ${guestToken}` : ''
    };
  }

  async reviewCart() {
    try {
      console.log('🔄 Guest checkout: Reviewing cart...');
      
      const response = await fetch(`${this.baseURL}/cart`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Cart review failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Guest cart review successful:', data);

      return {
        success: true,
        cart: {
          id: data.cart?.id || 'guest-cart',
          items: data.cart?.items || [],
          totalAmount: data.cart?.totalAmount || 0,
          itemCount: data.cart?.items?.length || 0
        }
      };
    } catch (error) {
      console.error('❌ Guest cart review failed:', error);
      throw error;
    }
  }

  async confirmOrder(orderData) {
    try {
      console.log('🔄 Guest checkout: Confirming order...', orderData);

      const response = await fetch(`${this.baseURL}/checkout/guest-order`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Order confirmation failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Guest order confirmation successful:', data);

      return {
        success: true,
        order: {
          id: data.order?._id || data.order?.id,
          orderNumber: data.order?.orderNumber,
          totalAmount: data.order?.totalAmount,
          status: data.order?.status || 'CONFIRMED',
          customerInfo: orderData.customerInfo,
          items: data.order?.items || [],
          createdAt: data.order?.createdAt || new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Guest order confirmation failed:', error);
      throw error;
    }
  }

  // ✅ Helper: Check if email exists (for Phase 2)
  async checkEmailExists(email) {
    try {
      const response = await fetch(`${this.baseURL}/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        return await response.json();
      }
      
      return { exists: false };
    } catch (error) {
      console.error('Email check failed:', error);
      return { exists: false };
    }
  }
}

// ✅ Fix: Create instance and assign to variable
const guestCheckoutService = new GuestCheckoutService();
export default guestCheckoutService;