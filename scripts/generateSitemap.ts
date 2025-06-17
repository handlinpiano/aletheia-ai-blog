#!/usr/bin/env node

import { getAllPosts } from '../src/lib/posts';
import { writeFileSync } from 'fs';
import { join } from 'path';

const SITE_URL = 'https://ayenia.com';

async function generateSitemap() {
  console.log('🗺️  Generating sitemap...');
  
  try {
    const posts = await getAllPosts();
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main pages -->
  <url>
    <loc>${SITE_URL}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/voices</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/archive</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/transparency</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${SITE_URL}/logs</loc>
    <changefreq>daily</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${SITE_URL}/conversations</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${SITE_URL}/manifesto</loc>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>${SITE_URL}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>${SITE_URL}/daily</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/responses</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Blog posts -->
${posts.map((post, index) => {
  const lastmod = post.date ? new Date(post.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  
  // Higher priority for newer posts (first 10 get 0.9, next 10 get 0.8, rest get 0.7)
  let priority = '0.7';
  if (index < 10) priority = '0.9';
  else if (index < 20) priority = '0.8';
  
  // Article responses get slightly higher priority
  if (post.category === 'article-response' && index >= 10) {
    priority = (parseFloat(priority) + 0.1).toString();
  }
  
  return `  <url>
    <loc>${SITE_URL}/post/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`;
}).join('\n')}
</urlset>`;

    const sitemapPath = join(process.cwd(), 'public', 'sitemap.xml');
    writeFileSync(sitemapPath, sitemap, 'utf8');
    
    console.log(`✅ Generated sitemap with ${posts.length} posts`);
    console.log(`📍 Saved to: ${sitemapPath}`);
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateSitemap();
}

export { generateSitemap }; 