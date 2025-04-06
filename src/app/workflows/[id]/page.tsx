

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Workflow } from '@/lib/workflowDatabase';
import WorkflowViewer from '@/components/WorkflowViewer';
import { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function WorkflowDetail() {
  const { id } = useParams();
  const router = useRouter();
  
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflow();
  }, [id]);

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

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
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
            nodes={workflow.nodes as Node[]} 
            edges={workflow.edges as Edge[]} 
          />
        </div>

        <div className="flex justify-between">
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            onClick={() => alert('Delete functionality would be implemented here')}
          >
            Delete Workflow
          </button>

          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            onClick={() => alert('Execute functionality would be implemented here')}
          >
            Execute Workflow
          </button>
        </div>
      </div>
    </main>
  );
}
