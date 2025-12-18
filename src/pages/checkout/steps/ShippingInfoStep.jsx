import { useState } from 'react';
import checkoutService from '../../../services/checkoutService';

const ShippingInfoStep = ({ onSubmit, onBack }) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Dev - [PAGE] ShippingInfoStep rendered');
  }
  const [shippingData, setShippingData] = useState({
    street: '',
    houseNo: '',
    city: '',
    postalCode: '',
    state: ''
  });
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setShippingData({
      ...shippingData,
      [e.target.name]: e.target.value
    });
  };

  const handleCustomerChange = (e) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const shippingAddress = {
      street: `${shippingData.houseNo} ${shippingData.street}`,
      city: shippingData.city,
      state: shippingData.state,
      zipCode: shippingData.postalCode,
      country: 'Nigeria'
    };

    try {
      console.log('Submitting shipping info:', shippingAddress, customerInfo);
      const result = await checkoutService.saveShippingInfo(shippingAddress, customerInfo);
      console.log('Shipping info saved:', result);

      onSubmit(shippingAddress, customerInfo);
    } catch (err) {
      console.error('Shipping error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Delivery Address</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Delivery Address Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Street name */}
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Street name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="street"
                  value={shippingData.street}
                  onChange={handleChange}
                  placeholder="Enter your street name"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              {/* House no */}
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  House no <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="houseNo"
                  value={shippingData.houseNo}
                  onChange={handleChange}
                  placeholder="Enter House no"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              {/* City */}
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={shippingData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              {/* Postal code */}
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Postal code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={shippingData.postalCode}
                  onChange={handleChange}
                  placeholder="Enter postal code"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              {/* State */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  name="state"
                  value={shippingData.state}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                  required
                >
                  <option value="">Select State</option>
                  <option value="Lagos">Lagos</option>
                  <option value="Abuja">Abuja</option>
                  <option value="Kano">Kano</option>
                  <option value="Rivers">Rivers</option>
                  <option value="Oyo">Oyo</option>
                  <option value="Kaduna">Kaduna</option>
                  <option value="Ogun">Ogun</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customer Information Section */}
          <div className="pt-4 sm:pt-6 border-t border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleCustomerChange}
                  placeholder="Enter your full name"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              {/* Email */}
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={customerInfo.email}
                  onChange={handleCustomerChange}
                  placeholder="Enter your email"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              {/* Phone Number */}
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={customerInfo.phone}
                  onChange={handleCustomerChange}
                  placeholder="Enter phone number"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back to Cart
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                'Continue to Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShippingInfoStep;
