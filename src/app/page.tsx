"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useWorkflows } from '@/hooks/useWorkflows';
import { formatDate } from '@/lib/utils';
import { Workflow } from '@/types';
import OnboardingButton from '@/components/OnboardingButton';
import OnboardingGuide from '@/components/OnboardingGuide';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { useRouter } from 'next/navigation';
import { fetchApiPost } from '@/lib/apiUtils';

export default function Dashboard() {
  const { workflows, isLoading, error, refreshWorkflows } = useWorkflows();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  
  // Filter workflows based on search term
  const filteredWorkflows = workflows.filter(workflow => 
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (workflow.description && workflow.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Sort workflows based on selected sort option
  const sortedWorkflows = [...filteredWorkflows].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'updated':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      default:
        return 0; // No sorting
    }
  });
  
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Include the onboarding guide component */}
      <OnboardingGuide />
      
      <div className="container mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Workflow Dashboard</h1>
            <p className="text-zinc-400 mt-1">Manage and create automated workflows</p>
          </div>
          <div className="flex space-x-4">
            <OnboardingButton />
            <Link 
              href="/execution-logs" 
              className="border border-zinc-700 hover:border-orange-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Execution Logs
            </Link>
            <Link 
              href="/workflows/new" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Create Workflow
            </Link>
          </div>
        </div>
        
        {/* Search and filter */}
        <div className="bg-zinc-900 p-4 rounded-lg mb-8 border border-zinc-800">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search workflows by Name or Description..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select 
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="">Sort by</option>
                <option value="name">Name</option>
                <option value="created">Date Created</option>
                <option value="updated">Last Updated</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Loading and error states */}
        {isLoading && (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" text="Loading workflows..." />
          </div>
        )}
        
        {error && (
          <ErrorDisplay 
            message={error} 
            onRetry={refreshWorkflows}
            className="mb-8"
          />
        )}
        
        {/* Workflows list */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedWorkflows.length > 0 ? (
              sortedWorkflows.map((workflow) => (
                <WorkflowCard key={workflow.id} workflow={workflow} />
              ))
            ) : (
              <div className="col-span-full bg-zinc-900 rounded-lg border border-zinc-800 p-8 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2">
                  {searchTerm ? 'No matching workflows found' : 'No workflows found'}
                </h3>
                <p className="text-zinc-400 mb-6">
                  {searchTerm 
                    ? `No workflows match "${searchTerm}". Try a different search term or create a new workflow.` 
                    : 'Get started by creating your first workflow'}
                </p>
                <Link
                  href="/workflows/new"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Create Workflow
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

interface WorkflowCardProps {
  workflow: Workflow;
}

function WorkflowCard({ workflow }: WorkflowCardProps) {
  const router = useRouter();
  const createdDate = formatDate(workflow.createdAt);
  const updatedDate = formatDate(workflow.updatedAt);
  const [isExecuting, setIsExecuting] = useState(false);
  
  const handleExecute = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      setIsExecuting(true);
      
      // Execute the workflow using the API
      const response = await fetchApiPost(`/api/workflows/${workflow.id}/execute`, {});
      
      // Navigate to the execution logs filtered by this workflow
      router.push(`/execution-logs?workflowId=${workflow.id}`);
    } catch (error) {
      console.error('Error executing workflow:', error);
      // If execution fails, navigate to the workflow detail page
      router.push(`/workflows/${workflow.id}`);
    } finally {
      setIsExecuting(false);
    }
  };
  
  return (
    <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden hover:border-orange-500 transition-colors">
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 truncate">{workflow.name}</h3>
        <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{workflow.description || 'No description'}</p>
        <div className="flex justify-between text-xs text-zinc-500">
          <div>Created: {createdDate}</div>
          <div>Updated: {updatedDate}</div>
        </div>
        <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-800">
          <Link 
            href={`/workflows/${workflow.id}`}
            className="text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded text-sm flex-1 text-center"
          >
            View
          </Link>
          <Link
            href={`/workflows/${workflow.id}/edit`}
            className="text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded text-sm flex-1 text-center"
          >
            Edit
          </Link>
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className={`text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded text-sm flex-1 text-center ${
              isExecuting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isExecuting ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin h-3 w-3 border-t-2 border-white rounded-full mr-2"></span>
                Running...
              </span>
            ) : 'Execute'}
          </button>
        </div>
      </div>
    </div>
  );
}
