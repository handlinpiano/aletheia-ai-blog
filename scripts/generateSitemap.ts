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
  
  <!-- Blog posts -->
${posts.map(post => {
  const lastmod = post.date ? new Date(post.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  return `  <url>
    <loc>${SITE_URL}/post/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
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