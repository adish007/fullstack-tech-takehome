import { NextRequest, NextResponse } from 'next/server';
import { getWorkflows, createWorkflow } from '@/lib/db';

export async function GET() {
  try {
    const workflows = getWorkflows();
    return NextResponse.json(workflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
  }
}

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
