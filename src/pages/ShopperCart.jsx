import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../utils/formatPrice';
import { calculateSubtotal, getPlatformFee } from '../utils/priceCalculations';
import { getProductImageUrl } from '../utils/productUtils';

const ShopperCart = () => {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some fabrics to get started</p>
          <Link
            to="/shopper/browse"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Shopping Cart</h1>
        <span className="text-sm text-gray-600">{cartCount} item{cartCount !== 1 ? 's' : ''}</span>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200">
          {cartItems.map((item) => {
            const itemKey = item.id || item.productId || `item-${item.name?.replace(/\s+/g, '-')}`;
            const itemId = item.productId || item.id;
            
            return (
              <div key={itemKey} className="p-6 flex items-center space-x-4">
                {/* Product Image */}
                <div className="flex-shrink-0 w-20 h-20">
                  {item.image ? (
                    <img
                      src={getProductImageUrl(item)}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      onError={e => { e.target.src = '/images/default-product.jpg'; }}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                  {item.vendorName && (
                    <p className="text-sm text-gray-600">by {item.vendorName}</p>
                  )}
                  <p className="text-lg font-semibold text-blue-600 mt-1">
                    {formatPrice(getAllInclusivePricePerYard(item))} per yard
                    <span className="text-xs text-gray-500 ml-1">(incl. fees & tax)</span>
                  </p>

                  {/* Price Breakdown */}
                  <div className="mt-1 text-sm text-gray-500">
                    Base: {formatPrice(item.pricePerYard)}
                    <span className="mx-1">+</span>
                    Tax: {formatPrice(item.taxAmount || 0)}
                    <span className="mx-1">+</span>
                    Fee: {formatPrice(getPlatformFee(item))}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityUpdate(itemId, Math.max(1, (item.quantity || 1) - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    disabled={(item.quantity || 1) <= 1}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-lg font-medium w-8 text-center">{item.quantity || 1}</span>
                  <button
                    onClick={() => handleQuantityUpdate(itemId, (item.quantity || 1) + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    {formatPrice(getAllInclusiveLineItemTotal(item))}
                  </p>
                  <button
                    onClick={() => removeFromCart(itemId)}
                    className="text-sm text-red-600 hover:text-red-700 mt-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cart Summary */}
        <div className="bg-gray-50 px-6 py-4">
          <div className="flex justify-between py-2">
            <span>Subtotal:</span>
            <span>{formatPrice(calculateSubtotal(cartItems))}</span>
          </div>
          <div className="flex justify-between py-2">
            <span>VAT ({(taxRate * 100).toFixed(1)}%):</span>
            <span>{formatPrice(calculateTaxTotal())}</span>
          </div>
          <div className="flex justify-between py-2">
            <span>Platform Fees:</span>
            <span>{formatPrice(calculatePlatformFeeTotal())}</span>
          </div>
          <div className="flex justify-between py-2 font-bold">
            <span>Total:</span>
            <span>{formatPrice(getAllInclusiveSubtotal())}</span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            * VAT is calculated on product price only. Platform fees are not taxed.
          </div>

          <div className="flex space-x-4 mt-4">
            <button
              onClick={async () => {
                await clearCart();
                if (process.env.NODE_ENV === 'development') {
                  console.log('[DEBUG] clearCart awaited in button click');
                }
              }}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear Cart
            </button>
            <Link
              to="/shopper/checkout"
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopperCart;