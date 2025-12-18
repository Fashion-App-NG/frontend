import { createContext, useContext, useEffect, useState } from 'react';
import { settingsService } from '../services/settingsService';

export const TaxContext = createContext();

export const TaxProvider = ({ children }) => {
  const [taxRate, setTaxRate] = useState(null); // Start with null instead of 0.075
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVATSettings = async () => {
      try {
        setIsLoading(true);
        const response = await settingsService.getVATSettings();
        if (response.success && response.data) {
          setTaxRate(response.data.taxRate);
        } else {
          // Only set default if API fails
          setTaxRate(0.0); // Default to 0% if API fails
        }
        setError(null);
      } catch (err) {
        console.error('Failed to fetch VAT settings:', err);
        setError('Unable to fetch VAT rate - using default');
        setTaxRate(0.0); // Fallback on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchVATSettings();
  }, []);

  return (
    <TaxContext.Provider value={{ taxRate, isLoading, error }}>
      {children}
    </TaxContext.Provider>
  );
};

export const useTax = () => useContext(TaxContext);