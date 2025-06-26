import { Outlet } from 'react-router-dom';
import { VendorSidebar } from '../Vendor/VendorSidebar';

const VendorLayout = () => {
  return (
    <div className="min-h-screen bg-[#d8dfe9] flex">
      {/* ✅ FIXED: Use the comprehensive VendorSidebar component */}
      <VendorSidebar />
      <div className="flex-1 ml-[254px]">
        <main className="h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;