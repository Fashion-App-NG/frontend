import Sidebar from './Sidebar';
import Topbar from './Topbar';
import OrderManagement from './OrderManagement';

const AdminOrders = () => {
  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
        <Sidebar />
        <div className="flex flex-col flex-1">
            <Topbar />
            <OrderManagement />
        </div>
    </div>
  );
};

export default AdminOrders;