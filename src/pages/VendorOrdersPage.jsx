import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const ORDER_STATUSES = [
  { key: "ALL", label: "All" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" }
  // PENDING removed from display but still processed in the backend
  // EXPIRED removed as less important
];

const STATUS_STYLES = {
  "PENDING": { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-400" }, // Map to CONFIRMED style
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

// Format price function
const formatPrice = (price) => {
  if (!price) return "Not set";
  
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

// Get product image URL (adapted from productUtils)
const getProductImageUrl = (item) => {
  // Check for image property directly from API response
  if (item.image && item.image.startsWith('http')) {
    return item.image;
  }
  
  // Check for imageUrls array
  if (item.imageUrls && item.imageUrls.length > 0) {
    const imageUrl = item.imageUrls[0];
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return `${process.env.REACT_APP_API_BASE_URL}/uploads/${imageUrl}`;
  }
  
  // Check for single imageUrl property
  if (item.imageUrl) {
    if (item.imageUrl.startsWith('http')) {
      return item.imageUrl;
    }
    return `${process.env.REACT_APP_API_BASE_URL}/uploads/${item.imageUrl}`;
  }
  
  // Default placeholder - use local asset instead of external service
  return '/assets/placeholder-image.png';
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
  // Map PENDING to CONFIRMED for display
  const displayStatus = status === "PENDING" ? "CONFIRMED" : status;
  
  const style = STATUS_STYLES[displayStatus] || { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-400" };
  return (
    <button
      className={`inline-flex items-center px-3 py-1 rounded-lg font-semibold text-xs ${style.bg} ${style.text} border-none`}
      style={{ minWidth: 90 }}
      disabled
    >
      <span className={`w-2 h-2 rounded-full mr-2 ${style.dot}`}></span>
      {displayStatus}
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

// Add this new component for order-level actions
const OrderActionMenu = ({ order, onProcessOrder, onCancelOrder, isLoading }) => {
  const [open, setOpen] = useState(false);
  
  // Determine if actions are available based on order status
  // Allow PENDING to be treated as CONFIRMED
  const displayStatus = order.status === "PENDING" ? "CONFIRMED" : order.status;
  const canProcess = order.paymentStatus === "PAID" && displayStatus === "CONFIRMED";
  const canCancel = ["CONFIRMED", "PROCESSING"].includes(displayStatus);
  
  // If no actions are available, disable the entire menu
  const anyActionsAvailable = canProcess || canCancel;

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
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
          {canProcess && (
          <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-blue-700 relative"
              onClick={() => { 
                setOpen(false); 
                onProcessOrder(order.id); 
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
              Schedule All for Pickup
          </button>
          )}
          
          {!canProcess && (
            <div className="block w-full text-left px-4 py-2 text-gray-400 cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Schedule All for Pickup
              <div className="text-xs mt-1">Requires confirmed items with payment</div>
            </div>
          )}
          
          {canCancel && (
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-red-700"
              onClick={() => { 
                setOpen(false); 
                onCancelOrder(order.id); 
              }}
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            Cancel All My Items
          </button>
          )}
          
          {!canCancel && (
            <div className="block w-full text-left px-4 py-2 text-gray-400 cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel All My Items
              <div className="text-xs mt-1">Only for confirmed or processing items</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to derive the vendor's item status for an order
// This provides a unified view of the status of all the vendor's items in an order
const deriveOrderStatus = (items = []) => {
  if (!items.length) return "CONFIRMED";
  
  // Count items by status
  const statusCounts = items.reduce((counts, item) => {
    // Map PENDING to CONFIRMED
    const status = item.status === "PENDING" ? "CONFIRMED" : item.status;
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});
  
  const totalItems = items.length;
  
  // If all items share the same status, use that
  if (statusCounts["CANCELLED"] === totalItems) return "CANCELLED";
  if (statusCounts["DELIVERED"] === totalItems) return "DELIVERED";
  if (statusCounts["SHIPPED"] === totalItems) return "SHIPPED";
  if ((statusCounts["CONFIRMED"] || 0) + (statusCounts["PENDING"] || 0) === totalItems) return "CONFIRMED";
  
  // If any items are processing, show as processing (unless all others are delivered)
  if (statusCounts["PROCESSING"] > 0) return "PROCESSING";
  
  // Mixed status - prioritize the most advanced status
  if (statusCounts["SHIPPED"] > 0) return "SHIPPED";
  if (statusCounts["CONFIRMED"] > 0 || statusCounts["PENDING"] > 0) return "CONFIRMED";
  
  // Fallback
  return "CONFIRMED";
};

const InfoTooltip = ({ text }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="relative inline-block ml-1">
      <span 
        className="text-gray-400 cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </span>
      {showTooltip && (
        <div className="absolute z-10 w-64 p-2 -ml-20 -mt-16 text-xs text-white bg-gray-700 rounded-lg shadow-lg">
          {text}
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
  const [processingOrderId, setProcessingOrderId] = useState(null); // Track which order is being processed
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
        
        // Process each order to derive the status from its items
        const processedOrders = receivedOrders.map(order => {
          newExpandedState[order.id] = true; // All orders expanded by default
          
          // Derive the order status from its items
          const derivedStatus = deriveOrderStatus(order.items);
          
          return {
            ...order,
            // Override backend status with derived status
            status: derivedStatus,
            // Store original status for reference if needed
            originalStatus: order.status
          };
        });
        
        setExpandedOrders(newExpandedState);
        setOrders(processedOrders);
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
        // Map PENDING to CONFIRMED for filtering purposes
        const getDisplayStatus = (status) => status === "PENDING" ? "CONFIRMED" : status;
        
        // Keep orders that have at least one item matching the active tab status
        return order.items?.some(item => getDisplayStatus(item.status) === activeTab);
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

  // Update summary stats to better track important statuses
  const orderStats = useMemo(() => {
    // Count items by their status
    const itemsByStatus = filteredOrders.reduce((counts, order) => {
      order.items?.forEach(item => {
        // Map PENDING to CONFIRMED for counting purposes
        const displayStatus = item.status === "PENDING" ? "CONFIRMED" : item.status;
        counts[displayStatus] = (counts[displayStatus] || 0) + 1;
      });
      return counts;
    }, {});

    return {
      totalOrders: pagination.totalOrders,
      processingItems: itemsByStatus["PROCESSING"] || 0,
      shippedItems: itemsByStatus["SHIPPED"] || 0,
      deliveredItems: itemsByStatus["DELIVERED"] || 0,
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

  // Update handleProcessOrder function to support both individual and batch endpoints

  const handleProcessOrder = async (orderId) => {
    if (!user?.id) return;
    
    try {
      // Find the order
      const orderToUpdate = orders.find(order => order.id === orderId);
      
      if (orderToUpdate?.status === "PROCESSING") {
        alert("These items are already scheduled for pickup.");
        return;
      }
      
      // Show loading indicator
      setProcessingOrderId(orderId);
      
      const token = localStorage.getItem("token");
      
      // Check if batch endpoint exists (will be added by backend team)
      const useBatchEndpoint = false; // Set to true when backend implements the endpoint
      
      if (useBatchEndpoint) {
        // Future implementation - single API call to update all items
        await axios.put(
          `${process.env.REACT_APP_API_BASE_URL}/api/vendor-orders/${user.id}/orders/${orderId}/status`,
          { status: "PROCESSING" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Update local state for all items
        setOrders(prevOrders => 
          prevOrders.map(order => {
            if (order.id === orderId) {
              const updatedItems = order.items.map(item => ({
                ...item, 
                status: "PROCESSING"
              }));
              
              return { 
                ...order, 
                items: updatedItems, 
                status: "PROCESSING"
              };
            }
            return order;
          })
        );
        
      } else {
        // Current implementation - update each item individually
        // Get all products in this order
        const productsToUpdate = orderToUpdate?.items || [];
        
        if (productsToUpdate.length === 0) {
          throw new Error("No items found in this order");
        }
        
        // IMPORTANT: Add a console.log with very distinct text to see if this code runs
        if (process.env.NODE_ENV === 'development') {
          console.log("🔴🔴🔴 SEQUENTIAL ITEM UPDATE LOGIC IS RUNNING 🔴🔴🔴");
        }
        
        // Process each product SEQUENTIALLY with better error handling and logging
        const successfulUpdates = [];
        const failedUpdates = [];
        
        for (const item of productsToUpdate) {
          // Skip already processed items
          if (item.status === "PROCESSING") {
            console.log(`Skipping already processed item: ${item.productId}`);
            continue;
          }
          
          const endpoint = `${process.env.REACT_APP_API_BASE_URL}/api/vendor-orders/${user.id}/orders/${orderId}/products/${item.productId}/status`;
          if (process.env.NODE_ENV === 'development') {
            console.log(`Updating item ${item.productId} to PROCESSING using endpoint: ${endpoint}`);
          }
          
          try {
            // Add a small delay between requests to prevent race conditions
            await new Promise(resolve => setTimeout(resolve, 500)); // Increased delay to 500ms
            
            const result = await axios.put(
              endpoint,
              { status: "PROCESSING" },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (process.env.NODE_ENV === 'development') {
              console.log(`Successfully updated item ${item.productId}`, result.data);
            }
            successfulUpdates.push(item.productId);
          } catch (itemError) {
            console.error(`Failed to update item ${item.productId}:`, itemError);
            failedUpdates.push({
              id: item.productId,
              error: itemError.response?.data?.message || itemError.message
            });
          }
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Completed processing with ${successfulUpdates.length} successes and ${failedUpdates.length} failures`);
        }
        
        if (failedUpdates.length > 0) {
          console.warn("Failed updates:", failedUpdates);
        }
        
        // Update local state - only if we had at least one successful update
        if (successfulUpdates.length > 0) {
          setOrders(prevOrders => 
            prevOrders.map(order => {
              if (order.id === orderId) {
                // Update all item statuses to PROCESSING, but only for those we successfully updated
                const updatedItems = order.items.map(item => {
                  if (successfulUpdates.includes(item.productId)) {
                    return { ...item, status: "PROCESSING" };
                  }
                  return item;
                });
                
                // Derive the new status based on updated items
                const derivedStatus = deriveOrderStatus(updatedItems);
                
                return { 
                  ...order, 
                  items: updatedItems, 
                  status: derivedStatus
                };
              }
              return order;
            })
          );
        }
      }
      
      // Show success message
      alert("All your items have been scheduled for pickup!");
    } catch (error) {
      console.error("Failed to schedule items for pickup:", error);
      alert(`Failed to schedule items for pickup: ${error.response?.data?.message || error.message}`);
    } finally {
      // Refresh data to ensure everything is up to date
      await refreshOrderData();
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!user?.id) return;
    
    try {
      // Find the order
      const orderToUpdate = orders.find(order => order.id === orderId);
      // Wrap other debug logs in the function (around lines 670-725):
if (process.env.NODE_ENV === 'development') {
  console.log("Starting batch update for order:", orderId);
  console.log("Items to process:", orderToUpdate?.items?.length);
}
      // Map PENDING to CONFIRMED for status checking purposes
      const displayStatus = orderToUpdate?.status === "PENDING" ? "CONFIRMED" : orderToUpdate?.status;
      
      if (!["CONFIRMED", "PROCESSING"].includes(displayStatus)) {
        alert("Only confirmed or scheduled items can be cancelled.");
        return;
      }
      
      // Confirm cancellation
      if (!window.confirm("Are you sure you want to cancel all your items in this order?")) {
        return;
      }
      
      // Show loading indicator
      setProcessingOrderId(orderId);
      
      const token = localStorage.getItem("token");
      
      // Get all products in this order
      const productsToUpdate = orderToUpdate?.items || [];
      
      if (productsToUpdate.length === 0) {
        throw new Error("No items found in this order");
      }
      
      // Cancel each product SEQUENTIALLY with better logging and error handling
      const successfulCancellations = [];
      const failedCancellations = [];
      
      for (const item of productsToUpdate) {
        // Skip already cancelled items
        if (item.status === "CANCELLED") {
          console.log(`Skipping already cancelled item: ${item.productId}`);
          continue;
        }
        
        const endpoint = `${process.env.REACT_APP_API_BASE_URL}/api/vendor-orders/${user.id}/orders/${orderId}/products/${item.productId}/status`;
        console.log(`Updating item ${item.productId} to CANCELLED using endpoint: ${endpoint}`);
        
        try {
          // Add a small delay between requests to prevent race conditions
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const result = await axios.put(
            endpoint,
            { status: "CANCELLED" },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          console.log(`Successfully cancelled item ${item.productId}`, result.data);
          successfulCancellations.push(item.productId);
        } catch (itemError) {
          console.error(`Failed to cancel item ${item.productId}:`, itemError);
          failedCancellations.push({
            id: item.productId,
            error: itemError.response?.data?.message || itemError.message
          });
        }
      }
      
      console.log(`Completed cancellation with ${successfulCancellations.length} successes and ${failedCancellations.length} failures`);
      
      if (failedCancellations.length > 0) {
        console.warn("Failed cancellations:", failedCancellations);
      }
      
      // Update local state - only if we had at least one successful update
      if (successfulCancellations.length > 0) {
        setOrders(prevOrders => 
          prevOrders.map(order => {
            if (order.id === orderId) {
              // Update all item statuses to CANCELLED, but only for those we successfully updated
              const updatedItems = order.items.map(item => {
                if (successfulCancellations.includes(item.productId)) {
                  return { ...item, status: "CANCELLED" };
                }
                return item;
              });
              
              // Derive the new status based on updated items
              const derivedStatus = deriveOrderStatus(updatedItems);
              
              return { 
                ...order, 
                items: updatedItems, 
                status: derivedStatus
              };
            }
            return order;
          })
        );
        
        // Show success message
        if (failedCancellations.length > 0) {
          alert(`Cancelled ${successfulCancellations.length} items. ${failedCancellations.length} items failed to cancel.`);
        } else {
          alert("All items have been successfully cancelled!");
        }
      } else {
        alert("Failed to cancel any items. Please try again.");
      }
    } catch (error) {
      console.error("Failed to cancel items:", error);
      alert(`Failed to cancel items: ${error.response?.data?.message || error.message}`);
    } finally {
      // Refresh data to ensure everything is up to date
      await refreshOrderData();
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

  // Add this function near other handlers

  const refreshOrderData = async () => {
    if (!user?.id || !isAuthenticated) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/api/vendor-orders/${user.id}/orders?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
      
      const response = await axios.get(apiUrl, { headers: { Authorization: `Bearer ${token}` } });
      const receivedOrders = response.data.orders || [];
      
      // Initialize expanded state for all orders
      const newExpandedState = {};
      
      // Process each order to derive the status from its items
      const processedOrders = receivedOrders.map(order => {
        // Preserve expansion state
        newExpandedState[order.id] = expandedOrders[order.id] !== undefined 
          ? expandedOrders[order.id] 
          : true;
        
        // Derive the order status from its items
        const derivedStatus = deriveOrderStatus(order.items);
        
        return {
          ...order,
          status: derivedStatus,
          originalStatus: order.status
        };
      });
      
      setExpandedOrders(prev => ({...prev, ...newExpandedState}));
      setOrders(processedOrders);
      setPagination({
        totalPages: response.data.pagination?.totalPages || 1,
        totalOrders: receivedOrders.length || 0
      });
    } catch (err) {
      console.error("Failed to refresh order data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return <div>Please log in.</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex-1 ml-[254px] p-8 bg-gray-50 min-h-screen">
      {/* Updated Summary cards to focus on revenue-generating statuses */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
          <div className="text-3xl font-bold text-purple-700 mb-1">{orderStats.processingItems}</div>
          <div className="text-gray-500 text-sm">Processing</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="text-3xl font-bold text-indigo-700 mb-1">{orderStats.shippedItems}</div>
          <div className="text-gray-500 text-sm">Shipped</div>
        </div>
      </div>

      {/* Informational alert about order status */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Order Status Information</h3>
            <p className="text-sm text-blue-700 mt-1">
              You're viewing the status of your items in each order. Orders may contain items from other vendors with different statuses.
            </p>
          </div>
          <button 
            type="button" 
            className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex text-blue-400 hover:text-blue-500 focus:outline-none"
            onClick={(e) => e.target.closest('.bg-blue-50').style.display = 'none'}
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
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
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase flex items-center">
                My Items Status
                <InfoTooltip text="This status reflects the combined status of all your items in this order" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort("totalAmount")}>
                Amount {sortBy === "totalAmount" && (sortOrder === "asc" ? "▲" : "▼")}
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
                <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
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
                
                // Apply status filter at the order level instead of item level
                if (activeTab !== "ALL" && order.status !== activeTab) {
                  return null;
                }
                
                const totalItems = visibleItems.length;
                
                return (
                  <React.Fragment key={order.id}>
                    {/* Order row */}
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
                          <span className="font-medium">{order.orderNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-gray-700">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-3 font-medium">
                        {formatPrice(order.totalAmount || 0)}
                      </td>
                      <td className="px-6 py-3">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-3">
                        {order.customerInfo?.name || order.customerInfo?.email}
                      </td>
                      <td className="px-6 py-3">
                        <PaymentBadge status={order.paymentStatus} />
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center">
                          <OrderActionMenu
                            order={order}
                            onProcessOrder={handleProcessOrder}
                            onCancelOrder={handleCancelOrder}
                            isLoading={processingOrderId === order.id}
                          />
                        </div>
                      </td>
                    </tr>
                    
                    {/* Item rows - only visible when order is expanded */}
                    {isExpanded && visibleItems.map((item, idx) => (
                      <tr key={`${order.id}-${item.productId}`} className={`${rowBgColor} opacity-80`}>
                        <td className="px-6 py-3 pl-14 border-b border-gray-100"></td>
                        <td className="px-6 py-3 border-b border-gray-100" colSpan="7">
                          <div className="flex items-center">
                            <img 
                              src={getProductImageUrl(item)} 
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded-md mr-3 border border-gray-200"
                              onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2280%22%20height%3D%2280%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2080%2080%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_189e490e658%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_189e490e658%22%3E%3Crect%20width%3D%2280%22%20height%3D%2280%22%20fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2229%22%20y%3D%2245%22%3ENO%20IMG%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                              }}
                            />
                            <div className="flex-1">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-gray-500 flex flex-wrap gap-x-4">
                                <span>{item.materialType} | {item.pattern}</span>
                                <span>Quantity: {item.quantity} {item.quantity > 1 ? 'yards' : 'yard'}</span>
                                <span>Price: {formatPrice(item.pricePerYard || item.price || 0)}</span>
                                <span>Status: <StatusBadge status={item.status} /></span>
                              </div>
                            </div>
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

      <div className="bg-red-500 text-white p-4 mb-4 text-center text-2xl">
        DEBUG: CODE CHANGES ARE VISIBLE - {new Date().toISOString()}
      </div>
    </div>
  );
}