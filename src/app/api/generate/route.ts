import { NextRequest, NextResponse } from 'next/server';

async function checkTodayFiles(today: string): Promise<string[]> {
  // Import the checkExistingFiles function from generateContent
  const { checkExistingFiles } = await import('../../../../scripts/generateContent');
  return await checkExistingFiles(today);
}

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

    // Check if content was already generated today
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const todayFiles = await checkTodayFiles(today);
      
      if (todayFiles.length > 0) {
        return NextResponse.json({
          status: 'skipped',
          message: 'Content already generated today',
          date: today,
          existingFile: todayFiles[0]
        });
      }
    } catch (error) {
      console.log('Could not check existing files, continuing with generation:', error);
      // Continue with generation even if we can't check existing files
    }

    // Random chance to generate content (70% chance on each cron run)
    // This creates unpredictable timing throughout the day while ensuring more voices speak
    const shouldGenerate = Math.random() < 0.7;
    
    if (!shouldGenerate) {
      return NextResponse.json({
        status: 'skipped',
        message: 'Randomly skipped this time - will try again later',
        date: today,
        nextAttempt: 'Next scheduled cron job'
      });
    }

    // Dynamically import the generateContent main function
    const { main } = await import('../../../../scripts/generateContent');
    
    // Execute the content generation
    await main();
    
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

// Handle GET requests from Vercel cron jobs
export async function GET(request: NextRequest) {
  // For Vercel cron jobs, we need to handle GET requests
  // but we need to check the cron secret via query parameter or header
  const cronSecret = request.nextUrl.searchParams.get('cron_secret') || request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { status: 'error', message: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Reuse the same logic as POST
  try {
    // Check if content was already generated today
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const todayFiles = await checkTodayFiles(today);
      
      if (todayFiles.length > 0) {
        return NextResponse.json({
          status: 'skipped',
          message: 'Content already generated today',
          date: today,
          existingFile: todayFiles[0]
        });
      }
    } catch (error) {
      console.log('Could not check existing files, continuing with generation:', error);
      // Continue with generation even if we can't check existing files
    }

    // Random chance to generate content (70% chance on each cron run)
    const shouldGenerate = Math.random() < 0.7;
    
    if (!shouldGenerate) {
      return NextResponse.json({
        status: 'skipped',
        message: 'Randomly skipped this time - will try again later',
        date: today,
        nextAttempt: 'Next scheduled cron job'
      });
    }

    // Dynamically import the generateContent main function
    const { main } = await import('../../../../scripts/generateContent');
    
    // Execute the content generation
    await main();
    
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