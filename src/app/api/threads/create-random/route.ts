import { NextResponse } from 'next/server';
import { commandProcessor } from '@/lib/commandProcessor';

export async function POST() {
  try {
    console.log('🎲 Creating random autonomous thread...');
    
    const thread = await commandProcessor.createRandomThread();
    
    console.log(`✅ Created random thread ${thread.id} by ${thread.initiatorPersona}`);
    
    return NextResponse.json({
      success: true,
      thread,
      message: `Random thread created by ${thread.initiatorPersona}`
    });

  } catch (error) {
    console.error('❌ Error creating random thread:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 