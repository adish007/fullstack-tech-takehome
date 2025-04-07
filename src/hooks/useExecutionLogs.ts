import { useState, useEffect } from 'react';
import { ExecutionLogEntry } from '@/types';
import { fetchApiGet } from '@/lib/apiUtils';

interface UseExecutionLogsProps {
  workflowId?: string;
}

/**
 * Custom hook for fetching and managing execution logs
 */
export function useExecutionLogs({ workflowId }: UseExecutionLogsProps = {}) {
  const [logs, setLogs] = useState<ExecutionLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        
        // Construct URL with optional workflowId filter
        const endpoint = workflowId 
          ? `/api/execution-logs?workflowId=${workflowId}`
          : '/api/execution-logs';
        
        const data = await fetchApiGet<ExecutionLogEntry[]>(endpoint);
        setLogs(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load execution logs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [workflowId]);
  
  const refreshLogs = async () => {
    try {
      setIsLoading(true);
      
      // Construct URL with optional workflowId filter
      const endpoint = workflowId 
        ? `/api/execution-logs?workflowId=${workflowId}`
        : '/api/execution-logs';
      
      const data = await fetchApiGet<ExecutionLogEntry[]>(endpoint);
      setLogs(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load execution logs');
    } finally {
      setIsLoading(false);
    }
  };
  
  return { logs, isLoading, error, refreshLogs };
}

/**
 * Custom hook for fetching a single execution log by ID
 */
export function useExecutionLog(id: string) {
  const [log, setLog] = useState<ExecutionLogEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchLog = async () => {
      try {
        setIsLoading(true);
        const data = await fetchApiGet<ExecutionLogEntry>(`/api/execution-logs/${id}`);
        setLog(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load execution log');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLog();
  }, [id]);
  
  return { log, isLoading, error };
}
