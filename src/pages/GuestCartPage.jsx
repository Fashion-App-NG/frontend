import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { getProductImageUrl } from '../utils/productUtils';

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
      {/* Header - Sticky on Mobile */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center min-w-0">
              <button
                onClick={() => navigate('/browse')}
                className="text-gray-600 hover:text-gray-800 mr-2 sm:mr-4 flex-shrink-0"
              >
                <span className="sm:hidden">←</span>
                <span className="hidden sm:inline">← Back to Shopping</span>
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-semibold text-gray-900 truncate">Shopping Cart</h1>
                <span className="text-xs sm:text-sm text-gray-600">
                  {cartCount} item{cartCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <button
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium"
              >
                Clear
              </button>
              <button
                onClick={handleCheckoutClick}
                className="bg-green-600 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg hover:bg-green-700 font-semibold text-sm sm:text-base"
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800 text-xs sm:text-sm">{error}</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart items */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-4 sm:mb-6">Items in your cart</h2>
                
                <div className="space-y-4 sm:space-y-6">
                  {cartItems.map((item) => {
                    const itemId = item.productId || item.id;
                    const itemQuantity = item.quantity || 1;

                    return (
                      <div key={itemId} className="flex gap-3 sm:gap-4 py-4 sm:py-6 border-b border-gray-200 last:border-b-0">
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
                              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Product details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-2 mb-2">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2">{item.name}</h3>
                              {item.vendorName && (
                                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">by {item.vendorName}</p>
                              )}
                            </div>
                            
                            {/* Remove button - Desktop */}
                            <button
                              onClick={() => handleRemoveItem(itemId, item.name)}
                              className="hidden sm:block p-2 text-red-600 hover:text-red-800 flex-shrink-0"
                              title="Remove item"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>

                          {/* Price per yard */}
                          <p className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                            {formatPrice(getAllInclusivePricePerYard(item))}
                            <span className="text-xs sm:text-sm font-normal text-gray-500 ml-1">per yard</span>
                          </p>

                          {/* ✅ IMPROVED: Better layout for quantity controls and total */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            {/* Quantity controls */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center border border-gray-300 rounded-lg">
                                <button
                                  onClick={() => handleQuantityUpdate(itemId, Math.max(1, itemQuantity - 1))}
                                  disabled={itemQuantity <= 1}
                                  className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                                >
                                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>
                                
                                <span className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-gray-900 font-medium min-w-[2.5rem] text-center">
                                  {itemQuantity}
                                </span>
                                
                                <button
                                  onClick={() => handleQuantityUpdate(itemId, itemQuantity + 1)}
                                  className="p-2 text-gray-600 hover:text-gray-800"
                                >
                                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </button>
                              </div>

                              {/* Mobile remove button - next to quantity */}
                              <button
                                onClick={() => handleRemoveItem(itemId, item.name)}
                                className="sm:hidden p-2 text-red-600 hover:text-red-800 border border-red-200 rounded-lg"
                                title="Remove"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>

                            {/* Item subtotal - better positioned */}
                            <div className="flex items-center justify-between sm:justify-end">
                              <span className="text-xs text-gray-500 sm:hidden">Subtotal:</span>
                              <p className="text-base sm:text-lg font-bold text-gray-900">
                                {formatPrice(getAllInclusiveLineItemTotal(item))}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ✅ SIMPLIFIED: Order summary */}
          <div className="lg:col-span-4 mt-6 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm lg:sticky lg:top-24">
              <div className="p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  {/* Subtotal */}
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">Subtotal ({cartCount} item{cartCount !== 1 ? 's' : ''})</span>
                    <span className="text-gray-900 font-medium">{formatPrice(calculateGrandTotal())}</span>
                  </div>
                  
                  {/* Shipping */}
                  <div className="flex justify-between text-sm sm:text-base pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-600">Calculated at checkout</span>
                  </div>
                  
                  {/* Total */}
                  <div className="flex justify-between text-lg sm:text-xl font-bold pt-2">
                    <span>Total</span>
                    <span>{formatPrice(calculateGrandTotal())}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckoutClick}
                  className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold transition-colors text-sm sm:text-base"
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