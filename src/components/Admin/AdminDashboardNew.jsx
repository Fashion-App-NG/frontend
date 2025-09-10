import Sidebar from './Sidebar';
import Topbar from './Topbar';
import QuickActionsCard from './QuickActionCard';

const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
        <Sidebar />
        <div className="flex flex-col flex-1">
            <Topbar />
            <QuickActionsCard />
        </div>
    </div>
  );
};

export default AdminDashboard;