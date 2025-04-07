/**
 * executionLogger.ts
 * This file contains utilities for logging workflow executions
 */

// Define interface for execution log entry
export interface ExecutionLogEntry {
  id: string;
  workflowId: string;
  workflowName: string;
  timestamp: string;
  status: 'success' | 'failure';
  error?: string;
  executionTime: number; // in milliseconds
  nodeResults?: {
    nodeId: string;
    success: boolean;
    timestamp: string;
    error?: string;
  }[];
}

// Helper function to get the base URL
const getBaseUrl = () => {
  // Check if we're running on the server and process.env is available
  if (typeof window === 'undefined') {
    // Server-side: use a relative URL for internal API calls
    return '';
  }
  // Client-side: use the window location
  return window.location.origin;
};

/**
 * Logs an execution by sending it to the API endpoint
 */
export const logExecution = async (logEntry: ExecutionLogEntry): Promise<void> => {
  try {
    // Check if we're on the server or client
    if (typeof window === 'undefined') {
      // On the server side, just log to console
      // In a production app, we would store this in a database directly
      console.log('[Server] Execution log:', logEntry);
      
      // For this demo app, we'll skip the API call when on the server
      // to avoid the Invalid URL error
      return;
    } 
    
    // On the client side, use regular fetch with the window.location.origin
    const baseUrl = window.location.origin;
    await fetch(`${baseUrl}/api/execution-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logEntry),
    });
  } catch (error) {
    console.error('Error logging execution:', error);
  }
};

/**
 * Gets execution logs for a specific workflow
 */
export const getWorkflowExecutionLogs = async (workflowId: string): Promise<ExecutionLogEntry[]> => {
  try {
    // Only available on the client side
    if (typeof window === 'undefined') {
      return [];
    }
    
    const baseUrl = window.location.origin;
    const response = await fetch(`${baseUrl}/api/execution-logs?workflowId=${workflowId}`);
    return await response.json();
  } catch (error) {
    console.error('Error getting workflow execution logs:', error);
    return [];
  }
};

/**
 * Gets a specific execution log by ID
 */
export const getExecutionLog = async (executionId: string): Promise<ExecutionLogEntry | undefined> => {
  try {
    // Only available on the client side
    if (typeof window === 'undefined') {
      return undefined;
    }
    
    const baseUrl = window.location.origin;
    const response = await fetch(`${baseUrl}/api/execution-logs/${executionId}`);
    if (response.ok) {
      return await response.json();
    } else {
      return undefined;
    }
  } catch (error) {
    console.error('Error getting execution log:', error);
    return undefined;
  }
};

/**
 * Deletes execution logs for a specific workflow
 */
export const deleteWorkflowExecutionLogs = async (workflowId: string): Promise<void> => {
  try {
    // Only available on the client side
    if (typeof window === 'undefined') {
      return;
    }
    
    const baseUrl = window.location.origin;
    await fetch(`${baseUrl}/api/execution-logs?workflowId=${workflowId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting workflow execution logs:', error);
  }
};
