import { useState, useImperativeHandle, forwardRef, useEffect, useCallback } from "react";

const ReusableForm = forwardRef(({
  fields,
  initialData = {},
  onSubmit,
  onCancel,
  submitText = "Submit",
  onChange,
}, ref) => {

  const getInitialFormData = useCallback(() => {
    const initial = {};
    fields.forEach(field => {
      initial[field.name] = initialData[field.name] || "";
    });
    return initial;
  }, [fields, initialData]);

  const [formData, setFormData] = useState(getInitialFormData());

  useEffect(() => {
    setFormData((prev) => {
      const updated = {};
      fields.forEach((field) => {
        // ✅ keep existing value if it exists
        updated[field.name] =
          prev[field.name] ?? initialData[field.name] ?? "";
      });
      return updated;
    });
  }, [fields, initialData]);

  useImperativeHandle(ref, () => ({
    resetForm: () => setFormData(getInitialFormData()),
    setFormData: (data) => setFormData(data) // ✅ allow parent to override
  }));


  const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
    let newValue = value;

    if (type === "number") {
      newValue = value === "" ? "" : parseFloat(value);
    } else if (type === "checkbox") {
      newValue = checked;
    }

    const updatedFormData = {
      ...formData,
      [name]: newValue,
    };

    setFormData(updatedFormData);
    if (onChange) onChange(updatedFormData); // 🔥 notify parent
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="flex justify-center p-4">
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-2xl space-y-4 bg-grey p-6 rounded-lg"
      >
        {fields.map((field) => (
          <div key={field.name}>
            {field.type === "select" ? (
              <select
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required={field.required}
              >
                <option value="">{field.placeholder}</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full p-2 border rounded"
                rows={field.rows || 3}
                required={field.required}
              />
            ) : field.type === "checkbox" ? (
              <input
                label={field.label}
                type= {field.type}
                name={field.name}
                checked= {formData[field.name] || false}
                onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  [field.name]: e.target.checked, // ✅ Boolean true/false
                }))
              }
              />
            )  : (
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full p-2 border rounded"
                required={field.required}
                step={field.step}
              />
            )}
          </div>
        ))}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            {submitText}
          </button>
        </div>
      </form>
    </div>
  );
});

export default ReusableForm;
