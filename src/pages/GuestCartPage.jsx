import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { getProductImageUrl } from '../utils/productUtils';

// ✅ EXTRACT: Move to constants file
const DEFAULT_TAX_RATE = 0.075; // 7.5% VAT

const GuestCartPage = () => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const { 
    cartItems, 
    cartCount, 
    removeFromCart, 
    updateCartItemQuantity, 
    clearCart, 
    error,
    isLoading
  } = useCart();

  // Format price utility
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price || 0);
  };

  // ✅ ADD: Calculate tax total (reusing ShopperCart logic)
  const calculateTaxTotal = () => {
    return cartItems.reduce((total, item) => {
      const taxAmount = item.taxAmount || 0;
      return total + taxAmount;
    }, 0);
  };

  // ✅ ADD: Calculate platform fee total (reusing ShopperCart logic)
  const calculatePlatformFeeTotal = () => {
    return cartItems.reduce((total, item) => {
      const platformFee = item.platformFeeAmount || 0;
      return total + platformFee;
    }, 0);
  };

  // ✅ ADD: Calculate base subtotal (products only, no fees)
  const calculateBaseSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const basePrice = item.pricePerYard || item.price || 0;
      const quantity = item.quantity || 1;
      return total + (basePrice * quantity);
    }, 0);
  };

  // ✅ ADD: Get all-inclusive price per yard (reusing ShopperCart logic)
  const getAllInclusivePricePerYard = (item) => {
    const basePrice = item.pricePerYard || 0;
    const taxPerYard = (item.taxAmount || 0) / (item.quantity || 1);
    const platformFeePerYard = (item.platformFeeAmount || 0) / (item.quantity || 1);
    return basePrice + taxPerYard + platformFeePerYard;
  };

  // ✅ ADD: Get line item total (reusing ShopperCart logic)
  const getAllInclusiveLineItemTotal = (item) => {
    const quantity = item.quantity || 1;
    return getAllInclusivePricePerYard(item) * quantity;
  };

  // ✅ ADD: Calculate grand total
  const calculateGrandTotal = () => {
    return calculateBaseSubtotal() + calculateTaxTotal() + calculatePlatformFeeTotal();
  };

  // ✅ Get tax rate from first item
  const taxRate = (cartItems && cartItems.length > 0) 
    ? (cartItems[0]?.taxRate || DEFAULT_TAX_RATE) 
    : DEFAULT_TAX_RATE;

  // Handle quantity updates
  const handleQuantityUpdate = (itemId, newQuantity) => {
    console.log('🔍 Guest cart quantity update:', { itemId, newQuantity });
    updateCartItemQuantity(itemId, newQuantity);
  };

  // Handle item removal
  const handleRemoveItem = (itemId, itemName) => {
    if (window.confirm(`Remove "${itemName}" from your cart?`)) {
      removeFromCart(itemId);
    }
  };

  // Handle clear cart
  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      clearCart();
    }
  };

  // ✅ NEW: Handle checkout click with auth gate
  const handleCheckoutClick = () => {
    setShowAuthModal(true);
  };

  // ✅ NEW: Handle auth modal actions
  const handleLogin = () => {
    const guestToken = localStorage.getItem('guestSessionToken');
    const guestId = localStorage.getItem('guestSessionId');
    
    // ✅ Wrap debug logging in development check
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 PRE-LOGIN STATE:', {
        hasGuestToken: !!guestToken,
        guestToken: guestToken?.substring(0, 50) + '...',
        hasGuestId: !!guestId,
        guestId: guestId,
        cartItemsCount: cartItems.length,
        cartItems: cartItems.map(item => ({
          id: item.productId || item.id,
          name: item.name,
          quantity: item.quantity
        }))
      });
    }
    
    if (!guestToken) {
      console.warn('⚠️ No guest session token found - cart may not merge');
    }
    
    sessionStorage.setItem('redirectAfterLogin', '/shopper/cart');
    sessionStorage.setItem('cartBeforeAuth', JSON.stringify(cartItems));
    navigate('/login/shopper');
  };

  const handleRegister = () => {
    const guestToken = localStorage.getItem('guestSessionToken');
    
    if (guestToken) {
      console.log('💾 Guest session token saved for merge:', guestToken);
    }
    
    // ✅ CHANGE: Redirect to cart, not checkout
    sessionStorage.setItem('redirectAfterLogin', '/shopper/cart'); // Changed from '/shopper/checkout'
    sessionStorage.setItem('cartBeforeAuth', JSON.stringify(cartItems));
    navigate('/register/shopper');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/browse')}
                  className="text-gray-600 hover:text-gray-800 mr-4"
                >
                  ← Back to Shopping
                </button>
                <h1 className="text-2xl font-semibold text-gray-900">Shopping Cart</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Empty cart content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Browse our fabric collection and add items to get started</p>
            <Link
              to="/browse"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Made Sticky */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/browse')}
                className="text-gray-600 hover:text-gray-800 mr-3 sm:mr-4 flex items-center"
              >
                <span className="text-xl sm:hidden">←</span>
                <span className="hidden sm:inline">← Back to Shopping</span>
              </button>
              <div>
                <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">Shopping Cart</h1>
                <span className="text-xs sm:text-sm text-gray-600">
                  {cartCount} item{cartCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium"
              >
                Clear <span className="hidden sm:inline">Cart</span>
              </button>
              <button
                onClick={handleCheckoutClick}
                className="hidden sm:block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart items */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Items in your cart</h2>
                
                <div className="space-y-6">
                  {cartItems.map((item) => {
                    const itemId = item.productId || item.id;
                    const itemPrice = item.pricePerYard || item.price || 0;
                    const itemQuantity = item.quantity || 1;

                    return (
                      <div key={itemId} className="flex flex-col sm:flex-row sm:items-center py-4 sm:py-6 border-b border-gray-200 last:border-b-0 bg-white">
                        <div className="flex items-start w-full">
                          {/* Product image */}
                          <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden">
                            {item.image ? (
                              <img
                                src={getProductImageUrl(item)}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={e => { e.target.src = '/images/default-product.jpg'; }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Product details */}
                          <div className="ml-4 sm:ml-6 flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div className="pr-2 sm:pr-6">
                                <h3 className="text-base sm:text-lg font-medium text-gray-900 line-clamp-2">{item.name}</h3>
                                {item.vendorName && (
                                  <p className="text-xs sm:text-sm text-gray-600">by {item.vendorName}</p>
                                )}
                                
                                {/* ✅ UPDATED: Compact Price Display */}
                                <div className="mt-1">
                                  <p className="text-base font-bold text-gray-900">
                                    {formatPrice(getAllInclusivePricePerYard(item))}
                                    <span className="text-xs font-normal text-gray-500 ml-1">/ yard</span>
                                  </p>

                                  {/* Collapsible Breakdown */}
                                  <details className="group mt-1">
                                    <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 list-none flex items-center gap-1 select-none">
                                      <span>View breakdown</span>
                                      <svg className="w-3 h-3 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </summary>
                                    <div className="mt-1 pl-2 border-l-2 border-gray-100 space-y-0.5 text-xs text-gray-500">
                                      <p>Base: {formatPrice(itemPrice)}</p>
                                      {item.taxAmount > 0 && (
                                        <p>VAT: {formatPrice((item.taxAmount || 0) / itemQuantity)}</p>
                                      )}
                                      {item.platformFeeAmount > 0 && (
                                        <p>Fee: {formatPrice((item.platformFeeAmount || 0) / itemQuantity)}</p>
                                      )}
                                    </div>
                                  </details>
                                </div>
                              </div>
                              
                              {/* Mobile Remove Button (Top Right) */}
                              <button
                                onClick={() => handleRemoveItem(itemId, item.name)}
                                className="sm:hidden p-1.5 -mr-2 text-gray-400 hover:text-red-600"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Quantity and Subtotal Row */}
                        <div className="mt-4 sm:mt-0 flex items-center justify-between w-full sm:w-auto sm:ml-6">
                           {/* Quantity controls */}
                           <div className="flex items-center border border-gray-300 rounded-lg h-9">
                                <button
                                  onClick={() => handleQuantityUpdate(itemId, Math.max(1, itemQuantity - 1))}
                                  disabled={itemQuantity <= 1}
                                  className="px-3 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed h-full flex items-center"
                                >
                                  −
                                </button>
                                
                                <span className="px-2 text-gray-900 font-medium min-w-[2rem] text-center text-sm">
                                  {itemQuantity}
                                </span>
                                
                                <button
                                  onClick={() => handleQuantityUpdate(itemId, itemQuantity + 1)}
                                  className="px-3 text-gray-600 hover:text-gray-800 h-full flex items-center"
                                >
                                  +
                                </button>
                              </div>

                              {/* Desktop Remove Button */}
                              <button
                                onClick={() => handleRemoveItem(itemId, item.name)}
                                className="hidden sm:block ml-4 p-2 text-red-600 hover:text-red-800"
                                title="Remove item"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>

                              {/* Mobile Subtotal */}
                              <div className="sm:hidden text-right">
                                <p className="text-sm font-medium text-gray-900">
                                  {formatPrice(getAllInclusiveLineItemTotal(item))}
                                </p>
                              </div>
                        </div>

                        {/* Desktop Subtotal */}
                        <div className="hidden sm:block mt-3 pt-3 border-t border-gray-100 w-full">
                            <p className="text-sm font-medium text-gray-900">
                              Item Subtotal: {formatPrice(getAllInclusiveLineItemTotal(item))}
                            </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ✅ UPDATED: Order summary with detailed breakdown */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm sticky top-4">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  {/* Subtotal (base prices only) */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({cartCount} item{cartCount !== 1 ? 's' : ''})</span>
                    <span className="text-gray-900">{formatPrice(calculateBaseSubtotal())}</span>
                  </div>
                  
                  {/* VAT */}
                  {calculateTaxTotal() > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">VAT ({(taxRate * 100).toFixed(1)}%)</span>
                      <span className="text-gray-900">{formatPrice(calculateTaxTotal())}</span>
                    </div>
                  )}
                  
                  {/* Platform Fees */}
                  {calculatePlatformFeeTotal() > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Platform Fees</span>
                      <span className="text-gray-900">{formatPrice(calculatePlatformFeeTotal())}</span>
                    </div>
                  )}
                  
                  {/* Shipping */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-600">Calculated at checkout</span>
                  </div>
                  
                  {/* Total */}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(calculateGrandTotal())}</span>
                    </div>
                  </div>

                  {/* ✅ Tax note */}
                  <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                    * VAT is calculated on product price only. Platform fees are not taxed.
                  </p>
                </div>

                <button
                  onClick={handleCheckoutClick}
                  className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold transition-colors"
                >
                  Proceed to Checkout
                </button>

                <Link
                  to="/browse"
                  className="block text-center text-blue-600 hover:text-blue-800 mt-4 text-sm font-medium"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ FIXED: Elegant Auth Modal */}
      {showAuthModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowAuthModal(false);
          }}
        >
          {/* ✅ ADD THIS WRAPPER DIV */}
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
            {/* Close button */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Close authentication modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Icon */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 id="auth-modal-title" className="text-2xl font-bold text-gray-900 mb-2">
                Ready to checkout?
              </h3>
              <p className="text-gray-600">
                Sign in to complete your purchase securely
              </p>
            </div>

            {/* Benefits */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Secure payment processing</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Track your order in real-time</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Save addresses for faster checkout</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={handleLogin}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In to Continue
              </button>
              
              <button
                onClick={handleRegister}
                className="w-full bg-white text-blue-600 py-3 rounded-lg border-2 border-blue-600 hover:bg-blue-50 font-semibold transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Create Account
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-6">
              Your cart will be saved and ready after you sign in
            </p>
          </div>
          {/* ✅ END OF WRAPPER DIV */}
        </div>
      )}
    </div>
  );
};

export default GuestCartPage;