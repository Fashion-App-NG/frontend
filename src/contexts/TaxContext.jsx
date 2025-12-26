import { createContext, useContext, useEffect, useState } from 'react';
import { settingsService } from '../services/settingsService';
import { useAuth } from './AuthContext';

export const TaxContext = createContext();

export const TaxProvider = ({ children }) => {
  const [taxRate, setTaxRate] = useState(0.02); // Default 2% VAT
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchVATSettings = async () => {
      // ✅ Only fetch if user is admin/superadmin
      if (!isAuthenticated || !user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        setTaxRate(0.02); // Use default for non-admin users
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await settingsService.getVATSettings();
        if (response.success && response.data) {
          setTaxRate(response.data.taxRate);
        } else {
          setTaxRate(0.02); // Fallback to default
        }
        setError(null);
      } catch (err) {
        console.error('Failed to fetch VAT settings:', err);
        setError('Unable to fetch VAT rate - using default');
        setTaxRate(0.02);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVATSettings();
  }, [isAuthenticated, user]);

  return (
    <TaxContext.Provider value={{ taxRate, isLoading, error }}>
      {children}
    </TaxContext.Provider>
  );
};

export const useTax = () => useContext(TaxContext);