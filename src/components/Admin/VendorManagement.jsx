// VendorManagement.jsx
import React, { useCallback, useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp, FaEdit, FaTimes } from "react-icons/fa";
import { adminService } from "../../services/adminService";
import ErrorMessage from "./AdminError";
import FilterSection from "./AdminFilter";
import Pagination from "./AdminPagination";
import UpdateModal from "./AdminUpdateModal";

const VendorManagement = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedVendorId, setExpandedVendorId] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 20,
    });

    // Filter options
    const statusOptions = ["PENDING", "APPROVED", "SUSPENDED","DEACTIVATED"]; // "" => all
    const reliabilityOptions = ["Excellent", "Very Good", "Good", "Fair", "Below Average", "Poor"]; // "" => all

    // Filters state
    const [filters, setFilters] = useState({
        status: "",
        reliabilityLevel: "",
        search: "",
    });

    const filterConfigs = [
        { key: "status", type: "select", placeholder: "All Status", options: statusOptions },
        { key: "reliabilityLevel", type: "select", placeholder: "All Reliability", options: reliabilityOptions },
        { key: "search", type: "text", placeholder: "Search by name or email" },
    ];

    // Fetch vendors from the API
    const fetchVendors = useCallback(async () => {
        setLoading(true);
        try {
        // Build probable filter payload:
        // Back-end may expect different keys — we send role & search as-is.
        // For status, map to `isSuspended` boolean query param (suspended => true; active => false)

            const data = await adminService.GetVendors(
                // NOTE: GetVendors signature in your service expects no pagination params,
                // but many endpoints support query params. We attempt to call it directly.
                // If your backend supports page/limit via query params, update adminService.GetVendors accordingly.
                filters
            );

            /**
             * Possible shapes:
             * 1) data = { vendors: [...], pagination: {...} }
             * 2) data = { data: [...], pagination: {...} }
             * 3) data = [...] (array)
             *
             * We'll handle the common possibilities to be resilient.
             */
            let items = [];
            let returnedPagination = {};

            if (!data) {
                items = [];
            } else if (Array.isArray(data)) {
                items = data;
            } else if (data.vendors) {
                items = data.vendors;
                returnedPagination = data.pagination || {};
            } else if (data.data) {
                items = data.data;
                returnedPagination = data.pagination || {};
            } else if (data.results) {
                items = data.results;
                returnedPagination = data.pagination || {};
            } else {
                // fallback — try to find the first array value
                const firstArray = Object.values(data).find((v) => Array.isArray(v));
                items = firstArray || [];
                returnedPagination = data.pagination || {};
            }

            setVendors(items);
            setPagination((prev) => ({
                ...prev,
                ...returnedPagination,
            }));

            // If backend returns message on success, clear or set accordingly:
            setError(null);
            } catch (err) {
            setError(err.message || "Failed to fetch vendors");
            } finally {
            setLoading(false);
            }
        }, [filters]);

    // Load vendors on mount and when filters/pagination change
    useEffect(() => {
        fetchVendors();
    }, [fetchVendors, pagination.currentPage]);

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
        return new Date(dateString).toLocaleDateString("en-GB", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
        } catch {
        return dateString;
        }
    };

  // When clicking Edit
  const handleUpdateClick = (vendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  // Update vendor profile
  const handleVendorUpdate = async () => {
    if (!selectedVendor || !selectedVendor._id) return;
    setLoading(true);
    try {
      const payload = {
        email: selectedVendor.email,
        phone: selectedVendor.phone,
        storeName: selectedVendor.storeName,
        pickupAddress: {
            line1: selectedVendor.vendorProfile?.pickupAddress?.line1 || "",
            city: selectedVendor.vendorProfile?.pickupAddress?.city || "",
            state: selectedVendor.vendorProfile?.pickupAddress?.state || "",
            zip: selectedVendor.vendorProfile?.pickupAddress?.zip || "",
            country: selectedVendor.vendorProfile?.pickupAddress?.country || ""
        }
        // add any other updatable fields you want to allow
      };

      await adminService.UpdateVendorProfile(selectedVendor._id, payload);
      await fetchVendors();
      setIsModalOpen(false);
      setSelectedVendor(null);
    } catch (err) {
      setError(err.message || "Failed to update vendor");
    } finally {
      setLoading(false);
    }
  };

  // Approve vendor
  const handleApprove = async (vendorId) => {
    if (!vendorId) return;
    if (!window.confirm("Are you sure you want to approve this vendor?")) return;
    setLoading(true);
    try {
      await adminService.ApproveVendor(vendorId);
      await fetchVendors();
    } catch (err) {
      setError(err.message || "Failed to approve vendor");
    } finally {
      setLoading(false);
    }
  };

  // Suspend vendor
  const handleSuspend = async (vendorId) => {
    if (!vendorId) return;
    if (!window.confirm("Are you sure you want to suspend this vendor?")) return;
    setLoading(true);
    try {
      await adminService.SuspendVendor(vendorId);
      await fetchVendors();
    } catch (err) {
      setError(err.message || "Failed to suspend vendor");
    } finally {
      setLoading(false);
    }
  };

  // Unsuspend vendor
  const handleUnsuspend = async (vendorId) => {
    if (!vendorId) return;
    if (!window.confirm("Are you sure you want to unsuspend this vendor?")) return;
    setLoading(true);
    try {
      await adminService.UnsuspendVendor(vendorId);
      await fetchVendors();
    } catch (err) {
      setError(err.message || "Failed to unsuspend vendor");
    } finally {
      setLoading(false);
    }
  };

  // Disable vendor (permanent disable)
  const handleDisable = async (vendorId) => {
    if (!vendorId) return;
    if (!window.confirm("Are you sure you want to disable this vendor? This action may be irreversible.")) return;
    setLoading(true);
    try {
      await adminService.DisableVendor(vendorId);
      await fetchVendors();
    } catch (err) {
      setError(err.message || "Failed to disable vendor");
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    // reset to page 1 when filters change
    setPagination((prev) => ({ ...prev, currentPage: 1 }));

    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Handle page change (pagination component)
  const handlePageChange = (newPage) => {
    if (newPage < 1) return;
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
        <p className="text-gray-600">Manage platform vendors — edit profiles, suspend, or disable accounts.</p>
      </div>

      {/* Error Message */}
      <ErrorMessage message={error} />

      {/* Filters */}
      <FilterSection
        filters={filters}
        onFilterChange={handleFilterChange}
        filterConfigs={filterConfigs}
        onReset={() => {
          setFilters({
            status: "",
            reliabilityLevel: "",
            search: "",
          });
          setPagination((prev) => ({ ...prev, currentPage: 1 }));
        }}
      />

      {/* Vendors Table */}
      <div className="bg-white rounded-lg shadow mt-6">
        <div className="p-6">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No vendors found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-4" />
                    <th className="text-left pb-4">ID</th>
                    <th className="text-left pb-4">Store Name</th>
                    <th className="text-left pb-4">Phone</th>
                    <th className="text-left pb-4">Status</th>
                    <th className="text-left pb-4">Created At</th>
                    <th className="text-left pb-4">Updated At</th>
                    <th className="text-left pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor) => (
                    <React.Fragment key={vendor._id}>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-4">
                          <button
                            onClick={() => setExpandedVendorId(expandedVendorId === (vendor._id || vendor.id) ? null : (vendor._id || vendor.id))}
                            className="flex items-center gap-2"
                          >
                            {expandedVendorId === (vendor._id || vendor.id) ? <FaChevronUp /> : <FaChevronDown />}
                          </button>
                        </td>
                        <td className="py-4 text-sm">{vendor.email || vendor.id}</td>
                        <td className="py-4">
                          <div>
                            <p className="font-medium">{vendor.vendorProfile?.storeName || "-"}</p>
                          </div>
                        </td>
                        <td>{vendor.vendorProfile?.businessInfo?.contactPerson?.phone || "-"}</td>
                        <td>
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                            {vendor.role || "vendor"}
                          </span>
                        </td>
                        <td>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            (vendor.vendorProfile?.status || vendor.status) === "APPROVED" ? "bg-green-100 text-green-800" :
                            (vendor.vendorProfile?.status || vendor.status) === "PENDING" ? "bg-yellow-200 text-yellow-700" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {vendor.vendorProfile?.status}
                          </span>

                          <div className="mt-2 flex gap-2">
                            {(vendor.vendorProfile?.status || vendor.status) === "SUSPENDED" ? (
                              <button
                                onClick={() => handleUnsuspend(vendor._id || vendor.id)}
                                className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                              >
                                Unsuspend
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSuspend(vendor._id || vendor.id)}
                                className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                              >
                                Suspend
                              </button>
                            )}

                            {(vendor.vendorProfile?.status || vendor.status) !== "APPROVED" ? (
                              <button
                                onClick={() => handleApprove(vendor._id || vendor.id)}
                                className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                              >
                                Approve
                              </button>
                            ) : null}

                          </div>
                        </td>
                        <td>{formatDate(vendor.createdAt)}</td>
                        <td>{formatDate(vendor.updatedAt)}</td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateClick(vendor)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => {
                                // Quick delete/disable is not exposed in adminService as deleteVendor,
                                // so we reuse DisableVendor for hard disabling (if backend supports).
                                handleDisable(vendor._id || vendor.id);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {expandedVendorId === (vendor._id || vendor.id) && (
                        <tr>
                          <td colSpan="9" className="bg-gray-50 p-4">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <h4 className="font-medium mb-2">Contact</h4>
                                <p className="text-sm">{vendor.vendorProfile?.businessInfo?.contactPerson?.name || "N/A"}</p>
                                <p className="text-sm">{vendor.vendorProfile?.pickupAddress?.street || "N/A"}</p>
                                <p className="text-sm">{vendor.vendorProfile?.pickupAddress?.city || "N/A"}</p>
                                <p className="text-sm">{vendor.vendorProfile?.pickupAddress?.state || "N/A"}</p>
                                <p className="text-sm">{vendor.vendorProfile?.pickupAddress?.country || "N/A"}</p>

                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Meta</h4>
                                <p className="text-sm">Rating: {vendor.vendorProfile?.reliabilityMetrics?.rating || "N/A"}</p>
                                <p className="text-sm">level: {vendor.vendorProfile?.reliabilityMetrics?.level || "N/A"}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      <Pagination
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      {/* Update Modal */}
      <UpdateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVendor(null);
        }}
        title="Update Vendor"
        onSubmit={handleVendorUpdate}
      >
        {/* Inline, bound inputs (keeps same pattern as FeesManagement) */}
        <div>
            <input
                type="email"
                value={selectedVendor?.email || ""}
                onChange={(e) => setSelectedVendor({ ...selectedVendor, email: e.target.value })}
                className="w-full p-2 border rounded mb-4"
                placeholder="Email"
            />
            <input
                type="text"
                value={selectedVendor?.phone || ""}
                onChange={(e) => setSelectedVendor({ ...selectedVendor, phone: e.target.value })}
                className="w-full p-2 border rounded mb-4"
                placeholder="Phone"
            />
            <input
                type="text"
                value={selectedVendor?.storeName || ""}
                onChange={(e) => setSelectedVendor({ ...selectedVendor, storeName: e.target.value })}
                className="w-full p-2 border rounded mb-4"
                placeholder="Store Name"
            />
            <select
                value={selectedVendor?.vendorProfile?.reliabilityMetrics?.level || ""}
                onChange={(e) => setSelectedVendor({ ...selectedVendor, reliability: e.target.value })}
                className="w-full p-2 border rounded mb-4"
                >
                <option value="">Select Reliability</option>
                {reliabilityOptions.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                ))}
                </select>

                {/* Pickup Address Section */}
                <h3 className="font-semibold mb-2">Pickup Address</h3>
            <input
                type="text"
                value={selectedVendor?.pickupAddress?.line1 || ""}
                onChange={(e) =>
                    setSelectedVendor({
                    ...selectedVendor,
                    pickupAddress: { ...selectedVendor.pickupAddress, line1: e.target.value },
                    })
                }
                className="w-full p-2 border rounded mb-2"
                placeholder="Address Line 1"
            />
            
            <input
                type="text"
                value={selectedVendor?.pickupAddress?.city || ""}
                onChange={(e) =>
                    setSelectedVendor({
                    ...selectedVendor,
                    pickupAddress: { ...selectedVendor.pickupAddress, city: e.target.value },
                    })
                }
                className="w-full p-2 border rounded mb-2"
                placeholder="City"
            />
            
            <input
                type="text"
                value={selectedVendor?.pickupAddress?.state || ""}
                onChange={(e) =>
                    setSelectedVendor({
                    ...selectedVendor,
                    pickupAddress: { ...selectedVendor.pickupAddress, state: e.target.value },
                    })
                }
                className="w-full p-2 border rounded mb-2"
                placeholder="State"
            />
            
            <input
                type="text"
                value={selectedVendor?.pickupAddress?.zip || ""}
                onChange={(e) =>
                    setSelectedVendor({
                    ...selectedVendor,
                    pickupAddress: { ...selectedVendor.pickupAddress, zip: e.target.value },
                    })
                }
                className="w-full p-2 border rounded mb-2"
                placeholder="ZIP Code"
            />
            
            <input
                type="text"
                value={selectedVendor?.pickupAddress?.country || ""}
                onChange={(e) =>
                    setSelectedVendor({
                    ...selectedVendor,
                    pickupAddress: { ...selectedVendor.pickupAddress, country: e.target.value },
                    })
                }
                className="w-full p-2 border rounded mb-4"
                placeholder="Country"
            />
        </div>
      </UpdateModal>
    </div>
  );
};

export default VendorManagement;
