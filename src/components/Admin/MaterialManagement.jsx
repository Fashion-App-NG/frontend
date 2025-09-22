import { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaEdit} from 'react-icons/fa'; //FaChevronDown, FaChevronUp 
import { adminService } from '../../services/adminService';
import FilterSection from './AdminFilter';
import Pagination from './AdminPagination';
import ErrorMessage from './AdminError';
import UpdateModal from './AdminUpdateModal';


const MaterialManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  //const [expandedMaterialId, setExpandedMaterialId] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 20
  });

  const [filters, setFilters] = useState({
    category: '',
    isActive: '',
    search: '',
  });


  const filterConfigs = [
    { key: "category", type: "select", placeholder: "Filter by Category",
       options: ["low-weight", "medium-weight", "heavy"]},
    { key: "isActive", type: "select", placeholder: "Status", 
      options: ["true", "false"] },
  ];

  // hangle update button
  const handleUpdateClick = (order) => {
    setSelectedMaterial(order);
    setIsModalOpen(true);
  };

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllMaterials(
        pagination.currentPage, // current page from pagination state
        pagination.limit, // limit per page
        filters // current filters state
      );
    
    if (data.success) {
    setMaterials(data.materials);
    setPagination((prev) => ({
        ...prev,          // keep existing defaults
        ...data.pagination, // override only what backend sends
    }));
    setError(null);
    } else {
    setError(data.message);
    }
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false);
    }

  }, [pagination.currentPage, pagination.limit, filters]);
  
  
  // Fetch orders on component mount
  useEffect (() => {
    fetchMaterials();
  }, [pagination.currentPage, fetchMaterials]);

  

  // Format currency
  /*const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  }*/

  // format date
  /*const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });*?
  }

  // handle filter search
  /*const handleSearch = async () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    setFilters((prev) => ({ ...prev, search: searchId.trim() }));

  };*/

  // handle filter search change
  const handleFilterChange = (key, value) => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    setFilters((prev) => ({
    ...prev,
    [key]: key === "isActive" ? (value === "true" ? true : value === "false" ? false : '') : value,
    }));
  };

  //handle status update
  const handleMaterialUpdate = async () => {
    if (!selectedMaterial) return;

    setLoading(true);
    try {
      await adminService.updateMaterial(selectedMaterial._id, selectedMaterial);
      await fetchMaterials();
      setSelectedMaterial(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;

    setLoading(true);
    try {
      await adminService.deleteMaterial(materialId);
      await fetchMaterials();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Material Management</h1>
        <p className="text-gray-600">Manage and track all materials</p>
      </div>

      {/* Error Message */}
      <ErrorMessage message={error} />

      {/* Search and Filter Section */}
      <FilterSection 
        filters={filters}
        onFilterChange={handleFilterChange}
        filterConfigs={filterConfigs}
        onReset={() => {
          setFilters({
            category: '',
            isActive: '',  
            search: ''
                
          });
          setPagination((prev) => ({ ...prev, currentPage: 1 }));
        }}       
      />



      {/* Materials Table */}
      <div className="bg-white rounded-lg shadow mt-6">
        <div className="p-6">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : materials.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No material found.</div>
          ) : (
            
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-4">Name</th>
                    <th className="text-left pb-4">Description</th>
                    <th className="text-left pb-4">Weight Category</th>
                    <th className="text-center pb-4">Weight Per Yard</th>
                    <th className="text-center pb-4">Height Per Yard</th>
                    <th className="text-left pb-4">Status</th>
                    <th className="text-left pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((material) => (
                  <>
                    <tr key={material._id} className="border-b hover:bg-gray-50">
                      <td className="py-4">
                        {/*<button
                          onClick={() => setExpandedMaterialId( expandedMaterialId === material._id ? null : material._id)}
                          className="flex items-center gap-2"
                        >
                          {expandedMaterialId === material._id ? <FaChevronUp /> : <FaChevronDown />}
                          {material.name}
                        </button>*/}
                        {material.name}
                      </td>
                      <td>{material.description}</td>
                      <td>{material.weightCategory}</td>
                      <td className='text-center'>{material.weightPerYard}</td>
                      <td  className='text-center'>{material.heightPerYard}</td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                            material.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                        }`}>
                          {material.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateClick(material)} 
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteMaterial(material._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/*{expandedMaterialId === material._id && (
                      <tr>
                        <td colSpan="5" className="bg-gray-50 p-4">
                          <h4 className="font-medium mb-2">Properties</h4>
                          <ul className="text-sm grid grid-cols-2 gap-2">
                            <li>Weight: {material.properties.weight} gsm</li>
                            <li>Thickness: {material.properties.thickness} mm</li>
                            <li>Stretch: {material.properties.stretch}/10</li>
                            <li>Breathability: {material.properties.breathability}/10</li>
                            <li>Durability: {material.properties.durability}/10</li>
                            <li>Care: {material.properties.careInstructions}</li>
                          </ul>
                        </td>
                      </tr>
                    )}*/}
                  </>
                ))}
                </tbody>
              </table>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      <Pagination 
        pagination={pagination}
        onPageChange={(newPage) =>
          setPagination((prev) => ({ ...prev, currentPage: newPage }))
        }
      />

      {/* Status Update Modal */}
      {<UpdateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Update Mateial"
        onSubmit={handleMaterialUpdate}
      >
        {/* Custom form fields */}
        <div>
          <input
            type="text"
            value={selectedMaterial?.name || ""}
            onChange={(e) =>
              setSelectedMaterial({ ...selectedMaterial, name: e.target.value })
            }
            className="w-full p-2 border rounded mb-4"
            placeholder="Material Name"
          />
          <input
            type="number"
            value={selectedMaterial?.weightPerYard || ""}
            onChange={(e) =>
              setSelectedMaterial({ ...selectedMaterial, weightPerYard: e.target.value })
            }
            className="w-full p-2 border rounded mb-4"
            placeholder="Price Per Yard"
          />
          <input
            type="number"
            value={selectedMaterial?.heightPerYard || ""}
            onChange={(e) =>
              setSelectedMaterial({ ...selectedMaterial, heightPerYard: e.target.value })
            }
            className="w-full p-2 border rounded mb-4"
            placeholder="Price Per Yard"
          />
          <select
            value={selectedMaterial?.weightCategory || ""}
            onChange={(e) =>
              setSelectedMaterial({ ...selectedMaterial, weightCategory: e.target.value })
            }
            className="w-full p-2 border rounded mb-4"
            placeholder="Select Weight Category"
          >
            <option value='low-weight'>low-weight</option>
            <option value='medium-weight'>medium-weight</option>
            <option value='heavy'>heavy</option>
          </select>
          <textarea
            value={selectedMaterial?.description || ""}
            onChange={(e) =>
              setSelectedMaterial({ ...selectedMaterial, description: e.target.value })
            }
            className="w-full p-2 border rounded mb-4"
            placeholder="Description"
          />
        </div>
      </UpdateModal>}
    </div>
  );
};

export default MaterialManagement;