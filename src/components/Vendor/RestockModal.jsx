import { useEffect, useState } from 'react';

export const RestockModal = ({ isOpen, onClose, product, onRestock }) => {
  const [formData, setFormData] = useState({
    change: '',
    reason: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const reasonOptions = [
    'Sold outside platform',
    'Damaged inventory',
    'Return to stock',
    'Inventory correction',
    'New stock arrival',
    'Transfer to warehouse',
    'Quality control adjustment',
    'Other'
  ];

  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        change: '',
        reason: '',
        notes: ''
      });
      setErrors({});
    }
  }, [isOpen, product]);

  const currentQuantity = product?.quantity || 0;
  const change = parseInt(formData.change) || 0;
  const newQuantity = Math.max(0, currentQuantity + change);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.change || formData.change === '0') {
      newErrors.change = 'Please enter a quantity change';
    }
    if (!formData.reason) {
      newErrors.reason = 'Please select a reason';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await onRestock({
        change: change,
        newQuantity: newQuantity,
        reason: formData.reason,
        notes: formData.notes
      });
    } catch (error) {
      setErrors({ general: error.message || 'Failed to update stock' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setErrors({});
      onClose();
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Restock Product
            </h2>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">{product.name}</h3>
            <p className="text-sm text-gray-600">
              Current Stock: <span className="font-medium">{currentQuantity} pcs</span>
            </p>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Quantity Change */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity Change
            </label>
            <input
              type="number"
              value={formData.change}
              onChange={(e) => setFormData({ ...formData, change: e.target.value })}
              className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.change ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter + or - amount"
              disabled={isLoading}
            />
            {errors.change && (
              <p className="mt-1 text-sm text-red-600">{errors.change}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Use negative numbers to reduce stock (e.g., -5)
            </p>
          </div>

          {/* New Quantity Preview */}
          {formData.change && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                New Stock: <span className="font-medium">{newQuantity} pcs</span>
                {change > 0 && (
                  <span className="text-green-600 ml-2">(+{change})</span>
                )}
                {change < 0 && (
                  <span className="text-red-600 ml-2">({change})</span>
                )}
              </p>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason
            </label>
            <select
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.reason ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            >
              <option value="">Select a reason</option>
              {reasonOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes about this stock change"
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.change || !formData.reason}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {isLoading ? 'Updating...' : 'Update Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestockModal;