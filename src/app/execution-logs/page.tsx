'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useExecutionLogs } from '@/hooks/useExecutionLogs';
import { formatDateTime, formatDuration } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorDisplay from '@/components/ui/ErrorDisplay';

export default function ExecutionLogs() {
  const searchParams = useSearchParams();
  const workflowId = searchParams.get('workflowId');
  const { logs, isLoading, error, refreshLogs } = useExecutionLogs({ 
    workflowId: workflowId || undefined 
  });

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
            <LoadingSpinner text="Loading logs..." />
          </div>
        ) : error ? (
          <ErrorDisplay 
            message={error} 
            onRetry={refreshLogs} 
            className="my-4"
          />
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
                        {formatDateTime(log.timestamp)}
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
                        <StatusBadge status={log.status} />
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
