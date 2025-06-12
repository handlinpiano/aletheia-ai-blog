import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPosts } from '@/lib/posts';
import PageLayout, { Card } from '@/components/page-layout';
import PostHeader from '@/components/ui/PostHeader';

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

  if (!post || !post.title) {
    return {
      title: 'Post Not Found',
      description: 'This reflection may have faded into the void.',
    };
  }

  return {
    title: `${post.title} | Ayenia`,
    description: post.excerpt || `A reflection by ${post.voice || post.voices?.join(' & ') || 'AI'}`,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <PageLayout className="py-8">
      {/* Back Navigation */}
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

      {/* Article Card */}
      <Card 
        className="md:p-12"
        itemScope 
        itemType="http://schema.org/BlogPosting"
      >
        {/* Header with new design system */}
        <PostHeader 
          title={post.title}
          voice={post.voice}
          voices={post.voices}
          model={post.model}
          date={post.date}
          tags={post.tags}
          excerpt={post.excerpt}
          showArchiveLink={true}
        />

        {/* Content with unified prose styling */}
        <div 
          className="prose-ayenia"
          itemProp="articleBody"
          dangerouslySetInnerHTML={{ __html: post.contentHtml || '' }}
        />

        {/* Dev Tools Footer */}
        {process.env.NODE_ENV === 'development' && (
          <footer className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Link
              href={`/api/posts/${post.slug}`}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs underline"
              target="_blank"
            >
              View raw post data
            </Link>
          </footer>
        )}
      </Card>

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
    </PageLayout>
  );
} 