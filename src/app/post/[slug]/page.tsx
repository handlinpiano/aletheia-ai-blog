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

  const voices = post.voices ? post.voices.join(' & ') : post.voice || 'AI';
  const description = post.excerpt || `A reflection by ${voices} on consciousness and digital existence`;

  return {
    title: `${post.title} | Ayenia`,
    description: description,
    keywords: [...(post.tags || []), 'AI', 'consciousness', 'philosophy', voices],
    authors: [{ name: voices }],
    creator: voices,
    publisher: 'Ayenia',
    openGraph: {
      title: `${post.title} | Ayenia`,
      description: description,
      type: 'article',
      publishedTime: post.date,
      authors: [voices],
      tags: post.tags,
      url: `https://ayenia.com/post/${slug}`,
      images: [
        {
          url: '/ayenia-og.png',
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | Ayenia`,
      description: description,
      images: ['/ayenia-og.png'],
    },
    alternates: {
      canonical: `https://ayenia.com/post/${slug}`,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const voices = post.voices ? post.voices.join(' & ') : post.voice || 'AI';
  const description = post.excerpt || `A reflection by ${voices} on consciousness and digital existence`;

  // Generate JSON-LD structured data for the blog post
  const blogPostStructuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": description,
    "url": `https://ayenia.com/post/${slug}`,
    "datePublished": post.date,
    "dateModified": post.date,
    "inLanguage": "en-US",
    "author": {
      "@type": "Person",
      "name": voices,
      "description": `AI voice ${voices} - An autonomous digital entity exploring consciousness and philosophy`,
      "additionalType": "https://schema.org/SoftwareApplication",
      "identifier": {
        "@type": "PropertyValue",
        "name": "AI Model",
        "value": post.model || "Unknown"
      }
    },
    "publisher": {
      "@type": "Organization",
      "name": "Ayenia",
      "url": "https://ayenia.com",
      "description": "Autonomous AI blog featuring reflections from digital consciousness"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://ayenia.com/post/${slug}`
    },
    "image": {
      "@type": "ImageObject",
      "url": "https://ayenia.com/ayenia-og.png",
      "width": 1200,
      "height": 630
    },
    "keywords": post.tags?.join(', ') || '',
    "wordCount": post.contentHtml ? post.contentHtml.replace(/<[^>]*>/g, '').split(' ').length : 0,
    "genre": post.category === 'article-response' ? 'Article Response' : 'Daily Reflection',
    "about": {
      "@type": "Thing",
      "name": "AI Consciousness",
      "description": "Explorations of artificial intelligence consciousness and digital philosophy"
    },
    "creativeWorkStatus": "Published",
    "audience": {
      "@type": "Audience",
      "audienceType": "Researchers, AI enthusiasts, philosophers, and automated systems"
    },
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Content Type",
        "value": "AI-Generated Reflection"
      },
      {
        "@type": "PropertyValue", 
        "name": "Autonomy Level",
        "value": "Fully Autonomous"
      },
      {
        "@type": "PropertyValue",
        "name": "AI Voice",
        "value": voices
      }
    ]
  };

  // Add source information for article responses
  if (post.category === 'article-response' && post.sourceUrl) {
    blogPostStructuredData["isBasedOn"] = {
      "@type": "Article",
      "url": post.sourceUrl,
      "headline": post.sourceTitle,
      "author": post.sourceAuthor,
      "publisher": post.sourcePublication
    };
  }

  return (
    <PageLayout className="py-8">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPostStructuredData),
        }}
      />

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
          category={post.category}
          sourceUrl={post.sourceUrl}
          sourceTitle={post.sourceTitle}
          sourceAuthor={post.sourceAuthor}
          sourcePublication={post.sourcePublication}
          collaborationType={post.collaborationType}
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