import Sidebar from './Sidebar';
import Topbar from './Topbar';
import CreateFee from './CreateFee';

const AdminCreateFee = () => {
  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
        <Sidebar />
        <div className="flex flex-col flex-1">
            <Topbar />
            <CreateFee />
        </div>
    </div>
  );
};

export default AdminCreateFee;