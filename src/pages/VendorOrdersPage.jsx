import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const ORDER_STATUSES = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
  { key: "EXPIRED", label: "Expired" }
];

const STATUS_STYLES = {
  "PENDING": { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-400" },
  "CONFIRMED": { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-400" },
  "PROCESSING": { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-400" },
  "SHIPPED": { bg: "bg-indigo-100", text: "text-indigo-700", dot: "bg-indigo-400" },
  "DELIVERED": { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-400" },
  "CANCELLED": { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-400" },
  "EXPIRED": { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-400" }
};

const PAYMENT_STYLES = {
  "PAID": { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-400" },
  "PENDING": { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-400" },
  "REFUNDED": { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-400" },
  "FAILED": { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-400" }
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-400" };
  return (
    <button
      className={`inline-flex items-center px-3 py-1 rounded-lg font-semibold text-xs ${style.bg} ${style.text} border-none`}
      style={{ minWidth: 90 }}
      disabled
    >
      <span className={`w-2 h-2 rounded-full mr-2 ${style.dot}`}></span>
      {status}
    </button>
  );
};

const PaymentBadge = ({ status }) => {
  const style = PAYMENT_STYLES[status] || { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-400" };
  return (
    <button
      className={`inline-flex items-center px-3 py-1 rounded-lg font-semibold text-xs ${style.bg} ${style.text} border-none`}
      style={{ minWidth: 90 }}
      disabled
    >
      <span className={`w-2 h-2 rounded-full mr-2 ${style.dot}`}></span>
      {status}
    </button>
  );
};

const ActionMenu = ({ onDispatch, onCancel }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        className="p-2 rounded-lg hover:bg-gray-100"
        onClick={() => setOpen((v) => !v)}
      >
        <svg width={20} height={20} fill="currentColor" className="text-gray-500">
          <circle cx="4" cy="10" r="2" />
          <circle cx="10" cy="10" r="2" />
          <circle cx="16" cy="10" r="2" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-10">
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-green-700"
            onClick={() => { setOpen(false); onDispatch(); }}
          >
            Dispatch
          </button>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-red-700"
            onClick={() => { setOpen(false); onCancel(); }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default function VendorOrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalOrders: 0
  });

  useEffect(() => {
    if (!user?.id || !isAuthenticated) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/api/vendor-orders/${user.id}/orders?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(res => {
        setOrders(res.data.orders || []);
        setPagination({
          totalPages: res.data.pagination?.totalPages || 1,
          totalOrders: res.data.pagination?.totalOrders || 0
        });
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Failed to fetch orders");
        setLoading(false);
      });
  }, [user?.id, isAuthenticated, page, sortBy, sortOrder, limit]);

  // Filter orders by tab and search
  const filteredOrders = useMemo(() => {
    let filtered = orders;
    if (activeTab !== "ALL") {
      filtered = filtered.filter(order => order.status === activeTab);
    }
    if (search.trim()) {
      filtered = filtered.filter(order => order.orderNumber?.toLowerCase().includes(search.trim().toLowerCase()));
    }
    filtered = [...filtered].sort((a, b) => {
      let aVal = a[sortBy], bVal = b[sortBy];
      if (sortBy === "createdAt") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [orders, activeTab, search, sortBy, sortOrder]);

  // Calculate item count for current page
  const itemsOnPage = useMemo(() => {
    return filteredOrders.reduce((sum, order) => sum + (order.items?.length || 0), 0);
  }, [filteredOrders]);

  // Update summary stats to use filteredOrders (orders on current page)
  const orderStats = useMemo(() => {
    return {
      totalOrders: pagination.totalOrders, // overall orders
      activeOrders: filteredOrders.filter(o => ["PENDING", "PROCESSING", "SHIPPED"].includes(o.status)).length,
      completedOrders: filteredOrders.filter(o => o.status === "DELIVERED").length,
      cancelledOrders: filteredOrders.filter(o => o.status === "CANCELLED").length,
      itemsOnPage,
    };
  }, [filteredOrders, pagination.totalOrders, itemsOnPage]);

  // Add this function before your return statement
  function handleSort(field) {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }

  // Table rows: show orders, not items
  if (!isAuthenticated) return <div>Please log in.</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex-1 ml-[254px] p-8 bg-gray-50 min-h-screen">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="text-3xl font-bold text-gray-900 mb-1">{orderStats.totalOrders}</div>
          <div className="text-gray-500 text-sm">Overall Orders</div>
          <div className="text-xs text-gray-400 mt-1">Page {page} of {pagination.totalPages}</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="text-3xl font-bold text-gray-900 mb-1">{orderStats.itemsOnPage}</div>
          <div className="text-gray-500 text-sm">Items (this page)</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="text-3xl font-bold text-gray-900 mb-1">{orderStats.activeOrders}</div>
          <div className="text-gray-500 text-sm">Active Orders (this page)</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="text-3xl font-bold text-gray-900 mb-1">{orderStats.completedOrders}</div>
          <div className="text-gray-500 text-sm">Completed Orders (this page)</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="text-3xl font-bold text-gray-900 mb-1">{orderStats.cancelledOrders}</div>
          <div className="text-gray-500 text-sm">Cancelled Orders (this page)</div>
        </div>
      </div>

      {/* Search, filter, tabs */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search order id…"
            className="w-full md:w-80 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium text-sm hover:bg-blue-50 transition-colors">
            <svg className="inline mr-2" width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Filter
          </button>
        </div>
        <div className="flex gap-2 flex-wrap mt-2">
          {ORDER_STATUSES.map(tab => (
            <button
              key={tab.key}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort("orderNumber")}>
                ID {sortBy === "orderNumber" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort("createdAt")}>
                Date {sortBy === "createdAt" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort("totalAmount")}>
                Amount {sortBy === "totalAmount" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort("status")}>
                Order Status {sortBy === "status" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort("paymentStatus")}>
                Payment Status {sortBy === "paymentStatus" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                  No orders found for this status.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4">
                    {order.orderNumber} <span className="text-xs text-gray-500 font-semibold">({order.items?.length || 0})</span>
                  </td>
                  <td className="px-6 py-4">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4">{order.customerInfo?.name || order.customerInfo?.email}</td>
                  <td className="px-6 py-4">{order.shippingAddress?.city}, {order.shippingAddress?.state}</td>
                  <td className="px-6 py-4 font-semibold">₦{order.totalAmount?.toLocaleString()}</td>
                  <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                  <td className="px-6 py-4"><PaymentBadge status={order.paymentStatus} /></td>
                  <td className="px-6 py-4">
                    <ActionMenu
                      onDispatch={() => {/* TODO: API call to dispatch order */}}
                      onCancel={() => {/* TODO: API call to cancel order */}}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-2">
        <div className="text-sm text-gray-600">
          Showing {filteredOrders.length} of {pagination.totalOrders} total orders
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
            value={limit}
            onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
          >
            {[10, 20, 50, 100].map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <button
            className="px-3 py-1 rounded-lg border bg-white text-gray-700 disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </button>
          <span className="mx-2 text-sm">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            className="px-3 py-1 rounded-lg border bg-white text-gray-700 disabled:opacity-50"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}