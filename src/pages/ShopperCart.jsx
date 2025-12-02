import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../utils/formatPrice';
import { calculateSubtotal } from '../utils/priceCalculations';
import { getProductImageUrl } from '../utils/productUtils';

const ShopperCart = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    cartCount, 
    removeFromCart, 
    updateCartItemQuantity, 
    clearCart, 
    error
  } = useCart();

  if (process.env.NODE_ENV === 'development') {
    console.log('[DEBUG] ShopperCart render: cartItems:', cartItems, 'cartCount:', cartCount);
  }

  // ✅ FIX: Use correct item ID and handle missing IDs
  const handleQuantityUpdate = (itemId, newQuantity) => {
    console.log('🔍 HANDLE QUANTITY UPDATE:', {
      itemId,
      newQuantity,
      currentItem: cartItems.find(item => (item.id === itemId) || (item.productId === itemId)),
      allCartItems: cartItems.map(item => ({ 
        id: item.id, 
        productId: item.productId, 
        quantity: item.quantity 
      }))
    });
    
    updateCartItemQuantity(itemId, newQuantity);
  };

  // Handle item removal
  const handleRemoveItem = (itemId, itemName) => {
    if (window.confirm(`Remove "${itemName}" from your cart?`)) {
      removeFromCart(itemId);
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      await clearCart();
      if (process.env.NODE_ENV === 'development') {
        console.log('[DEBUG] clearCart awaited in button click');
      }
    }
  };

  // ✅ Calculate using API values only - NO recalculation
  // ✅ CORRECTED: taxAmount is already multiplied by quantity in API
  const calculateTaxTotal = () => {
    return cartItems.reduce((total, item) => {
      const taxAmount = item.taxAmount || 0;  // ✅ Already total for quantity
      return total + taxAmount;  // Note: Don't multiply by quantity again!
    }, 0);
  };

  const calculatePlatformFeeTotal = () => {
    return cartItems.reduce((total, item) => {
      const platformFee = item.platformFeeAmount || 0;  // ✅ Already total
      return total + platformFee;
    }, 0);
  };

  // ✅ CORRECTED: Divide taxAmount by quantity to get per-yard amount
  const getAllInclusivePricePerYard = (item) => {
    const basePrice = item.pricePerYard || 0;
    const taxPerYard = (item.taxAmount || 0) / (item.quantity || 1);  // ✅ Divide by quantity!
    const platformFeePerYard = (item.platformFeeAmount || 0) / (item.quantity || 1);
    return basePrice + taxPerYard + platformFeePerYard;
  };

  const getAllInclusiveLineItemTotal = (item) => {
    const quantity = item.quantity || 1;
    return getAllInclusivePricePerYard(item) * quantity;
  };

  const getAllInclusiveSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + getAllInclusiveLineItemTotal(item), 0);
  };

  // ✅ Get tax rate directly from API
  const taxRate = cartItems[0]?.taxRate || 0.02;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/shopper/browse')}
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
            <p className="text-gray-600 mb-8">Add some fabrics to get started</p>
            <Link
              to="/shopper/browse"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error Message */}
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
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-sm text-gray-600 mt-1">
              {cartCount} item{cartCount !== 1 ? 's' : ''} in your cart
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Clear Cart
            </button>
            <Link
              to="/shopper/checkout"
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm sm:text-base"
            >
              Checkout
            </Link>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart items */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-4 sm:mb-6">Items in your cart</h2>
                
                <div className="space-y-4 sm:space-y-6">
                  {cartItems.map((item) => {
                    const itemKey = item.id || item.productId || `item-${item.name?.replace(/\s+/g, '-')}`;
                    const itemId = item.productId || item.id;
                    const itemQuantity = item.quantity || 1;
                    
                    return (
                      <div key={itemKey} className="flex gap-3 sm:gap-4 py-4 sm:py-6 border-b border-gray-200 last:border-b-0">
                        {/* Product Image */}
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

                        {/* Product Info */}
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
                          <p className="text-base sm:text-lg font-bold text-gray-900 mb-3">
                            {formatPrice(getAllInclusivePricePerYard(item))}
                            <span className="text-xs sm:text-sm font-normal text-gray-500 ml-1">per yard</span>
                          </p>

                          {/* Quantity controls and subtotal */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            {/* Quantity controls */}
                            <div className="flex items-center border border-gray-300 rounded-lg w-fit">
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

                            {/* Mobile: Remove button and subtotal stacked */}
                            <div className="sm:hidden flex flex-col gap-2">
                              {/* Remove button */}
                              <button
                                onClick={() => handleRemoveItem(itemId, item.name)}
                                className="flex items-center justify-center gap-2 p-2 text-red-600 hover:text-red-800 border border-red-200 rounded-lg w-full"
                                title="Remove"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span className="text-sm font-medium">Remove</span>
                              </button>

                              {/* Subtotal */}
                              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                                <span className="text-xs font-medium text-gray-600">Subtotal:</span>
                                <span className="text-base font-bold text-gray-900">
                                  {formatPrice(getAllInclusiveLineItemTotal(item))}
                                </span>
                              </div>
                            </div>

                            {/* Desktop: Subtotal only */}
                            <div className="hidden sm:block">
                              <p className="text-base sm:text-lg font-bold text-gray-900 text-right">
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

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-6 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm lg:sticky lg:top-24">
              <div className="p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  {/* Subtotal */}
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">Subtotal ({cartCount} item{cartCount !== 1 ? 's' : ''})</span>
                    <span className="text-gray-900 font-medium">{formatPrice(calculateSubtotal(cartItems))}</span>
                  </div>
                  
                  {/* VAT */}
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">VAT ({(taxRate * 100).toFixed(1)}%)</span>
                    <span className="text-gray-900 font-medium">{formatPrice(calculateTaxTotal())}</span>
                  </div>

                  {/* Platform Fees */}
                  <div className="flex justify-between text-sm sm:text-base pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Platform Fees</span>
                    <span className="text-gray-900 font-medium">{formatPrice(calculatePlatformFeeTotal())}</span>
                  </div>
                  
                  {/* Total */}
                  <div className="flex justify-between text-lg sm:text-xl font-bold pt-2">
                    <span>Total</span>
                    <span>{formatPrice(getAllInclusiveSubtotal())}</span>
                  </div>

                  <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                    * VAT is calculated on product price only. Platform fees are not taxed.
                  </p>
                </div>

                <Link
                  to="/shopper/checkout"
                  className="block w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors text-center text-sm sm:text-base"
                >
                  Proceed to Checkout
                </Link>

                <button
                  onClick={handleClearCart}
                  className="w-full mt-3 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm sm:text-base"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopperCart;