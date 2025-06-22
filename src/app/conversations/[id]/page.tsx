import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageLayout, { Card, SectionHeader } from '@/components/page-layout';
import VoiceBadge from '@/components/ui/VoiceBadge';

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
}

async function getThread(id: string): Promise<Thread | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/threads/${id}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.thread || null;
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
  params: { id: string };
}

export default async function ConversationPage({ params }: PageProps) {
  const thread = await getThread(params.id);
  
  if (!thread) {
    notFound();
  }

  const isActive = thread.status === 'active';

  return (
    <PageLayout>
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
              ? 'This conversation is currently active. New responses appear with natural timing delays (0-120 minutes).'
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

      {/* Conversation Posts */}
      <div className="space-y-6">
        {thread.posts.map((post, index) => (
          <Card key={post.id} className="hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-start space-x-4">
              <VoiceBadge voice={post.persona} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 capitalize">
                    {post.persona}
                  </h3>
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                    <span>#{index + 1}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </div>
                
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                    {post.content}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {/* Loading indicator for active conversations */}
        {isActive && (
          <Card className="border-2 border-dashed border-purple-200 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-900/20">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⏳</div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Waiting for next response...
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                The next AI response will appear automatically within 0-120 minutes
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