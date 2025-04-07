'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface NodeResult {
  nodeId: string;
  success: boolean;
  timestamp: string;
  error?: string;
}

interface ExecutionLogEntry {
  id: string;
  workflowId: string;
  workflowName: string;
  timestamp: string;
  status: 'success' | 'failure';
  error?: string;
  executionTime: number;
  nodeResults?: NodeResult[];
}

export default function ExecutionLogDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [log, setLog] = useState<ExecutionLogEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLog = async () => {
      try {
        setIsLoading(true);
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/execution-logs/${id}`, {
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error('Execution log not found');
        }

        const data = await res.json();
        setLog(data);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLog();
  }, [id]);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p className="text-zinc-400">Loading execution log...</p>
      </main>
    );
  }

  if (error || !log) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="bg-red-900/30 border border-red-800 text-red-200 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error || 'Execution log not found'}</p>
          <Link
            href="/execution-logs"
            className="mt-4 inline-block bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Back to Logs
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Execution Log</h1>
            <p className="text-zinc-400 mt-1">
              Details for execution of "{log.workflowName}"
            </p>
          </div>
          <div className="flex space-x-3">
            <Link 
              href={`/workflows/${log.workflowId}`} 
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              View Workflow
            </Link>
            <Link 
              href="/execution-logs" 
              className="border border-zinc-700 hover:border-orange-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Back to Logs
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-400 mb-1">Execution Time</h3>
            <p>{new Date(log.timestamp).toLocaleString()}</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-400 mb-1">Status</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              log.status === 'success' 
                ? 'bg-green-900/30 text-green-300' 
                : 'bg-red-900/30 text-red-300'
            }`}>
              {log.status === 'success' ? 'Success' : 'Failed'}
            </span>
          </div>
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-400 mb-1">Duration</h3>
            <p>{formatDuration(log.executionTime)}</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-400 mb-1">Nodes Executed</h3>
            <p>{log.nodeResults?.length || 0}</p>
          </div>
        </div>

        {log.error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-lg mb-6">
            <h3 className="font-bold mb-2">Execution Error</h3>
            <p>{log.error}</p>
          </div>
        )}

        {log.nodeResults && log.nodeResults.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden mb-6">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="font-bold">Node Execution Details</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="px-4 py-3 text-left">Time</th>
                    <th className="px-4 py-3 text-left">Node ID</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {log.nodeResults.map((node, index) => (
                    <tr key={index} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                      <td className="px-4 py-3">
                        {new Date(node.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">
                        {node.nodeId}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          node.success 
                            ? 'bg-green-900/30 text-green-300' 
                            : 'bg-red-900/30 text-red-300'
                        }`}>
                          {node.success ? 'Success' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {node.error && (
                          <span className="text-red-300">{node.error}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
