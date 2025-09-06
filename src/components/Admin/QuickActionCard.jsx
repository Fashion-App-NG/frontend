import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const QuickActionsCard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="flex flex-row gap-4 mx-4 mt-4">
            {/* User Management Card */}
            <div className="bg-white rounded-lg shadow p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                    <div className="bg-blue-100 p-2 rounded-full">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                    </div>
                </div>
                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                    >
                        User Management
                    </button>
                    
                    {user?.role === 'superadmin' && (
                        <button
                            onClick={() => navigate('/admin/create')}
                            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
                        >
                            Create Admin
                        </button>
                    )}
                </div>
            </div>

            {/* Order Management Card */}
            <div className="bg-white rounded-lg shadow p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Order Management</h3>
                    <div className="bg-green-100 p-2 rounded-full">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                </div>
                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/admin/admin-orders')}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
                    >
                        View Orders
                    </button>
                    {/*<button
                        onClick={() => navigate('/admin/orders/pending')}
                        className="w-full bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700 transition-colors"
                    >
                        Pending Orders
                    </button>*/}
                </div>
            </div>
        </div>
    );
};

export default QuickActionsCard;