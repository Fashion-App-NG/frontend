import { useState, useEffect, useCallback } from 'react';
import { FaEdit } from 'react-icons/fa';
import { adminService } from '../../services/adminService';
import ErrorMessage from './AdminError';
import UpdateModal from './AdminUpdateModal';


const TaxManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTax, setSelectedTax] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tax, setTax] = useState(null);
  const [history, setHistory] = useState([]);

  // hangle update button
  const handleUpdateClick = (tax) => {
    setSelectedTax(tax);
    setIsModalOpen(true);
  };

  const fetchTax = useCallback(async () => {
    try {
      const data = await adminService.GetCurrentTax();
      setTax(data.data);
    } catch (error){
      setError(error.message);
    }
  }, []);

  const fetchTaxHistory = useCallback(async () => {
    try {
      const data = await adminService.GetTaxHistory();
      setHistory(data.data.history || []);
    } catch (error){
      setError(error.message);
    }
  }, []);
  
  
  // Fetch tax on component mount
  useEffect (() => {
    fetchTax();
    fetchTaxHistory();
  }, [fetchTax, fetchTaxHistory]);

  
  const handleToggleTax = async (feeId) => {
    setLoading(true);
    try {
      await adminService.ToggleTax();
      await fetchTaxHistory(); // refresh list after toggle
      await fetchTax();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

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

  //handle status update
  const handleTaxUpdate = async () => {
    if (!selectedTax) return;

    setLoading(true);
    try {
      await adminService.UpdateTax({
        taxRate: Number(selectedTax.taxRate),
        description: selectedTax.description,
      });
      await fetchTax();
      setSelectedTax(null);
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
        <h1 className="text-2xl font-bold text-gray-900">Tax Management</h1>
        <p className="text-gray-600">Track Platform Tax</p>
      </div>

      {/* Error Message */}
      <ErrorMessage message={error} />

      {/* Global Tax Table */}
      {tax ? (
        <div className="mb-6 overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">Tax Rate</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">Tax Rate Percentage</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{tax?.taxRate}</td>
                <td className="px-4 py-2 border-b">{tax?.taxRatePercentage}</td>
                <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateClick(tax)} 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <FaEdit />
                      </button>
                    </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <button
          onClick={() => {
            setSelectedTax({ taxRate: "", description: "" }); // empty form
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Set Tax
        </button>
      )}

      {/* Tax History Table */}
      <div className="bg-white rounded-lg shadow mt-6">
        <div className="p-6">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No tax history found.</div>
          ) : (
            
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-4">Tax Rate</th>
                    <th className="text-left pb-4">Tax Rate Percentate</th>
                    <th className="text-left pb-4">Status</th>
                    <th className="text-left pb-4">Effective Date</th>
                    <th className="text-left pb-4">Description</th>
                    <th className="text-left pb-4">Updated By</th>
                    <th className="text-left pb-4">Date Created</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                  <>
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-4">
                        {item.taxRate}
                      </td>
                      <td>
                        <div>
                          <p className="font-medium">{item.taxRatePercentage}</p>
                        </div>
                      </td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.isActive === true ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                          <button
                            onClick={() => handleToggleTax()}
                            className="ml-2 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                          >
                            Toggle
                          </button>
                      </td>
                      <td>{formatDate(item.effectiveDate)}</td>
                      <td>{item.description}</td>
                      <td>{item.updatedBy}</td>
                      <td>{formatDate(item.createdAt)}</td>
                    </tr>
                  </>
                ))}
                </tbody>
              </table>
          )}
        </div>
      </div>


      {/* Status Update Modal */}
      <UpdateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Update Tax"
        onSubmit={handleTaxUpdate}
      >
        {/* Custom form fields */}
        <div>
          <input
            type="number"
            step="0.01"
            value={selectedTax?.taxRate || ""}
            onChange={(e) =>
              setSelectedTax({ ...selectedTax, taxRate: e.target.value })
            }
            className="w-full p-2 border rounded mb-4"
            placeholder="Tax Rate"
          />
          <textarea
            value={selectedTax?.description || ""}
            onChange={(e) =>
              setSelectedTax({ ...selectedTax, description: e.target.value })
            }
            className="w-full p-2 border rounded mb-4"
            placeholder="Description"
          />
        </div>
      </UpdateModal>
    </div>
  );
};

export default TaxManagement;