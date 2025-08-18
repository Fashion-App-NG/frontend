import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GuestOrderConfirmationStep = ({ clearCart, loadCart, order, customerInfo }) => {
  const navigate = useNavigate();
  const [showRegistration, setShowRegistration] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // ✅ Phase 4: Post-order registration will be implemented here
  const handleQuickRegistration = async (password) => {
    setIsRegistering(true);
    try {
      // Placeholder for registration logic
      console.log('🔄 Post-order registration:', { customerInfo, password });
      // Implementation will be added in Phase 4
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsRegistering(false);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-800">Order Confirmed!</h1>
              <p className="text-green-700">Thank you for your purchase</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Order Number:</span>
                <p className="text-gray-900 font-mono">{order.orderNumber}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total Amount:</span>
                <p className="text-gray-900 font-semibold">{formatPrice(order.totalAmount)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <p className="text-gray-900">{customerInfo?.email}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <p className="text-gray-900">{order.status}</p>
              </div>
            </div>
          </div>

          <p className="text-green-700 mt-4 text-sm">
            📧 Order confirmation and tracking details have been sent to {customerInfo?.email}
          </p>
        </div>

        {/* Post-Order Registration Prompt */}
        {!showRegistration ? (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Want to track your orders easily?
            </h3>
            <p className="text-gray-600 mb-4">
              Create an account to view your order history, save your information for faster checkout, 
              and receive updates on new arrivals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowRegistration(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Create Account (30 seconds)
              </button>
              <button
                onClick={() => navigate('/browse')}
                className="text-gray-600 hover:text-gray-800 px-6 py-2"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Your Account</h3>
            
            <QuickRegistrationForm
              customerInfo={customerInfo}
              onSubmit={handleQuickRegistration}
              isSubmitting={isRegistering}
            />
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
          
          {order.items?.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
              <div>
                <h4 className="font-medium text-gray-900">{item.name}</h4>
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatPrice(item.pricePerYard * item.quantity)}
                </p>
                <p className="text-sm text-gray-600">
                  {formatPrice(item.pricePerYard)} per yard
                </p>
              </div>
            </div>
          ))}

          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button
            onClick={() => navigate('/browse')}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => {/* TODO: Order tracking */}}
            className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Track Order
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ Quick registration form component
const QuickRegistrationForm = ({ customerInfo, onSubmit, isSubmitting }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit(password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          value={customerInfo?.firstName || ''}
          readOnly
          className="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="First Name"
        />
        <input
          type="text"
          value={customerInfo?.lastName || ''}
          readOnly
          className="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="Last Name"
        />
      </div>
      
      <input
        type="email"
        value={customerInfo?.email || ''}
        readOnly
        className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm"
        placeholder="Email"
      />
      
      <div>
        <input
          type="password"
          placeholder="Create Password (min. 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`w-full border rounded px-3 py-2 text-sm ${
            errors.password ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
      </div>
      
      <div>
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={`w-full border rounded px-3 py-2 text-sm ${
            errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50 font-semibold"
      >
        {isSubmitting ? 'Creating Account...' : 'Create Account & Link Orders'}
      </button>
      
      <p className="text-xs text-gray-600 text-center">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  );
};

export default GuestOrderConfirmationStep;