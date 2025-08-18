import { Link, useNavigate } from 'react-router-dom'; // ✅ Remove unused useEffect
import { useCart } from '../contexts/CartContext';
import { getProductImageUrl } from '../utils/productUtils';

const GuestCartPage = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    cartCount, 
    removeFromCart, 
    updateCartItemQuantity, 
    clearCart, 
    getCartTotal,
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
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Shopping Cart</h1>
                <span className="text-sm text-gray-600">
                  {cartCount} item{cartCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            {/* Cart actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Clear Cart
              </button>
              <button
                onClick={() => navigate('/guest/checkout')}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold"
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
                      <div key={itemId} className="flex items-center py-6 border-b border-gray-200 last:border-b-0">
                        {/* Product image */}
                        <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                          {item.images && item.images.length > 0 ? (
                            <img
                              src={getProductImageUrl(item.images[0])}
                              alt={item.name}
                              className="w-full h-full object-cover"
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
                        <div className="ml-6 flex-1">
                          <div className="flex justify-between">
                            <div className="pr-6">
                              <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                              {item.vendorName && (
                                <p className="text-sm text-gray-600">by {item.vendorName}</p>
                              )}
                              <p className="text-lg font-semibold text-gray-900 mt-1">
                                {formatPrice(itemPrice)} per yard
                              </p>
                            </div>
                            
                            {/* Quantity and remove */}
                            <div className="flex items-center">
                              {/* Quantity controls */}
                              <div className="flex items-center border border-gray-300 rounded-lg">
                                <button
                                  onClick={() => handleQuantityUpdate(itemId, Math.max(1, itemQuantity - 1))}
                                  disabled={itemQuantity <= 1}
                                  className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>
                                
                                <span className="px-4 py-2 text-gray-900 font-medium min-w-[3rem] text-center">
                                  {itemQuantity}
                                </span>
                                
                                <button
                                  onClick={() => handleQuantityUpdate(itemId, itemQuantity + 1)}
                                  className="p-2 text-gray-600 hover:text-gray-800"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </button>
                              </div>

                              {/* Remove button */}
                              <button
                                onClick={() => handleRemoveItem(itemId, item.name)}
                                className="ml-4 p-2 text-red-600 hover:text-red-800"
                                title="Remove item"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Item total */}
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              Subtotal: {formatPrice(itemPrice * itemQuantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm sticky top-4">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items ({cartCount})</span>
                    <span className="text-gray-900">{formatPrice(getCartTotal())}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">Calculated at checkout</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(getCartTotal())}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/guest/checkout')}
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
    </div>
  );
};

export default GuestCartPage;