import { CreditCard, Wallet } from 'lucide-react';
import { useState } from 'react';
import { PaystackButton } from 'react-paystack';
import { PAYSTACK_CONFIG, formatAmountForPaystack } from '../../../config/paystack';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../contexts/CartContext';

// In PaymentMethodStep.jsx
const PaymentMethodStep = ({ onSubmit, onBack, shippingAddress, customerInfo, cart }) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Dev - [PAGE] PaymentMethodStep rendered');
  }
  const { user } = useAuth();
  const { getCartTotal } = useCart();
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('paystack');
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
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  // Calculate totals
  const subtotal = getCartTotal();
  const deliveryFee = 3000;
  const tax = Math.round(subtotal * 0.075); // 7.5% VAT
  const total = subtotal + deliveryFee + tax;

  // Paystack configuration
  const paystackProps = {
    email: customerInfo?.email || user?.email || 'customer@example.com',
    amount: formatAmountForPaystack(total),
    currency: PAYSTACK_CONFIG.currency,
    publicKey: PAYSTACK_CONFIG.publicKey,
    text: `Pay ₦${total.toLocaleString()}`,
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

  // ✅ Handle successful payment
  async function handlePaymentSuccess(reference) {
    if (orderConfirmed) return;
    setOrderConfirmed(true);

    try {
      console.log('💳 PAYMENT SUCCESS DEBUG:', {
        reference: reference.reference,
        timestamp: new Date().toISOString(),
        paymentDetails: reference,
        expectedOrderStatusAfterPayment: 'Should this be PROCESSING or stay PENDING?',
        expectedPaymentStatusAfterPayment: 'Should this be PAID?'
      });

      const orderResponse = await onSubmit({
        shippingAddress,
        customerInfo,
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

      console.log('📋 ORDER CREATION RESPONSE:', {
        success: orderResponse.success,
        orderStatus: orderResponse.order?.status,
        paymentStatus: orderResponse.order?.paymentStatus,
        vendorOrderStatus: orderResponse.order?.vendorOrderStatus,
        message: 'Does backend automatically change payment status after payment?',
        fullResponse: orderResponse
      });

      // ✅ CHECK: What happens after successful order creation?
      console.log('🎯 POST-ORDER SUCCESS ACTIONS:', {
        orderResponseExists: !!orderResponse,
        orderExists: !!orderResponse?.order,
        successField: orderResponse?.success,
        aboutToNavigateToSuccess: true
      });

      // ✅ ADD: Explicit success check before navigation
      if (orderResponse && orderResponse.success && orderResponse.order) {
        console.log('✅ ORDER CONFIRMED - About to navigate to success page');
        // Navigation or success handling should happen here
      } else {
        console.error('❌ ORDER RESPONSE INVALID:', orderResponse);
        throw new Error('Invalid order response structure');
      }

      // ✅ ADD: Check if payment status was updated
      if (orderResponse.order?.paymentStatus === 'PENDING') {
        console.warn('⚠️ PAYMENT STATUS ISSUE: Payment succeeded but status is still PENDING');
        console.warn('🔧 INVESTIGATION NEEDED: Check backend payment confirmation logic');
      }

    } catch (error) {
      console.error('❌ Order confirmation error DETAILS:', {
        errorMessage: error.message,
        errorStack: error.stack,
        errorName: error.name,
        fullError: error
      });
      setOrderConfirmed(false);
      alert(`Order confirmation failed: ${error.message}`);
    } finally {
      setProcessingPayment(false);
    }
  }

  // ✅ Handle payment popup close
  function handlePaymentClose() {
    if (process.env.NODE_ENV === 'development') {
      console.log('💳 Payment popup closed');
    }
    setProcessingPayment(false);
  }

  // ✅ Handle manual card form submission (fallback)
  const handleManualPayment = async (e) => {
    e.preventDefault();
    if (process.env.NODE_ENV === 'development') {
      console.log('💳 Manual payment data:', paymentData);
    }

    // For development: simulate payment success
    if (process.env.NODE_ENV === 'development') {
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price || 0);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Select payment method</h2>

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
              {/* ✅ Replace with Lucide React icons */}
              <CreditCard
                className="h-6 w-6 text-red-500"
                title="Mastercard"
                aria-label="Mastercard accepted"
                role="img"
              />
              <CreditCard
                className="h-6 w-6 text-blue-600"
                title="Visa"
                aria-label="Visa accepted"
                role="img"
              />
              <Wallet
                className="h-6 w-6 text-green-600"
                title="Verve"
                aria-label="Verve accepted"
                role="img"
              />
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

      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-gray-900 mb-3">Payment Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery Fee</span>
            <span className="font-medium">{formatPrice(deliveryFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax (7.5%)</span>
            <span className="font-medium">{formatPrice(tax)}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="text-blue-600">{formatPrice(total)}</span>
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

      {/* Manual Card Form (Fallback) */}
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
    </div>
  );
};

export default PaymentMethodStep;