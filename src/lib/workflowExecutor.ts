/**
 * workflowExecutor.ts
 * This file contains the logic for executing workflows by following node connections
 * and performing API requests as defined in each node.
 */
import { Edge } from '@xyflow/react';
import { cleanDataWithOpenAI } from './openai';
import { logExecution } from './executionLogger';
import { v4 as uuidv4 } from 'uuid';

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
 * Checks if the workflow contains at least one output node
 */
export const hasOutputNode = (nodes: Node[]): boolean => {
  return nodes.some(node => node.type === 'output' || node.data.label === 'Output');
};

/**
 * Finds all output nodes in the workflow
 */
export const findOutputNodes = (nodes: Node[]): Node[] => {
  return nodes.filter(node => node.type === 'output' || node.data.label === 'Output');
};

/**
 * Executes an API request based on the node configuration
 */
export const executeNodeRequest = async (node: Node): Promise<any> => {
  if (!node.data.apiRoute) {
    return { message: 'Output Node: No API route defined for this node' };
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
  } catch (error: any) {
    console.error(`Error executing node ${node.id}:`, error);
    return { error: error.message || 'Unknown error executing API request' };
  }
};

/**
 * Processes a Transform node by cleaning data with OpenAI
 */
export const executeTransformNode = async (node: Node, previousResults: any): Promise<any> => {
  try {
    // If there are no previous results, return a default message
    if (!previousResults) {
      return "No previous data to transform";
    }

    // Use OpenAI to clean the data and return the direct response
    const cleanedData = await cleanDataWithOpenAI(previousResults);
    
    // If there was an error, throw it to be caught by the catch block
    if (typeof cleanedData === 'object' && 'error' in cleanedData) {
      throw new Error(cleanedData.error);
    }
    
    // Return the string directly
    return cleanedData;
  } catch (error: any) {
    console.error(`Error executing transform node ${node.id}:`, error);
    throw error;
  }
};

/**
 * Checks if a node is connected to an output node (directly or indirectly)
 */
export const isConnectedToOutput = (
  nodeId: string, 
  edges: Edge[], 
  nodes: Node[], 
  visited: Set<string> = new Set()
): boolean => {
  // Prevent infinite loops in cyclic graphs
  if (visited.has(nodeId)) return false;
  visited.add(nodeId);
  
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return false;
  
  // Check if this is an output node
  if (node.type === 'output' || node.data.label === 'Output') {
    return true;
  }
  
  // Check if any next nodes are connected to output
  const nextNodes = findNextNodes(nodeId, edges, nodes);
  return nextNodes.some(nextNode => 
    isConnectedToOutput(nextNode.id, edges, nodes, new Set([...visited]))
  );
};

/**
 * Executes a workflow by starting at the start node and following connections
 */
export const executeWorkflow = async (nodes: Node[], edges: Edge[], workflowId?: string, workflowName?: string): Promise<ExecutionResult[]> => {
  const allResults: ExecutionResult[] = [];
  const startNode = findStartNode(nodes, edges);
  const executionStartTime = Date.now();
  const executionId = uuidv4();
  
  if (!startNode) {
    throw new Error('No start node found in the workflow');
  }
  
  // Check if the workflow has any output nodes
  const outputNodes = findOutputNodes(nodes);
  const hasOutput = outputNodes.length > 0;
  
  // Add start node to results
  allResults.push({
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
  
  // Store results for each node to pass to next nodes
  const nodeResults = new Map<string, any>();
  nodeResults.set(startNode.id, { message: 'Workflow execution started' });
  
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
        
        let data;
        let success = true;
        
        // Handle different node types
        if (node.type === 'output' || node.data.label === 'Output') {
          // For output nodes, just pass through the previous results
          data = previousResults || { message: 'No data received from previous nodes' };
        } else if (node.data.label === 'Transform') {
          try {
            // For transform nodes, use OpenAI to clean the data
            data = await executeTransformNode(node, previousResults);
            success = true;
          } catch (error: any) {
            success = false;
            data = error.message || 'Error transforming data';
          }
        } else {
          // For API nodes, execute the API request
          data = await executeNodeRequest(node);
          // Check if there was an error
          if (data && data.error) {
            success = false;
          }
        }
        
        // Store the result for this node
        nodeResults.set(node.id, data);
        
        allResults.push({
          nodeId: node.id,
          success: success,
          data: data,
          error: data && data.error ? data.error : undefined,
          timestamp: new Date().toISOString()
        });
        
        // Only continue to next nodes if this node was successful
        if (success) {
          // Add next nodes to the queue
          queue.push({ 
            nodeId: node.id, 
            previousResults: data 
          });
        }
      } catch (error: any) {
        allResults.push({
          nodeId: node.id,
          success: false,
          error: error.message || 'Unknown error',
          timestamp: new Date().toISOString()
        });
        
        // Don't continue from failed nodes
      }
    }
  }
  
  // If there are output nodes, filter results to only include nodes that lead to an output node
  let finalResults: ExecutionResult[] = [];
  if (hasOutput) {
    // Create a set of node IDs that are connected to output nodes
    const nodesConnectedToOutput = new Set<string>();
    
    // Add all output nodes to the set
    outputNodes.forEach(node => nodesConnectedToOutput.add(node.id));
    
    // For each node, check if it's connected to an output node
    nodes.forEach(node => {
      if (isConnectedToOutput(node.id, edges, nodes)) {
        nodesConnectedToOutput.add(node.id);
      }
    });
    
    // Filter results to only include nodes that are connected to output
    finalResults = allResults.filter(result => nodesConnectedToOutput.has(result.nodeId));
  } else {
    finalResults = hasOutput ? allResults : [];
  }
  
  // Calculate execution time
  const executionEndTime = Date.now();
  const executionTime = executionEndTime - executionStartTime;
  
  // Determine overall execution status
  const hasFailures = finalResults.some(result => !result.success);
  const executionStatus = hasFailures ? 'failure' : 'success';
  
  // Log the execution
  if (workflowId) {
    try {
      await logExecution({
        id: executionId,
        workflowId,
        workflowName: workflowName || 'Unnamed Workflow',
        timestamp: new Date().toISOString(),
        status: executionStatus,
        executionTime,
        error: hasFailures ? 'One or more nodes failed during execution' : undefined,
        nodeResults: finalResults.map(result => ({
          nodeId: result.nodeId,
          success: result.success,
          timestamp: result.timestamp,
          error: result.error
        }))
      });
    } catch (error) {
      console.error('Failed to log execution:', error);
    }
  }
  
  return finalResults;
};
