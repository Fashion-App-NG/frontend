import { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaEdit, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { adminService } from '../../services/adminService';
import FilterSection from './AdminFilter';
import Pagination from './AdminPagination';
import ErrorMessage from './AdminError';
import UpdateModal from './AdminUpdateModal';


const FeesManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedFeeId, setExpandedFeeId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 20
  });

  const levelOptions = [
    'GLOBAL',
    'VENDOR',
    'PRODUCT',
  ];

  const feeOptions = [
    'FIXED',
    'PERCENTAGE',
  ];

  const [filters, setFilters] = useState({
    level: '',
    feeType: '',
    vendorId: '',
    productId: '',
    isActive: '',
    search: ''
  });

  const filterConfigs = [
    { key: "level", type: "select", placeholder: "All Level", options: levelOptions },
    { key: "feeType", type: "select", placeholder: "All Fee Type", options: feeOptions },
    { key: "vendorId", type: "text", placeholder: "Filter by Vendor ID" },
    { key: "productId", type: "text", placeholder: "Filter by Product ID" },
    { key: "isActive", type: "select", placeholder:"Filter by Active Status", options: ["true", "false"]}
  ];

  // hangle update button
  const handleUpdateClick = (fee) => {
    setSelectedFee(fee);
    setIsModalOpen(true);
  };

  const fetchFees = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.GetFees(
        pagination.currentPage, // current page from pagination state
        pagination.limit, // limit per page
        filters // current filters state
      );

      setFees(data.feeConfigs);
      setPagination((prev) => ({
      ...prev,          // keep existing defaults
      ...data.pagination, // override only what backend sends
      }));

        //setError(null);
      setError(data.message)

      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false);
    }

  }, [pagination.currentPage, pagination.limit, filters]);

  const fetchSummary = useCallback(async () => {
    try {
      const data = await adminService.GetFeeSummary();
      setSummary(data.summary);
    } catch (error){
      setError(error.message);
    }
  }, []);
  
  
  // Fetch Fees on component mount
  useEffect (() => {
    fetchFees();
    fetchSummary();
  }, [pagination.currentPage, fetchFees, fetchSummary]);

  

  // Format currency
  /*const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  }*/

  // format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // handle filter search
  /*const handleSearch = async () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    setFilters((prev) => ({ ...prev, search: searchId.trim() }));

  };*/

  // handle filter search change
  const handleFilterChange = (key, value) => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));

    let processedValue = value;
    if (key === "isActive") {
        if (value === "true"){
            processedValue = true;
        } else if (value === "false"){
            processedValue = false;
        } else {
            processedValue = "";
        }
    }
    setFilters((prev) => ({ ...prev, [key]: processedValue }));
  };



  //handle status update
  const handleFeeUpdate = async () => {
    if (!selectedFee) return;

    setLoading(true);
    try {
      await adminService.UpdateFee(selectedFee._id, selectedFee);
      await fetchFees();
      setSelectedFee(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteFee = async (feeId) => {
    if (!window.confirm('Are you sure you want to delete this fee?')) return;

    setLoading(true);
    try {
      await adminService.DeleteFee(feeId);
      await fetchFees();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFee = async (feeId) => {
    setLoading(true);
    try {
      await adminService.ToggleFee(feeId);
      await fetchFees(); // refresh list after toggle
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
        <p className="text-gray-600">Manage and track Platform Fees</p>
      </div>

      {/* Error Message */}
      <ErrorMessage message={error} />

      {/* Global Fee Table */}
      {summary?.global && (
        <div className="mb-6 overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">ID</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">Fee Type</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">Fee Value</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{summary?.global?.id}</td>
                <td className="px-4 py-2 border-b">{summary?.global?.feeType}</td>
                <td className="px-4 py-2 border-b">{summary?.global?.feeValue}</td>
                <td className="px-4 py-2 border-b">{summary?.global?.description}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Section */}
      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-100 rounded-lg shadow">
            <h4 className="text-sm font-semibold text-gray-700">Total Fee Count</h4>
            <p className="text-xl font-bold text-gray-900">{summary.totalActive || 0}</p>
          </div>
          <div className="p-4 bg-green-100 rounded-lg shadow">
            <h4 className="text-sm font-semibold text-gray-700">Vendor Fee Count</h4>
            <p className="text-xl font-bold text-gray-900">{summary.vendorCount || 0}</p>
          </div>
          <div className="p-4 bg-red-100 rounded-lg shadow">
            <h4 className="text-sm font-semibold text-gray-700">Product Fee Count</h4>
            <p className="text-xl font-bold text-gray-900">{summary.productCount || 0}</p>
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <FilterSection 
        filters={filters}
        onFilterChange={handleFilterChange}
        filterConfigs={filterConfigs}
        onReset={() => {
          setFilters({
            level: '',
            feeType: '',
            vendorId: '',
            productId: '',
            isActive: '',
            search: ''
          });
          setPagination((prev) => ({ ...prev, currentPage: 1 }));
        }}       
      />



      {/* Fees Table */}
      <div className="bg-white rounded-lg shadow mt-6">
        <div className="p-6">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : fees.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No fees found.</div>
          ) : (
            
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-4">ID</th>
                    <th className="text-left pb-4">Level</th>
                    <th className="text-left pb-4">Vendor ID</th>
                    <th className="text-left pb-4">Product ID</th>
                    <th className="text-left pb-4">Fee Type</th>
                    <th className="text-left pb-4">Fee Value</th>
                    <th className="text-left pb-4">Fee Status</th>
                    <th className="text-left pb-4">Description</th>
                    <th className="text-left pb-4">Date Created</th>
                    <th className="text-left pb-4">Date Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((fee) => (
                  <>
                    <tr key={fee._id} className="border-b hover:bg-gray-50">
                      <td className="py-4">
                        <button
                          onClick={() => setExpandedFeeId(expandedFeeId === fee._id ? null : fee._id)}
                          className="flex items-center gap-2"
                        >
                          {expandedFeeId === fee._id ? <FaChevronUp /> : <FaChevronDown />}
                          {fee._id}
                        </button>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium">{fee.level}</p>
                        </div>
                      </td>
                      <td>{fee.vendorId}</td>
                      <td>{fee.productId}</td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          fee.feeType === 'FIXED' ? 'bg-blue-100 text-blue-800' :
                          fee.feeType === 'PERCENTAGE' ? 'bg-purple-100 text-purple-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {fee.feeType}
                        </span>
                      </td>
                      <td>{fee.feeValue}</td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          fee.isActive === true ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {fee.isActive ? "Active" : "Inactive"}
                        </span>
                          <button
                            onClick={() => handleToggleFee(fee._id)}
                            className="ml-2 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                          >
                            Toggle
                          </button>
                      </td>
                      <td>{fee.description}</td>
                      <td>{formatDate(fee.createdAt)}</td>
                      <td>{formatDate(fee.updatedAt)}</td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateClick(fee)} 
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteFee(fee._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedFeeId === fee._id && (
                      <tr>
                        <td colSpan="6" className="bg-gray-50 p-4">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-medium mb-2">Created By</h4>
                              <p className="text-sm">{fee.createdByAdmin.name}</p>
                              <p className="text-sm">{fee.createdByAdmin.email}</p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">UpdatedBy</h4>
                              <p className="text-sm">{fee.updatedByAdmin.name}</p>
                              <p className="text-sm">{fee.updatedByAdmin.email}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                </tbody>
              </table>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      <Pagination 
        pagination={pagination}
        onPageChange={(newPage) =>
          setPagination((prev) => ({ ...prev, currentPage: newPage }))
        }
      />

      {/* Status Update Modal */}
      {<UpdateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Update Fee"
        onSubmit={handleFeeUpdate}
      >
        {/* Custom form fields */}
        <div>
          <input
            type="number"
            value={selectedFee?.feeValue || ""}
            onChange={(e) =>
              setSelectedFee({ ...selectedFee, feeValue: e.target.value })
            }
            className="w-full p-2 border rounded mb-4"
            placeholder="Fee Value"
          />
          <textarea
            value={selectedFee?.description || ""}
            onChange={(e) =>
              setSelectedFee({ ...selectedFee, description: e.target.value })
            }
            className="w-full p-2 border rounded mb-4"
            placeholder="Fee Value"
          />
        </div>
      </UpdateModal>}
    </div>
  );
};

export default FeesManagement;