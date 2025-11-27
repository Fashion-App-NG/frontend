import { useCallback, useState } from 'react';

const ProductFilters = ({ onFiltersChange, loading = false, isMobile = false }) => {
  const [filters, setFilters] = useState({
    search: '',
    materialType: '',
    pattern: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (!isMobile) {
      onFiltersChange(newFilters);
    }
  }, [filters, onFiltersChange, isMobile]);

  const materialTypes = ['Cotton', 'Silk', 'Linen', 'Wool', 'Polyester', 'Chiffon', 'Lace'];
  const patterns = ['Solid', 'Striped', 'Floral', 'Geometric', 'Polka Dot', 'Abstract'];

  return (
    <div className={`bg-white ${isMobile ? '' : 'p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 mb-6'}`}>
      {/* ✅ Mobile: Single column, Desktop: Multi-column grid */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            disabled={loading}
          />
        </div>

        {/* Material Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
          <select
            value={filters.materialType}
            onChange={(e) => handleFilterChange('materialType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            disabled={loading}
          >
            <option value="">All Materials</option>
            {materialTypes.map(type => (
              <option key={type} value={type.toLowerCase()}>{type}</option>
            ))}
          </select>
        </div>

        {/* Pattern */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pattern</label>
          <select
            value={filters.pattern}
            onChange={(e) => handleFilterChange('pattern', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            disabled={loading}
          >
            <option value="">All Patterns</option>
            {patterns.map(pattern => (
              <option key={pattern} value={pattern.toLowerCase()}>{pattern}</option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              handleFilterChange('sortBy', sortBy);
              handleFilterChange('sortOrder', sortOrder);
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

      {/* Price Range */}
      <div className={`mt-4 grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (₦)</label>
          <input
            type="number"
            placeholder="0"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
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
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            disabled={loading}
          />
        </div>
      </div>

      {/* ✅ Mobile: Apply button handled by parent (ProductBrowsePage) */}
    </div>
  );
};

export default ProductFilters;