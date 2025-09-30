import { CreditCard, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PaystackButton } from 'react-paystack';
import { PAYSTACK_CONFIG, formatAmountForPaystack } from '../../../config/paystack';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../contexts/CartContext';
import { useTax } from '../../../contexts/TaxContext';
import { formatPrice } from '../../../utils/formatPrice';
import { getAllInclusiveSubtotal } from '../../../utils/priceCalculations';

const PaymentMethodStep = ({ 
  onSubmit, 
  onBack, 
  shippingAddress, 
  customerInfo, 
  cart,
  paymentError: paymentErrorProp,
  clearPaymentError,
  isProcessingPayment: isProcessingPaymentProp
}) => {
  // Only log in development environment
  if (process.env.NODE_ENV === 'development') {
    console.log('Dev - [PAGE] PaymentMethodStep rendered');
  }

  // Component mount/unmount debugging - only in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("PaymentMethodStep mounted with ID:", Math.random());
      return () => console.log("PaymentMethodStep unmounted");
    }
  }, []);

  const { user } = useAuth();
  const { cartItems } = useCart();
  const { taxRate } = useTax();
  
  // Use all-inclusive subtotal calculation
  const subtotal = getAllInclusiveSubtotal(cartItems, taxRate);
  
  // Calculate delivery fee
  const deliveryFee = cart?.shippingCost || 3000;
  
  // Calculate total (tax is already included in subtotal)
  const total = subtotal + deliveryFee;

  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [paymentError, setPaymentError] = useState(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    billingAddress: {
      sameAsDelivery: true,
      phone: '',
      address: '',
      city: '',
      state: ''
    }
  });

  // Sync parent error state to local state
  useEffect(() => {
    if (paymentErrorProp) {
      setPaymentError(paymentErrorProp);
    }
  }, [paymentErrorProp]);

  // Sync parent processing state if provided
  useEffect(() => {
    if (isProcessingPaymentProp !== undefined) {
      setProcessingPayment(isProcessingPaymentProp);
    }
  }, [isProcessingPaymentProp]);

  // Error debug logging - only in development
  useEffect(() => {
    if (paymentError && process.env.NODE_ENV === 'development') {
      console.log('[DEBUG-ERROR] Payment error state set:', {
        message: paymentError,
        timestamp: new Date().toISOString(),
        renderingComponent: 'PaymentMethodStep',
        sourceFromProp: paymentError === paymentErrorProp
      });
      
      // Check DOM rendering
      setTimeout(() => {
        const errorElement = document.querySelector('.payment-error-message');
        console.log('[DEBUG-ERROR] Error element in DOM:', {
          exists: !!errorElement,
          visible: errorElement ? window.getComputedStyle(errorElement).display !== 'none' : false,
          text: errorElement?.textContent
        });
      }, 0);
    }
  }, [paymentError, paymentErrorProp]);

  // Format payment error message for production
  const formatErrorForDisplay = (error) => {
    if (!error) return '';
    
    // Common technical errors that need user-friendly messages
    const errorMap = {
      'Payment reference is required': 'We couldn\'t process your payment. Please try again.',
      'Payment amount does not match expected amount': 'There was a price discrepancy. Please refresh and try again.',
      'Invalid transaction reference': 'Payment verification failed. Please try a different payment method.',
      'Too many requests': 'Please wait a moment before trying again.',
      'Invalid card': 'Your card was declined. Please try another card or payment method.'
    };

    // Check if the error message contains any of our mapped errors
    for (const [technical, friendly] of Object.entries(errorMap)) {
      if (error.includes(technical)) {
        return friendly;
      }
    }

    // Default user-friendly message if we don't have a specific mapping
    return 'There was an issue processing your payment. Please try again.';
  };

  // Paystack configuration
  const paystackProps = {
    email: customerInfo?.email || user?.email || 'customer@example.com',
    amount: formatAmountForPaystack(total),
    currency: PAYSTACK_CONFIG.currency,
    publicKey: PAYSTACK_CONFIG.publicKey,
    text: `Pay ${formatPrice(total)}`, // This will now use the imported formatPrice
    channels: PAYSTACK_CONFIG.channels,
    metadata: {
      customerName: customerInfo?.name,
      customerPhone: customerInfo?.phone,
      orderAmount: total,
      itemCount: cart?.items?.length || 0,
      custom_fields: [
        {
          display_name: "Fashion App Order",
          variable_name: "order_type",
          value: "fashion_checkout"
        }
      ]
    },
    onSuccess: handlePaymentSuccess,
    onClose: handlePaymentClose,
  };

  // Handle successful payment
  async function handlePaymentSuccess(reference) {
    if (orderConfirmed) return;
    setOrderConfirmed(true);
    setProcessingPayment(true);
    
    // Clear any previous errors when starting new payment
    setPaymentError(null);
    if (clearPaymentError) clearPaymentError();

    try {
      // Log payment details in development only
      if (process.env.NODE_ENV === 'development') {
        console.log('💳 PAYMENT SUCCESS DEBUG:', {
          reference: reference.reference,
          timestamp: new Date().toISOString(),
          paymentDetails: reference,
        });
      }

      const orderResponse = await onSubmit({
        paymentDetails: { 
          reference: reference.reference,
          status: 'success',
          amount: reference.amount,
          channel: reference.channel,
          paid_at: reference.paid_at,
          created_at: reference.created_at
        },
        reservationDuration: 30
      });

      // Log order response in development only
      if (process.env.NODE_ENV === 'development') {
        console.log('📋 ORDER CREATION RESPONSE:', orderResponse);
      }

      // Success handling
      if (orderResponse && orderResponse.success && orderResponse.order) {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ ORDER CONFIRMED');
        }
        // Navigation or success handling happens in the parent component
      } else {
        // Handle errors from backend
        if (orderResponse.payment && orderResponse.payment.error) {
          const errorMsg = orderResponse.payment.error;
          setPaymentError(errorMsg);
          setOrderConfirmed(false); // Allow retry
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ PAYMENT ERROR:', errorMsg);
          }
        } else if (orderResponse.message && orderResponse.message.includes('failed')) {
          const errorMsg = orderResponse.message;
          setPaymentError(errorMsg);
          setOrderConfirmed(false); // Allow retry
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ ORDER ERROR MESSAGE:', errorMsg);
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ ORDER RESPONSE INVALID:', orderResponse);
          }
          setPaymentError('Something went wrong with your payment. Please try again.');
          setOrderConfirmed(false); // Allow retry
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Order confirmation error:', error);
      }
      const errorMsg = error.message || 'Order confirmation failed';
      setPaymentError(errorMsg);
      setOrderConfirmed(false); // Allow retry
    } finally {
      setProcessingPayment(false);
    }
  }

  // Handle payment popup close
  function handlePaymentClose() {
    if (process.env.NODE_ENV === 'development') {
      console.log('💳 Payment popup closed');
    }
    setProcessingPayment(false);
  }

  // Handle error dismissal
  function handleDismissError() {
    setPaymentError(null);
    if (clearPaymentError) clearPaymentError();
  }

  // Handle manual card form submission
  const handleManualPayment = async (e) => {
    e.preventDefault();
    if (process.env.NODE_ENV === 'development') {
      console.log('💳 Manual payment data:', paymentData);
      
      // Simulate payment success in development
      handlePaymentSuccess({
        reference: 'test_ref_' + Date.now(),
        status: 'success'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('billing.')) {
      const field = name.replace('billing.', '');
      setPaymentData({
        ...paymentData,
        billingAddress: {
          ...paymentData.billingAddress,
          [field]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      setPaymentData({
        ...paymentData,
        [name]: value
      });
    }
  };

  const handleRetryPayment = () => {
    // Clear any errors and reset state to allow new payment attempt
    setPaymentError(null);
    if (clearPaymentError) clearPaymentError();
    setOrderConfirmed(false);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Select payment method</h2>

      {/* Payment Error Display with dismiss button - improved for production */}
      {paymentError && (
        <div 
          className="payment-error-message bg-red-100 border-2 border-red-500 text-red-700 rounded px-4 py-3 mb-6"
          style={{ 
            display: 'block',
            position: 'relative',
            zIndex: 50 
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>
                {process.env.NODE_ENV === 'development' 
                  ? `Payment Error: ${paymentError}` 
                  : formatErrorForDisplay(paymentError)
                }
              </span>
            </div>
            <button 
              onClick={handleDismissError}
              className="text-red-500 hover:text-red-700"
              aria-label="Dismiss error"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Added for production: retry button */}
          {paymentError && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleRetryPayment}
                className="text-sm bg-red-50 hover:bg-red-100 text-red-600 font-medium px-3 py-1 rounded transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-gray-900 mb-3">Payment Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal (incl. fees & tax)</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery Fee</span>
            <span className="font-medium">{formatPrice(deliveryFee)}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="text-blue-600">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-4 mb-6">
        {/* Paystack Payment (Recommended) */}
        <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === 'paystack' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`} onClick={() => setPaymentMethod('paystack')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="radio"
                id="paystack"
                name="paymentMethod"
                value="paystack"
                checked={paymentMethod === 'paystack'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="paystack" className="ml-3 flex items-center">
                <span className="text-sm font-medium text-gray-900">Paystack</span>
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Recommended</span>
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-6 w-6 text-red-500" />
              <CreditCard className="h-6 w-6 text-blue-600" />
              <Wallet className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2 ml-7">
            Secure payment with cards, bank transfers, USSD, and mobile money
          </p>
        </div>

        {/* Manual Card Entry (Fallback) */}
        <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === 'manual' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`} onClick={() => setPaymentMethod('manual')}>
          <div className="flex items-center">
            <input
              type="radio"
              id="manual"
              name="paymentMethod"
              value="manual"
              checked={paymentMethod === 'manual'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="manual" className="ml-3 text-sm font-medium text-gray-900">
              Credit/Debit Card (Manual Entry)
            </label>
          </div>
        </div>
      </div>

      {/* Paystack Payment Button */}
      {paymentMethod === 'paystack' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-sm text-blue-800">
                You'll be redirected to Paystack's secure payment page to complete your purchase.
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-6">
            <button
              type="button"
              onClick={onBack}
              disabled={processingPayment}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Back
            </button>

            <PaystackButton
              {...paystackProps}
              className={`px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${processingPayment ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              disabled={processingPayment}
            />
          </div>

          {processingPayment && (
            <div className="text-center py-4">
              <div className="inline-flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm text-gray-600">Processing your order...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Card Form */}
      {paymentMethod === 'manual' && (
        <form onSubmit={handleManualPayment} className="space-y-6">
          {/* Card Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <input
                type="text"
                name="cardNumber"
                value={paymentData.cardNumber}
                onChange={handleChange}
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Holder Name
              </label>
              <input
                type="text"
                name="cardHolder"
                value={paymentData.cardHolder}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date (MM/YY)
              </label>
              <input
                type="text"
                name="expiryDate"
                value={paymentData.expiryDate}
                onChange={handleChange}
                placeholder="12/25"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <input
                type="text"
                name="cvv"
                value={paymentData.cvv}
                onChange={handleChange}
                placeholder="123"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={onBack}
              disabled={processingPayment}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={processingPayment}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {processingPayment ? 'Processing...' : 'Process Payment'}
            </button>
          </div>
        </form>
      )}

      {/* Development Testing Tools - only shown in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Development Testing Tools</h4>
          <div className="flex space-x-2">
            <button
              type="button"
              className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200"
              onClick={() => {
                setPaymentError("Payment amount does not match expected amount");
                // Add a timeout before clearing the error
                setTimeout(() => {
                  if (clearPaymentError) clearPaymentError();
                }, 5000); // Clear after 5 seconds
              }}
            >
              Test Payment Mismatch Error
            </button>
            <button
              type="button"
              className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded hover:bg-orange-200"
              onClick={() => {
                setPaymentError("Too many requests. Please wait a moment and try again.");
                // Add a timeout before clearing the error
                setTimeout(() => {
                  if (clearPaymentError) clearPaymentError();
                }, 5000); // Clear after 5 seconds
              }}
            >
              Test Rate Limit Error
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodStep;