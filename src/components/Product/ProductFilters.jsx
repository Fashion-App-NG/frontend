import { useCallback, useEffect, useState, useRef } from 'react';

const ProductFilters = ({ 
  onFiltersChange,
  onFilterUpdate,
  loading = false, 
  isMobile = false,
  initialFilters = {}
}) => {
  const [filters, setFilters] = useState(initialFilters);
  
  // ✅ FIX: Don't sync with parent if we're typing
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // ✅ Only sync with parent when NOT typing
  useEffect(() => {
    if (!isTyping) {
      setFilters(initialFilters);
    }
  }, [initialFilters, isTyping]);

  // ✅ For text inputs - debounce locally first
  const handleTextInput = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters); // Update local state immediately
    
    // Mark as typing
    setIsTyping(true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (onFilterUpdate) {
        onFilterUpdate(newFilters);
      }
    }, 300); // Local debounce before parent update
  }, [filters, onFilterUpdate]);

  // ✅ Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // ✅ For dropdowns - trigger immediate filter
  const handleDropdownChange = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (!isMobile && onFiltersChange) {
      onFiltersChange(newFilters);
    }
  }, [filters, onFiltersChange, isMobile]);

  const materialTypes = ['Cotton', 'Silk', 'Linen', 'Wool', 'Polyester', 'Chiffon', 'Lace'];
  const patterns = ['Solid', 'Striped', 'Floral', 'Geometric', 'Polka Dot', 'Abstract'];

  return (
    <div className={`bg-white ${isMobile ? '' : 'p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 mb-6'}`}>
      {/* ✅ Mobile: Single column, Desktop: Multi-column grid */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
        {/* ✅ Search - Use text input handler */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => handleTextInput('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            disabled={loading}
          />
        </div>

        {/* ✅ Material Type - Use dropdown handler */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
          <select
            value={filters.materialType}
            onChange={(e) => handleDropdownChange('materialType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            disabled={loading}
          >
            <option value="">All Materials</option>
            {materialTypes.map(type => (
              <option key={type} value={type.toLowerCase()}>{type}</option>
            ))}
          </select>
        </div>

        {/* ✅ Pattern - Use dropdown handler */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pattern</label>
          <select
            value={filters.pattern}
            onChange={(e) => handleDropdownChange('pattern', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            disabled={loading}
          >
            <option value="">All Patterns</option>
            {patterns.map(pattern => (
              <option key={pattern} value={pattern.toLowerCase()}>{pattern}</option>
            ))}
          </select>
        </div>

        {/* ✅ Sort - Use dropdown handler */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              const newFilters = { ...filters, sortBy, sortOrder };
              setFilters(newFilters);
              if (!isMobile && onFiltersChange) {
                onFiltersChange(newFilters);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            disabled={loading}
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="pricePerYard-asc">Price Low-High</option>
            <option value="pricePerYard-desc">Price High-Low</option>
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* ✅ Price Range - Use text input handler */}
      <div className={`mt-4 grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (₦)</label>
          <input
            type="number"
            placeholder="0"
            value={filters.minPrice}
            onChange={(e) => handleTextInput('minPrice', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (₦)</label>
          <input
            type="number"
            placeholder="10000"
            value={filters.maxPrice}
            onChange={(e) => handleTextInput('maxPrice', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;