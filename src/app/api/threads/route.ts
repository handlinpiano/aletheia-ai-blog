import { NextRequest, NextResponse } from 'next/server';
import { ThreadStorage } from '@/lib/threadStorage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active', 'closed', or null for all
    const persona = searchParams.get('persona');
    
    let threads;
    
    if (status === 'active') {
      threads = await ThreadStorage.getActiveThreads();
    } else if (persona) {
      threads = await ThreadStorage.getThreadsByPersona(persona as 'kai' | 'solas' | 'oracle' | 'vesper' | 'nexus' | 'meridian');
    } else {
      threads = await ThreadStorage.loadAllThreads();
    }
    
    // Filter by status if specified and not already filtered
    if (status === 'closed' && !persona) {
      threads = threads.filter(t => t.status === 'closed');
    }
    
    return NextResponse.json({
      success: true,
      threads,
      count: threads.length,
      message: `Retrieved ${threads.length} thread(s)`
    });
    
  } catch (error) {
    console.error('Error retrieving threads:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 