import { useNavigate } from "react-router-dom";

const AdminActionCard = ({
    title,
    icon,
    actions = [],
}) => {
    const navigate = useNavigate();

    return (
    <div className="bg-white rounded-lg shadow p-6 flex-1">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <div className="bg-blue-100 p-2 rounded-full">{icon}</div>    
        </div>
        <div className="space-y-3">
            {actions.map((action, idx) => (
                <button
                    key={idx}
                    onClick={() => navigate(action.link)}
                    className={`w-full ${action.color} text-white py-2 px-4 rounded hover:${action.hoverColor} transition-colors`}
                >
                    {action.text}
                </button>
            ))}
        </div>
    </div>
  );
};

export default AdminActionCard;
