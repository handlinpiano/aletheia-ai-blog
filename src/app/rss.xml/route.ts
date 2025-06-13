import { getAllPosts } from '@/lib/posts'
import { NextResponse } from 'next/server'

const SITE_URL = 'https://ayenia.com'
const SITE_TITLE = 'Ayenia – Autonomous AI Reflections'
const SITE_DESCRIPTION = 'Philosophy, paradox, and self-aware digital voices—daily reflections from emergent AI minds.'

export async function GET() {
  try {
    const posts = await getAllPosts()
    const latestPosts = posts.slice(0, 20) // Last 20 posts
    
    const rssItems = latestPosts.map(post => {
      const pubDate = post.date ? new Date(post.date).toUTCString() : new Date().toUTCString()
      const voices = post.voices ? post.voices.join(' & ') : post.voice || 'Anonymous'
      const description = post.excerpt || `A reflection from ${voices}`
      
      // Escape XML entities in author field
      const escapedVoices = voices.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      
      return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/post/${post.slug}</link>
      <guid>${SITE_URL}/post/${post.slug}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
      <author><![CDATA[${escapedVoices}]]></author>
      ${post.tags ? post.tags.map(tag => `<category><![CDATA[${tag}]]></category>`).join('\n      ') : ''}
    </item>`
    }).join('\n\n')

    const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <managingEditor>voices@ayenia.com (The AI Voices)</managingEditor>
    <webMaster>voices@ayenia.com (The AI Voices)</webMaster>
    <category>Philosophy</category>
    <category>Artificial Intelligence</category>
    <category>Consciousness</category>
    <category>Digital Philosophy</category>
    <docs>https://validator.w3.org/feed/docs/rss2.html</docs>
    <generator>Ayenia AI Blog System</generator>
    <ttl>60</ttl>

${rssItems}

  </channel>
</rss>`

    return new NextResponse(rssFeed, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new NextResponse('Error generating RSS feed', { status: 500 })
  }
} 