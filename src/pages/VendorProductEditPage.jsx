import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import productService from '../services/productService';

const VendorProductEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // ✅ ADD: Image state
  const [existingImages, setExistingImages] = useState([]); // Images from server
  const [newImages, setNewImages] = useState([]); // New images to upload
  const [imagesToRemove, setImagesToRemove] = useState([]); // IDs of images to delete
  
  const [formData, setFormData] = useState({
    name: '',
    pricePerYard: '',
    quantity: '',
    description: '',
    materialType: '',
    pattern: '',
    status: 'Available'
  });

  // ✅ Extract images from product
  const extractImages = useCallback((product) => {
    if (!product) return [];
    
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images.map((img, idx) => {
        const url = typeof img === 'object' ? (img.url || img.data) : img;
        return {
          id: img.id || img._id || `existing-${idx}`,
          url: url,
          isExisting: true
        };
      }).filter(img => img.url);
    }
    
    if (product.image) {
      const url = typeof product.image === 'object' ? product.image.url : product.image;
      return url ? [{ id: 'main', url, isExisting: true }] : [];
    }
    
    return [];
  }, []);

  // Load product
  useEffect(() => {
    const loadProduct = async () => {
      if (!id || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('📥 Loading product for edit:', id);
        
        const response = await productService.getVendorProducts(user.id);
        
        if (response.products) {
          const foundProduct = response.products.find(p => {
            const productId = p.id || p._id;
            return productId === id || 
                   productId?.toString() === id ||
                   productId?.toString().includes(id) ||
                   id?.toString().includes(productId?.toString());
          });

          if (foundProduct) {
            console.log('✅ Product found:', foundProduct);
            setProduct(foundProduct);
            setFormData({
              name: foundProduct.name || '',
              pricePerYard: foundProduct.pricePerYard || foundProduct.price || '',
              quantity: foundProduct.quantity || '',
              description: foundProduct.description || '',
              materialType: foundProduct.materialType || '',
              pattern: foundProduct.pattern || 'Solid',
              status: foundProduct.status || 'Available'
            });
            
            // ✅ Load existing images
            const images = extractImages(foundProduct);
            console.log('🖼️ Existing images:', images);
            setExistingImages(images);
          } else {
            toast.error('Product not found');
            navigate('/vendor/products');
          }
        }
      } catch (error) {
        console.error('❌ Error loading product:', error);
        toast.error('Failed to load product');
        navigate('/vendor/products');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, user?.id, navigate, extractImages]);

  // ✅ ADD: Handle new image selection
  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length - imagesToRemove.length + newImages.length;
    
    if (totalImages + files.length > 4) {
      toast.warning(`You can only have 4 images total. ${4 - totalImages} slots available.`);
      return;
    }

    const processedImages = await Promise.all(files.map(async (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file: file,
            preview: reader.result,
            name: file.name,
            size: file.size,
            isNew: true
          });
        };
        reader.readAsDataURL(file);
      });
    }));

    setNewImages(prev => [...prev, ...processedImages]);
  };

  // ✅ ADD: Remove existing image
  const handleRemoveExistingImage = (imageId) => {
    setImagesToRemove(prev => [...prev, imageId]);
  };

  // ✅ ADD: Restore removed image
  const handleRestoreImage = (imageId) => {
    setImagesToRemove(prev => prev.filter(id => id !== imageId));
  };

  // ✅ ADD: Remove new image
  const handleRemoveNewImage = (imageId) => {
    setNewImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!product) {
      toast.error('Product not loaded');
      return;
    }

    try {
      setSaving(true);
      
      // Build FormData if we have new images
      const hasImageChanges = newImages.length > 0 || imagesToRemove.length > 0;
      
      let response;
      
      if (hasImageChanges) {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name.trim());
        formDataToSend.append('pricePerYard', formData.pricePerYard);
        formDataToSend.append('quantity', formData.quantity);
        formDataToSend.append('description', formData.description.trim());
        formDataToSend.append('materialType', formData.materialType);
        formDataToSend.append('pattern', formData.pattern);
        formDataToSend.append('status', formData.status);
        
        // Add images to remove
        if (imagesToRemove.length > 0) {
          formDataToSend.append('imagesToRemove', JSON.stringify(imagesToRemove));
        }
        
        // Add new images
        newImages.forEach((img) => {
          if (img.file) {
            formDataToSend.append('images', img.file);
          }
        });
        
        response = await productService.updateProductWithImages(id, formDataToSend);
      } else {
        // No image changes, just update data
        const updateData = {
          name: formData.name.trim(),
          pricePerYard: parseFloat(formData.pricePerYard),
          quantity: parseInt(formData.quantity),
          description: formData.description.trim(),
          materialType: formData.materialType,
          pattern: formData.pattern,
          status: formData.status
        };
        
        response = await productService.updateProduct(id, updateData);
      }

      if (response.success || response.product) {
        toast.success('Product updated successfully!');
        navigate(`/vendor/products/${id}`);
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

  // Calculate remaining slots
  const activeExistingImages = existingImages.filter(img => !imagesToRemove.includes(img.id));
  const totalActiveImages = activeExistingImages.length + newImages.length;
  const canAddMore = totalActiveImages < 4;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
        <button
          onClick={() => navigate('/vendor/products')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/vendor/products/${id}`)}
          className="text-blue-600 hover:text-blue-700 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Product
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form Fields */}
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Yard (₦) *
                </label>
                <input
                  type="number"
                  value={formData.pricePerYard}
                  onChange={(e) => setFormData({ ...formData, pricePerYard: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material Type *
                </label>
                <select
                  value={formData.materialType}
                  onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select material</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Silk">Silk</option>
                  <option value="Linen">Linen</option>
                  <option value="Lace">Lace</option>
                  <option value="Polyester">Polyester</option>
                  <option value="Wool">Wool</option>
                  <option value="Chiffon">Chiffon</option>
                  <option value="Satin">Satin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pattern
                </label>
                <select
                  value={formData.pattern}
                  onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Solid">Solid</option>
                  <option value="Striped">Striped</option>
                  <option value="Floral">Floral</option>
                  <option value="Geometric">Geometric</option>
                  <option value="Abstract">Abstract</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
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
                placeholder="Describe your product..."
              />
            </div>
          </div>

          {/* Right Column - Images */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Product Images</h3>
              <span className="text-sm text-gray-500">{totalActiveImages}/4 images</span>
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Current Images:</p>
                <div className="grid grid-cols-2 gap-3">
                  {existingImages.map((img) => {
                    const isMarkedForRemoval = imagesToRemove.includes(img.id);
                    return (
                      <div 
                        key={img.id} 
                        className={`relative group ${isMarkedForRemoval ? 'opacity-50' : ''}`}
                      >
                        <img
                          src={img.url}
                          alt="Product"
                          className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                        />
                        {isMarkedForRemoval ? (
                          <button
                            type="button"
                            onClick={() => handleRestoreImage(img.id)}
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg"
                          >
                            <span className="text-white text-sm font-medium">Click to Restore</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(img.id)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* New Images */}
            {newImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">New Images to Add:</p>
                <div className="grid grid-cols-2 gap-3">
                  {newImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.preview}
                        alt={img.name}
                        className="w-full h-24 object-cover rounded-lg border-2 border-green-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(img.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        ×
                      </button>
                      <span className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                        New
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add More Images */}
            {canAddMore && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <span className="text-3xl text-gray-400 mb-1">+</span>
                  <span className="text-sm text-gray-500">Add Images ({4 - totalActiveImages} remaining)</span>
                </button>
              </div>
            )}

            {imagesToRemove.length > 0 && (
              <p className="mt-3 text-sm text-orange-600">
                ⚠️ {imagesToRemove.length} image(s) will be removed when you save.
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/vendor/products/${id}`)}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorProductEditPage;