import { Link } from 'react-router-dom';

const OrderBreadcrumbs = ({ orderId, orderNumber, currentPage }) => {
  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link to="/shopper/orders" className="text-gray-700 hover:text-blue-600 text-sm">
            Orders
          </Link>
        </li>
        
        <li>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
            </svg>
            <Link to={`/shopper/orders/${orderId}`} className={`ml-1 text-sm ${currentPage === 'details' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
              Order {orderNumber}
            </Link>
          </div>
        </li>
        
        {currentPage === 'tracking' && (
          <li>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <span className="ml-1 text-sm text-blue-600">
                Tracking
              </span>
            </div>
          </li>
        )}
      </ol>
    </nav>
  );
};

export default OrderBreadcrumbs;