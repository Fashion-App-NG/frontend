import { CreditCard, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PaystackButton } from 'react-paystack';
import { PAYSTACK_CONFIG, formatAmountForPaystack } from '../../../config/paystack';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../contexts/CartContext';
import { formatPrice } from '../../../utils/formatPrice';

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

  const { user } = useAuth();
  const { cartItems } = useCart();

  // 🎯 USE BACKEND VALUES - Backend is the source of truth
  const backendBaseAmount = cart?.totalAmount || 0;
  const backendTaxAmount = cart?.taxAmount || 0;
  const backendPlatformFees = cart?.totalPlatformFee || 0;
  const backendShipping = cart?.shippingCost || 0;
  
  const subtotal = backendBaseAmount + backendTaxAmount + backendPlatformFees;
  const deliveryFee = backendShipping;
  const total = subtotal + deliveryFee;

  // State management
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

  // Paystack configuration
  const paystackProps = {
    email: customerInfo?.email || user?.email || 'customer@example.com',
    amount: formatAmountForPaystack(total),
    currency: PAYSTACK_CONFIG.currency,
    publicKey: PAYSTACK_CONFIG.publicKey,
    text: `Pay ${formatPrice(total)}`,
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
    
    setPaymentError(null);
    if (clearPaymentError) clearPaymentError();

    try {
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

      if (orderResponse && orderResponse.success && orderResponse.order) {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ ORDER CONFIRMED');
        }
      } else {
        if (orderResponse.payment && orderResponse.payment.error) {
          const errorMsg = orderResponse.payment.error;
          setPaymentError(errorMsg);
          setOrderConfirmed(false);
        } else if (orderResponse.message && orderResponse.message.includes('failed')) {
          const errorMsg = orderResponse.message;
          setPaymentError(errorMsg);
          setOrderConfirmed(false);
        } else {
          setPaymentError('Something went wrong with your payment. Please try again.');
          setOrderConfirmed(false);
        }
      }
    } catch (error) {
      const errorMsg = error.message || 'Order confirmation failed';
      setPaymentError(errorMsg);
      setOrderConfirmed(false);
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

  // Handle manual card form submission
  const handleManualPayment = async (e) => {
    e.preventDefault();
    if (process.env.NODE_ENV === 'development') {
      console.log('💳 Manual payment data:', paymentData);
      
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

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Select payment method</h2>

        {/* Payment Summary - Simplified */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm sm:text-base">
              <span className="text-gray-600">Subtotal (incl. fees & tax)</span>
              <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm sm:text-base pb-3 border-b border-gray-200">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-medium text-gray-900">{formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-lg sm:text-xl pt-2">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-blue-600">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-4 mb-6">
          {/* Paystack Payment (Recommended) */}
          <div 
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              paymentMethod === 'paystack' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`} 
            onClick={() => setPaymentMethod('paystack')}
          >
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
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2 ml-7">
              Secure payment with cards, bank transfers, USSD, and mobile money
            </p>
          </div>

          {/* Manual Card Entry (Fallback) */}
          <div 
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              paymentMethod === 'manual' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`} 
            onClick={() => setPaymentMethod('manual')}
          >
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
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-sm text-blue-800">
                  You'll be redirected to Paystack's secure payment page to complete your purchase.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-4">
              <button
                type="button"
                onClick={onBack}
                disabled={processingPayment}
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>

              <PaystackButton
                {...paystackProps}
                className={`w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                  processingPayment ? 'opacity-50 cursor-not-allowed' : ''
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={paymentData.cardNumber}
                  onChange={handleChange}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Holder Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="cardHolder"
                  value={paymentData.cardHolder}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date (MM/YY) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="expiryDate"
                  value={paymentData.expiryDate}
                  onChange={handleChange}
                  placeholder="12/25"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={paymentData.cvv}
                  onChange={handleChange}
                  placeholder="123"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-4">
              <button
                type="button"
                onClick={onBack}
                disabled={processingPayment}
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={processingPayment}
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingPayment ? 'Processing...' : 'Process Payment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodStep;