import { useState, useCallback } from 'react';

export const useAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callAPI = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);
      setLoading(false);
      
      if (result.success) {
        return result.data;
      } else {
        setError(result.error);
        return null;
      }
    } catch (err) {
      setLoading(false);
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      return null;
    }
  }, []);

  return {
    loading,
    error,
    callAPI,
    clearError: () => setError(null),
  };
};
