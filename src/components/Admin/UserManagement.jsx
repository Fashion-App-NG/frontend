// UserManagement.jsx
import React, { useCallback, useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { adminService } from "../../services/adminService";
import ErrorMessage from "./AdminError";
import Pagination from "./AdminPagination";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedUserId, setExpandedUserId] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 20,
    });

    // Fetch users from the API
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
        // Build probable filter payload:
        // Back-end may expect different keys — we send role & search as-is.
        // For status, map to `isSuspended` boolean query param (suspended => true; active => false)

            const data = await adminService.GetUsers(
                // NOTE: GetUsers signature in your service expects no pagination params,
                // but many endpoints support query params. We attempt to call it directly.
                // If your backend supports page/limit via query params, update adminService.GetUsers accordingly.
            );

            /**
             * Possible shapes:
             * 1) data = { users: [...], pagination: {...} }
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
            } else if (data.users) {
                items = data.users;
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

            setUsers(items);
            setPagination((prev) => ({
                ...prev,
                ...returnedPagination,
            }));

            // If backend returns message on success, clear or set accordingly:
            setError(null);
            } catch (err) {
            setError(err.message || "Failed to fetch users");
            } finally {
            setLoading(false);
            }
        }, []);

    // Load users on mount and when filters/pagination change
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers, pagination.currentPage]);

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

  // Handle page change (pagination component)
  const handlePageChange = (newPage) => {
    if (newPage < 1) return;
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">Manage platform users</p>
      </div>

      {/* Error Message */}
      <ErrorMessage message={error} />

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow mt-6">
        <div className="p-6">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-4" />
                    <th className="text-left pb-4">ID</th>
                    <th className="text-left pb-4">Name</th>
                    <th className="text-left pb-4">Phone</th>
                    <th className="text-left pb-4">Role</th>
                    <th className="text-left pb-4">Status</th>
                    <th className="text-left pb-4">Created At</th>
                    <th className="text-left pb-4">Updated At</th>
                    <th className="text-left pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <React.Fragment key={user._id}>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-4">
                          <button
                            onClick={() => setExpandedUserId(expandedUserId === (user._id || user.id) ? null : (user._id || user.id))}
                            className="flex items-center gap-2"
                          >
                            {expandedUserId === (user._id || user.id) ? <FaChevronUp /> : <FaChevronDown />}
                          </button>
                        </td>
                        <td className="py-4 text-sm">{user.email || user.id}</td>
                        <td className="py-4">
                          <div>
                            <p className="font-medium">{user.name || "-"}</p>
                          </div>
                        </td>
                        <td>{user.phone || "-"}</td>
                        <td>
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                            {user.role || "user"}
                          </span>
                        </td>
                        <td>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.status === "APPROVED" ? "bg-green-100 text-green-800" :
                            user.status === "PENDING" ? "bg-yellow-200 text-yellow-700" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>{formatDate(user.updatedAt)}</td>
                      </tr>

                      {expandedUserId === (user._id || user.id) && (
                        <tr>
                          <td colSpan="9" className="bg-gray-50 p-4">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <h4 className="font-medium mb-2">Contact</h4>
                                <p className="text-sm">{user.phone || "N/A"}</p>
                                <p className="text-sm">{user.address || "N/A"}</p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Meta</h4>
                                <p className="text-sm">Loyalty Tier: {user.loyaltyTier || "N/A"}</p>
                                <p className="text-sm">Preferences: {user.preferences ? JSON.stringify(user.preferences) : "N/A"}</p>
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

    </div>
  );
};

export default UserManagement;
