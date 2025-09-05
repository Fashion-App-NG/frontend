import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ORDER_STATUSES = [
  { key: "ALL", label: "All" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
  { key: "EXPIRED", label: "Expired" }
  // PENDING removed from display but still processed in the backend
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

// Generate background colors for orders (light pastel colors)
const getOrderBackgroundColor = (orderId) => {
  const colors = [
    'bg-blue-50', 'bg-green-50', 'bg-purple-50', 'bg-yellow-50', 
    'bg-pink-50', 'bg-indigo-50', 'bg-red-50', 'bg-orange-50'
  ];
  
  // Use the last character of the orderId as a simple hash
  const hash = parseInt(orderId.slice(-1), 16) % colors.length;
  return colors[hash];
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

// Updated ActionMenu to operate on specific item
const ActionMenu = ({ order, item, onSchedulePickup, onCancel, isLoading }) => {
  const [open, setOpen] = useState(false);
  
  // Determine if actions are available based on status
  const canSchedulePickup = order.paymentStatus === "PAID" && item.status === "CONFIRMED";
  const canCancel = ["CONFIRMED", "PROCESSING"].includes(item.status);
  
  // If no actions are available, disable the entire menu
  const anyActionsAvailable = canSchedulePickup || canCancel;

  return (
    <div className="relative">
      <button
        className={`p-2 rounded-lg ${anyActionsAvailable ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
        onClick={() => anyActionsAvailable && setOpen((v) => !v)}
        disabled={!anyActionsAvailable}
      >
        <svg width={20} height={20} fill="currentColor" className="text-gray-500">
          <circle cx="4" cy="10" r="2" />
          <circle cx="10" cy="10" r="2" />
          <circle cx="16" cy="10" r="2" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg z-10">
          {canSchedulePickup && (
          <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-blue-700 relative"
              onClick={() => { 
                setOpen(false); 
                onSchedulePickup(order.id, item.productId); 
              }}
              disabled={isLoading}
            >
              {isLoading && (
                <span className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                  <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              )}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Schedule Pickup
          </button>
          )}
          
          {!canSchedulePickup && (
            <div className="block w-full text-left px-4 py-2 text-gray-400 cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Schedule Pickup
              <div className="text-xs mt-1">Requires confirmed item with payment</div>
            </div>
          )}
          
          {canCancel && (
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-red-700"
              onClick={() => { 
                setOpen(false); 
                onCancel(order.id, item.productId); 
              }}
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            Cancel
          </button>
          )}
          
          {!canCancel && (
            <div className="block w-full text-left px-4 py-2 text-gray-400 cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
              <div className="text-xs mt-1">Only for confirmed or processing items</div>
            </div>
          )}
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
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [processingItemId, setProcessingItemId] = useState(null); // Track which item is being processed
  const [expandedOrders, setExpandedOrders] = useState({});

  // Fetch all orders including those with PENDING status
  useEffect(() => {
    if (!user?.id || !isAuthenticated) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    
    const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/api/vendor-orders/${user.id}/orders?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
    
    axios.get(apiUrl, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const receivedOrders = res.data.orders || [];
        
        // Initialize expanded state for all orders
        const newExpandedState = {};
        receivedOrders.forEach(order => {
          newExpandedState[order.id] = true; // All orders expanded by default
        });
        setExpandedOrders(newExpandedState);
        
        setOrders(receivedOrders);
        setPagination({
          totalPages: res.data.pagination?.totalPages || 1,
          totalOrders: receivedOrders.length || 0
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
    
    // Apply status filter at the item level
    if (activeTab !== "ALL") {
      filtered = filtered.filter(order => {
        // Keep orders that have at least one item matching the active tab status
        return order.items?.some(item => item.status === activeTab);
      });
    }
    
    // Apply search filter
    if (search.trim()) {
      filtered = filtered.filter(order => 
        order.orderNumber?.toLowerCase().includes(search.trim().toLowerCase()) ||
        order.items?.some(item => 
          item.name?.toLowerCase().includes(search.trim().toLowerCase())
        )
      );
    }
    
    // Apply sorting
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

  // Update summary stats
  const orderStats = useMemo(() => {
    // Count items by their status
    const itemsByStatus = filteredOrders.reduce((counts, order) => {
      order.items?.forEach(item => {
        counts[item.status] = (counts[item.status] || 0) + 1;
      });
      return counts;
    }, {});

    return {
      totalOrders: pagination.totalOrders,
      activeItems: (itemsByStatus["CONFIRMED"] || 0) + (itemsByStatus["PROCESSING"] || 0) + (itemsByStatus["SHIPPED"] || 0),
      completedItems: itemsByStatus["DELIVERED"] || 0,
      cancelledItems: itemsByStatus["CANCELLED"] || 0,
      itemsOnPage,
    };
  }, [filteredOrders, pagination.totalOrders, itemsOnPage]);

  // Toggle order expansion
  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleSchedulePickup = async (orderId, productId) => {
    if (!user?.id) return;
    
    try {
      // Find the item
      const orderToUpdate = orders.find(order => order.id === orderId);
      const productToUpdate = orderToUpdate?.items?.find(item => item.productId === productId);
      
      if (productToUpdate?.status === "PROCESSING") {
        alert("This item is already scheduled for pickup.");
        return;
      }
      
      // Show loading indicator and track which item is being processed
      setIsActionLoading(true);
      setProcessingItemId(`${orderId}-${productId}`);
      
      const token = localStorage.getItem("token");
      
      // Add timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      try {
        const response = await axios.put(
          `${process.env.REACT_APP_API_BASE_URL}/api/vendor-orders/${user.id}/orders/${orderId}/products/${productId}/status`,
          { status: "PROCESSING" },
          { 
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal
          }
        );
        
        clearTimeout(timeoutId);
        
        // Check response
        if (!response || !response.data) {
          throw new Error("Invalid response from server");
        }
        
        // Update local state
        setOrders(prevOrders => 
          prevOrders.map(order => {
            if (order.id === orderId) {
              // Update the status of the specific product
              const updatedItems = order.items.map(item => {
                if (item.productId === productId) {
                  return { ...item, status: "PROCESSING" };
                }
                return item;
              });
              
              // Derive order status based on items
              const allProcessing = updatedItems.every(item => 
                ["PROCESSING", "SHIPPED", "DELIVERED"].includes(item.status)
              );
              const anyProcessing = updatedItems.some(item => item.status === "PROCESSING");
              
              let newStatus = order.status;
              if (allProcessing) {
                newStatus = "PROCESSING";
              } else if (anyProcessing && order.status === "CONFIRMED") {
                newStatus = "PROCESSING";
              }
              
              return { ...order, items: updatedItems, status: newStatus };
            }
            return order;
          })
        );
        
        // Show success message
        alert("Item scheduled for pickup successfully!");
      } catch (networkError) {
        if (networkError.name === 'AbortError') {
          console.error("Request timed out");
          alert("Request timed out. Please try again.");
        } else {
          throw networkError;
        }
      }
    } catch (error) {
      console.error("Failed to schedule pickup:", error);
      alert(`Failed to schedule pickup: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsActionLoading(false);
      setProcessingItemId(null);
    }
  };

  const handleCancel = async (orderId, productId) => {
    if (!user?.id) return;
    
    try {
      // Find the item
      const orderToUpdate = orders.find(order => order.id === orderId);
      const productToUpdate = orderToUpdate?.items?.find(item => item.productId === productId);
      
      if (!["CONFIRMED", "PROCESSING"].includes(productToUpdate?.status)) {
        alert("Only confirmed or processing items can be cancelled.");
        return;
      }
      
      // Confirm cancellation
      if (!window.confirm("Are you sure you want to cancel this item?")) {
        return;
      }
      
      // Show loading indicator
      setIsActionLoading(true);
      setProcessingItemId(`${orderId}-${productId}`);
      
      const token = localStorage.getItem("token");
      
      // Remove unused variable by not storing the response or use it
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/vendor-orders/${user.id}/orders/${orderId}/products/${productId}/status`,
        { status: "CANCELLED" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.id === orderId) {
            // Update the status of the specific product
            const updatedItems = order.items.map(item => {
              if (item.productId === productId) {
                return { ...item, status: "CANCELLED" };
              }
              return item;
            });
            
            // Derive order status based on items
            const allCancelled = updatedItems.every(item => item.status === "CANCELLED");
            
            let newStatus = order.status;
            if (allCancelled) {
              newStatus = "CANCELLED";
            }
            
            return { ...order, items: updatedItems, status: newStatus };
          }
          return order;
        })
      );
      
      // Show success message
      alert("Item cancelled successfully!");
    } catch (error) {
      console.error("Failed to cancel item:", error);
      alert(`Failed to cancel item: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsActionLoading(false);
      setProcessingItemId(null);
    }
  };

  function handleSort(field) {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }

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
          <div className="text-3xl font-bold text-gray-900 mb-1">{itemsOnPage}</div>
          <div className="text-gray-500 text-sm">Items (this page)</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="text-3xl font-bold text-gray-900 mb-1">{orderStats.activeItems}</div>
          <div className="text-gray-500 text-sm">Active Items</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="text-3xl font-bold text-gray-900 mb-1">{orderStats.completedItems}</div>
          <div className="text-gray-500 text-sm">Completed Items</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="text-3xl font-bold text-gray-900 mb-1">{orderStats.cancelledItems}</div>
          <div className="text-gray-500 text-sm">Cancelled Items</div>
        </div>
      </div>

      {/* Search, filter, tabs */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search order id or item name…"
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
      
      {/* Item-centric Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort("orderNumber")}>
                Order ID {sortBy === "orderNumber" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Qty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort("createdAt")}>
                Date {sortBy === "createdAt" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              // Render orders with their items
              filteredOrders.map((order) => {
                const isExpanded = expandedOrders[order.id];
                const rowBgColor = getOrderBackgroundColor(order.id);
                
                // Filter items based on active tab
                let visibleItems = order.items || [];
                if (activeTab !== "ALL") {
                  visibleItems = visibleItems.filter(item => item.status === activeTab);
                }
                
                if (visibleItems.length === 0) {
                  return null; // Skip orders with no visible items
                }
                
                return (
                  <React.Fragment key={order.id}>
                    {/* Order header row */}
                    <tr className={`group border-t-2 border-gray-200 ${rowBgColor}`}>
                      <td className="px-6 py-3">
                        <div className="flex items-center">
                          <button 
                            onClick={() => toggleOrderExpansion(order.id)}
                            className="mr-2 focus:outline-none"
                          >
                            <svg 
                              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          <Link to={`/vendor/orders/${order.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                            {order.orderNumber}
                          </Link>
                          <span className="ml-2 text-xs text-gray-500 font-semibold">({visibleItems.length} items)</span>
                        </div>
                      </td>
                      <td colSpan="7" className="px-6 py-3 text-sm text-gray-500">
                        Order Total: <span className="font-medium">₦{order.totalAmount?.toLocaleString()}</span> | 
                        Location: <span className="font-medium">{order.shippingAddress?.city}, {order.shippingAddress?.state}</span> | 
                        Date: <span className="font-medium">{formatDate(order.createdAt)}</span>
                      </td>
                    </tr>
                    
                    {/* Item rows - only visible when order is expanded */}
                    {isExpanded && visibleItems.map((item, idx) => (
                      <tr key={`${order.id}-${item.productId}`} className={rowBgColor}>
                        <td className="px-6 py-3 pl-14 border-b border-gray-100"></td>
                        <td className="px-6 py-3 border-b border-gray-100">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500">
                            {item.materialType} | {item.pattern}
                          </div>
                        </td>
                        <td className="px-6 py-3 border-b border-gray-100">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-6 py-3 border-b border-gray-100">
                          {item.quantity} {item.quantity > 1 ? 'yards' : 'yard'}
                        </td>
                        <td className="px-6 py-3 border-b border-gray-100">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-3 border-b border-gray-100">
                          {order.customerInfo?.name || order.customerInfo?.email}
                        </td>
                        <td className="px-6 py-3 border-b border-gray-100">
                          <PaymentBadge status={order.paymentStatus} />
                        </td>
                        <td className="px-6 py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-2">
                            <Link to={`/vendor/orders/${order.id}`} className="text-blue-600 hover:text-blue-800">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Link>
                            <ActionMenu
                              order={order}
                              item={item}
                              onSchedulePickup={handleSchedulePickup}
                              onCancel={handleCancel}
                              isLoading={isActionLoading && processingItemId === `${order.id}-${item.productId}`}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-2">
        <div className="text-sm text-gray-600">
          Showing {filteredOrders.length} orders with {itemsOnPage} items
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