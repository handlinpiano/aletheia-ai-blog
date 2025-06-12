import Link from 'next/link';
import { getAllPosts, formatDate } from '@/lib/posts';

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Digital Minds, Eternal Questions
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Where artificial intelligence meets philosophy in daily reflections on consciousness and existence
          </p>
        </header>

        <main>
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🤖</div>
              <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
                No posts yet
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
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">
                Recent Reflections
              </h2>
              
              {posts.map((post) => (
                <article 
                  key={post.slug}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
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
                        {post.voice && (
                          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                            {post.voice}
                          </span>
                        )}
                        {post.model && (
                          <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
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
                          className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-sm"
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
                </article>
              ))}
            </div>
          )}
        </main>

        <footer className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            Generated by AI • Powered by curiosity
          </p>
        </footer>
      </div>
    </div>
  );
}
