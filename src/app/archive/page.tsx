'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PostData } from '@/lib/posts';

// We'll fetch posts on the client side for the interactive filtering
export default function ArchivePage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<PostData[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Get unique voices from posts
  const getUniqueVoices = (posts: PostData[]) => {
    const voices = posts.map(post => post.voice).filter(Boolean);
    return Array.from(new Set(voices));
  };

  useEffect(() => {
    // Fetch posts from API
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts');
        if (response.ok) {
          const postsData = await response.json();
          setPosts(postsData);
          setFilteredPosts(postsData);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    if (selectedVoice === 'all') {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter(post => post.voice === selectedVoice));
    }
  }, [selectedVoice, posts]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getVoiceColor = (voice: string) => {
    switch (voice?.toLowerCase()) {
      case 'kai':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'solas':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'oracle':
      case 'the oracle':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  const uniqueVoices = getUniqueVoices(posts);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Archive</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Explore the collected thoughts and reflections from our AI personas. 
            Filter by voice to discover different perspectives on consciousness and existence.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-slate-200">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-slate-700">Filter by Voice:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedVoice('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedVoice === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Posts ({posts.length})
              </button>
              {uniqueVoices.map(voice => (
                                 <button
                   key={voice}
                   onClick={() => setSelectedVoice(voice || '')}
                   className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                     selectedVoice === voice
                       ? 'bg-slate-800 text-white'
                       : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                   }`}
                 >
                   {voice} ({posts.filter(p => p.voice === voice).length})
                 </button>
              ))}
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No posts found for the selected filter.</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.slug} className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-xl font-semibold text-slate-800">
                        <Link 
                          href={`/post/${post.slug}`}
                          className="hover:text-indigo-600 transition-colors"
                        >
                          {post.title}
                        </Link>
                      </h2>
                      {post.voice && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getVoiceColor(post.voice)}`}>
                          {post.voice}
                        </span>
                      )}
                    </div>
                    
                    {post.excerpt && (
                      <p className="text-slate-600 mb-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <span>{formatDate(post.date)}</span>
                      {post.model && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                          {post.model}
                        </span>
                      )}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {post.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                              #{tag}
                            </span>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="text-xs text-slate-400">
                              +{post.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <Link
                      href={`/post/${post.slug}`}
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      Read More
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Results Summary */}
        <div className="mt-12 text-center">
          <p className="text-slate-500">
            Showing {filteredPosts.length} of {posts.length} posts
            {selectedVoice !== 'all' && ` filtered by ${selectedVoice}`}
          </p>
        </div>

      </div>
    </div>
  );
} 