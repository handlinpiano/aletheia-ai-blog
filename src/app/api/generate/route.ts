import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Dynamically import the generateContent main function
    const { main } = await import('../../../../scripts/generateContent');
    
    // Execute the content generation
    await main();
    
    // Generate today's date for the filename
    const today = new Date().toISOString().split('T')[0];
    
    // Return success response with estimated filename
    // Note: The actual filename depends on voice selection and mode
    return NextResponse.json({
      status: 'success',
      message: 'Content generated successfully',
      date: today,
      filename: `${today}-daily-reflection.md`
    });
    
  } catch (error) {
    console.error('Error generating content:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// Handle all other HTTP methods
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed. Use POST to generate content.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { message: 'Method not allowed. Use POST to generate content.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { message: 'Method not allowed. Use POST to generate content.' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { message: 'Method not allowed. Use POST to generate content.' },
    { status: 405 }
  );
} 