import { NextRequest, NextResponse } from 'next/server';
import { ThreadStorage } from '@/lib/threadStorage';
import { ThreadResponse } from '@/types/threading';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: threadId } = await params;
    
    if (!threadId) {
      return NextResponse.json(
        { status: 'error', message: 'Thread ID is required' },
        { status: 400 }
      );
    }

    console.log(`📖 Fetching thread: ${threadId}`);
    
    const thread = await ThreadStorage.loadThread(threadId);
    
    if (!thread) {
      return NextResponse.json(
        { status: 'error', message: 'Thread not found' },
        { status: 404 }
      );
    }

    // Generate thread title from first post
    const title = thread.posts.length > 0 
      ? (thread.posts[0].content.split('\n')[0].substring(0, 60) + '...')
      : 'Conversation';

    return NextResponse.json({
      status: 'success',
      thread: {
        ...thread,
        title
      }
    });

  } catch (error) {
    console.error('❌ Error fetching thread:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error'
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