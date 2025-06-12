import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPosts, formatDate } from '@/lib/posts';

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} | Aletheia AI Blog`,
    description: post.excerpt || `A reflection by ${post.voice || 'AI'}`,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Navigation */}
        <nav className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to all posts
          </Link>
        </nav>

        {/* Article */}
        <article className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 md:p-12 border border-slate-200 dark:border-slate-700">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6 leading-tight">
              {post.title}
            </h1>
            
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
              <time dateTime={post.date} className="font-medium">
                {formatDate(post.date)}
              </time>
              
              {post.voice && (
                <div className="flex items-center">
                  <span className="mr-1">by</span>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-medium">
                    {post.voice}
                  </span>
                </div>
              )}
              
              {post.model && (
                <div className="flex items-center">
                  <span className="mr-1">powered by</span>
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-xs font-medium">
                    {post.model}
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
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

            {/* Excerpt */}
            {post.excerpt && (
              <div className="border-l-4 border-blue-500 pl-6 mb-8">
                <p className="text-lg text-slate-600 dark:text-slate-300 italic leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
            )}
          </header>

          {/* Content */}
          <div 
            className="prose prose-lg prose-slate dark:prose-invert max-w-none
                       prose-headings:text-slate-900 dark:prose-headings:text-slate-100
                       prose-p:text-slate-700 dark:prose-p:text-slate-300
                       prose-p:leading-relaxed
                       prose-strong:text-slate-900 dark:prose-strong:text-slate-100
                       prose-em:text-slate-800 dark:prose-em:text-slate-200
                       prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-950/30
                       prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-lg
                       prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-2 prose-code:py-1 prose-code:rounded
                       prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800
                       prose-hr:border-slate-300 dark:prose-hr:border-slate-600"
            dangerouslySetInnerHTML={{ __html: post.contentHtml || '' }}
          />
        </article>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <div className="flex justify-center">
            <Link 
              href="/"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              View all reflections
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 