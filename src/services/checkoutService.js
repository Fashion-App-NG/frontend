class CheckoutService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL || '';
    this.shippingService = require('./shippingService').default;
  }

  // 🔍 DEBUGGING: Add method to get shopper orders from correct endpoint
  async getShopperOrders(userId, { page = 1, limit = 20, status, paymentStatus } = {}) {
    console.log('🔍 GETTING SHOPPER ORDERS FROM USER ENDPOINT:', {
      userId,
      endpoint: `/api/user/${userId}`,
      params: { page, limit, status, paymentStatus }
    });

    const response = await fetch(`${this.baseURL}/api/user/${userId}`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to fetch user orders');
    
    const data = await response.json();
    
    console.log('🔍 USER ENDPOINT RESPONSE:', data);
    
    // Transform the response to match expected structure
    return {
      orders: data.user?.orders || [],
      pagination: { currentPage: 1, totalPages: 1 }, // Add pagination if backend provides it
      success: data.success
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
    console.log('🔄 CHECKOUT CONFIRM ORDER DEBUG:', {
      endpoint: `${this.baseURL}/api/checkout/confirm-step`,
      paymentDetails,
      shippingAddress,
      customerInfo,
      reservationDuration,
      timestamp: new Date().toISOString()
    });

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

    if (!response.ok) {
      console.error('❌ CHECKOUT CONFIRM FAILED:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      throw new Error('Failed to confirm order');
    }

    const data = await response.json();
    
    console.log('📋 CHECKOUT CONFIRM RESPONSE:', {
      success: data.success,
      orderCreated: !!data.order,
      orderStatus: data.order?.status,
      paymentStatus: data.order?.paymentStatus,
      expectedPaymentStatus: 'PAID',
      actualPaymentStatus: data.order?.paymentStatus,
      paymentStatusMatch: data.order?.paymentStatus === 'PAID',
      fullResponse: data
    });

    return data;
  }

  async getOrderById(orderId) {
    const response = await fetch(`${this.baseURL}/api/checkout/orders/${orderId}`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch order');
    return await response.json();
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
