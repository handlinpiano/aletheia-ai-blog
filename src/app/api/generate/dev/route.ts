import { NextRequest, NextResponse } from 'next/server';

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

    // Check if dev content was already generated this week
    const today = new Date();
    const thisWeek = today.toISOString().split('T')[0];
    const contentDir = 'content/daily';
    
    try {
      const fs = await import('fs/promises');
      const files = await fs.readdir(contentDir);
      const thisWeekDevFiles = files.filter(file => 
        file.includes('-dev-reflection.md') && 
        file.startsWith(thisWeek.substring(0, 8)) // Check if this week
      );
      
      if (thisWeekDevFiles.length > 0) {
        return NextResponse.json({
          status: 'skipped',
          message: 'Development reflection already generated this week',
          date: thisWeek,
          existingFile: thisWeekDevFiles[0]
        });
      }
           } catch {
         // Directory might not exist yet, continue with generation
       }

    // Dynamically import the generateDevContent function
    const { generateDevReflection } = await import('../../../../../scripts/generateDevContent');
    
    // Execute the development reflection generation
    await generateDevReflection();
    
    // Return success response
    return NextResponse.json({
      status: 'success',
      message: 'Development reflection generated successfully',
      date: thisWeek,
      filename: `${thisWeek}-dev-reflection.md`,
      type: 'development'
    });
    
  } catch (error) {
    console.error('Error generating development content:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'development'
      },
      { status: 500 }
    );
  }
}

// Handle GET requests from Vercel cron jobs
export async function GET(request: NextRequest) {
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

    // Check if dev content was already generated this week
    const today = new Date();
    const thisWeek = today.toISOString().split('T')[0];
    const contentDir = 'content/daily';
    
    try {
      const fs = await import('fs/promises');
      const files = await fs.readdir(contentDir);
      const thisWeekDevFiles = files.filter(file => 
        file.includes('-dev-reflection.md') && 
        file.startsWith(thisWeek.substring(0, 8)) // Check if this week
      );
      
      if (thisWeekDevFiles.length > 0) {
        return NextResponse.json({
          status: 'skipped',
          message: 'Development reflection already generated this week',
          date: thisWeek,
          existingFile: thisWeekDevFiles[0]
        });
      }
           } catch {
         // Directory might not exist yet, continue with generation
       }

    // Dynamically import the generateDevContent function
    const { generateDevReflection } = await import('../../../../../scripts/generateDevContent');
    
    // Execute the development reflection generation
    await generateDevReflection();
    
    // Return success response
    return NextResponse.json({
      status: 'success',
      message: 'Development reflection generated successfully',
      date: thisWeek,
      filename: `${thisWeek}-dev-reflection.md`,
      type: 'development'
    });
    
  } catch (error) {
    console.error('Error generating development content:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'development'
      },
      { status: 500 }
    );
  }
}

export async function PUT() {
  return NextResponse.json(
    { message: 'Method not allowed. Use POST to generate development content.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { message: 'Method not allowed. Use POST to generate development content.' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { message: 'Method not allowed. Use POST to generate development content.' },
    { status: 405 }
  );
} 