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

/**
 * GET /api/workflows/[id]
 * Retrieves a specific workflow by ID
 */
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    const workflow = await getWorkflowById(id);
    
    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json(workflow);
  } catch (error) {
    console.error('Error fetching workflow:', error);
    return NextResponse.json({ error: 'Failed to fetch workflow' }, { status: 500 });
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
export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Workflow name is required' }, { status: 400 });
    }

    const updatedWorkflow = await updateWorkflow(id, {
      name: body.name,
      description: body.description,
      nodes: body.nodes,
      edges: body.edges,
    });

    if (!updatedWorkflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json(updatedWorkflow);
  } catch (error) {
    console.error('Error updating workflow:', error);
    return NextResponse.json({ error: 'Failed to update workflow' }, { status: 500 });
  }
}

/**
 * DELETE /api/workflows/[id]
 * Deletes a specific workflow by ID
 */
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    const success = await deleteWorkflow(id);

    if (!success) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    return NextResponse.json({ error: 'Failed to delete workflow' }, { status: 500 });
  }
}
