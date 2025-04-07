import { useState, useEffect } from 'react';
import { Workflow } from '@/types';
import { fetchApiGet } from '@/lib/apiUtils';

/**
 * Custom hook for fetching and managing workflows
 */
export function useWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setIsLoading(true);
        const data = await fetchApiGet<Workflow[]>('/api/workflows');
        setWorkflows(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load workflows');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkflows();
  }, []);
  
  const refreshWorkflows = async () => {
    try {
      setIsLoading(true);
      const data = await fetchApiGet<Workflow[]>('/api/workflows');
      setWorkflows(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load workflows');
    } finally {
      setIsLoading(false);
    }
  };
  
  return { workflows, isLoading, error, refreshWorkflows };
}
