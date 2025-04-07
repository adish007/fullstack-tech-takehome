'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface ExecutionLogEntry {
  id: string;
  workflowId: string;
  workflowName: string;
  timestamp: string;
  status: 'success' | 'failure';
  error?: string;
  executionTime: number;
  nodeResults?: {
    nodeId: string;
    success: boolean;
    timestamp: string;
    error?: string;
  }[];
}

export default function ExecutionLogs() {
  const [logs, setLogs] = useState<ExecutionLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const workflowId = searchParams.get('workflowId');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        
        // Construct URL with optional workflowId filter
        let url = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/execution-logs`;
        if (workflowId) {
          url += `?workflowId=${workflowId}`;
        }
        
        const res = await fetch(url, {
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error('Failed to fetch execution logs');
        }

        const data = await res.json();
        setLogs(data);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [workflowId]);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Execution Logs</h1>
            <p className="text-zinc-400 mt-1">
              {workflowId 
                ? 'Logs for specific workflow' 
                : 'All workflow execution logs'}
            </p>
          </div>
          <div>
            <Link 
              href="/" 
              className="border border-zinc-700 hover:border-orange-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <p className="text-zinc-400">Loading logs...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-800 text-red-200 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-2">No Logs Found</h2>
            <p className="text-zinc-400">
              {workflowId 
                ? 'No execution logs found for this workflow.' 
                : 'No workflow executions have been logged yet.'}
            </p>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="font-bold">Execution History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="px-4 py-3 text-left">Time</th>
                    <th className="px-4 py-3 text-left">Workflow</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Duration</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                      <td className="px-4 py-3">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Link 
                          href={`/workflows/${log.workflowId}`}
                          className="text-orange-400 hover:underline"
                        >
                          {log.workflowName}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.status === 'success' 
                            ? 'bg-green-900/30 text-green-300' 
                            : 'bg-red-900/30 text-red-300'
                        }`}>
                          {log.status === 'success' ? 'Success' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {formatDuration(log.executionTime)}
                      </td>
                      <td className="px-4 py-3">
                        <Link 
                          href={`/execution-logs/${log.id}`}
                          className="text-orange-400 hover:underline"
                        >
                          View Details
                        </Link>
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
