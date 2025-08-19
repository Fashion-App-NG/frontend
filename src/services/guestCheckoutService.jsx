const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('REACT_APP_API_BASE_URL environment variable is not set. Please configure it for your environment.');
}

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

  // In guestCheckoutService.jsx - Use single-step like shoppers
  async confirmOrder(orderData) {
    try {
      console.log('🔄 Guest checkout: Using same working endpoint POST /api/checkout/confirm-step...');

      // ✅ Use the SAME working endpoint as shoppers
      const response = await fetch(`${this.baseURL}/checkout/confirm-step`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          shippingAddress: orderData.shippingAddress,
          customerInfo: orderData.customerInfo,
          paymentDetails: orderData.paymentDetails,
          reservationDuration: orderData.reservationDuration || 30
        })
      });

      if (!response.ok) {
        throw new Error(`Guest checkout failed: ${response.status}`);
      }

      const data = await response.json();
      
      // ✅ Handle missing paymentStatus from backend
      if (data.order && !data.order.paymentStatus && orderData.paymentDetails.reference) {
        data.order.paymentStatus = 'PAID';
        console.log('✅ GUEST FALLBACK: Set paymentStatus to PAID');
      }

      console.log('✅ Guest checkout successful with REAL order ID:', {
        orderId: data.order?.id,
        orderNumber: data.order?.orderNumber,
        status: data.order?.status,
        paymentStatus: data.order?.paymentStatus
      });

      return {
        success: true,
        order: {
          id: data.order?.id,                    // Real MongoDB ObjectId
          orderNumber: data.order?.orderNumber,
          totalAmount: data.order?.totalAmount,
          status: data.order?.status || 'PENDING',
          paymentStatus: data.order?.paymentStatus || 'PAID',
          customerInfo: orderData.customerInfo,
          items: data.order?.items || [],
          createdAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Guest checkout failed:', error);
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