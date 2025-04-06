/**
 * Workflow Collection API Routes
 * 
 * This file handles API endpoints for the collection of workflows:
 * - GET /api/workflows - Retrieve all workflows
 * - POST /api/workflows - Create a new workflow
 */
import { NextRequest, NextResponse } from 'next/server';
import { getWorkflows, createWorkflow } from '@/lib/workflowDatabase';

/**
 * GET /api/workflows
 * Retrieves all workflows from the database
 */
export async function GET() {
  try {
    const workflows = getWorkflows();
    return NextResponse.json(workflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
  }
}

/**
 * POST /api/workflows
 * Creates a new workflow with the provided data
 * 
 * Required fields:
 * - name: string
 * 
 * Optional fields:
 * - description: string
 * - nodes: array of workflow nodes
 * - edges: array of workflow connections
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json({ error: 'Workflow name is required' }, { status: 400 });
    }
    
    const newWorkflow = createWorkflow({
      name: body.name,
      description: body.description || '',
      nodes: body.nodes || [],
      edges: body.edges || [],
    });
    
    return NextResponse.json(newWorkflow, { status: 201 });
  } catch (error) {
    console.error('Error creating workflow:', error);
    return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 });
  }
}
