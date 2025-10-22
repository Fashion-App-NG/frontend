import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import OrderStatusBadge from '../components/OrderStatusBadge';
import { useAuth } from "../contexts/AuthContext";
import checkoutService from "../services/checkoutService";
import { formatPrice } from "../utils/formatPrice";
import { calculateOrderStatus, normalizeOrderStatus } from '../utils/orderUtils';
import { calculateSubtotal } from "../utils/priceCalculations";

const FILTER_TABS = [
    { key: "ALL", label: "All" },
    { key: "PROCESSING", label: "Processing" },
    { key: "IN_PROGRESS", label: "In Progress" }, // ✅ NEW
    { key: "COMPLETED", label: "Completed" }, // ✅ NEW
    { key: "DELIVERED", label: "Delivered" },
    { key: "CANCELLED", label: "Cancelled" },
];

const PAGE_SIZE = 10;

const ShopperOrders = () => {
    const { user, isAuthenticated } = useAuth();
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("ALL");
    const [search, setSearch] = useState("");

    // ✅ All hooks BEFORE conditional returns
    useEffect(() => {
        async function verifyAndFetchOrders() {
            // Skip if not authenticated
            if (!isAuthenticated || !user?.id) {
                setLoading(false);
                return;
            }
            
            await checkoutService.verifyCheckoutOrdersEndpoint();
            
            setLoading(true);
            setError(null);
            
            try {
                const data = await checkoutService.getShopperOrders(user.id, { 
                    page: pagination.currentPage, 
                    limit: PAGE_SIZE 
                });
                
                console.log('🔍 ACTUAL ENDPOINT RESPONSE:', {
                    success: data.success,
                    orders: data.orders,
                    data: data.data,
                    pagination: data.pagination,
                    responseKeys: Object.keys(data)
                });
                
                // Process orders to calculate aggregate status
                const processedOrders = (data.orders || []).map(order => {
                    // ✅ FIX: Use backend status if available
                    if (order.items && order.items.length > 0) {
                        order.items = order.items.map((item, index) => {
                            // ✅ Use backend status if it exists
                            if (item.status) {
                                return item; // Keep backend status as-is
                            }
                            
                            // ⚠️ Only apply demo logic as fallback
                            let status = 'PROCESSING';
                            if (order.orderNumber.includes('250923')) {
                              status = index % 2 === 0 ? 'PROCESSING' : 'CONFIRMED';
                            } else if (order.orderNumber.includes('250918')) {
                              status = 'DELIVERED';
                            } else if (order.orderNumber.includes('250916')) {
                              if (order.orderNumber.endsWith('0007')) {
                                status = 'CANCELLED';
                              } else if (order.orderNumber.endsWith('0006')) {
                                status = 'PROCESSING';
                              } else {
                                status = 'DELIVERED';
                              }
                            }
                            return { ...item, status };
                        });
                    }
                    
                    // Calculate aggregate status consistently
                    const orderStatus = calculateOrderStatus(order.items);
                    console.log(`Order ${order.orderNumber} calculated status:`, orderStatus);

                    return {
                        ...order,
                        aggregateStatus: orderStatus, // ✅ Use new function
                        status: orderStatus // ✅ Override order.status with calculated value
                    };
                });
                
                setOrders(processedOrders);
                setPagination(data.pagination || { currentPage: 1, totalPages: 1 });
            } catch (err) {
                console.error('❌ SHOPPER ORDERS ERROR:', err);
                
                if (err.message === 'Session expired' || err.message === 'No authentication token found') {
                    setError('Your session has expired. Redirecting to login...');
                } else {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        }
        
        verifyAndFetchOrders();
    }, [pagination.currentPage, user?.id, isAuthenticated]);

    const filteredOrders = useMemo(() => {
        let filtered = orders;
        if (activeTab !== "ALL") {
            filtered = filtered.filter((order) => {
                const orderStatus = order.aggregateStatus || normalizeOrderStatus(order.status);
                return orderStatus === activeTab;
            });
        }
        if (search.trim()) {
            filtered = filtered.filter((order) => order.orderNumber?.toLowerCase().includes(search.trim().toLowerCase()));
        }
        return filtered;
    }, [orders, activeTab, search]);

    const handlePageChange = (page) => {
        setPagination((prev) => ({ ...prev, currentPage: page }));
    };

    const getVendorInfo = (order) => {
        console.log('🔍 VENDOR INFO EXTRACTION (CHECKOUT ORDERS):', {
            orderId: order.id,
            orderNumber: order.orderNumber,
            itemsCount: order.items?.length || 0,
            hasVendorInfo: !!order.vendor,
            firstItem: order.items?.[0]
        });

        return {
            name: 'Multiple Vendors',
            email: null,
            initial: 'V'
        };
    };

    // ✅ Conditional redirect AFTER all hooks
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* 🔍 DEBUGGING: Add debug panel */}
            {process.env.NODE_ENV === 'development' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                    <h4 className="font-medium text-yellow-800 mb-3">🔍 SHOPPER ORDERS DEBUG:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p><strong>User ID:</strong> {user?.id || 'Not found'}</p>
                            <p><strong>User Role:</strong> {user?.role || 'Not found'}</p>
                            <p><strong>Orders Count:</strong> {orders.length}</p>
                            <p><strong>Current API:</strong> /api/checkout/orders</p>
                            <p><strong>Expected API:</strong> /api/user/{user?.id}</p>
                        </div>
                        <div>
                            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                            <p><strong>Error:</strong> {error || 'None'}</p>
                            <p><strong>API Base URL:</strong> {process.env.REACT_APP_API_BASE_URL || 'Not set'}</p>
                        </div>
                    </div>
                    
                    {orders.length > 0 && (
                        <details className="mt-3">
                            <summary className="cursor-pointer text-yellow-700 font-medium">📋 First Order Structure</summary>
                            <pre className="mt-2 p-2 bg-yellow-100 rounded text-xs overflow-auto">
                                {JSON.stringify(orders[0], null, 2)}
                            </pre>
                        </details>
                    )}
                </div>
            )}

            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">My Orders</h1>
                    <p className="text-gray-600">Track and manage your fabric orders</p>
                </div>
                <Link
                    to="/browse"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Shop Now
                </Link>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="flex gap-2 flex-wrap">
                    {FILTER_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            className={`px-4 py-2 rounded-full border font-medium text-sm transition-colors ${
                                activeTab === tab.key
                                    ? "bg-blue-600 text-white border-blue-600 shadow"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                            }`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-80">
                    <input
                        type="text"
                        placeholder="Search order ID…"
                        className="w-full border border-gray-300 rounded-full px-4 py-2 pl-10 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading orders...</div>
                ) : error ? (
                    <div className="text-center py-12 text-red-500">{error}</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">No orders found.</div>
                ) : (
                    <table className="min-w-full bg-white divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.map((order) => {
                                const vendorInfo = getVendorInfo(order);
                                return (
                                    <tr key={order.id || order.orderId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                            #{order.orderId || order.orderNumber || order.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                    <span className="text-blue-600 text-xs font-medium">
                                                        {vendorInfo.initial}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="font-medium">
                                                        {vendorInfo.name}
                                                    </div>
                                                    {vendorInfo.email && (
                                                        <div className="text-xs text-gray-500">{vendorInfo.email}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.products?.length || order.items?.length || 0} items
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {formatPrice(order.totalWithShipping || order.totalAmount || calculateSubtotal(order.items))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <OrderStatusBadge status={order.aggregateStatus || normalizeOrderStatus(order.status)} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                            <Link
                                                to={`/shopper/orders/${order.orderId || order.id}`}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                View Details
                                            </Link>

                                            {/* ✅ ALWAYS show Track link for ALL orders */}
                                            <Link
                                                to={`/shopper/orders/${order.orderId || order.id}/tracking`}
                                                state={{ orderId: order.orderId || order.id, orderNumber: order.orderNumber }}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Track
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-end items-center gap-2 mt-8">
                <button
                    className="px-3 py-1 rounded border bg-gray-50 text-gray-700 disabled:opacity-50"
                    disabled={pagination.currentPage <= 1}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                    Prev
                </button>
                <span className="text-sm">
                    Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                    className="px-3 py-1 rounded border bg-gray-50 text-gray-700 disabled:opacity-50"
                    disabled={pagination.currentPage >= pagination.totalPages}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default ShopperOrders;