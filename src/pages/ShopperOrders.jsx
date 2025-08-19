import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // ✅ Add this import
import checkoutService from "../services/checkoutService";
import { formatPrice } from "../utils/formatPrice";

const FILTER_TABS = [
    { key: "ALL", label: "All" },
    { key: "NEW_ORDER", label: "New Order" },
    { key: "COMPLETED", label: "Completed" },
    { key: "IN_PROGRESS", label: "In Progress" },
    { key: "PENDING", label: "Pending" },
    { key: "CANCELLED", label: "Cancelled" },
];

const StatusBadge = ({ status }) => {
    const map = {
        COMPLETED: "bg-green-100 text-green-700",
        CANCELLED: "bg-red-100 text-red-700",
        IN_PROGRESS: "bg-yellow-100 text-yellow-700",
        PENDING: "bg-orange-100 text-orange-700",
        NEW_ORDER: "bg-blue-100 text-blue-700",
    };
    return (
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${map[status] || "bg-gray-100 text-gray-700"}`}>
            {status.replace("_", " ").toLowerCase().replace(/(^|\s)\S/g, (l) => l.toUpperCase())}
        </span>
    );
};

const PAGE_SIZE = 10;

const ShopperOrders = () => {
    const { user } = useAuth(); // ✅ Add user context
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("ALL");
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function verifyAndFetchOrders() {
            // ✅ VERIFICATION: Test the actual endpoint
            await checkoutService.verifyCheckoutOrdersEndpoint();
            
            // Then run your existing fetch logic...
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
                
                setOrders(data.orders || []);
                setPagination(data.pagination || { currentPage: 1, totalPages: 1 });
            } catch (err) {
                console.error('❌ SHOPPER ORDERS ERROR:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        
        if (user?.id) {
            verifyAndFetchOrders();
        }
    }, [pagination.currentPage, user?.id]);

    const filteredOrders = useMemo(() => {
        let filtered = orders;
        if (activeTab !== "ALL") {
            filtered = filtered.filter((order) => order.status === activeTab);
        }
        if (search.trim()) {
            filtered = filtered.filter((order) => order.orderNumber?.toLowerCase().includes(search.trim().toLowerCase()));
        }
        return filtered;
    }, [orders, activeTab, search]);

    const handlePageChange = (page) => {
        setPagination((prev) => ({ ...prev, currentPage: page }));
    };

    // 🔍 FIXED: Update vendor info extraction for checkout orders
    const getVendorInfo = (order) => {
        console.log('🔍 VENDOR INFO EXTRACTION (CHECKOUT ORDERS):', {
            orderId: order.id,
            orderNumber: order.orderNumber,
            itemsCount: order.items?.length || 0,
            hasVendorInfo: !!order.vendor,
            firstItem: order.items?.[0]
        });

        // ✅ Since checkout orders don't include vendor info, show placeholder
        // This is expected until we create dedicated shopper orders endpoint
        return {
            name: 'Multiple Vendors', // Since one order can have items from multiple vendors
            email: null,
            initial: 'V'
        };
    };

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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {formatPrice(order.totalAmount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                to={`/shopper/orders/${order.orderId || order.id}`}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                View Details
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