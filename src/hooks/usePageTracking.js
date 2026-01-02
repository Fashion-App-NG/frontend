import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location]);

  // ✅ FIX: Return null to follow React hook conventions
  return null;
};

export default usePageTracking;