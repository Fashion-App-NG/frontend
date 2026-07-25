import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from '../components/Admin/Sidebar';
import Topbar from '../components/Admin/Topbar';
import productService from '../services/productService';
import { useMaterials } from '../hooks/useMaterials';
import { PATTERNS } from '../constants/productOptions';

const AdminProductEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    pricePerYard: '',
    quantity: '',
    description: '',
    materialType: '',
    pattern: '',
    status: 'Available'
  });

  const { materials: materialTypes, loading: materialsLoading } = useMaterials();
  const patterns = PATTERNS;

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await productService.getProductById(id);
        const found = response.product;

        if (!found) {
          toast.error('Product not found');
          navigate('/admin/vendor-management');
          return;
        }

        setProduct(found);
        setFormData({
          name: found.name || '',
          pricePerYard: found.pricePerYard || '',
          quantity: found.quantity || '',
          description: found.description || '',
          materialType: found.materialType || '',
          pattern: found.pattern || 'Solid',
          status: found.status === 'ACTIVE' || found.status === 'Available' ? 'Available' : 'Unavailable'
        });
      } catch (error) {
        console.error('Failed to load product:', error);
        toast.error('Failed to load product');
        navigate('/admin/vendor-management');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product) return;

    if (!formData.name.trim()) {
      toast.warning('Please enter a product name');
      return;
    }
    if (!formData.pricePerYard || parseFloat(formData.pricePerYard) <= 0) {
      toast.warning('Please enter a valid price');
      return;
    }

    try {
      setSaving(true);
      const updateData = {
        name: formData.name.trim(),
        pricePerYard: parseFloat(formData.pricePerYard),
        quantity: parseInt(formData.quantity, 10),
        description: formData.description.trim(),
        materialType: formData.materialType,
        pattern: formData.pattern,
        status: formData.status
      };

      const response = await productService.updateProduct(id, updateData);

      if (response.success || response.product) {
        toast.success('Product updated successfully!');
        navigate(`/admin/vendors/${product.vendorId}/products`);
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      toast.error(error.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const backTarget = product?.vendorId ? `/admin/vendors/${product.vendorId}/products` : '/admin/vendor-management';

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f5f6fa]">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Topbar />
          <div className="p-8 text-gray-500">Loading product...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar />
        <div className="p-8 max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[#3e3e3e]">Edit Product</h1>
            <button
              onClick={() => navigate(backTarget)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to vendor's products
            </button>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Editing as admin. Image changes aren't supported here yet — let me know if you need that added.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-lg border border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price per Yard *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pricePerYard}
                  onChange={(e) => handleChange('pricePerYard', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                <select
                  value={formData.materialType}
                  onChange={(e) => handleChange('materialType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={materialsLoading}
                >
                  <option value="">Select material</option>
                  {materialTypes.map((material) => (
                    <option key={material._id} value={material.name}>{material.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pattern</label>
                <select
                  value={formData.pattern}
                  onChange={(e) => handleChange('pattern', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {patterns.map((pattern) => (
                    <option key={pattern} value={pattern}>{pattern}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(backTarget)}
                disabled={saving}
                className="px-6 py-2.5 bg-[#f9f9f9] text-[#b2b2b2] rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                  saving ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'text-[#edff8c] bg-[#2e2e2e] hover:bg-gray-800'
                }`}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProductEditPage;
