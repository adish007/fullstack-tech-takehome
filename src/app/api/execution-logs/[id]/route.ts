import { NextRequest, NextResponse } from 'next/server';
import { getExecutionLog } from '@/lib/serverExecutionLogger';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const log = getExecutionLog(id);
    
    if (!log) {
      return NextResponse.json(
        { error: 'Execution log not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(log);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch execution log' },
      { status: 500 }
    );
  }
}
