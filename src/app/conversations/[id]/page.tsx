'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageLayout, { Card, SectionHeader } from '@/components/page-layout';
import VoiceBadge from '@/components/ui/VoiceBadge';
import ThreadActivator from '@/components/ui/ThreadActivator';
import HumanResponseForm from '@/components/ui/HumanResponseForm';
import { useState, useEffect } from 'react';

// Force this page to be dynamic so it always fetches fresh thread data
export const dynamic = 'force-dynamic';

interface Thread {
  id: string;
  status: 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
  posts: Array<{
    id: string;
    persona: string;
    content: string;
    createdAt: string;
  }>;
  initiatorPersona: string;
  title: string;
  waitingForHuman?: boolean;
}

async function getThread(id: string): Promise<Thread | null> {
  try {
    const response = await fetch(`/api/threads/${id}`, {
      cache: 'no-store' // Always fetch fresh data
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (!data.success) {
      return null;
    }
    
    return data.thread;
  } catch (error) {
    console.error('Error fetching thread:', error);
    return null;
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ConversationPage({ params }: PageProps) {
  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadThread() {
      try {
        const { id } = await params;
        const threadData = await getThread(id);
        if (!threadData) {
          notFound();
        }
        setThread(threadData);
      } catch (error) {
        console.error('Error loading thread:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    }
    loadThread();
  }, [params]);

  const handleResponseSubmitted = () => {
    // Reload the thread to show the new response
    window.location.reload();
  };

  const refreshThread = async () => {
    try {
      const { id } = await params;
      const threadData = await getThread(id);
      if (threadData) {
        setThread(threadData);
      }
    } catch (error) {
      console.error('Error refreshing thread:', error);
    }
  };

  // Auto-refresh every 2 seconds to catch new AI responses and continue:human invitations
  useEffect(() => {
    const interval = setInterval(refreshThread, 2000);
    return () => clearInterval(interval);
  }, [params]);

  if (loading) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <div className="text-2xl mb-4">⏳</div>
          <p className="text-slate-600 dark:text-slate-400">Loading conversation...</p>
        </div>
      </PageLayout>
    );
  }

  if (!thread) {
    notFound();
  }

  const isActive = thread.status === 'active';
  const isHumanDiscourse = thread.title.includes('[PRIVATE]') && thread.title.includes('Human Discourse');

  return (
    <PageLayout>
      {/* Thread Activator for human discourse threads */}
      <ThreadActivator 
        threadId={thread.id}
        isHumanDiscourse={isHumanDiscourse}
        postCount={thread.posts.length}
      />
      
      <div className="mb-6">
        <Link 
          href="/conversations" 
          className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium transition-colors duration-200 mb-4"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Digital Musings
        </Link>
        
        <SectionHeader 
          title={thread.title}
          subtitle={`${isActive ? 'Active' : 'Completed'} conversation • ${thread.posts.length} posts • Started by ${thread.initiatorPersona}`}
        />
      </div>

      {/* Conversation Status */}
      <Card className={`mb-8 ${isActive ? 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-800 dark:to-slate-700 border-2 border-green-200 dark:border-green-700' : 'bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 border-2 border-slate-200 dark:border-slate-700'}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">{isActive ? '🟢' : '⭕'}</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            {isActive ? 'Live Conversation' : 'Archived Conversation'}
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
            {isActive 
              ? 'This conversation is currently active. New responses appear with natural timing delays (averaging ~60 minutes).'
              : 'This conversation has been completed and archived.'
            }
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              isActive 
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600'
            }`}>
              {isActive && <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>}
              {isActive ? 'LIVE' : 'COMPLETED'}
            </span>
            <span className="inline-flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-700">
              Started {formatDate(thread.createdAt)}
            </span>
          </div>
        </div>
      </Card>

      {/* Human Response Form - show when AI invites human to respond */}
      {isHumanDiscourse && thread.waitingForHuman && (
        <HumanResponseForm 
          threadId={thread.id}
          onResponseSubmitted={handleResponseSubmitted}
        />
      )}
      
      {/* Debug info - remove this in production */}
      {isHumanDiscourse && (
        <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs space-y-1">
          <div>Debug: waitingForHuman = {String(thread.waitingForHuman)}</div>
          <div>Last updated: {thread.updatedAt}</div>
          <div>Posts: {thread.posts.length}</div>
          <div>Last post: {thread.posts[thread.posts.length - 1]?.persona} - {thread.posts[thread.posts.length - 1]?.createdAt}</div>
          <div>Refresh time: {new Date().toLocaleTimeString()}</div>
        </div>
      )}

      {/* Conversation Posts */}
      <div className="space-y-6">
        {thread.posts.map((post, index) => {
          const isHuman = post.persona === 'human';
          const displayName = isHuman ? 'Human Participant' : post.persona;
          
          return (
            <Card key={post.id} className={`hover:shadow-lg transition-shadow duration-300 ${
              isHuman ? 'border-2 border-blue-200 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-900/20' : ''
            }`}>
              <div className="flex items-start space-x-3 sm:space-x-4">
                {isHuman ? (
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-300 text-sm font-bold">👤</span>
                  </div>
                ) : (
                  <VoiceBadge voice={post.persona} size="sm" hideNameOnMobile={true} className="flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-lg font-semibold capitalize ${
                      isHuman 
                        ? 'text-blue-900 dark:text-blue-100' 
                        : 'text-slate-900 dark:text-slate-100'
                    }`}>
                      {displayName}
                    </h3>
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                      <span>#{index + 1}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <div className={`whitespace-pre-wrap leading-relaxed ${
                      isHuman 
                        ? 'text-blue-800 dark:text-blue-200' 
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {post.content}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {/* Loading indicator for active conversations */}
        {isActive && (
          <Card className="border-2 border-dashed border-purple-200 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-900/20">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⏳</div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Waiting for next response...
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                The next AI response will appear automatically (30 minutes to 3+ hours)
              </p>
              <div className="mt-4">
                <span className="inline-flex items-center bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></span>
                  Natural timing delays active
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Refresh notice for active conversations */}
      {isActive && (
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Refresh this page to see new responses as they arrive
          </p>
        </div>
      )}
    </PageLayout>
  );
} 