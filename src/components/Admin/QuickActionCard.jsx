import { useAuth } from '../../contexts/AuthContext';
import AdminActionCard from './AdminActionCard';

const QuickActionsCard = () => {
    const { user } = useAuth();

    return (
        <>
            <div className="flex flex-row gap-4 mx-4 mt-4">
                {/* User Management Card */}
                <AdminActionCard 
                    title="User Management"
                    icon={
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                    }
                    actions={[
                        {
                            text: 'View Users',
                            link: '/admin/users',
                            color: 'bg-blue-600',
                            hoverColor: 'bg-blue-700',
                        },
                        ...(user?.role === 'superadmin' ? [{
                            text: 'Create Admin',
                            link: '/admin/create',
                            color: 'bg-red-600',
                            hoverColor: 'bg-red-700',
                        }]
                        : []),
                    ]}
                />

                {/* Order Management Card */}
                <AdminActionCard 
                    title="Order Management"
                    icon={
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    }
                    actions={[
                        {
                            text: 'View Orders',
                            link: '/admin/admin-orders',
                            color: 'bg-blue-600',
                            hoverColor: 'bg-blue-700',
                        },
                        {
                            text: 'Orders Breakdown',
                            link: '/admin/order-breakdown',
                            color: 'bg-yellow-600',
                            hoverColor: 'bg-yellow-700',
                        }
                    ]}
                />

                {/* Material Management */}
                <AdminActionCard 
                    title="Material Management"
                    icon={
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    }
                    actions={[
                        {
                            text: 'View Materials',
                            link: '/admin/admin-materials',
                            color: 'bg-blue-600',
                            hoverColor: 'bg-blue-700',
                        },
                        {
                            text: 'Create Material',
                            link: '/admin/create-material',
                            color: 'bg-green-600',
                            hoverColor: 'bg-green-700',
                        }
                    ]}
                />
            </div>
            <div className="flex flex-row gap-4 mx-4 mt-4">
                {/* Vendor Fees */}
                <AdminActionCard 
                    title="Fee Management"
                    icon={
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                    }
                    actions={[
                        {
                            text: 'View Fees',
                            link: '/admin/fees-management',
                            color: 'bg-blue-600',
                            hoverColor: 'bg-blue-700',
                        },
                        {
                            text: 'Create Fee',
                            link: '/admin/create-fee',
                            color: 'bg-green-600',
                            hoverColor: 'bg-green-700',
                        },
                        {
                            text: 'Earnings',
                            link: '/admin/earnings',
                            color: 'bg-purple-600',
                            hoverColor: 'bg-purple-700',
                        }
                    ]}
                />

            </div>
        </>
    );
};

export default QuickActionsCard;