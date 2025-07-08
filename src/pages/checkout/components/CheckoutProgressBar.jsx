
const CheckoutProgressBar = ({ currentStep }) => {
  const steps = [
    { number: 1, title: 'Review Cart', description: 'Check your items' },
    { number: 2, title: 'Shipping', description: 'Delivery address' },
    { number: 3, title: 'Payment', description: 'Payment method' },
    { number: 4, title: 'Confirmation', description: 'Order complete' }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            {/* Step Circle */}
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step.number
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-300 text-gray-500'
            }`}>
              {currentStep > step.number ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-sm font-semibold">{step.number}</span>
              )}
            </div>
            
            {/* Step Info */}
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step.title}
              </p>
              <p className="text-xs text-gray-400">{step.description}</p>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckoutProgressBar;