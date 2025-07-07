import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useCheckoutSession } from '../../hooks/useCheckoutSession';

import CheckoutBreadcrumb from './components/CheckoutBreadcrumb';
import CheckoutNavigation from './components/CheckoutNavigation';
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
    sessionData,
    loading,
    error,
    timeRemaining,
    initializeSession,
    nextStep,
    prevStep,
    goToStep
  } = useCheckoutSession();

  console.log('🔍 CHECKOUT PAGE DEBUG - Component Loading');

  // Redirect if cart is empty
  useEffect(() => {
    console.log('🔍 CHECKOUT PAGE DEBUG - Cart Check:', { cartCount, cartItems });
    if (cartCount === 0) {
      console.log('🔍 CHECKOUT PAGE DEBUG - Redirecting to cart (empty)');
      navigate('/shopper/cart');
    }
  }, [cartCount, navigate]);

  // Initialize checkout session
  useEffect(() => {
    console.log('🔍 CHECKOUT PAGE DEBUG - Session Check:', { 
      cartItemsLength: cartItems.length, 
      sessionData, 
      hasInitializeSession: !!initializeSession 
    });
    if (cartItems.length > 0 && !sessionData) {
      console.log('🔍 CHECKOUT PAGE DEBUG - Calling initializeSession');
      initializeSession();
    }
  }, [cartItems, sessionData, initializeSession]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <CartReviewStep onNext={nextStep} sessionData={sessionData} />;
      case 2:
        return <ShippingInfoStep onNext={nextStep} onBack={prevStep} sessionData={sessionData} />;
      case 3:
        return <PaymentMethodStep onNext={nextStep} onBack={prevStep} sessionData={sessionData} />;
      case 4:
        return <OrderConfirmationStep sessionData={sessionData} />;
      default:
        return <CartReviewStep onNext={nextStep} sessionData={sessionData} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Setting up your checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <CheckoutBreadcrumb currentStep={currentStep} />
        
        {/* Progress Bar */}
        <CheckoutProgressBar currentStep={currentStep} />
        
        {/* Session Timer */}
        {timeRemaining && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm text-center">
              ⏰ Your items are reserved for{' '}
              <span className="font-semibold">
                {Math.floor(timeRemaining / 60000)}:{String(Math.floor((timeRemaining % 60000) / 1000)).padStart(2, '0')}
              </span>{' '}
              minutes
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Checkout Steps */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {renderCurrentStep()}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummaryCard sessionData={sessionData} />
          </div>
        </div>

        {/* Navigation */}
        {currentStep < 4 && (
          <CheckoutNavigation
            currentStep={currentStep}
            onNext={nextStep}
            onBack={prevStep}
            canProceed={sessionData !== null}
          />
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;