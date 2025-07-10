import { useEffect, useState } from 'react';

const ProductViewToggle = ({ 
  currentView, 
  onViewChange, 
  defaultView = 'grid',
  className = '',
  disabled = false 
}) => {
  const [view, setView] = useState(currentView || defaultView);

  // ✅ Fix ESLint warning: only update when currentView actually changes
  useEffect(() => {
    if (currentView) {
      setView(currentView);
    }
  }, [currentView]); // ✅ Removed 'view' from dependencies

  const handleViewChange = (newView) => {
    if (disabled || newView === view) return;
    
    setView(newView);
    onViewChange?.(newView);
  };

  return (
    <div className={`flex items-center bg-gray-100 rounded-lg p-1 ${className}`}>
      <button
        onClick={() => handleViewChange('grid')}
        disabled={disabled}
        className={`px-3 py-1 rounded transition-all duration-200 ${
          view === 'grid'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
        } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        title="Grid view"
      >
        Grid
      </button>
      <button
        onClick={() => handleViewChange('list')}
        disabled={disabled}
        className={`px-3 py-1 rounded transition-all duration-200 ${
          view === 'list'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
        } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        title="List view"
      >
        List
      </button>
    </div>
  );
};

export default ProductViewToggle;