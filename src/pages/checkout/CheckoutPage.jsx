import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CART_TOTAL_TOLERANCE } from '../../constants/cart';
import { useCart } from '../../contexts/CartContext';
import { useCheckoutSession } from '../../hooks/useCheckoutSession';

import CheckoutProgressBar from './components/CheckoutProgressBar';
import OrderSummaryCard from './components/OrderSummaryCard';
import CartReviewStep from './steps/CartReviewStep';
import OrderConfirmationStep from './steps/OrderConfirmationStep';
import PaymentMethodStep from './steps/PaymentMethodStep';
import ShippingInfoStep from './steps/ShippingInfoStep';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartCount, getCartTotal } = useCart();
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
    loadCart,
    paymentError,
    clearPaymentError,
    isProcessingPayment
  } = useCheckoutSession();

  // Generate a stable ID for component lifecycle tracking
  const componentId = useRef(
    window.crypto && window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : Math.random().toString(36).slice(2, 10)
  );

  // Component lifecycle logging - only in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const id = componentId.current;
      console.log(`[CHECKOUT-LIFECYCLE] CheckoutPage-${id} MOUNTED`);
      return () => {
        console.log(`[CHECKOUT-LIFECYCLE] CheckoutPage-${id} UNMOUNTED`);
      };
    }
  }, []);

  // Cart change logging - only in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[CHECKOUT-LIFECYCLE] CheckoutPage-${componentId.current} cartItems changed:`, cartItems.length);
    }
  }, [cartItems]);

  // Debug payment error state - only in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && paymentError) {
      console.log(`[CHECKOUT-ERROR] Payment error in parent:`, paymentError);
    }
  }, [paymentError]);

  // Redirect if cart is empty (but NOT on confirmation step)
  useEffect(() => {
    if (cartCount === 0 && currentStep < 4) {
      navigate('/shopper/cart');
    }
  }, [cartCount, cartItems, navigate, currentStep]);

  // On mount, review cart
  useEffect(() => {
    reviewCart();
  }, [reviewCart]);

  // Verify that UI and API totals match
  useEffect(() => {
    const uiTotal = getCartTotal();
    const apiTotal = cart?.totalAmount || 0;
    
    if (Math.abs(uiTotal - apiTotal) > CART_TOTAL_TOLERANCE) {
      console.warn('Cart total mismatch detected!', {
        uiCalculated: uiTotal,
        apiValue: apiTotal,
        difference: uiTotal - apiTotal
      });
    }
  }, [cart, getCartTotal]);

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
            onClick={() => navigate('/shopper/cart')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Return to Cart
          </button>
        </div>
      </div>
    );
  }

  // Confirmation step: show only confirmation
  if (currentStep === 4 && order) {
    return <OrderConfirmationStep clearCart={clearCart} loadCart={loadCart} order={order} />;
  }

  // All other steps: show step + order summary
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="sm:hidden bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate('/shopper/cart')}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Checkout</h1>
          <div className="w-8" /> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8">
            <CheckoutProgressBar currentStep={currentStep} />
            
            {currentStep === 1 && (
              <CartReviewStep cart={cart} onNext={() => setCurrentStep(2)} />
            )}
            {currentStep === 2 && (
              <ShippingInfoStep
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
                cart={shippingInfo?.cart || cart}
                paymentError={paymentError}
                clearPaymentError={clearPaymentError}
                isProcessingPayment={isProcessingPayment}
              />
            )}
          </div>
          
          {/* Order Summary - Hidden on mobile during review, shown as sticky card */}
          <div className="hidden lg:block lg:col-span-4">
            <OrderSummaryCard
              cart={currentStep === 3 && shippingInfo?.cart ? shippingInfo.cart : cart}
              order={order}
              currentStep={currentStep}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;