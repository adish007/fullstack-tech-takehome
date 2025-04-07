import { NextRequest, NextResponse } from 'next/server';
import { getWorkflowById } from '@/lib/workflowDatabase';
import { executeWorkflow } from '@/lib/workflowExecutor';
import { Edge } from '@xyflow/react';
import { Node } from '@/types';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const workflow = getWorkflowById(id);
    
    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }
    
    const results = await executeWorkflow(
      workflow.nodes as Node[], 
      workflow.edges as Edge[],
      workflow.id,
      workflow.name
    );
    
    return NextResponse.json({ 
      success: true, 
      results,
      workflowId: workflow.id,
      workflowName: workflow.name
    });
  } catch (error: any) {
    console.error('Error executing workflow:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to execute workflow' },
      { status: 500 }
    );
  }
}
