import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Admin/Sidebar';
import Topbar from '../components/Admin/Topbar';
import productService from '../services/productService';
import { adminService } from '../services/adminService';

const getFirstImageUrl = (product) => {
  const first = product.images?.[0];
  if (!first) return null;
  return typeof first === 'string' ? first : first.url || null;
};

const formatNaira = (kobo) => {
  const value = Number(kobo) || 0;
  return `\u20a6${value.toLocaleString()}`;
};

export const AdminVendorProductsPage = () => {
  const { vendorId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const vendorNameFromQuery = searchParams.get('vendorName');

  const [vendorName, setVendorName] = useState(vendorNameFromQuery || '');
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getVendorProducts(vendorId, page, 20);
      setProducts(data.products || []);
      setPagination(data.pagination || { currentPage: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false });
    } catch (err) {
      console.error('Failed to load vendor products:', err);
      setError('Could not load products for this vendor. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    loadProducts(1);
  }, [loadProducts]);

  // If we weren't handed a vendor name via query param (e.g. direct link or
  // page refresh), fetch it once so the header isn't just a raw ID.
  useEffect(() => {
    if (vendorNameFromQuery || !vendorId) return;
    adminService.getVendorById(vendorId)
      .then((data) => {
        const vendorRecord = data?.data || data?.vendor || data;
        const name = vendorRecord?.vendorProfile?.storeName;
        if (name) setVendorName(name);
      })
      .catch((err) => console.error('Failed to fetch vendor name:', err));
  }, [vendorId, vendorNameFromQuery]);

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar />
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#3e3e3e]">
                Products — {vendorName || 'Vendor'}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {pagination.totalPages > 0 ? `${products.length} shown` : ''}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/admin/products/upload?vendorId=${vendorId}&vendorName=${encodeURIComponent(vendorName || '')}`)}
                className="px-4 py-2 bg-[#2e2e2e] text-[#edff8c] rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                + Add Product
              </button>
              <button
                onClick={() => navigate('/admin/vendor-management')}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-600"
              >
                Back to Vendors
              </button>
            </div>
          </div>

          {loading && <p className="text-gray-500">Loading products...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && !error && products.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
              This vendor has no products yet.
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Material</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Price/Yard</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Quantity</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Added</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const imageUrl = getFirstImageUrl(product);
                    const addedByAdmin = product.createdByRole && product.createdByRole !== 'vendor';
                    return (
                      <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {imageUrl ? (
                              <img src={imageUrl} alt={product.name} className="w-12 h-12 rounded object-cover" />
                            ) : (
                              <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                                No image
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-[#3e3e3e]">{product.name}</p>
                              {product.product_code && (
                                <p className="text-xs text-gray-400">{product.product_code}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{product.materialType}</td>
                        <td className="px-4 py-3">{formatNaira(product.pricePerYard)}</td>
                        <td className="px-4 py-3">
                          {product.availableUnits ?? product.quantity}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {addedByAdmin ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                              Added by Admin
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">By vendor</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {(pagination.hasNextPage || pagination.hasPrevPage) && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                  <button
                    disabled={!pagination.hasPrevPage}
                    onClick={() => loadProducts(pagination.currentPage - 1)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    disabled={!pagination.hasNextPage}
                    onClick={() => loadProducts(pagination.currentPage + 1)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVendorProductsPage;
