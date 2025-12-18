import Sidebar from './Sidebar';
import Topbar from './Topbar';
import VendorManagement from './VendorManagement';

const AdminVendorManagement = () => {
  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
        <Sidebar />
        <div className="flex flex-col flex-1">
            <Topbar />
            <VendorManagement />
        </div>
    </div>
  );
};

export default AdminVendorManagement;