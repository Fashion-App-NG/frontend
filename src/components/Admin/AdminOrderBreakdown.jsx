import Sidebar from './Sidebar';
import Topbar from './Topbar';
import OrderBreakdown from './OrderBreakdown';

const AdminOrderBreakdown = () => {
  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
        <Sidebar />
        <div className="flex flex-col flex-1">
            <Topbar />
            <OrderBreakdown />
        </div>
    </div>
  );
};

export default AdminOrderBreakdown;