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
      {/* Grid View Button */}
      <button
        onClick={() => handleViewChange('grid')}
        disabled={disabled}
        className={`flex items-center justify-center px-3 py-2 rounded-md transition-all duration-200 ${
          view === 'grid'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        title="Grid view"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        <span className="ml-1 text-sm font-medium">Grid</span>
      </button>

      {/* List View Button */}
      <button
        onClick={() => handleViewChange('list')}
        disabled={disabled}
        className={`flex items-center justify-center px-3 py-2 rounded-md transition-all duration-200 ${
          view === 'list'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        title="List view"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        <span className="ml-1 text-sm font-medium">List</span>
      </button>
    </div>
  );
};

export default ProductViewToggle;