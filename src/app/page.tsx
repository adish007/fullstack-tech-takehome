import Link from 'next/link';
import { Workflow } from '@/lib/db';

async function getWorkflows(): Promise<Workflow[]> {
  // In Next.js server components, we need to use an absolute URL
  // Using the URL constructor to ensure a valid URL
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';
  
  const res = await fetch(`${baseUrl}/api/workflows`, {
    cache: 'no-store',
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch workflows');
  }
  
  return res.json();
}

export default async function Dashboard() {
  const workflows = await getWorkflows();
  
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Workflow Dashboard</h1>
            <p className="text-zinc-400 mt-1">Manage and create automated workflows</p>
          </div>
          <Link 
            href="/workflows/new" 
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Create Workflow
          </Link>
        </div>
        
        {/* Search and filter */}
        <div className="bg-zinc-900 p-4 rounded-lg mb-8 border border-zinc-800">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search workflows..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="flex gap-2">
              <select className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-500">
                <option value="">Sort by</option>
                <option value="name">Name</option>
                <option value="created">Date Created</option>
                <option value="updated">Last Updated</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Workflows list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.length > 0 ? (
            workflows.map((workflow) => (
              <WorkflowCard key={workflow.id} workflow={workflow} />
            ))
          ) : (
            <div className="col-span-full bg-zinc-900 rounded-lg border border-zinc-800 p-8 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2">No workflows found</h3>
              <p className="text-zinc-400 mb-6">Get started by creating your first workflow</p>
              <Link
                href="/workflows/new"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Create Workflow
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

interface WorkflowCardProps {
  workflow: Workflow;
}

function WorkflowCard({ workflow }: WorkflowCardProps) {
  const createdDate = new Date(workflow.createdAt).toLocaleDateString();
  const updatedDate = new Date(workflow.updatedAt).toLocaleDateString();
  
  return (
    <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden hover:border-orange-500 transition-colors">
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 truncate">{workflow.name}</h3>
        <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{workflow.description || 'No description'}</p>
        <div className="flex justify-between text-xs text-zinc-500">
          <div>Created: {createdDate}</div>
          <div>Updated: {updatedDate}</div>
        </div>
      </div>
      <div className="bg-zinc-800 p-4 flex justify-between">
        <Link
          href={`/workflows/${workflow.id}`}
          className="text-orange-500 hover:text-orange-400 transition-colors"
        >
          View Details
        </Link>
        <Link
          href={`/workflows/${workflow.id}/edit`}
          className="text-orange-500 hover:text-orange-400 transition-colors"
        >
          Edit
        </Link>
      </div>
    </div>
  );
}
