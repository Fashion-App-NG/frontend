
const CheckoutNavigation = ({ currentStep, onNext, onBack, canProceed = true }) => {
  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={currentStep === 1}
        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
          currentStep === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        Back
      </button>

      {/* Next/Continue Button */}
      <button
        onClick={onNext}
        disabled={!canProceed}
        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
          canProceed
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {currentStep === 3 ? 'Place Order' : 'Continue'}
      </button>
    </div>
  );
};

export default CheckoutNavigation;