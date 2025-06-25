import GuestSidebar from '../components/Common/GuestSidebar';
import ProductBrowsePage from './ProductBrowsePage';

const GuestBrowsePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <GuestSidebar />
      <div className="flex-1">
        <main>
          <ProductBrowsePage />
        </main>
      </div>
    </div>
  );
};

export default GuestBrowsePage;