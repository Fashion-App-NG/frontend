import { useState, useEffect, useCallback } from 'react';
//import { FaTimes, FaEdit, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { adminService } from '../../services/adminService';
import FilterSection from './AdminFilter';
import ErrorMessage from './AdminError';


const Earnings = () => {
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    vendorId: '',
    search: ''
  });

  const filterConfigs = [
    { key: "startDate", type: "date", placeholder: "Start Date"},
    { key: "endDate", type: "date", placeholder: "End Date"},
    { key: "vendorId", type: "text", placeholder: "Filter by Vendor ID" },
  ];


  const fetchEarnings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getFeesEarnings(
        filters // current filters state
      );

        if (data?.report) {
            setEarnings(data.report);
            setError(null);
        } else {
            setError(data.message || "No Fee Earnings Available")
        }

      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false);
    }

  }, [filters]);
  
  
  // Fetch Fees on component mount
  useEffect (() => {
    fetchEarnings();
  }, [fetchEarnings]);

  

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  }

  // format date
  /*const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }*/

  // handle filter search change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };


  return (
    <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Fees Breakdown</h1>
            <p className="text-gray-600">Track Platform Fees Across Orders</p>
        </div>

        {/* Error Message */}
        <ErrorMessage message={error} />

        {/* Search and Filter Section */}
        <FilterSection 
            filters={filters}
            onFilterChange={handleFilterChange}
            filterConfigs={filterConfigs}
            onReset={() => {
            setFilters({
                startDate: '',
                endDate: '',
                vendorId: '',
                search: ''
            });
            }}       
        />

        
        {/* Summary Section */}
        {loading ? (
            <div className="text-center py-4">Loading...</div>
        ) : (earnings && (
        <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-100 rounded-lg shadow">
                <h4 className="text-sm font-semibold text-gray-700">Total Fees</h4>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(earnings.totalFees) || 0}</p>
            </div>
            <div className="p-4 bg-green-100 rounded-lg shadow">
                <h4 className="text-sm font-semibold text-gray-700">Total Orders</h4>
                <p className="text-xl font-bold text-gray-900">{earnings.totalOrders || 0}</p>
            </div>
            <div className="p-4 bg-purple-100 rounded-lg shadow">
                <h4 className="text-sm font-semibold text-gray-700">Total Transactions</h4>
                <p className="text-xl font-bold text-gray-900">{earnings.totalTransactions || 0}</p>
            </div>
        </div>
        ))}

        {/* Breakdown Table by Level */}
        <div className="bg-white rounded-lg shadow mt-6">
            <div className="p-6">
            {loading ? (
                <div className="text-center py-4">Loading...</div>
            ) : earnings.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No Earnings found.</div>
            ) : (
            <>
                <h3 className="font-semibold mb-2">Breakdown by Level</h3>
                <table className="w-full">
                    <thead>
                    <tr className="border-b">
                        <th className="text-left pb-4">Level</th>
                        <th className="text-left pb-4">Count</th>
                        <th className="text-left pb-4">Amount</th>
                    </tr>
                    </thead>
                    <tbody>
                    {Object.entries(earnings.breakdownByLevel).map(([level, data]) => (
                    <>
                        <tr key={level} className="border-b hover:bg-gray-50">
                        <td className="py-4">
                            {level}
                        </td>
                        <td>{data.count}</td>
                        <td>{data.amount}</td>
                        </tr>
                    </>
                    ))}
                    </tbody>
                </table>
            </>
            )}
            </div>
        </div>
        
        {/* Breakdown Table by Type */}
        <div className="bg-white rounded-lg shadow mt-6">
            <div className="p-6">
            {loading ? (
                <div className="text-center py-4">Loading...</div>
            ) : earnings.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No Earnings found.</div>
            ) : (
            <>
                <h3 className="font-semibold mb-2">Breakdown by Type</h3>
                <table className="w-full">
                    <thead>
                    <tr className="border-b">
                        <th className="text-left pb-4">Type</th>
                        <th className="text-left pb-4">Count</th>
                        <th className="text-left pb-4">Amount</th>
                    </tr>
                    </thead>
                    <tbody>
                    {Object.entries(earnings.breakdownByType).map(([type, data]) => (
                    <>
                        <tr key={type} className="border-b hover:bg-gray-50">
                        <td className="py-4">
                            {type}
                        </td>
                        <td>{data.count}</td>
                        <td>{data.amount}</td>
                        </tr>
                    </>
                    ))}
                    </tbody>
                </table>
            </>
            )}
            </div>
        </div>
    </div>
  );
};

export default Earnings;