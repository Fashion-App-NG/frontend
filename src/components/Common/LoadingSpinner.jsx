
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue', 
  text = null, 
  fullScreen = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600',
    yellow: 'border-yellow-600',
    purple: 'border-purple-600',
    gray: 'border-gray-600',
    white: 'border-white'
  };

  const spinnerElement = (
    <div className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]} ${className}`} />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center">
          {spinnerElement}
          {text && (
            <p className="mt-3 text-gray-600 text-sm">{text}</p>
          )}
        </div>
      </div>
    );
  }

  if (text) {
    return (
      <div className="flex items-center justify-center space-x-2">
        {spinnerElement}
        <span className="text-gray-600 text-sm">{text}</span>
      </div>
    );
  }

  return spinnerElement;
};

// Predefined spinner variants
export const LoadingButton = ({ loading, children, ...props }) => (
  <button {...props} disabled={loading || props.disabled}>
    <div className="flex items-center justify-center space-x-2">
      {loading && <LoadingSpinner size="sm" color="white" />}
      <span>{children}</span>
    </div>
  </button>
);

export const LoadingOverlay = ({ loading, children, text = "Loading..." }) => (
  <div className="relative">
    {children}
    {loading && (
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
        <LoadingSpinner size="lg" text={text} />
      </div>
    )}
  </div>
);

export default LoadingSpinner;