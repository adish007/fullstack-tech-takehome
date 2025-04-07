/**
 * serverExecutionLogger.ts
 * Server-side utility for managing execution logs
 * This file should only be imported in API routes or server components
 */

import fs from 'fs';
import path from 'path';
import { ExecutionLogEntry } from './executionLogger';

// Path to the log file
const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'execution-logs.json');

/**
 * Ensures the log directory exists
 */
const ensureLogDirExists = (): void => {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, JSON.stringify([], null, 2));
  }
};

/**
 * Reads all execution logs from the log file
 */
export const getExecutionLogs = (): ExecutionLogEntry[] => {
  ensureLogDirExists();
  
  try {
    const logsData = fs.readFileSync(LOG_FILE, 'utf-8');
    return JSON.parse(logsData);
  } catch (error) {
    console.error('Error reading execution logs:', error);
    return [];
  }
};

/**
 * Gets execution logs for a specific workflow
 */
export const getWorkflowExecutionLogs = (workflowId: string): ExecutionLogEntry[] => {
  const logs = getExecutionLogs();
  return logs.filter(log => log.workflowId === workflowId);
};

/**
 * Adds a new execution log entry
 */
export const addExecutionLog = (logEntry: ExecutionLogEntry): void => {
  ensureLogDirExists();
  
  try {
    const logs = getExecutionLogs();
    logs.push(logEntry);
    
    // Sort logs by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Keep only the latest 1000 logs to prevent the file from growing too large
    const trimmedLogs = logs.slice(0, 1000);
    
    fs.writeFileSync(LOG_FILE, JSON.stringify(trimmedLogs, null, 2));
  } catch (error) {
    console.error('Error logging execution:', error);
  }
};

/**
 * Gets a specific execution log by ID
 */
export const getExecutionLog = (executionId: string): ExecutionLogEntry | undefined => {
  const logs = getExecutionLogs();
  return logs.find(log => log.id === executionId);
};

/**
 * Deletes execution logs for a specific workflow
 */
export const deleteWorkflowExecutionLogs = (workflowId: string): void => {
  ensureLogDirExists();
  
  try {
    const logs = getExecutionLogs();
    const filteredLogs = logs.filter(log => log.workflowId !== workflowId);
    
    fs.writeFileSync(LOG_FILE, JSON.stringify(filteredLogs, null, 2));
  } catch (error) {
    console.error('Error deleting workflow execution logs:', error);
  }
};
