import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useNavigationConsistency = () => {
  const location = useLocation();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Log navigation for debugging
      console.log('🧭 Navigation:', {
        pathname: location.pathname,
        state: location.state,
        timestamp: new Date().toISOString()
      });
    }
  }, [location]);
};