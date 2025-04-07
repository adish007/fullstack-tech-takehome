'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useExecutionLog } from '@/hooks/useExecutionLogs';
import { formatDateTime, formatTime, formatDuration } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorDisplay from '@/components/ui/ErrorDisplay';

// Component that uses useParams
function ExecutionLogDetailContent() {
  const { id } = useParams();
  const { log, isLoading, error } = useExecutionLog(id as string);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <LoadingSpinner text="Loading execution log..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-12">
        <ErrorDisplay 
          message={error} 
          className="my-4"
        />
        <div className="mt-4">
          <Link 
            href="/execution-logs" 
            className="text-orange-400 hover:underline"
          >
            &larr; Back to Execution Logs
          </Link>
        </div>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold mb-2">Log Not Found</h2>
          <p className="text-zinc-400">
            The execution log you're looking for doesn't exist or has been deleted.
          </p>
        </div>
        <div className="mt-4">
          <Link 
            href="/execution-logs" 
            className="text-orange-400 hover:underline"
          >
            &larr; Back to Execution Logs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-6">
        <Link 
          href={log.workflowId ? `/execution-logs?workflowId=${log.workflowId}` : "/execution-logs"} 
          className="text-orange-400 hover:underline"
        >
          &larr; Back to Execution Logs
        </Link>
      </div>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden mb-8">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">{log.workflowName}</h1>
              <p className="text-zinc-400 mt-1">
                Executed on {formatDateTime(log.timestamp)}
              </p>
            </div>
            <StatusBadge status={log.status} />
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-zinc-800/50 p-4 rounded-lg">
              <h3 className="font-medium text-zinc-400 mb-1">Workflow ID</h3>
              <p className="font-mono text-sm">{log.workflowId}</p>
            </div>
            <div className="bg-zinc-800/50 p-4 rounded-lg">
              <h3 className="font-medium text-zinc-400 mb-1">Execution ID</h3>
              <p className="font-mono text-sm">{log.id}</p>
            </div>
            <div className="bg-zinc-800/50 p-4 rounded-lg">
              <h3 className="font-medium text-zinc-400 mb-1">Start Time</h3>
              <p>{formatTime(log.timestamp)}</p>
            </div>
            <div className="bg-zinc-800/50 p-4 rounded-lg">
              <h3 className="font-medium text-zinc-400 mb-1">Duration</h3>
              <p>{formatDuration(log.executionTime)}</p>
            </div>
          </div>
          
          <h2 className="text-xl font-bold mb-4">Execution Results</h2>
          
          {log.nodeResults && log.nodeResults.map((nodeResult) => (
            <div 
              key={nodeResult.nodeId} 
              className="mb-6 bg-zinc-800/30 border border-zinc-700 rounded-lg overflow-hidden"
            >
              <div className="bg-zinc-800 px-4 py-3 flex justify-between items-center">
                <div>
                  <span className="font-medium">{nodeResult.nodeId}</span>
                </div>
                <StatusBadge status={nodeResult.success ? 'success' : 'failure'} />
              </div>
              
              <div className="p-4">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Details:</h4>
                  {nodeResult.error && (
                    <div className="bg-red-900/30 border border-red-800 text-red-200 p-3 rounded mb-3">
                      <p className="font-medium">Error:</p>
                      <p>{nodeResult.error}</p>
                    </div>
                  )}
                  <pre className="bg-zinc-900 p-3 rounded overflow-x-auto text-sm whitespace-pre-wrap">
                    {nodeResult.data ? 
                      (typeof nodeResult.data === 'object' 
                        ? JSON.stringify(nodeResult.data, null, 2) 
                        : nodeResult.data
                      ) 
                      : 'No data available'
                    }
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function ExecutionLogDetail() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner text="Loading execution log..." />
        </div>
      }>
        <ExecutionLogDetailContent />
      </Suspense>
    </main>
  );
}
