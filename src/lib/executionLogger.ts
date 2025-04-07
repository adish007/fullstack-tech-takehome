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

/**
 * Logs an execution by sending it to the API endpoint
 */
export const logExecution = async (logEntry: ExecutionLogEntry): Promise<void> => {
  try {
    await fetch('/api/execution-logs', {
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
    const response = await fetch(`/api/execution-logs?workflowId=${workflowId}`);
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
    const response = await fetch(`/api/execution-logs/${executionId}`);
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
    await fetch(`/api/execution-logs?workflowId=${workflowId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting workflow execution logs:', error);
  }
};
