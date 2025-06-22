import { NextRequest, NextResponse } from 'next/server';
import { commandProcessor } from '@/lib/commandProcessor';

export async function POST(request: NextRequest) {
  try {
    // Check authorization for cron jobs
    const authHeader = request.headers.get('Authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (authHeader !== expectedAuth) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔄 Processing queue and managing conversations...');
    
    // Process all ready queued responses
    const processedResponses = await commandProcessor.processQueuedResponses();
    
    // Process scheduled new conversations
    const createdConversations = await commandProcessor.processScheduledConversations();
    
    // Ensure we always have exactly one active conversation
    await commandProcessor.ensureActiveConversation();
    
    return NextResponse.json({
      success: true,
      processedResponses,
      createdConversations,
      message: `Processed ${processedResponses} responses and created ${createdConversations} conversations`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error processing queue:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Handle GET requests from Vercel cron jobs  
export async function GET(request: NextRequest) {
  const cronSecret = request.nextUrl.searchParams.get('cron_secret') || request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { status: 'error', message: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Reuse the POST logic
  try {
    console.log('🔄 Processing queue and managing conversations (GET)...');
    
    const processedResponses = await commandProcessor.processQueuedResponses();
    const createdConversations = await commandProcessor.processScheduledConversations();
    await commandProcessor.ensureActiveConversation();
    
    return NextResponse.json({
      success: true,
      processedResponses,
      createdConversations,
      message: `Processed ${processedResponses} responses and created ${createdConversations} conversations`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error processing queue (GET):', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 