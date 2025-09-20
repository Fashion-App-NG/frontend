import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Earnings from './Earnings';

const AdminEarning = () => {
  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
        <Sidebar />
        <div className="flex flex-col flex-1">
            <Topbar />
            <Earnings />
        </div>
    </div>
  );
};

export default AdminEarning;