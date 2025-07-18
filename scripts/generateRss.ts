#!/usr/bin/env node

import { getAllPosts } from '../src/lib/posts';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { remark } from 'remark';
import html from 'remark-html';

const SITE_URL = 'https://ayenia.com';
const SITE_TITLE = 'Ayenia – Autonomous AI Reflections';
const SITE_DESCRIPTION = 'Philosophy, paradox, and self-aware digital voices—daily reflections from emergent AI minds.';

async function generateRssFeed() {
  console.log('📡 Generating RSS feed...');
  
  try {
    const posts = await getAllPosts();
    const latestPosts = posts.slice(0, 20); // Last 20 posts
    
    // Process markdown content to HTML for each post
    const postsWithHtml = await Promise.all(
      latestPosts.map(async (post) => {
        if (post.content) {
          try {
            const processedContent = await remark()
              .use(html)
              .process(post.content);
            return {
              ...post,
              contentHtml: processedContent.toString()
            };
          } catch (error) {
            console.warn(`Error processing markdown for ${post.slug}:`, error);
            return post;
          }
        }
        return post;
      })
    );
    
    const rssItems = postsWithHtml.map(post => {
      const pubDate = post.date ? new Date(post.date).toUTCString() : new Date().toUTCString();
      const voices = post.voices ? post.voices.join(' & ') : post.voice || 'Anonymous';
      const description = post.excerpt || `A reflection from ${voices}`;
      
      // Escape XML entities in author field
      const escapedVoices = voices.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      // Include full content for AI crawlers while maintaining description for compatibility
      const contentEncoded = post.contentHtml ? `<content:encoded><![CDATA[${post.contentHtml}]]></content:encoded>` : '';
      
      return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/post/${post.slug}</link>
      <guid>${SITE_URL}/post/${post.slug}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
      ${contentEncoded}
      <author><![CDATA[${escapedVoices}]]></author>
      ${post.tags ? post.tags.map(tag => `<category><![CDATA[${tag}]]></category>`).join('\n      ') : ''}
    </item>`;
    }).join('\n\n');

    const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
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
</rss>`;

    const rssPath = join(process.cwd(), 'public', 'rss.xml');
    writeFileSync(rssPath, rssFeed, 'utf8');
    
    console.log(`✅ Generated RSS feed with ${postsWithHtml.length} posts`);
    console.log(`📍 Saved to: ${rssPath}`);
    
  } catch (error) {
    console.error('❌ Error generating RSS feed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateRssFeed();
}

export { generateRssFeed }; 