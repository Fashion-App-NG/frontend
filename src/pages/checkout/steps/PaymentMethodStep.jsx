import { useState } from 'react';

const PaymentMethodStep = ({ onNext, onBack, sessionData }) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Process payment via Paystack
    console.log('Payment data:', paymentData);
    onNext();
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
    <div>
      <h2 className="text-xl font-semibold mb-6">Select payment method</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method Selection */}
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex items-center">
            <input
              type="radio"
              id="credit-card"
              name="paymentMethod"
              value="credit-card"
              defaultChecked
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="credit-card" className="ml-3 flex items-center">
              <span className="text-sm font-medium text-gray-900">Credit card</span>
              <div className="ml-4 flex space-x-2">
                <img src="/visa-logo.png" alt="Visa" className="h-6" />
                <img src="/mastercard-logo.png" alt="Mastercard" className="h-6" />
              </div>
            </label>
          </div>
        </div>

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
              Expiration date (MM/YY)
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

        {/* Billing Address */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Billing address</h3>
          
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="same-as-delivery"
              name="billing.sameAsDelivery"
              checked={paymentData.billingAddress.sameAsDelivery}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="same-as-delivery" className="ml-2 text-sm text-gray-700">
              Same as my delivery address
            </label>
          </div>

          {!paymentData.billingAddress.sameAsDelivery && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <input
                  type="text"
                  name="billing.phone"
                  value={paymentData.billingAddress.phone}
                  onChange={handleChange}
                  placeholder="Phone no"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <input
                  type="text"
                  name="billing.address"
                  value={paymentData.billingAddress.address}
                  onChange={handleChange}
                  placeholder="Address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="billing.city"
                  value={paymentData.billingAddress.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <select
                  name="billing.state"
                  value={paymentData.billingAddress.state}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select State</option>
                  <option value="Lagos">Lagos</option>
                  <option value="Abuja">Abuja</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Checkout Now
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentMethodStep;