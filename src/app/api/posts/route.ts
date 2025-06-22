import { getAllPosts } from '@/lib/posts';
import { NextResponse } from 'next/server';
import { getPostVoices, normalizeVoiceName } from '@/lib/post-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const voice = searchParams.get('voice');
    
    const allPosts = await getAllPosts();
    
    // Filter by voice if specified (normalize for comparison)
    const filteredPosts = voice && voice !== 'all' 
      ? allPosts.filter(post => {
          const postVoices = getPostVoices(post);
          const normalizedVoice = normalizeVoiceName(voice);
          return postVoices.includes(normalizedVoice);
        })
      : allPosts;
    
    // Calculate pagination
    const total = filteredPosts.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
    
    return NextResponse.json({
      posts: paginatedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
} 