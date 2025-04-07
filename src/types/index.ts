/**
 * Common type definitions used throughout the application
 */
import { Edge } from '@xyflow/react';

export interface Node {
  id: string;
  type: string;
  data: {
    label: string;
    apiRoute?: ApiRoute;
  };
  position: {
    x: number;
    y: number;
  };
  style?: any;
  measured?: any;
  selected?: boolean;
  dragging?: boolean;
}

export interface ApiRoute {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
  apiKey?: string;
  provider?: 'custom' | 'stripe';
}

export interface NodeResult {
  nodeId: string;
  success: boolean;
  timestamp: string;
  error?: string;
  data?: any;
}

export interface ExecutionResult {
  nodeId: string;
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

export interface ExecutionLogEntry {
  id: string;
  workflowId: string;
  workflowName: string;
  timestamp: string;
  status: 'success' | 'failure';
  error?: string;
  executionTime: number;
  nodeResults?: NodeResult[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  nodes: Node[];
  edges: Edge[];
}
