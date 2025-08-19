import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  } = useCheckoutSession();

  const componentId = useRef(
    window.crypto && window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : Math.random().toString(36).slice(2, 10)
  );

  useEffect(() => {
    // ✅ Fix: Copy ref value to variable to avoid stale closure
    const id = componentId.current;
    console.log(`[CHECKOUT-LIFECYCLE] CheckoutPage-${id} MOUNTED`);

    return () => {
      console.log(`[CHECKOUT-LIFECYCLE] CheckoutPage-${id} UNMOUNTED`);
    };
  }, []);

  useEffect(() => {
    console.log(`[CHECKOUT-LIFECYCLE] CheckoutPage-${componentId.current} cartItems changed:`, cartItems.length);
  }, [cartItems]);

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

  if (loading) {
    return <div>Loading checkout...</div>;
  }

  if (error) {
    return (
      <div>
        <h1>Checkout Error</h1>
        <p>{error}</p>
        <button onClick={() => navigate('/shopper/cart')}>Return to Cart</button>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
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

export default CheckoutPage;