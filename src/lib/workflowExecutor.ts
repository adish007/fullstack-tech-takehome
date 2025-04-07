/**
 * workflowExecutor.ts
 * This file contains the logic for executing workflows by following node connections
 * and performing API requests as defined in each node.
 */
import { Edge } from '@xyflow/react';

// Define our own Node interface to match the structure in workflowDatabase.ts
interface Node {
  id: string;
  type: string;
  data: {
    label: string;
    apiRoute?: {
      url: string;
      method: string;
      headers?: Record<string, string>;
      body?: any;
      apiKey?: string;
      provider?: string;
    };
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

interface ExecutionResult {
  nodeId: string;
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

/**
 * Finds the start node in the workflow
 * If no explicit 'start' type node exists, uses the following strategies:
 * 1. Look for a node with 'start' in its label (case insensitive)
 * 2. Look for a node that has no incoming edges (source node)
 * 3. If all else fails, use the first node in the array
 */
export const findStartNode = (nodes: Node[], edges: Edge[]): Node | undefined => {
  // Strategy 1: Look for a node with type 'start'
  const typeStartNode = nodes.find(node => node.type === 'start');
  if (typeStartNode) return typeStartNode;
  
  // Strategy 2: Look for a node with 'start' in its label (case insensitive)
  const labelStartNode = nodes.find(node => 
    node.data.label && node.data.label.toLowerCase().includes('start')
  );
  if (labelStartNode) return labelStartNode;
  
  // Strategy 3: Find nodes that have no incoming edges (source nodes)
  const targetNodeIds = edges.map(edge => edge.target);
  const sourceNodes = nodes.filter(node => !targetNodeIds.includes(node.id));
  
  if (sourceNodes.length > 0) {
    // If there are multiple source nodes, prefer API nodes if available
    const apiSourceNode = sourceNodes.find(node => 
      node.data.label === 'Api' || 
      node.type === 'api' || 
      (node.data.apiRoute && Object.keys(node.data.apiRoute).length > 0)
    );
    
    return apiSourceNode || sourceNodes[0];
  }
  
  // Strategy 4: If all else fails, use the first node
  return nodes.length > 0 ? nodes[0] : undefined;
};

/**
 * Finds all nodes that are connected from the given source node
 */
export const findNextNodes = (sourceNodeId: string, edges: Edge[], nodes: Node[]): Node[] => {
  const connectedEdges = edges.filter(edge => edge.source === sourceNodeId);
  const targetNodeIds = connectedEdges.map(edge => edge.target);
  return nodes.filter(node => targetNodeIds.includes(node.id));
};

/**
 * Executes an API request based on the node configuration
 */
export const executeNodeRequest = async (node: Node): Promise<any> => {
  if (!node.data.apiRoute) {
    return { message: 'No API route defined for this node' };
  }

  const { url, method, headers = {}, body, provider } = node.data.apiRoute;
  
  try {
    // Build request options
    const requestOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      ...(method !== 'GET' && method !== 'HEAD' && body ? { body: JSON.stringify(body) } : {})
    };

    // Handle Stripe API calls
    if (provider === 'stripe') {
      // Get Stripe API key from environment variable
      // const stripeApiKey = process.env.STRIPE_SECRET_KEY || '';
      const stripeApiKey = process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY || '';
      if (!stripeApiKey) {
        throw new Error('Stripe API key is not configured');
      }
      
      // Add Authorization header with Stripe API key
      (requestOptions.headers as Record<string, string>)['Authorization'] = `Bearer ${stripeApiKey}`;
    }

    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error executing node ${node.id}:`, error);
    throw error;
  }
};

/**
 * Executes a workflow by starting at the start node and following connections
 */
export const executeWorkflow = async (nodes: Node[], edges: Edge[]): Promise<ExecutionResult[]> => {
  const results: ExecutionResult[] = [];
  const startNode = findStartNode(nodes, edges);
  
  if (!startNode) {
    throw new Error('No start node found in the workflow');
  }
  
  // Add start node to results
  results.push({
    nodeId: startNode.id,
    success: true,
    data: { message: 'Workflow execution started' },
    timestamp: new Date().toISOString()
  });
  
  // Queue for BFS traversal
  const queue: { nodeId: string, previousResults: any }[] = [{ 
    nodeId: startNode.id, 
    previousResults: null 
  }];
  
  // Track visited nodes to avoid cycles
  const visited = new Set<string>();
  
  while (queue.length > 0) {
    const { nodeId, previousResults } = queue.shift()!;
    
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);
    
    // Find next nodes
    const nextNodes = findNextNodes(nodeId, edges, nodes);
    
    // Execute each next node
    for (const node of nextNodes) {
      try {
        // Skip start nodes in the execution chain
        if (node.type === 'start') continue;
        
        // Execute the node's request
        const data = await executeNodeRequest(node);
        
        results.push({
          nodeId: node.id,
          success: true,
          data,
          timestamp: new Date().toISOString()
        });
        
        // Add next nodes to the queue
        queue.push({ 
          nodeId: node.id, 
          previousResults: data 
        });
      } catch (error: any) {
        results.push({
          nodeId: node.id,
          success: false,
          error: error.message || 'Unknown error',
          timestamp: new Date().toISOString()
        });
        
        // Don't continue from failed nodes
        // But we could add error handling logic here if needed
      }
    }
  }
  
  return results;
};
