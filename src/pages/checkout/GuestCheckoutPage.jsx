import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useGuestCheckoutSession } from '../../hooks/useGuestCheckoutSession';
import CheckoutProgressBar from './components/CheckoutProgressBar';
import OrderSummaryCard from './components/OrderSummaryCard';
import CartReviewStep from './steps/CartReviewStep';
import GuestOrderConfirmationStep from './steps/GuestOrderConfirmationStep';
import GuestShippingInfoStep from './steps/GuestShippingInfoStep';
import PaymentMethodStep from './steps/PaymentMethodStep';

const GuestCheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartCount } = useCart();
  const {
    currentStep,
    loading,
    error,
    cart,
    order,
    reviewCart,
    saveShipping,
    confirmOrder,
    setCurrentStep,
    shippingInfo,
    clearCart,
    loadCart
  } = useGuestCheckoutSession();

  // ✅ Fixed: Use slice() instead of deprecated substr()
  const componentId = useRef(crypto.randomUUID());

  useEffect(() => {
    const id = componentId.current;
    // ✅ Remove in production or wrap in development check
    if (process.env.NODE_ENV === 'development') {
      console.log(`[GUEST-CHECKOUT-LIFECYCLE] GuestCheckoutPage-${id} MOUNTED`);
    }

    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[GUEST-CHECKOUT-LIFECYCLE] GuestCheckoutPage-${id} UNMOUNTED`);
      }
    };
  }, []);

  // ✅ Guest-specific: Redirect to guest cart if empty
  useEffect(() => {
    if (cartCount === 0 && currentStep < 4) {
      navigate('/guest/cart');
    }
  }, [cartCount, cartItems, navigate, currentStep]);

  // On mount, review cart
  useEffect(() => {
    reviewCart();
  }, [reviewCart]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Checkout Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/guest/cart')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Return to Cart
          </button>
        </div>
      </div>
    );
  }

  // ✅ Guest-specific: Confirmation step with post-order registration
  if (currentStep === 4 && order) {
    return (
      <GuestOrderConfirmationStep 
        clearCart={clearCart} 
        loadCart={loadCart} 
        order={order}
        customerInfo={shippingInfo?.customerInfo}
      />
    );
  }

  // All other steps: show step + order summary
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/guest/cart')}
                className="text-gray-600 hover:text-gray-800 mr-4"
              >
                ← Back to Cart
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">Checkout</h1>
            </div>
            <span className="text-sm text-gray-500">Guest Checkout</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CheckoutProgressBar currentStep={currentStep} />
          
          {currentStep === 1 && (
            <CartReviewStep cart={cart} onNext={() => setCurrentStep(2)} />
          )}
          
          {currentStep === 2 && (
            <GuestShippingInfoStep
              onSubmit={(shippingAddress, customerInfo) => saveShipping(shippingAddress, customerInfo)}
              onBack={() => setCurrentStep(1)}
            />
          )}
          
          {currentStep === 3 && (
            <PaymentMethodStep
              onSubmit={({ paymentDetails, reservationDuration }) =>
                confirmOrder(paymentDetails, reservationDuration)
              }
              onBack={() => setCurrentStep(2)}
              shippingAddress={shippingInfo?.shippingAddress}
              customerInfo={shippingInfo?.customerInfo}
              cart={cart}
            />
          )}
        </div>
        
        <div className="lg:col-span-1">
          <OrderSummaryCard cart={cart} order={order} currentStep={currentStep} />
        </div>
      </div>
    </div>
  );
};

export default GuestCheckoutPage;