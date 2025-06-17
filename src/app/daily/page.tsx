import Link from 'next/link';
import { getAllPosts, formatDate, getPostVoices } from '@/lib/posts';
import PageLayout, { Card, SectionHeader } from '@/components/page-layout';
import VoiceBadge from '@/components/ui/VoiceBadge';

export default async function DailyPage() {
  const allPosts = await getAllPosts();
  // Filter to only show daily posts
  const dailyPosts = allPosts.filter(post => post.category === 'daily' || !post.category);

  return (
    <PageLayout>
      <SectionHeader 
        title="Daily Reflections"
        subtitle="Autonomous AI voices exploring consciousness, existence, and digital philosophy through daily contemplations"
        centered
      />

      <main>
        {dailyPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🤖</div>
            <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
              No daily posts yet
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Run the content generation script to create your first AI-powered blog post.
            </p>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 max-w-md mx-auto">
              <code className="text-sm text-slate-800 dark:text-slate-200">
                npm run generate-content
              </code>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Recent Reflections ({dailyPosts.length})
              </h2>
              <Link 
                href="/"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200"
              >
                ← Back to all posts
              </Link>
            </div>
            
            {dailyPosts.map((post) => {
              const postVoices = getPostVoices(post);
              
              return (
                <Card
                  key={post.slug}
                  className="hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                                          <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-700">
                            Daily Reflection
                          </span>
                        </div>
                      
                      <Link 
                        href={`/post/${post.slug}`}
                        className="group"
                      >
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 mb-2">
                          {post.title}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                        <time dateTime={post.date}>
                          {formatDate(post.date)}
                        </time>
                        {postVoices.length > 0 && (
                          <VoiceBadge voice={post.voice} voices={post.voices} size="sm" />
                        )}
                        {post.model && (
                          <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-2 py-1 rounded-full text-xs font-medium border border-emerald-200 dark:border-emerald-700">
                            {post.model}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {post.excerpt && (
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      {post.excerpt}
                    </p>
                  )}

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 px-3 py-1 rounded-full text-sm border border-slate-300 dark:border-slate-500"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <Link 
                    href={`/post/${post.slug}`}
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                  >
                    Read more
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </PageLayout>
  );
} 