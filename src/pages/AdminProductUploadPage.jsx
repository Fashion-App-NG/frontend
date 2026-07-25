import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Admin/Sidebar';
import Topbar from '../components/Admin/Topbar';
import VendorProductUploadContent from '../components/Vendor/VendorProductUploadContent';
import { adminService } from '../services/adminService';

// Normalizes the different shapes adminService.GetVendors has been observed
// to return (see the same defensive handling in VendorManagement.jsx) into
// a flat array of { id, storeName, email } for the picker.
const normalizeVendorResults = (data) => {
  let items = [];

  if (!data) {
    items = [];
  } else if (Array.isArray(data)) {
    items = data;
  } else if (Array.isArray(data.vendors)) {
    items = data.vendors;
  } else if (Array.isArray(data.data)) {
    items = data.data;
  } else if (Array.isArray(data.data?.users)) {
    items = data.data.users;
  } else if (Array.isArray(data.users)) {
    items = data.users;
  }

  return items.map((vendor) => ({
    id: vendor._id || vendor.id,
    storeName: vendor.vendorProfile?.storeName || vendor.storeName || 'Unnamed store',
    email: vendor.email || '',
    profileComplete:
      vendor.vendorProfile?.profileCompletionStatus?.isComplete ?? null,
  }));
};

export const AdminProductUploadPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const preselectedVendorId = searchParams.get('vendorId');
  const preselectedVendorName = searchParams.get('vendorName');

  const [selectedVendor, setSelectedVendor] = useState(
    preselectedVendorId
      ? { id: preselectedVendorId, storeName: preselectedVendorName || 'Vendor' }
      : null
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const debounceRef = useRef(null);

  const runSearch = useCallback(async (term) => {
    setSearching(true);
    setSearchError(null);
    try {
      const data = await adminService.GetVendors(1, 10, term ? { search: term } : {});
      setResults(normalizeVendorResults(data));
    } catch (error) {
      console.error('Vendor search failed:', error);
      setSearchError('Could not load vendors. Please try again.');
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (selectedVendor) return; // No need to search once a vendor is chosen

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(searchTerm);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [searchTerm, selectedVendor, runSearch]);

  if (selectedVendor) {
    return (
      <VendorProductUploadContent
        adminMode
        overrideVendorId={selectedVendor.id}
        overrideVendorName={selectedVendor.storeName}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar />
        <div className="p-8 max-w-2xl">
          <h1 className="text-2xl font-bold text-[#3e3e3e] mb-2">Add Product for a Vendor</h1>
          <p className="text-gray-600 mb-6">
            Search for the vendor you want to upload a product on behalf of. This is logged
            as an admin-created product, separate from anything the vendor uploads themselves.
          </p>

          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by store name or email..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
          />

          {searching && <p className="text-gray-500 text-sm mb-4">Searching...</p>}
          {searchError && <p className="text-red-600 text-sm mb-4">{searchError}</p>}

          {!searching && !searchError && results.length === 0 && searchTerm && (
            <p className="text-gray-500 text-sm mb-4">No vendors found for "{searchTerm}".</p>
          )}

          <div className="space-y-2">
            {results.map((vendor) => (
              <button
                key={vendor.id}
                onClick={() => setSelectedVendor(vendor)}
                className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-[#3e3e3e]">{vendor.storeName}</p>
                  <p className="text-sm text-gray-500">{vendor.email}</p>
                </div>
                {vendor.profileComplete === false && (
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                    Profile incomplete
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate('/admin/vendor-management')}
            className="mt-6 text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Vendor Management
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProductUploadPage;
