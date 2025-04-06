import { NextRequest, NextResponse } from 'next/server';
import { getWorkflowById, updateWorkflow, deleteWorkflow } from '@/lib/db';

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const { id } = await context.params;

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
export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  const { id } = await context.params;

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

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  const { id } = await context.params;

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

