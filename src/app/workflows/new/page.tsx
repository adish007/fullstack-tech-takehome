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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Initial nodes for a new workflow
const initialNodes: Node[] = [
  {
    id: 'start',
    type: 'input',
    data: { label: 'Start' },
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
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const onConnect = (params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  };
  
  const handleAddNode = (type: string) => {
    const newNode: Node = {
      id: `node_${nodes.length + 1}`,
      type: type === 'output' ? 'output' : 'default',
      data: { label: type.charAt(0).toUpperCase() + type.slice(1) },
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
    </main>
  );
}
