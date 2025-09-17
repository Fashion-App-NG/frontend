import { useState, useRef } from "react";
import ReusableForm from "./AdminForms";
import { adminService } from "../../services/adminService";


const CreateMaterial = ({ onCreated, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const formRef = useRef();

  const materialFields = [
  { name: "name", type: "text", placeholder: "Material Name", required: true },
  { name: "weightPerYard", type: "number", placeholder: "Weight per yard (gsm)", required: true },
  { name: "heightPerYard", type: "number", placeholder: "Height per yard (m)", step: "0.01", required: true },
  { 
    name: "weightCategory", 
    type: "select", 
    placeholder: "Select Weight Category", 
    required: true, 
    options: ["low-weight", "medium-weight", "high-weight"] 
  },
  { name: "description", type: "textarea", placeholder: "Description", required: true }
]

  const [initialData, setInitialData] = useState({});

  
  const handleSubmit = async (formData) => {
    setLoading(true);
    setMessage("");
    try {
      
      const response = await adminService.createMaterial(formData);
      if(!response.ok || response.error){
        setMessage(response.message || "Failed to create material.");
      } else {
        setInitialData({})
        formRef.current?.resetForm();
        if (onCreated) onCreated(); // refresh list
      }

    } catch (err) {
      console.log("Error creating material:", err);
      setMessage("❌ Failed to create material. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ReusableForm
        ref={formRef}
        fields={materialFields}
        initialData={initialData} 
        onSubmit={handleSubmit} 
        onCancel={onCancel} 
        submitText={loading ? "Creating..." : "Create"}
      />
      {message && <p className="mt-2 text-center">{message}</p>}
    </div>
  );
};

export default CreateMaterial;
