'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ReactFlow,
  Background, 
  Controls, 
  MiniMap, 
  Panel,
  useNodesState, 
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeMouseHandler
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import OnboardingGuide from '@/components/OnboardingGuide';

// Define interface for API route properties
interface ApiRoute {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: any;
  provider?: string; // Add provider field to identify Stripe API calls
}

// Define custom node data type with index signature
interface NodeData {
  label: string;
  apiRoute?: ApiRoute;
  [key: string]: any; // Add index signature to satisfy ReactFlow's constraints
}

// Initial nodes for a new workflow
const initialNodes: Node<NodeData>[] = [
  {
    id: 'start',
    type: 'input',
    data: { 
      label: 'Start',
      // Include empty properties to satisfy NodeData interface
      apiRoute: undefined
    },
    position: { x: 250, y: 25 },
    style: {
      background: '#f97316',
      color: 'white',
      border: '1px solid #c2410c',
      width: 150,
    },
  },
];

const initialEdges: Edge[] = [];

export default function NewWorkflow() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [showNodeConfig, setShowNodeConfig] = useState(false);
  
  const onConnect = (params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  };
  
  const handleAddNode = (type: string) => {
    const newNode: Node<NodeData> = {
      id: `node_${nodes.length + 1}`,
      type: type === 'output' ? 'output' : 'default',
      data: { 
        label: type.charAt(0).toUpperCase() + type.slice(1),
        apiRoute: type === 'api' ? {
          url: '',
          method: 'GET',
          headers: {},
          body: {},
          provider: 'custom' // Default to custom API provider
        } : undefined
      },
      position: { 
        x: Math.random() * 300 + 100, 
        y: Math.random() * 200 + 100 
      },
      style: {
        background: type === 'api' ? '#3b82f6' : 
                   type === 'transform' ? '#10b981' : 
                   type === 'output' ? '#8b5cf6' : '#f97316',
        color: 'white',
        border: '1px solid rgba(0,0,0,0.1)',
        width: 150,
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
  };

  const onNodeClick: NodeMouseHandler = (event, node) => {
    setSelectedNode(node as Node<NodeData>);
    if (node.type !== 'output' && node.data.label === 'Api') {
      setShowNodeConfig(true);
    }
  };

  const handleUpdateNodeConfig = () => {
    if (!selectedNode) return;
    
    // Format the URL based on provider before saving
    if (selectedNode.data.apiRoute && selectedNode.data.apiRoute.provider === 'stripe') {
      // Ensure Stripe paths start with /
      let stripePath = selectedNode.data.apiRoute.url;
      if (!stripePath.startsWith('/')) {
        stripePath = '/' + stripePath;
      }
      
      // Update the node with the formatted path
      const updatedNode = {
        ...selectedNode,
        data: {
          ...selectedNode.data,
          apiRoute: {
            ...selectedNode.data.apiRoute,
            url: stripePath
          }
        }
      };
      
      setSelectedNode(updatedNode);
      
      // Update the nodes state with the updated node
      setNodes((nds) => 
        nds.map((node) => {
          if (node.id === updatedNode.id) {
            return updatedNode;
          }
          return node;
        })
      );
    } else {
      // For non-Stripe nodes, just update as normal
      setNodes((nds) => 
        nds.map((node) => {
          if (node.id === selectedNode.id) {
            return selectedNode;
          }
          return node;
        })
      );
    }
    
    // Dispatch a custom event that the onboarding guide can listen for
    const configCompletedEvent = new CustomEvent('apiNodeConfigured', {
      detail: { nodeId: selectedNode.id }
    });
    document.dispatchEvent(configCompletedEvent);
    
    setShowNodeConfig(false);
  };

  const handleApiRouteChange = (field: string, value: any) => {
    if (!selectedNode || !selectedNode.data.apiRoute) return;
    
    // Special handling for provider changes
    if (field === 'provider') {
      // When switching to Stripe, adjust the URL format
      if (value === 'stripe') {
        // Extract just the path if it's a full URL
        let currentUrl = selectedNode.data.apiRoute.url;
        if (currentUrl.startsWith('http')) {
          try {
            const urlObj = new URL(currentUrl);
            currentUrl = urlObj.pathname;
          } catch (e) {
            // If URL parsing fails, just use the current value or empty string
            currentUrl = currentUrl || '';
          }
        }
        
        // Ensure path starts with /
        if (currentUrl && !currentUrl.startsWith('/')) {
          currentUrl = '/' + currentUrl;
        }
        
        // If path is empty, provide a default Stripe path
        if (!currentUrl) {
          currentUrl = '/v1/customers';
        }
        
        setSelectedNode({
          ...selectedNode,
          data: {
            ...selectedNode.data,
            apiRoute: {
              ...selectedNode.data.apiRoute,
              provider: value,
              url: currentUrl
            }
          }
        });
        return;
      } 
      // When switching to custom, provide a full URL format if it's just a path
      else if (value === 'custom') {
        let currentUrl = selectedNode.data.apiRoute.url;
        if (currentUrl.startsWith('/')) {
          // It's likely a Stripe path, so replace with empty or example URL
          currentUrl = '';
        }
        
        setSelectedNode({
          ...selectedNode,
          data: {
            ...selectedNode.data,
            apiRoute: {
              ...selectedNode.data.apiRoute,
              provider: value,
              url: currentUrl
            }
          }
        });
        return;
      }
    }
    
    // Standard field update
    setSelectedNode({
      ...selectedNode,
      data: {
        ...selectedNode.data,
        apiRoute: {
          ...selectedNode.data.apiRoute,
          [field]: value
        }
      }
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Workflow name is required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          nodes,
          edges,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create workflow');
      }
      
      const workflow = await response.json();
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the workflow');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Include the onboarding guide component */}
      <OnboardingGuide />
      
      <div className="container mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Create New Workflow</h1>
            <p className="text-zinc-400 mt-1">Design your automated workflow</p>
          </div>
          <Link 
            href="/" 
            className="border border-zinc-700 hover:border-orange-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block mb-2 text-sm font-medium">
                  Workflow Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-500"
                  placeholder="Enter workflow name"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block mb-2 text-sm font-medium">
                  Description
                </label>
                <input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-500"
                  placeholder="Enter workflow description (optional)"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 mb-6 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="font-bold">Workflow Builder</h2>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleAddNode('api')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Add API Node
                </button>
                <button
                  type="button"
                  onClick={() => handleAddNode('transform')}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Add Transform
                </button>
                <button
                  type="button"
                  onClick={() => handleAddNode('output')}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Add Output
                </button>
              </div>
            </div>
            <div style={{ height: '500px' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                fitView
              >
                <Background />
                <Controls />
                <MiniMap />
                <Panel position="bottom-right">
                  <div className="bg-zinc-800 p-2 rounded text-xs text-zinc-400">
                    Drag to connect nodes
                  </div>
                </Panel>
              </ReactFlow>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Workflow'}
            </button>
          </div>
        </form>
      </div>

      {/* Node Configuration Modal */}
      {showNodeConfig && selectedNode && (selectedNode.data as NodeData).apiRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Configure API Node</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">API Provider</label>
                <select
                  value={(selectedNode.data as NodeData).apiRoute?.provider || 'custom'}
                  onChange={(e) => handleApiRouteChange('provider', e.target.value)}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                >
                  <option value="custom">Custom API</option>
                  <option value="stripe">Stripe API</option>
                </select>
                {(selectedNode.data as NodeData).apiRoute?.provider === 'stripe' && (
                  <p className="mt-1 text-xs text-zinc-400">
                    Stripe API authentication will be handled automatically using your STRIPE_SECRET_KEY.
                  </p>
                )}
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium">
                  {(selectedNode.data as NodeData).apiRoute?.provider === 'stripe' 
                    ? 'Stripe Endpoint Path' 
                    : 'API URL'}
                </label>
                <input
                  type="text"
                  value={(selectedNode.data as NodeData).apiRoute?.url || ''}
                  onChange={(e) => handleApiRouteChange('url', e.target.value)}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                  placeholder={(selectedNode.data as NodeData).apiRoute?.provider === 'stripe' 
                    ? "/v1/customers" 
                    : "https://api.example.com/endpoint"}
                />
                {(selectedNode.data as NodeData).apiRoute?.provider === 'stripe' && (
                  <p className="mt-1 text-xs text-zinc-400">
                    Enter only the path portion (e.g., "/v1/customers"). The base URL "https://api.stripe.com" will be added automatically.
                  </p>
                )}
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium">Method</label>
                <select
                  value={(selectedNode.data as NodeData).apiRoute?.method || 'GET'}
                  onChange={(e) => handleApiRouteChange('method', e.target.value)}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium">Headers (JSON)</label>
                <textarea
                  value={JSON.stringify((selectedNode.data as NodeData).apiRoute?.headers || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const headers = JSON.parse(e.target.value);
                      handleApiRouteChange('headers', headers);
                    } catch (err) {
                      // Allow invalid JSON during editing
                    }
                  }}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 font-mono text-sm"
                  rows={4}
                  placeholder='{ "Content-Type": "application/json" }'
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium">Body (JSON)</label>
                <textarea
                  value={JSON.stringify((selectedNode.data as NodeData).apiRoute?.body || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const body = JSON.parse(e.target.value);
                      handleApiRouteChange('body', body);
                    } catch (err) {
                      // Allow invalid JSON during editing
                    }
                  }}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 font-mono text-sm"
                  rows={4}
                  placeholder='{ "key": "value" }'
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowNodeConfig(false)}
                className="px-4 py-2 border border-zinc-600 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateNodeConfig}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
