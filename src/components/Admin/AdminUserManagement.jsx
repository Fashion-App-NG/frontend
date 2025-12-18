import Sidebar from './Sidebar';
import Topbar from './Topbar';
import UserManagement from './UserManagement';

const AdminUserManagement = () => {
  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
        <Sidebar />
        <div className="flex flex-col flex-1">
            <Topbar />
            <UserManagement />
        </div>
    </div>
  );
};

export default AdminUserManagement;