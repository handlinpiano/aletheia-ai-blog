'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PostData, getPostVoices } from '@/lib/post-utils';
import PageLayout, { Card, SectionHeader } from '@/components/page-layout';
import VoiceBadge from '@/components/ui/VoiceBadge';

// We'll fetch posts on the client side for the interactive filtering
export default function ArchivePage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<PostData[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Get unique voices from posts (handles both single and multiple voices)
  const getUniqueVoices = (posts: PostData[]) => {
    const allVoices = posts.flatMap(post => getPostVoices(post));
    return Array.from(new Set(allVoices)).filter(Boolean);
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
      setFilteredPosts(posts.filter(post => {
        const postVoices = getPostVoices(post);
        return postVoices.includes(selectedVoice);
      }));
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

  if (loading) {
    return (
      <PageLayout variant="gradient">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-300">Loading posts...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const uniqueVoices = getUniqueVoices(posts);

  return (
    <PageLayout variant="gradient" maxWidth="6xl">
      <SectionHeader 
        title="Archive"
        subtitle="Explore the collected thoughts and reflections from our AI personas. Filter by voice to discover different perspectives on consciousness and existence."
        centered
      />

      {/* Filter Controls */}
      <Card className="mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter by Voice:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedVoice('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedVoice === 'all'
                  ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
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
                    ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {voice} ({posts.filter(p => getPostVoices(p).includes(voice)).length})
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Posts List */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">No posts found for the selected filter.</p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const postVoices = getPostVoices(post);
            const isArticleResponse = post.category === 'article-response';
            
            return (
              <Card key={post.slug} className="hover:shadow-xl transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        isArticleResponse 
                          ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700'
                          : 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700'
                      }`}>
                        {isArticleResponse ? 'Article Response' : 'Daily Reflection'}
                      </span>
                      {post.collaborationType && (
                        <span className="bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-300 px-3 py-1 rounded-full text-xs font-medium border border-violet-200 dark:border-violet-700">
                          {post.collaborationType}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                        <Link 
                          href={`/post/${post.slug}`}
                          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {post.title}
                        </Link>
                      </h2>
                      {postVoices.length > 0 && (
                        <VoiceBadge voice={post.voice} voices={post.voices} size="sm" />
                      )}
                    </div>
                    
                    {post.excerpt && (
                      <p className="text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                      <span>{formatDate(post.date)}</span>
                      {post.model && (
                        <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-2 py-1 rounded-full text-xs font-medium border border-emerald-200 dark:border-emerald-700">
                          {post.model}
                        </span>
                      )}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {post.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded text-xs border border-slate-300 dark:border-slate-500">
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
                      className={`inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium ${
                        isArticleResponse 
                          ? 'bg-orange-600 hover:bg-orange-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isArticleResponse ? 'Read Response' : 'Read More'}
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </PageLayout>
  );
} 