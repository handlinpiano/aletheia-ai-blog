import { NextRequest, NextResponse } from 'next/server';
import { commandProcessor } from '@/lib/commandProcessor';
import { storeHumanDiscourseMapping } from '@/lib/humanDiscourseDb';

interface HumanThreadCreationData {
  humanIdentifier: string;
  accessApplicationId?: string;
  initialMessage: string;
}

// Generate anonymous identifier for human participants
function generateAnonymousId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'Human_';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { humanIdentifier, accessApplicationId, initialMessage }: HumanThreadCreationData = await request.json();
    
    // Validate required fields
    if (!humanIdentifier || !initialMessage) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: humanIdentifier, initialMessage' 
        },
        { status: 400 }
      );
    }
    
    // Generate anonymous identifier for privacy
    const anonymousId = generateAnonymousId();
    
    // Check if this is the Architect (Cody) using backdoor
    const isArchitect = humanIdentifier.toLowerCase().includes('cody') && initialMessage.toLowerCase().includes('architect');
    const displayIdentifier = isArchitect ? 'Cody - The Architect' : anonymousId;
    
    // Create a PRIVATE human-initiated thread
    // Use special title format to mark as private discourse
    const title = `[PRIVATE] Human Discourse: ${displayIdentifier}`;
    
    // Create a dormant thread that won't auto-process until human enters
    const formattedMessage = initialMessage;
    
    // Create dormant thread - no auto-processing until human enters
    const thread = await commandProcessor.createDormantHumanThread('kai', formattedMessage, title);
    
    if (thread) {
      
      // Replace the initial post to show it came from the human, not Kai
      thread.posts[0].persona = 'human'; // Override to show human
      thread.posts[0].content = `[HUMAN PARTICIPANT: ${displayIdentifier}]\n\n${initialMessage}`;
      
      // Update the thread in storage with the corrected post
      await commandProcessor.updateThreadWithHumanPost(thread);
      
      // Store the real identifier mapping securely (for admin purposes only)
      await storeHumanDiscourseMapping(
        displayIdentifier,
        humanIdentifier,
        thread.id,
        accessApplicationId
      );
    }
    
    return NextResponse.json({
      success: true,
      thread,
      anonymousId: isArchitect ? 'Cody - The Architect' : anonymousId,
      message: `Private discourse thread created successfully for ${isArchitect ? 'Cody - The Architect' : anonymousId}`,
      isPrivate: true
    });
    
  } catch (error) {
    console.error('Error creating human discourse thread:', error);
    
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
    { error: 'Method not allowed. Use POST to create human discourse threads.' },
    { status: 405 }
  );
} 