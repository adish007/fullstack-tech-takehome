import { NextRequest, NextResponse } from 'next/server';
import { getExecutionLogs, getWorkflowExecutionLogs, addExecutionLog, deleteWorkflowExecutionLogs } from '@/lib/serverExecutionLogger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');
    
    // If workflowId is provided, get logs for that workflow only
    const logs = workflowId 
      ? getWorkflowExecutionLogs(workflowId)
      : getExecutionLogs();
    
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch execution logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const logEntry = await request.json();
    
    // Validate the log entry
    if (!logEntry.id || !logEntry.workflowId || !logEntry.timestamp) {
      return NextResponse.json(
        { error: 'Invalid log entry' },
        { status: 400 }
      );
    }
    
    // Add the log entry
    addExecutionLog(logEntry);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add execution log' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');
    
    if (!workflowId) {
      return NextResponse.json(
        { error: 'Workflow ID is required' },
        { status: 400 }
      );
    }
    
    deleteWorkflowExecutionLogs(workflowId);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete execution logs' },
      { status: 500 }
    );
  }
}
