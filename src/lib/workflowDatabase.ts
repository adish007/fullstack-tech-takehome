/**
 * workflowDatabase.ts
 * This file handles all database operations for workflows.
 * It provides CRUD functionality for workflow data stored in JSON files.
 */
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Workflow } from '@/types';

// Define the data directory
const DATA_DIR = path.join(process.cwd(), 'data');
const WORKFLOWS_FILE = path.join(DATA_DIR, 'workflows.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize workflows file if it doesn't exist
if (!fs.existsSync(WORKFLOWS_FILE)) {
  fs.writeFileSync(WORKFLOWS_FILE, JSON.stringify([], null, 2));
}

// CRUD operations for workflows
export const getWorkflows = (): Workflow[] => {
  const data = fs.readFileSync(WORKFLOWS_FILE, 'utf-8');
  return JSON.parse(data);
};

export const getWorkflowById = (id: string): Workflow | null => {
  const workflows = getWorkflows();
  return workflows.find(workflow => workflow.id === id) || null;
};

export const createWorkflow = (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Workflow => {
  const workflows = getWorkflows();
  const now = new Date().toISOString();
  
  const newWorkflow: Workflow = {
    ...workflow,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  
  workflows.push(newWorkflow);
  fs.writeFileSync(WORKFLOWS_FILE, JSON.stringify(workflows, null, 2));
  
  return newWorkflow;
};

export const updateWorkflow = (id: string, updates: Partial<Omit<Workflow, 'id' | 'createdAt'>>): Workflow | null => {
  const workflows = getWorkflows();
  const index = workflows.findIndex(workflow => workflow.id === id);
  
  if (index === -1) return null;
  
  const updatedWorkflow: Workflow = {
    ...workflows[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  workflows[index] = updatedWorkflow;
  fs.writeFileSync(WORKFLOWS_FILE, JSON.stringify(workflows, null, 2));
  
  return updatedWorkflow;
};

export const deleteWorkflow = (id: string): boolean => {
  const workflows = getWorkflows();
  const filteredWorkflows = workflows.filter(workflow => workflow.id !== id);
  
  if (filteredWorkflows.length === workflows.length) return false;
  
  fs.writeFileSync(WORKFLOWS_FILE, JSON.stringify(filteredWorkflows, null, 2));
  return true;
};
