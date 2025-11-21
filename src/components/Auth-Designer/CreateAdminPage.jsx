import { useNavigate } from 'react-router-dom';
import { CreateAdminForm } from './CreateAdminForm';

export const CreateAdminPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Logo Section - Updated to Fáàrí */}
        <div className="flex justify-center mb-12">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <img
              src="/favicon.svg"
              alt="Fáàrí Logo"
              className="h-12 w-12 object-contain"
            />
            <div className="flex flex-col">
              <div className="text-2xl font-bold text-gray-900">Fáàrí</div>
              <div className="text-sm text-gray-600">Admin Portal</div>
            </div>
          </button>
        </div>

        <CreateAdminForm />
      </div>
    </div>
  );
};

export default CreateAdminPage;