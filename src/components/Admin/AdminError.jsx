// ErrorMessage.js
const ErrorMessage = ({ message }) => {
  if (!message) return null; // Don't render if there's no error

  return (
    <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
      <p className="text-red-700">{message}</p>
    </div>
  );
};

export default ErrorMessage;