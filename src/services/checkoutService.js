class CheckoutService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';
    this.currentSession = null;
  }

  // ✅ UPDATED: Real API integration with smart fallback
  async createSession(cartItems) {
    try {
      console.log('🔍 Creating checkout session for items:', cartItems);
      
      const response = await fetch(`${this.baseURL}/checkout/create-session`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ items: cartItems })
      });
      
      console.log('🔍 Checkout API Response Status:', response.status);
      
      // ✅ Check if response is successful
      if (!response.ok) {
        // Log error but provide fallback for development
        console.error('❌ Checkout API Error:', {
          status: response.status,
          statusText: response.statusText
        });
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Using mock checkout session for development');
          return this.getMockSession(cartItems);
        }
        
        throw new Error(`Checkout session creation failed: ${response.status}`);
      }

      // ✅ Validate JSON response
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (process.env.NODE_ENV === 'development') {
          return this.getMockSession(cartItems);
        }
        throw new Error('Invalid response format from checkout API');
      }

      const data = await response.json();
      console.log('✅ Checkout session created:', data);
      
      if (data.success) {
        this.currentSession = data;
        localStorage.setItem('checkoutSession', JSON.stringify(data));
        return data;
      } else {
        throw new Error(data.message || 'Failed to create checkout session');
      }
      
    } catch (error) {
      console.error('❌ CreateSession error:', error);
      
      // ✅ Provide fallback for development
      if (process.env.NODE_ENV === 'development' && !error.message.includes('Failed to create')) {
        console.log('🔧 Falling back to mock session');
        return this.getMockSession(cartItems);
      }
      
      throw error;
    }
  }

  // ✅ UPDATED: Real shipping API integration
  async saveShippingInfo(sessionId, shippingData) {
    try {
      console.log('🔍 Saving shipping info:', { sessionId, shippingData });
      
      const response = await fetch(`${this.baseURL}/checkout/shipping`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ 
          sessionId, 
          shippingAddress: {
            street: shippingData.street,
            city: shippingData.city,
            state: shippingData.state,
            zipCode: shippingData.postalCode,
            country: 'Nigeria' // Default for Nigerian fashion app
          },
          customerInfo: {
            name: shippingData.customerName || 'Customer',
            email: shippingData.email || '',
            phone: shippingData.phone
          }
        })
      });

      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Mock shipping info saved');
          return { success: true, message: 'Shipping info saved (mock)' };
        }
        throw new Error(`Shipping API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Shipping info saved:', data);
      return data;
      
    } catch (error) {
      console.error('❌ SaveShippingInfo error:', error);
      if (process.env.NODE_ENV === 'development') {
        return { success: true, message: 'Shipping info saved (mock)' };
      }
      throw error;
    }
  }

  // ✅ UPDATED: Real payment method API integration
  async setPaymentMethod(sessionId, paymentMethod) {
    try {
      console.log('🔍 Setting payment method:', { sessionId, paymentMethod });
      
      const response = await fetch(`${this.baseURL}/checkout/payment-method`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ sessionId, paymentMethod })
      });

      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Mock payment method set');
          return { success: true, message: 'Payment method set (mock)' };
        }
        throw new Error(`Payment Method API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Payment method set:', data);
      return data;
      
    } catch (error) {
      console.error('❌ SetPaymentMethod error:', error);
      if (process.env.NODE_ENV === 'development') {
        return { success: true, message: 'Payment method set (mock)' };
      }
      throw error;
    }
  }

  // ✅ UPDATED: Real order confirmation API integration
  async confirmOrder(sessionId, paymentReference, sessionData) {
    try {
      console.log('🔍 Confirming order with inventory update tracking:', { 
        sessionId, 
        paymentReference 
      });
      
      const response = await fetch(`${this.baseURL}/checkout/confirm`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ 
          sessionId, 
          paymentReference,
          updateInventory: true // ✅ Explicitly request inventory update
        })
      });

      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          const mockOrder = this.getMockOrder(paymentReference, sessionData);
          this.clearSession();
          return mockOrder;
        }
        throw new Error(`Order Confirmation API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Order confirmed with inventory updates:', {
        order: data.order,
        inventoryUpdates: data.inventoryUpdates,
        updatedProducts: data.updatedProducts
      });
      
      if (data.success) {
        this.clearSession();
      }
      return data;
      
    } catch (error) {
      console.error('❌ ConfirmOrder error:', error);
      if (process.env.NODE_ENV === 'development') {
        const mockOrder = this.getMockOrder(paymentReference, sessionData);
        this.clearSession();
        return mockOrder;
      }
      throw error;
    }
  }

  // ✅ NEW: Cancel checkout session
  async cancelSession(sessionId) {
    try {
      console.log('🔍 Canceling session:', sessionId);
      
      if (sessionId.includes('mock')) {
        console.log('🔧 Mock session canceled');
        this.clearSession();
        return { success: true, message: 'Session canceled (mock)' };
      }
      
      const response = await fetch(`${this.baseURL}/checkout/cancel`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ sessionId })
      });

      if (!response.ok) {
        console.warn('⚠️ Cancel session API error:', response.status);
        // Don't throw error for cancel operations
      }

      this.clearSession();
      return { success: true, message: 'Session canceled' };
      
    } catch (error) {
      console.error('❌ CancelSession error:', error);
      this.clearSession(); // Clear local session anyway
      return { success: true, message: 'Session canceled locally' };
    }
  }

  // ✅ NEW: Get order details
  async getOrder(orderId) {
    try {
      console.log('🔍 Getting order:', orderId);
      
      const response = await fetch(`${this.baseURL}/order/${orderId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          return this.getMockOrderDetails(orderId);
        }
        throw new Error(`Order API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Order details:', data);
      return data;
      
    } catch (error) {
      console.error('❌ GetOrder error:', error);
      if (process.env.NODE_ENV === 'development') {
        return this.getMockOrderDetails(orderId);
      }
      throw error;
    }
  }

  // ✅ UPDATED: Enhanced mock session
  getMockSession(cartItems) {
    const mockSession = {
      success: true,
      sessionId: `mock_session_${Date.now()}`,
      reservedItems: cartItems.map(item => ({
        ...item,
        reservedQuantity: item.quantity,
        reservedAt: new Date().toISOString()
      })),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      totalAmount: cartItems.reduce((sum, item) => sum + (item.pricePerYard * item.quantity), 0),
      message: 'Mock session created for development'
    };
    
    this.currentSession = mockSession;
    localStorage.setItem('checkoutSession', JSON.stringify(mockSession));
    console.log('🔧 Mock session created:', mockSession);
    return mockSession;
  }

  // ✅ NEW: Mock order for development
  getMockOrder(paymentReference, sessionData) {
    // Calculate from sessionData if available
    const items = sessionData?.reservedItems || [];
    const subtotal = items.reduce((sum, item) => sum + ((item.pricePerYard || item.price || 0) * (item.quantity || 1)), 0);
    const deliveryFee = 3000;
    const tax = Math.round(subtotal * 0.075);
    const totalAmount = subtotal + deliveryFee + tax;

    return {
      success: true,
      order: {
        orderNumber: `ORD-${Date.now()}`,
        orderId: `order_${Date.now()}`,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        paymentReference: paymentReference,
        subtotal,
        deliveryFee,
        tax,
        totalAmount,
        trackingId: `TRK-${Date.now()}`,
        orderDate: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        items,
        shippingAddress: {
          street: "123 Mock Street",
          city: "Lagos",
          state: "Lagos",
          zipCode: "100001",
          country: "Nigeria"
        },
        customerInfo: {
          name: "Mock Customer",
          email: "customer@example.com",
          phone: "+2341234567890"
        },
        message: 'Mock order confirmed for development'
      }
    };
  }

  // ✅ NEW: Mock order details
  getMockOrderDetails(orderId) {
    return {
      success: true,
      order: {
        orderId: orderId,
        orderNumber: `ORD-${orderId.slice(-8)}`,
        status: 'PROCESSING',
        paymentStatus: 'PAID',
        totalAmount: 675000,
        trackingId: `TRK-${orderId.slice(-8)}`,
        orderDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        items: [
          {
            productId: "mock_product_1",
            name: "Mock Fabric Sample",
            pricePerYard: 25000,
            quantity: 3,
            image: "/api/placeholder/150/150"
          }
        ],
        shippingAddress: {
          street: "123 Mock Street",
          city: "Lagos", 
          state: "Lagos",
          zipCode: "100001",
          country: "Nigeria"
        },
        statusHistory: [
          { status: 'PENDING', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
          { status: 'CONFIRMED', timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString() },
          { status: 'PROCESSING', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() }
        ]
      }
    };
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

// ✅ Assign to variable before exporting
const checkoutServiceInstance = new CheckoutService();
export default checkoutServiceInstance;