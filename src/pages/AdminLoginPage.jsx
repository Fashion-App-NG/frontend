import { AdminLoginForm } from '../components/Auth-Designer/AdminLoginForm'; // ✅ Use existing component

export const AdminLoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <AdminLoginForm /> {/* ✅ Use single AdminLoginForm component */}
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;