class CheckoutService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL || '';
    this.shippingService = require('./shippingService').default;
  }

  // ✅ FIXED: Update getShopperOrders to use the correct endpoint
  async getShopperOrders(userId, { page = 1, limit = 20, status, paymentStatus } = {}) {
    console.log('🔍 GETTING SHOPPER ORDERS FROM CHECKOUT ENDPOINT:', {
      userId,
      endpoint: `/api/checkout/orders`,
      params: { page, limit, status, paymentStatus }
    });

    // ✅ Use /api/checkout/orders instead of /api/user/{userId}
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (status) params.append('status', status);
    if (paymentStatus) params.append('paymentStatus', paymentStatus);

    const response = await fetch(`${this.baseURL}/api/checkout/orders?${params.toString()}`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to fetch checkout orders');
    
    const data = await response.json();
    
    console.log('🔍 CHECKOUT ORDERS ENDPOINT RESPONSE:', data);
    
    // ✅ FIXED: Return data in expected format (orders at root level)
    return {
      success: data.success,
      orders: data.orders || [],
      pagination: data.pagination || { currentPage: 1, totalPages: 1 }
    };
  }

  // Keep existing method for backward compatibility
  async getOrders({ page = 1, limit = 20, status, paymentStatus } = {}) {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (status) params.append('status', status);
    if (paymentStatus) params.append('paymentStatus', paymentStatus);

    console.log('🔍 CHECKOUT SERVICE getOrders:', {
      endpoint: `/api/checkout/orders`,
      params: Object.fromEntries(params)
    });

    const response = await fetch(`${this.baseURL}/api/checkout/orders?${params.toString()}`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to fetch orders');
    const data = await response.json();
    
    console.log('🔍 CHECKOUT ENDPOINT RESPONSE:', data);
    return data;
  }

  // Always prefix with /api
  async reviewCart() {
    const response = await fetch(`${this.baseURL}/api/checkout/review`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Failed to review cart');
    return response.json();
  }

  async saveShippingInfo(shippingAddress, customerInfo) {
    console.log('Validating address:', shippingAddress);
    const validationResult = await this.shippingService.validateAddress(shippingAddress);
    console.log('Validation result:', validationResult);
    if (!validationResult.success) {
      throw new Error('Invalid address.');
    }

    const response = await fetch(`${this.baseURL}/api/checkout/shipping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ shippingAddress, customerInfo })
    });
    if (!response.ok) throw new Error('Failed to save shipping info');
    return response.json();
  }

  async confirmOrder({ shippingAddress, customerInfo, paymentDetails, reservationDuration }) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 SHOPPER checkout: Using correct working endpoint POST /api/checkout/confirm-step...');
      }
      
      const response = await fetch(`${this.baseURL}/api/checkout/confirm-step`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          shippingAddress,
          customerInfo,
          paymentDetails,
          reservationDuration
        })
      });

      // Extract HTTP status for better error reporting
      const statusCode = response.status;
      
      // Handle HTTP errors like rate limiting (429)
      if (statusCode === 429) {
        const rateLimitError = {
          success: false,
          message: 'Too many requests. Please wait a moment and try again.',
          statusCode: 429
        };
        
        if (process.env.NODE_ENV === 'development') {
          console.error('⚠️ RATE LIMITING DETECTED:', rateLimitError);
        }
        
        throw rateLimitError;
      }
      
      const data = await response.json();
      
      // Add status code to the response object for downstream handling
      data.statusCode = statusCode;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📋 SHOPPER CONFIRM-STEP RESPONSE:', data);
        
        // Log payment specific errors
        if (data.payment && data.payment.error) {
          console.log('⚠️ Payment processing issue:', data.payment.error);
        }
      }
      
      return data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ CONFIRM ORDER ERROR:', error);
      }
      
      // Pass through any structured errors from above
      if (error.statusCode) {
        throw error;
      }
      
      // Handle network/fetch errors
      throw new Error(error.message || 'Failed to confirm order. Please try again.');
    }
  }

  async getOrderById(orderId) {
    const response = await fetch(`${this.baseURL}/api/checkout/orders/${orderId}`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch order');
    return await response.json();
  }

  // ✅ Add this method to verify the actual endpoint behavior
  async verifyCheckoutOrdersEndpoint() {
    console.log('🔍 VERIFYING ACTUAL ENDPOINT BEHAVIOR:');
    
    try {
      // Test 1: Basic call without parameters
      console.log('📋 TEST 1: Basic call without query params');
      const response1 = await fetch(`${this.baseURL}/api/checkout/orders`, {
        headers: this.getAuthHeaders(),
      });
      
      if (response1.ok) {
        const data1 = await response1.json();
        console.log('✅ BASIC CALL RESPONSE:', {
          status: response1.status,
          hasSuccess: 'success' in data1,
          hasMessage: 'message' in data1,
          hasOrders: 'orders' in data1,
          hasData: 'data' in data1,
          hasPagination: 'pagination' in data1,
          responseKeys: Object.keys(data1),
          responseStructure: data1
        });
      } else {
        console.log('❌ BASIC CALL FAILED:', response1.status, response1.statusText);
      }

      // Test 2: Call with query parameters (as per Swagger)
      console.log('📋 TEST 2: Call with query parameters');
      const params = new URLSearchParams({ page: '1', limit: '5' });
      const response2 = await fetch(`${this.baseURL}/api/checkout/orders?${params.toString()}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (response2.ok) {
        const data2 = await response2.json();
        console.log('✅ PARAMS CALL RESPONSE:', {
          status: response2.status,
          hasSuccess: 'success' in data2,
          hasMessage: 'message' in data2,
          hasOrders: 'orders' in data2,
          hasData: 'data' in data2,
          hasPagination: 'pagination' in data2,
          responseKeys: Object.keys(data2),
          responseStructure: data2
        });
      } else {
        console.log('❌ PARAMS CALL FAILED:', response2.status, response2.statusText);
      }

    } catch (error) {
      console.error('❌ ENDPOINT VERIFICATION ERROR:', error);
    }
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    };
  }
}

const checkoutServiceInstance = new CheckoutService();
export default checkoutServiceInstance;
