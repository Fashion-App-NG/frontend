import { FaBell } from "react-icons/fa";
import { useAuth } from '../../contexts/AuthContext'; // ✅ Add this import

const Topbar = () => {

    const { user } = useAuth();

    const getUserDisplayName = (user) => {
    return user?.name ?? user?.firstName ?? user?.email ?? 'Admin User';
    };

    return (
    <header className="w-full">
        <div className="grid grid-cols-3 gap-4 items-center w-full px-6 py-4 border-b">
            <div className="justify-self-start">
                <h1 className="text-xl font-semibold">Welcome {getUserDisplayName(user)}</h1>
                <p className="text-gray-500 text-sm">This is the Admin Dashboard</p>
            </div>
            <div className="flex justify-center relative w-full max-w-md">
                <input type="text" placeholder="Search..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-300"
                />
            </div>
            <div className="flex justify-end items-center gap-4">
                <button className="relative p-2 hover:bg-gray-100 rounded-full">
                    <FaBell className="text-gray-600 text-xl"/>
                </button>
                {user?.role && (
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                    user.role === 'superadmin' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                  </span>
                )} 
            </div>
        </div>
    </header>
    );
}
export default Topbar;