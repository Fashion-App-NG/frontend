import { createContext, useContext, useEffect, useState } from 'react';
import { settingsService } from '../services/settingsService';

export const TaxContext = createContext();

export const TaxProvider = ({ children }) => {
  const [taxRate, setTaxRate] = useState(0.075); // Default 7.5%
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTaxSettings = async () => {
      try {
        setIsLoading(true);
        const response = await settingsService.getTaxSettings();
        if (response.success && response.data) {
          // Convert percentage to decimal (e.g., 7.5% → 0.075)
          setTaxRate(response.data.vatRate / 100);
        }
        setError(null);
      } catch (err) {
        console.error('Failed to fetch tax settings:', err);
        setError('Unable to fetch tax rate - using default');
        // Keep using default tax rate
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaxSettings();
  }, []);

  return (
    <TaxContext.Provider value={{ taxRate, isLoading, error }}>
      {children}
    </TaxContext.Provider>
  );
};

export const useTax = () => useContext(TaxContext);