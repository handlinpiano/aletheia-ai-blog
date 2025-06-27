import { NextRequest, NextResponse } from 'next/server';
import { commandProcessor } from '@/lib/commandProcessor';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const threadId = params.id;
    
    if (!threadId) {
      return NextResponse.json(
        { success: false, error: 'Thread ID is required' },
        { status: 400 }
      );
    }

    // Activate the dormant human thread
    await commandProcessor.activateHumanThread(threadId);

    return NextResponse.json({
      success: true,
      message: 'Thread activated successfully'
    });

  } catch (error) {
    console.error('Error activating thread:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to activate threads.' },
    { status: 405 }
  );
} 