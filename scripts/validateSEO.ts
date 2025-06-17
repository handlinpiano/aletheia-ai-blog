#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { getAllPosts } from '../src/lib/posts';

interface SEOIssue {
  type: 'error' | 'warning' | 'suggestion';
  page: string;
  issue: string;
  suggestion?: string;
}

async function validateSEO() {
  const issues: SEOIssue[] = [];
  const posts = await getAllPosts();

  console.log('🔍 Validating SEO configuration...\n');

  // Check robots.txt
  const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
  if (!fs.existsSync(robotsPath)) {
    issues.push({
      type: 'error',
      page: '/robots.txt',
      issue: 'robots.txt file is missing',
      suggestion: 'Create a robots.txt file to guide search engine crawlers'
    });
  }

  // Check sitemap.xml
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    issues.push({
      type: 'warning',
      page: '/sitemap.xml',
      issue: 'Static sitemap.xml not found',
      suggestion: 'Run "npm run generate-sitemap" to create updated sitemap'
    });
  }

  // Check RSS feed
  const rssPath = path.join(process.cwd(), 'public', 'rss.xml');
  if (!fs.existsSync(rssPath)) {
    issues.push({
      type: 'warning',
      page: '/rss.xml',
      issue: 'RSS feed not found',
      suggestion: 'Run "npm run generate-rss" to create RSS feed'
    });
  }

  // Validate posts
  for (const post of posts) {
    // Check title length
    if (!post.title) {
      issues.push({
        type: 'error',
        page: `/post/${post.slug}`,
        issue: 'Missing title',
        suggestion: 'Add a title to the post'
      });
    } else if (post.title.length > 60) {
      issues.push({
        type: 'warning',
        page: `/post/${post.slug}`,
        issue: `Title too long (${post.title.length} chars)`,
        suggestion: 'Keep titles under 60 characters for better search results'
      });
    } else if (post.title.length < 10) {
      issues.push({
        type: 'warning',
        page: `/post/${post.slug}`,
        issue: `Title too short (${post.title.length} chars)`,
        suggestion: 'Consider a more descriptive title (10+ characters)'
      });
    }

    // Check description/excerpt
    if (!post.excerpt) {
      issues.push({
        type: 'suggestion',
        page: `/post/${post.slug}`,
        issue: 'Missing excerpt/description',
        suggestion: 'Add an excerpt for better search engine snippets'
      });
    } else if (post.excerpt.length > 160) {
      issues.push({
        type: 'warning',
        page: `/post/${post.slug}`,
        issue: `Excerpt too long (${post.excerpt.length} chars)`,
        suggestion: 'Keep excerpts under 160 characters for search snippets'
      });
    }

    // Check for tags
    if (!post.tags || post.tags.length === 0) {
      issues.push({
        type: 'suggestion',
        page: `/post/${post.slug}`,
        issue: 'No tags assigned',
        suggestion: 'Add relevant tags to improve discoverability'
      });
    } else if (post.tags.length > 10) {
      issues.push({
        type: 'warning',
        page: `/post/${post.slug}`,
        issue: `Too many tags (${post.tags.length})`,
        suggestion: 'Limit to 3-10 most relevant tags'
      });
    }

    // Check for date
    if (!post.date) {
      issues.push({
        type: 'error',
        page: `/post/${post.slug}`,
        issue: 'Missing publication date',
        suggestion: 'Add a publication date to the post'
      });
    }

    // Check content length
    if (post.contentHtml) {
      const wordCount = post.contentHtml.replace(/<[^>]*>/g, '').split(' ').length;
      if (wordCount < 100) {
        issues.push({
          type: 'suggestion',
          page: `/post/${post.slug}`,
          issue: `Content too short (${wordCount} words)`,
          suggestion: 'Consider expanding content to 300+ words for better SEO'
        });
      }
    }

    // Check slug quality
    if (post.slug.length > 50) {
      issues.push({
        type: 'warning',
        page: `/post/${post.slug}`,
        issue: 'URL slug too long',
        suggestion: 'Keep URL slugs concise and descriptive'
      });
    }
  }

  // Report results
  const errors = issues.filter(i => i.type === 'error');
  const warnings = issues.filter(i => i.type === 'warning');
  const suggestions = issues.filter(i => i.type === 'suggestion');

  console.log(`📊 SEO Analysis Results:`);
  console.log(`   Posts analyzed: ${posts.length}`);
  console.log(`   🚨 Errors: ${errors.length}`);
  console.log(`   ⚠️  Warnings: ${warnings.length}`);
  console.log(`   💡 Suggestions: ${suggestions.length}\n`);

  if (errors.length > 0) {
    console.log('🚨 ERRORS (must fix):');
    errors.forEach(issue => {
      console.log(`   ${issue.page}: ${issue.issue}`);
      if (issue.suggestion) console.log(`      → ${issue.suggestion}`);
    });
    console.log();
  }

  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS (should fix):');
    warnings.forEach(issue => {
      console.log(`   ${issue.page}: ${issue.issue}`);
      if (issue.suggestion) console.log(`      → ${issue.suggestion}`);
    });
    console.log();
  }

  if (suggestions.length > 0) {
    console.log('💡 SUGGESTIONS (nice to have):');
    suggestions.forEach(issue => {
      console.log(`   ${issue.page}: ${issue.issue}`);
      if (issue.suggestion) console.log(`      → ${issue.suggestion}`);
    });
    console.log();
  }

  if (issues.length === 0) {
    console.log('✅ No SEO issues found! Your blog is well optimized for search engines.');
  } else {
    console.log('🔧 Run these commands to improve your SEO:');
    console.log('   npm run generate-sitemap  # Update sitemap');
    console.log('   npm run generate-rss      # Update RSS feed');
  }

  // Check for potential improvements
  console.log('\n🚀 Additional SEO recommendations:');
  console.log('   1. Ensure all images have alt text');
  console.log('   2. Add internal linking between related posts');
  console.log('   3. Consider adding breadcrumbs for better navigation');
  console.log('   4. Monitor Core Web Vitals in Google Search Console');
  console.log('   5. Submit sitemap to Google Search Console and Bing Webmaster Tools');

  return issues;
}

if (require.main === module) {
  validateSEO().catch(console.error);
}

export default validateSEO; 