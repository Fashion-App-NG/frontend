// FiltersSection.js
const FiltersSection = ({ filterConfigs, filters, onFilterChange, onReset }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filterConfigs.map((filter) => {
          switch (filter.type) {
            case "select":
              return (
                <select
                  key={filter.key}
                  value={filters[filter.key]}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">{filter.placeholder}</option>
                  {filter.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              );

            case "date":
              return (
                <input
                  key={filter.key}
                  type="date"
                  value={filters[filter.key]}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              );

            case "text":
            default:
              return (
                <input
                  key={filter.key}
                  type="text"
                  placeholder={filter.placeholder}
                  value={filters[filter.key]}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              );
          }
        })}
      </div>

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default FiltersSection;
