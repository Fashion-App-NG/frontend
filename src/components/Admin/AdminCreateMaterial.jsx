import Sidebar from './Sidebar';
import Topbar from './Topbar';
import CreateMaterial from './CreateMaterial';

const AdminCreateMaterial = () => {
  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
        <Sidebar />
        <div className="flex flex-col flex-1">
            <Topbar />
            <CreateMaterial />
        </div>
    </div>
  );
};

export default AdminCreateMaterial;