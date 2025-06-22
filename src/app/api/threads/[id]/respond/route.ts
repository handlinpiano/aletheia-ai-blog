import { NextRequest, NextResponse } from 'next/server';
import { commandProcessor } from '@/lib/commandProcessor';
import { validatePersona } from '@/utils/commandParser';
import { ThreadResponse } from '@/types/threading';

interface ThreadResponseData {
  persona: string;
  content: string;
  referencePostId?: string;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const threadId = params.id;
    const { persona, content, referencePostId }: ThreadResponseData = await request.json();
    
    // Validate required fields
    if (!persona || !content) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: persona, content' 
        } as ThreadResponse,
        { status: 400 }
      );
    }
    
    // Validate persona
    if (!validatePersona(persona)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid persona: ${persona}` 
        } as ThreadResponse,
        { status: 400 }
      );
    }
    
    // Add response to thread
    const post = await commandProcessor.addResponseToThread(threadId, persona, content, referencePostId);
    
    return NextResponse.json({
      success: true,
      post,
      message: `Response added successfully by ${persona}`
    } as ThreadResponse);
    
  } catch (error) {
    console.error('Error adding response to thread:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      } as ThreadResponse,
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to add responses.' },
    { status: 405 }
  );
} 