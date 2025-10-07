import Sidebar from './Sidebar';
import Topbar from './Topbar';
import TaxManagement from './TaxManagement';

const AdminTax = () => {
  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
        <Sidebar />
        <div className="flex flex-col flex-1">
            <Topbar />
            <TaxManagement />
        </div>
    </div>
  );
};

export default AdminTax;