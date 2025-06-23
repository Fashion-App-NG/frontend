// src/pages/VendorHybridBulkUploadPage.jsx
import VendorHybridBulkUpload from '../components/Vendor/VendorHybridBulkUpload';
import VendorSidebar from '../components/Vendor/VendorSidebar';

export const VendorHybridBulkUploadPage = () => {
    
  return (
    <div className="min-h-screen bg-[#d8dfe9] flex">
      <VendorSidebar />
      <div className="flex-1 ml-[254px]">
        <VendorHybridBulkUpload />
      </div>
    </div>
  );
};

export default VendorHybridBulkUploadPage;