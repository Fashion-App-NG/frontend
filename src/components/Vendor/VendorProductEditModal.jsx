import { useEffect, useState } from 'react';

const VendorProductEditModal = ({ product, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    pricePerYard: '',
    quantity: '',
    description: '',
    materialType: '',
    pattern: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ Complete material types list
  const materialTypes = [
    'Cotton', 'Silk', 'Wool', 'Linen', 'Polyester', 'Rayon', 'Denim', 'Chiffon', 'Satin', 'Velvet'
  ];

  // ✅ Complete patterns list
  const patterns = [
    'Solid', 'Striped', 'Floral', 'Geometric', 'Abstract', 'Polka-dot', 'Paisley', 'Animal-print'
  ];

  // Initialize form data when product changes
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || '',
        pricePerYard: String(product.price || product.pricePerYard || ''), // ✅ Fix: check both fields
        quantity: String(product.quantity || ''),
        description: product.description || '',
        materialType: product.materialType || '',
        pattern: product.pattern || ''
      });
      setErrors({});
    }
  }, [product, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.pricePerYard || parseFloat(formData.pricePerYard) <= 0) {
      newErrors.pricePerYard = 'Valid price is required';
    }

    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Valid quantity is required';
    }

    if (!formData.materialType) {
      newErrors.materialType = 'Material type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const updateData = {
        name: formData.name.trim(),
        pricePerYard: parseFloat(formData.pricePerYard),
        quantity: parseInt(formData.quantity),
        materialType: formData.materialType.toLowerCase()
      };

      // Add optional fields only if they have values
      if (formData.description && formData.description.trim()) {
        updateData.description = formData.description.trim();
      }

      if (formData.pattern) {
        updateData.pattern = formData.pattern.toLowerCase();
      }

      console.log('Sending update data:', updateData);
      
      await onSave(updateData);
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors({ general: error.message || 'Failed to save product' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Edit Product
            </h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter product name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Price per Yard */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price per Yard (₦) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.pricePerYard}
              onChange={(e) => handleInputChange('pricePerYard', e.target.value)}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.pricePerYard ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.pricePerYard && (
              <p className="mt-1 text-sm text-red-600">{errors.pricePerYard}</p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity (Pieces) *
            </label>
            <input
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.quantity ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
            )}
          </div>

          {/* Material Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Material Type *
            </label>
            <select
              value={formData.materialType}
              onChange={(e) => handleInputChange('materialType', e.target.value)}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.materialType ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select material type</option>
              {materialTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.materialType && (
              <p className="mt-1 text-sm text-red-600">{errors.materialType}</p>
            )}
          </div>

          {/* Pattern */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pattern
            </label>
            <select
              value={formData.pattern}
              onChange={(e) => handleInputChange('pattern', e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select pattern</option>
              {patterns.map(pattern => (
                <option key={pattern} value={pattern}>
                  {pattern}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={loading}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Optional product description"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorProductEditModal;