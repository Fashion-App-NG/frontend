import { useState, useRef } from "react";
import ReusableForm from "./AdminForms";
import { adminService } from "../../services/adminService";


const CreateFee = ({ onCreated, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [level, setLevel] = useState("GLOBAL");
  const formRef = useRef();

  const baseFields = [
    { 
        name: "level", 
        type: "select", 
        placeholder: "Select Level", 
        required: true, 
        options: ["GLOBAL", "VENDOR", "PRODUCT"] 
    },
    { 
        name: "feeType", 
        type: "select", 
        placeholder: "Select Fee Type", 
        required: true, 
        options: ["FIXED", "PERCENTAGE"] 
    },
    { name: "feeValue", type: "number", placeholder: "Fee Value", required: true },
    { name: "description", type: "textarea", placeholder: "Enter a description for the fee", required: true },
    { name: "isActive", type: "checkbox", placeholder: "Active Status", required: true, label: "Is Active"}
  ]

  let optionFields = [];
    if (level === "VENDOR") {
      optionFields = [{ name: "vendorId", type: "text", placeholder: "Vendor ID", required: true }];
    } else if (level === "PRODUCT") {
      optionFields = [
        { name: "vendorId", type: "text", placeholder: "Vendor ID", required: true },
        { name: "productId", type: "text", placeholder: "Product ID", required: true },
      ];
    }

  // Merge Fields
  const feeFields = [
    baseFields[0], // level first
    ...optionFields,
    ...baseFields.slice(1),
  ]

  const [initialData, setInitialData] = useState({});

  
  const handleSubmit = async (formData) => {
    setLoading(true);
    setMessage("");
      try {
      
      const response = await adminService.CreateFee(formData);
      if(!response.ok || response.error){
          setMessage(response.message || "Failed to create fee.");
      } else {
          setInitialData({})
          formRef.current?.resetForm();
          if (onCreated) onCreated(); // refresh list
      }

      } catch (err) {
      console.log("Error creating fee:", err);
      setMessage("❌ Failed to create fee. Check console for details.");
      } finally {
      setLoading(false);
      }
  };

  // listen to changes in level
  const handleLevelChange = (formData) => {
    let updated = {...formData};

    if (formData.level === "VENDOR") {
      updated.feeType = "PERCENTAGE";
    } else if (formData.level === "PRODUCT") {
      updated.feeType = "FIXED";
    }

    if (formData.level !== level) {
      setLevel(formData.level);
    }

    formRef.current?.setFormData(updated);
  };

  return (
    <div>
      <ReusableForm
        ref={formRef}
        fields={feeFields}
        initialData={initialData} 
        onSubmit={handleSubmit} 
        onCancel={onCancel} 
        submitText={loading ? "Creating..." : "Create"}
        onChange={handleLevelChange}
      />
      {message && <p className="mt-2 text-center">{message}</p>}
    </div>
  );
};

export default CreateFee;
