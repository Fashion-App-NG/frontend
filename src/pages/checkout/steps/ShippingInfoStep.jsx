import { useState } from 'react';

const ShippingInfoStep = ({ onNext, onBack, sessionData }) => {
  const [shippingData, setShippingData] = useState({
    street: '',
    houseNo: '',
    phone: '',
    city: '',
    postalCode: '',
    state: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (process.env.NODE_ENV === 'development') {
      console.log('🚚 [SHIPPING] Shipping data:', shippingData); // ✅ More specific logging
    }
    
    // TODO: Implement actual API call
    // await checkoutService.saveShippingInfo(sessionData.sessionId, shippingData);
    
    onNext();
  };

  const handleChange = (e) => {
    setShippingData({
      ...shippingData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Delivery Address</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street name
            </label>
            <input
              type="text"
              name="street"
              value={shippingData.street}
              onChange={handleChange}
              placeholder="Enter your street name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              House no
            </label>
            <input
              type="text"
              name="houseNo"
              value={shippingData.houseNo}
              onChange={handleChange}
              placeholder="Enter House no"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone number
            </label>
            <input
              type="tel"
              name="phone"
              value={shippingData.phone}
              onChange={handleChange}
              placeholder="Enter Phone Number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              name="city"
              value={shippingData.city}
              onChange={handleChange}
              placeholder="City"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postal code
            </label>
            <input
              type="text"
              name="postalCode"
              value={shippingData.postalCode}
              onChange={handleChange}
              placeholder="Enter Postal Code"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <select
              name="state"
              value={shippingData.state}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select State</option>
              <option value="Lagos">Lagos</option>
              <option value="Abuja">Abuja</option>
              <option value="Kano">Kano</option>
              <option value="Rivers">Rivers</option>
              <option value="Oyo">Oyo</option>
            </select>
          </div>
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
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShippingInfoStep;