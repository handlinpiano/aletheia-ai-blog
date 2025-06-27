import { NextRequest, NextResponse } from 'next/server';
import { ThreadStorage } from '@/lib/threadStorage';
import { ThreadResponse } from '@/types/threading';

export async function GET(
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

    const rawThread = await ThreadStorage.loadThread(threadId);
    
    if (!rawThread) {
      return NextResponse.json(
        { success: false, error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Convert Date objects to strings for JSON serialization
    const thread = {
      id: rawThread.id,
      status: rawThread.status === 'active' || rawThread.status === 'closed' ? rawThread.status : 'closed',
      createdAt: rawThread.createdAt.toISOString(),
      updatedAt: rawThread.updatedAt.toISOString(),
      posts: rawThread.posts.map(post => ({
        id: post.id,
        persona: post.persona,
        content: post.content,
        createdAt: post.createdAt.toISOString()
      })),
      initiatorPersona: rawThread.initiatorPersona,
      title: rawThread.title || `Thread by ${rawThread.initiatorPersona}`,
      waitingForHuman: rawThread.waitingForHuman
    };

    return NextResponse.json({
      success: true,
      thread
    });

  } catch (error) {
    console.error('Error fetching thread:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: threadId } = await params;
    
    // Close the thread instead of deleting it
    await ThreadStorage.updateThreadStatus(threadId, 'closed');
    
    return NextResponse.json({
      success: true,
      message: `Thread ${threadId} closed successfully`
    } as ThreadResponse);
    
  } catch (error) {
    console.error('Error closing thread:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      } as ThreadResponse,
      { status: 500 }
    );
  }
} 