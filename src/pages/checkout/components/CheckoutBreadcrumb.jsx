
const CheckoutBreadcrumb = ({ currentStep }) => {
  const getBreadcrumbItems = () => {
    const items = [
      { label: 'Cart', step: 0, path: '/shopper/cart' },
      { label: 'Checkout', step: 1, active: currentStep <= 3 },
      { label: 'Payment', step: 3, active: currentStep === 3 }
    ];
    
    return items;
  };

  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {getBreadcrumbItems().map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <svg className="w-6 h-6 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
            )}
            <span className={`text-sm font-medium ${
              item.active ? 'text-blue-600' : 'text-gray-500'
            }`}>
              {item.label}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default CheckoutBreadcrumb;