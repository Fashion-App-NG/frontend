import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import checkoutService from "../services/checkoutService";

const FILTER_TABS = [
	{ key: "ALL", label: "All" },
	{ key: "NEW_ORDER", label: "New Order" },
	{ key: "COMPLETED", label: "Completed" },
	{ key: "IN_PROGRESS", label: "In Progress" },
	{ key: "PENDING", label: "Pending" },
	{ key: "CANCELLED", label: "Cancelled" },
];

const statusBadge = (status) => {
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
	const [orders, setOrders] = useState([]);
	const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [activeTab, setActiveTab] = useState("ALL");
	const [search, setSearch] = useState("");

	useEffect(() => {
		async function fetchOrders() {
			setLoading(true);
			setError(null);
			try {
				const data = await checkoutService.getOrders({ page: pagination.currentPage, limit: PAGE_SIZE });
				setOrders(data.orders || []);
				setPagination(data.pagination || { currentPage: 1, totalPages: 1 });
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}
		fetchOrders();
		// eslint-disable-next-line
	}, [pagination.currentPage]);

	const filteredOrders = useMemo(() => {
		let filtered = orders;
		if (activeTab !== "ALL") {
			filtered = filtered.filter((order) => order.status === activeTab);
		}
		if (search.trim()) {
			filtered = filtered.filter((order) => order.orderNumber.toLowerCase().includes(search.trim().toLowerCase()));
		}
		return filtered;
	}, [orders, activeTab, search]);

	const handlePageChange = (page) => {
		setPagination((prev) => ({ ...prev, currentPage: page }));
	};

	return (
		<div className="p-6 max-w-4xl mx-auto">
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
					filteredOrders.map((order) => (
						<div
							key={order.id}
							className="bg-white rounded-xl shadow border p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 hover:shadow-lg transition"
						>
							<div className="flex-1">
								<div className="flex flex-col md:flex-row md:items-center md:gap-6">
									<div className="mb-2 md:mb-0">
										<div className="text-xs text-gray-500">Order ID</div>
										<div className="font-mono text-lg font-semibold">{order.orderNumber}</div>
									</div>
									<div className="mb-2 md:mb-0">
										<div className="text-xs text-gray-500">Date</div>
										<div>{new Date(order.createdAt).toLocaleDateString()}</div>
									</div>
									<div className="mb-2 md:mb-0">
										<div className="text-xs text-gray-500">Amount</div>
										<div className="font-semibold text-blue-700">₦{order.totalAmount.toLocaleString()}</div>
									</div>
									<div className="mb-2 md:mb-0">
										<div className="text-xs text-gray-500">Status</div>
										{statusBadge(order.status)}
									</div>
									<div className="mb-2 md:mb-0">
										<div className="text-xs text-gray-500">Payment</div>
										{statusBadge(order.paymentStatus)}
									</div>
								</div>
								<div className="mt-4">
									<div className="text-xs text-gray-500 mb-1">Items</div>
									<ul className="list-disc ml-5 text-sm text-gray-700">
										{order.items.map((item) => (
											<li key={item.productId}>
												<span className="font-medium">{item.name}</span> x{item.quantity} @ ₦{item.pricePerYard.toLocaleString()}
											</li>
										))}
									</ul>
								</div>
							</div>
							<div className="flex flex-col items-end gap-2">
								<Link
									to={`/shopper/orders/${order.id}`}
									className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
								>
									View Details
								</Link>
								{/* Add more actions here if needed */}
							</div>
						</div>
					))
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