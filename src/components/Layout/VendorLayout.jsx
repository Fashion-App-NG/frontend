import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { VendorSidebar } from '../Vendor/VendorSidebar';

const VendorLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#d8dfe9] flex">
      <VendorSidebar
        collapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-16' : 'ml-[254px]'
        } md:ml-[254px]`}
      >
        <main className="h-full p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;