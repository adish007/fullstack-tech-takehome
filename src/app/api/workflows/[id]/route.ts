/**
 * Individual Workflow API Routes
 * 
 * This file handles API endpoints for individual workflow operations:
 * - GET /api/workflows/[id] - Retrieve a specific workflow
 * - PUT /api/workflows/[id] - Update a specific workflow
 * - DELETE /api/workflows/[id] - Delete a specific workflow
 */
import { NextRequest, NextResponse } from 'next/server';
import { getWorkflowById, updateWorkflow, deleteWorkflow } from '@/lib/workflowDatabase';

type RouteParams = {
  params: {
    id: string;
  };
};

/**
 * GET /api/workflows/[id]
 * Retrieves a specific workflow by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = params;

  try {
    const workflow = await getWorkflowById(id);
    
    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(workflow);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve workflow' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/workflows/[id]
 * Updates a specific workflow with the provided data
 * 
 * Required fields:
 * - name: string
 * 
 * Optional fields:
 * - description: string
 * - nodes: array of workflow nodes
 * - edges: array of workflow connections
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  
  try {
    const existingWorkflow = await getWorkflowById(id);
    
    if (!existingWorkflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Workflow name is required' },
        { status: 400 }
      );
    }
    
    // Update the workflow
    const updatedWorkflow = await updateWorkflow(id, {
      ...data,
      updatedAt: new Date().toISOString()
    });
    
    return NextResponse.json(updatedWorkflow);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update workflow' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workflows/[id]
 * Deletes a specific workflow by ID
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  
  try {
    const existingWorkflow = await getWorkflowById(id);
    
    if (!existingWorkflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }
    
    await deleteWorkflow(id);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete workflow' },
      { status: 500 }
    );
  }
}
