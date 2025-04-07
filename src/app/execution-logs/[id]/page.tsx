'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useExecutionLog } from '@/hooks/useExecutionLogs';
import { formatDateTime, formatTime, formatDuration } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorDisplay from '@/components/ui/ErrorDisplay';

export default function ExecutionLogDetail() {
  const { id } = useParams();
  const { log, isLoading, error } = useExecutionLog(id as string);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <LoadingSpinner text="Loading execution log..." />
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
            <p>{formatDateTime(log.timestamp)}</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-400 mb-1">Status</h3>
            <StatusBadge status={log.status} />
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
          <ErrorDisplay message={log.error} className="mb-6" />
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
                        {formatTime(node.timestamp)}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">
                        {node.nodeId}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge 
                          status={node.success ? 'success' : 'failure'} 
                        />
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
