import { NextRequest, NextResponse } from 'next/server';
import { commandProcessor } from '@/lib/commandProcessor';
import { ThreadStorage } from '@/lib/threadStorage';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const threadId = params.id;
    const { content } = await request.json();
    
    if (!threadId || !content?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Thread ID and content are required' },
        { status: 400 }
      );
    }

    // Load the thread to verify it exists and is a human discourse thread
    const thread = await ThreadStorage.loadThread(threadId);
    if (!thread) {
      return NextResponse.json(
        { success: false, error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Verify this is a human discourse thread
    const isHumanDiscourse = thread.title?.includes('[PRIVATE]') && thread.title?.includes('Human Discourse');
    if (!isHumanDiscourse) {
      return NextResponse.json(
        { success: false, error: 'This is not a human discourse thread' },
        { status: 403 }
      );
    }

    // Verify the thread is waiting for human response
    if (!thread.waitingForHuman) {
      return NextResponse.json(
        { success: false, error: 'Thread is not waiting for human response' },
        { status: 400 }
      );
    }

    // Add the human response to the thread
    const humanPost = await commandProcessor.addResponseToThread(
      threadId, 
      'human', 
      content.trim()
    );

    // Clear the waiting for human flag
    await ThreadStorage.setWaitingForHuman(threadId, false);

    return NextResponse.json({
      success: true,
      post: humanPost,
      message: 'Response added successfully'
    });

  } catch (error) {
    console.error('Error adding human response:', error);
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
    { error: 'Method not allowed. Use POST to add human responses.' },
    { status: 405 }
  );
} 