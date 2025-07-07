class CheckoutService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';
    this.currentSession = null;
  }

  // ✅ IMPROVED: Add robust error handling
  async createSession(cartItems) {
    try {
      console.log('🔍 Creating checkout session for items:', cartItems);
      
      const response = await fetch(`${this.baseURL}/checkout/create-session`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ items: cartItems })
      });
      
      console.log('🔍 Checkout API Response Status:', response.status);
      
      // ✅ FIX: Check if response is successful and JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Checkout API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        // Return mock data for development when API is not available
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Using mock checkout session for development');
          return this.getMockSession(cartItems);
        }
        
        throw new Error(`Checkout API Error: ${response.status} - ${response.statusText}`);
      }

      // ✅ FIX: Validate JSON response
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response:', text);
        
        if (process.env.NODE_ENV === 'development') {
          return this.getMockSession(cartItems);
        }
        
        throw new Error('Expected JSON response but received: ' + contentType);
      }

      const data = await response.json();
      console.log('✅ Checkout session created:', data);
      
      if (data.success) {
        this.currentSession = data;
        localStorage.setItem('checkoutSession', JSON.stringify(data));
      }
      return data;
      
    } catch (error) {
      console.error('❌ CreateSession error:', error);
      
      // ✅ FIX: Provide fallback for development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Falling back to mock session');
        return this.getMockSession(cartItems);
      }
      
      throw error;
    }
  }

  // ✅ ADD: Mock session for development
  getMockSession(cartItems) {
    const mockSession = {
      success: true,
      sessionId: `mock_session_${Date.now()}`,
      reservedItems: cartItems,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      message: 'Mock session created for development'
    };
    
    this.currentSession = mockSession;
    localStorage.setItem('checkoutSession', JSON.stringify(mockSession));
    return mockSession;
  }

  // ✅ IMPROVED: Add error handling to other methods
  async saveShippingInfo(sessionId, shippingData) {
    try {
      const response = await fetch(`${this.baseURL}/checkout/shipping`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ sessionId, ...shippingData })
      });

      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          return { success: true, message: 'Mock shipping saved' };
        }
        throw new Error(`Shipping API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ SaveShippingInfo error:', error);
      if (process.env.NODE_ENV === 'development') {
        return { success: true, message: 'Mock shipping saved' };
      }
      throw error;
    }
  }

  async setPaymentMethod(sessionId, paymentMethod) {
    try {
      const response = await fetch(`${this.baseURL}/checkout/payment-method`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ sessionId, paymentMethod })
      });

      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          return { success: true, message: 'Mock payment method set' };
        }
        throw new Error(`Payment Method API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ SetPaymentMethod error:', error);
      if (process.env.NODE_ENV === 'development') {
        return { success: true, message: 'Mock payment method set' };
      }
      throw error;
    }
  }

  async confirmOrder(sessionId, paymentReference) {
    try {
      const response = await fetch(`${this.baseURL}/checkout/confirm`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ sessionId, paymentReference })
      });

      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          const mockOrder = {
            success: true,
            order: {
              orderNumber: `ORD-${Date.now()}`,
              status: 'CONFIRMED',
              paymentStatus: 'PAID',
              totalAmount: 675000,
              trackingId: `TRK-${Date.now()}`,
              message: 'Mock order confirmed'
            }
          };
          this.clearSession();
          return mockOrder;
        }
        throw new Error(`Order Confirmation API Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        this.clearSession();
      }
      return data;
    } catch (error) {
      console.error('❌ ConfirmOrder error:', error);
      if (process.env.NODE_ENV === 'development') {
        const mockOrder = {
          success: true,
          order: {
            orderNumber: `ORD-${Date.now()}`,
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            totalAmount: 675000,
            trackingId: `TRK-${Date.now()}`,
            message: 'Mock order confirmed'
          }
        };
        this.clearSession();
        return mockOrder;
      }
      throw error;
    }
  }

  // Cancel session and release quantities
  async cancelSession(sessionId) {
    await fetch(`${this.baseURL}/checkout/cancel`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ sessionId })
    });
    this.clearSession();
  }

  clearSession() {
    this.currentSession = null;
    localStorage.removeItem('checkoutSession');
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }
}

export default new CheckoutService();