const CheckoutProgressBar = ({ currentStep }) => {
  const steps = [
    { number: 1, title: 'Review Cart', description: 'Check your items' },
    { number: 2, title: 'Shipping', description: 'Delivery address' },
    { number: 3, title: 'Payment', description: 'Payment method' },
    { number: 4, title: 'Confirmation', description: 'Order complete' }
  ];

  return (
    <div className="mb-6 sm:mb-8">
      {/* Mobile: Simplified Progress */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-xs text-gray-500">
            {steps[currentStep - 1]?.title}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: Full Progress Bar */}
      <div className="hidden sm:flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                currentStep >= step.number
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-500 bg-white'
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
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium ${
                  currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
              </div>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 transition-colors ${
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