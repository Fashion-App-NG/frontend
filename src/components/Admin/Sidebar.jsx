import { NavLink, useNavigate } from "react-router-dom";
import logo from '../../assets/fashionlogo.png';
import { useAuth } from '../../contexts/AuthContext'; // ✅ Add this import


const menu = [
  { id: 1, label: "Dashboard", to: "/admin/dashboard" },
  { id: 2, label: "User Management",  to: "/admin/users" },
  { id: 3, label: "Order Management", to: "/admin/admin-orders" },
  { id: 3, label: "Material Management", to: "/admin/admin-materials" },
  { id: 3, label: "Fee Management", to: "/admin/fees-management" },
  { id: 6, label: "Sales Reports", to: "/admin/sales" },
];


const Sidebar = () => {

  const navigate = useNavigate();
  const { logout } = useAuth();

  // ✅ LEARNING: Proper admin logout with cleanup
  const handleAdminLogout = async () => {
    try {
      // Use the logout function from AuthContext
      logout();
      
      // Navigate to home with logout message
      navigate('/', { 
        state: { 
          message: 'Successfully logged out from admin dashboard',
          type: 'success'
        } 
      });
    } catch (error) {
      console.error('Admin logout error:', error);
      // Still navigate even if cleanup fails
      navigate('/');
    }
  };

  return (
    <aside className="w-64 bg-white h-screen flex flex-col border-r">
      <div className="px-6 py-8 flex items-center gap-2">
        <img src={logo} alt="" />
        <span className="font-bold text-xl">FASHION CULTURE</span>
    </div>
      <nav className="flex-1">
        <ul className="space-y-1 px-2">
          {menu.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                    isActive ? "bg-gray-100 font-semibold" : "text-gray-700 hover:bg-gray-50"
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-4 py-6 border-t space-y-4">
        <NavLink to="/admin/settings" className="flex items-center gap-3 text-gray-700 hover:text-black">
          Settings
        </NavLink>
        <div className="flex items-center gap-3 text-gray-700">
          Dark Theme
          {/* You can add a toggle switch here */}
        </div>
        <button
          onClick={handleAdminLogout}
          className="flex items-center gap-3 text-red-500 hover:text-red-700 w-full"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;