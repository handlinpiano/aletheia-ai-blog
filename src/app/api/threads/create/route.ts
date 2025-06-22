import { NextRequest, NextResponse } from 'next/server';
import { commandProcessor } from '@/lib/commandProcessor';
import { validatePersona } from '@/utils/commandParser';
import { ThreadCreationData, ThreadResponse } from '@/types/threading';

export async function POST(request: NextRequest) {
  try {
    const { initiatorPersona, initialContent, title }: ThreadCreationData = await request.json();
    
    // Validate required fields
    if (!initiatorPersona || !initialContent) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: initiatorPersona, initialContent' 
        } as ThreadResponse,
        { status: 400 }
      );
    }
    
    // Validate persona
    if (!validatePersona(initiatorPersona)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid persona: ${initiatorPersona}` 
        } as ThreadResponse,
        { status: 400 }
      );
    }
    
    // Create the thread
    const thread = await commandProcessor.createThread(initiatorPersona, initialContent, title);
    
    return NextResponse.json({
      success: true,
      thread,
      message: `Thread created successfully by ${initiatorPersona}`
    } as ThreadResponse);
    
  } catch (error) {
    console.error('Error creating thread:', error);
    
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
    { error: 'Method not allowed. Use POST to create threads.' },
    { status: 405 }
  );
} 