// import { NextRequest, NextResponse } from 'next/server';
// import { getExecutionLog } from '@/lib/serverExecutionLogger';

// export async function GET(
//   request: NextRequest,
//   context: { params: { id: string } }
// ) {
//   try {
//     const { id } = context.params;
//     const log = getExecutionLog(id);
    
//     if (!log) {
//       return NextResponse.json(
//         { error: 'Execution log not found' },
//         { status: 404 }
//       );
//     }
    
//     return NextResponse.json(log);
//   } catch (error: any) {
//     return NextResponse.json(
//       { error: error.message || 'Failed to fetch execution log' },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from 'next/server';
import { getExecutionLog } from '@/lib/serverExecutionLogger';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const log = getExecutionLog(id);

    if (!log) {
      return NextResponse.json(
        { error: 'Execution log not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(log);
  } catch (error: unknown) {
    // Narrow the error type safely
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch execution log' },
      { status: 500 }
    );
  }
}
