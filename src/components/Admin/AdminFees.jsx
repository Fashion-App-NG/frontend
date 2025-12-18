import Sidebar from './Sidebar';
import Topbar from './Topbar';
import FeesManagement from './FeesManagement';

const AdminFees = () => {
  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
        <Sidebar />
        <div className="flex flex-col flex-1">
            <Topbar />
            <FeesManagement />
        </div>
    </div>
  );
};

export default AdminFees;