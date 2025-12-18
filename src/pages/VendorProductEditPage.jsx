import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVendorProducts } from '../hooks/useVendorProducts';

const VendorProductEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, updateProduct, loading } = useVendorProducts();
  
  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    pricePerYard: '',
    quantity: '',
    description: '',
    materialType: ''
  });

  useEffect(() => {
    const foundProduct = products.find(p => p.id === id || p._id === id);
    if (foundProduct) {
      setProduct(foundProduct);
      setFormData({
        name: foundProduct.name || '',
        pricePerYard: foundProduct.pricePerYard || foundProduct.price || '',
        quantity: foundProduct.quantity || '',
        description: foundProduct.description || '',
        materialType: foundProduct.materialType || ''
      });
    }
  }, [id, products]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProduct(id, {
        name: formData.name,
        pricePerYard: parseFloat(formData.pricePerYard),
        quantity: parseInt(formData.quantity),
        description: formData.description,
        materialType: formData.materialType
      });
      navigate('/vendor/products');
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  if (loading || !product) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price per Yard (₦)
          </label>
          <input
            type="number"
            value={formData.pricePerYard}
            onChange={(e) => setFormData({ ...formData, pricePerYard: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
          </label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Material Type
          </label>
          <select
            value={formData.materialType}
            onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select material</option>
            <option value="cotton">Cotton</option>
            <option value="silk">Silk</option>
            <option value="linen">Linen</option>
            <option value="polyester">Polyester</option>
            <option value="wool">Wool</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/vendor/products')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorProductEditPage;