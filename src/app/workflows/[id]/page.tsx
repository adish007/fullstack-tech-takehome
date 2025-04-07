'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Workflow } from '@/lib/workflowDatabase';
import WorkflowViewer from '@/components/WorkflowViewer';
import OnboardingGuide from '@/components/OnboardingGuide';
import { Node as XYFlowNode, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { executeWorkflow, hasOutputNode, findOutputNodes } from '@/lib/workflowExecutor';

export default function WorkflowDetail() {
  const { id } = useParams();
  const router = useRouter();
  
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<any[]>([]);
  const [executionError, setExecutionError] = useState('');
  const [hasOutput, setHasOutput] = useState(false);

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/workflows/${id}`, {
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error('Workflow not found');
        }

        const data = await res.json();
        setWorkflow(data);
        
        // Check if the workflow has any output nodes
        if (data.nodes) {
          setHasOutput(hasOutputNode(data.nodes));
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflow();
  }, [id]);

  const handleExecuteWorkflow = async () => {
    if (!workflow) return;
    
    setIsExecuting(true);
    setExecutionResults([]);
    setExecutionError('');
    
    try {
      const results = await executeWorkflow(
        workflow.nodes as any[], 
        workflow.edges as Edge[]
      );
      setExecutionResults(results);
      
      // If no results and we have output nodes, it means no nodes are connected to output
      if (results.length === 0 && hasOutput) {
        setExecutionError('No execution results available. Make sure your nodes are properly connected to an Output node.');
      }
    } catch (err: any) {
      setExecutionError(err.message || 'Failed to execute workflow');
    } finally {
      setIsExecuting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p className="text-zinc-400">Loading workflow...</p>
      </main>
    );
  }

  if (error || !workflow) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="bg-red-900/30 border border-red-800 text-red-200 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error || 'Workflow not found'}</p>
          <Link
            href="/"
            className="mt-4 inline-block bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const createdDate = new Date(workflow.createdAt).toLocaleString();
  const updatedDate = new Date(workflow.updatedAt).toLocaleString();
  
  // Find all output nodes in the workflow
  const outputNodes = findOutputNodes(workflow.nodes as any[]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <OnboardingGuide />
      
      <div className="container mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{workflow.name}</h1>
            <p className="text-zinc-400 mt-1">{workflow.description || 'No description'}</p>
          </div>
          <div className="flex space-x-3">
            <Link 
              href={`/workflows/${workflow.id}/edit`} 
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Edit Workflow
            </Link>
            <Link 
              href="/" 
              className="border border-zinc-700 hover:border-orange-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-400 mb-1">Created</h3>
            <p>{createdDate}</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-400 mb-1">Last Modified</h3>
            <p>{updatedDate}</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-400 mb-1">Nodes</h3>
            <p>{workflow.nodes?.length || 0}</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-400 mb-1">Connections</h3>
            <p>{workflow.edges?.length || 0}</p>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-lg border border-zinc-800 mb-6 overflow-hidden">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="font-bold">Workflow Diagram</h2>
          </div>
          <WorkflowViewer 
            nodes={workflow.nodes as XYFlowNode[]} 
            edges={workflow.edges as Edge[]} 
          />
        </div>

        {!hasOutput && (
          <div className="bg-yellow-900/30 border border-yellow-800 text-yellow-200 p-4 rounded-lg mb-6">
            <h3 className="font-bold mb-2">Output Node Required</h3>
            <p>
              To see execution results, you need to add an Output node to your workflow. 
              Edit the workflow to add an Output node and connect your nodes to it.
            </p>
          </div>
        )}

        {executionResults.length > 0 && (
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 mb-6 overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="font-bold">Execution Results</h2>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {executionResults.map((result, index) => (
                <div 
                  key={index} 
                  className={`mb-4 p-4 rounded-lg ${
                    result.success ? 'bg-green-900/20 border border-green-800' : 'bg-red-900/20 border border-red-800'
                  }`}
                >
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">
                      Node: {result.nodeId}
                    </h3>
                    <span className="text-sm text-zinc-400">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {result.success ? (
                    <div className="bg-zinc-800 p-3 rounded overflow-x-auto">
                      {typeof result.data === 'string' ? (
                        // For string data (like from Transform nodes), preserve newlines
                        <pre className="text-sm whitespace-pre-wrap">{result.data}</pre>
                      ) : (
                        // For object data, use JSON.stringify
                        <pre className="text-sm">{JSON.stringify(result.data, null, 2)}</pre>
                      )}
                    </div>
                  ) : (
                    <p className="text-red-300">{result.error}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {executionError && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-lg mb-6">
            <h3 className="font-bold mb-2">Execution Error</h3>
            <p>{executionError}</p>
          </div>
        )}

        <div className="flex justify-between">

          <button
            className={`${
              isExecuting 
                ? 'bg-zinc-600 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white px-6 py-2 rounded-lg font-medium transition-colors`}
            onClick={handleExecuteWorkflow}
            disabled={isExecuting}
          >
            {isExecuting ? 'Executing...' : 'Execute Workflow'}
          </button>
        </div>
      </div>
    </main>
  );
}
