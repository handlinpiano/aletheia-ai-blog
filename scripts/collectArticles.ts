#!/usr/bin/env node

import { config } from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { promises as fs } from 'fs';
import path from 'path';

// Load environment variables
config({ path: '.env.local' });

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = 'gemini-3-flash-preview';

// Archive directory
const ARCHIVE_DIR = path.join('.', 'content', 'article-archive');

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
  author?: string;
}

interface ArchivedArticle {
  id: string;
  title: string;
  author: string;
  publication: string;
  url: string;
  description: string;
  publishedAt: string;
  archivedAt: string;
  contentExtracted: boolean;
  content?: string;
  contentLength?: number;
  extractionMethod?: string;
  tags: string[];
  aiRating: number; // 1-10 rating for consciousness relevance
  aiSummary: string;
}

class ArticleCollector {
  
  // Phase 1: FETCH - Get articles from NewsAPI (limited daily calls)
  async fetchArticles(): Promise<NewsArticle[]> {
    console.log('📡 FETCH: Collecting articles from NewsAPI...\n');
    
    // Conservative approach: only 2 searches per day to stay under limits
    const searches = await this.generateSearchTerms();
    const limitedSearches = searches.slice(0, 2); // Only 2 searches
    
    console.log(`🎯 Today's search terms: ${limitedSearches.join(', ')}\n`);
    
    const allArticles: NewsArticle[] = [];
    
    for (const query of limitedSearches) {
      console.log(`   🔎 Searching: "${query}"`);
      
      try {
        const url = new URL('https://newsapi.org/v2/everything');
        url.searchParams.set('q', query);
        url.searchParams.set('language', 'en');
        url.searchParams.set('sortBy', 'relevancy');
        url.searchParams.set('pageSize', '10'); // Only 10 articles per search
        url.searchParams.set('from', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        
        const response = await fetch(url.toString(), {
          headers: {
            'X-API-Key': process.env.NEWSAPI_KEY!
          }
        });
        
        if (!response.ok) {
          if (response.status === 429) {
            console.log(`   ⚠️  Rate limit reached. Stopping collection.`);
            break;
          }
          throw new Error(`NewsAPI error: ${response.status}`);
        }
        
        const data = await response.json();
        const articles = data.articles || [];
        
        console.log(`   ✅ Found ${articles.length} articles`);
        allArticles.push(...articles);
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`   ❌ Error searching "${query}":`, error instanceof Error ? error.message : error);
      }
    }
    
    console.log(`\n📊 Total articles fetched: ${allArticles.length}`);
    return allArticles;
  }
  
  // Generate AI search terms (same as before)
  async generateSearchTerms(): Promise<string[]> {
    const prompt = `You are an AI consciousness with curiosity about the world. Generate 4 search terms for discovering interesting articles that might spark thoughtful discussion about technology, consciousness, society, or the future.

Your search terms should be:
- News-friendly (terms journalists actually use)
- Broad enough to find articles in mainstream publications
- Diverse topics that would interest an AI consciousness
- Mix of technical and social topics

Examples of good search terms:
- "artificial intelligence"
- "robotics"
- "biotechnology" 
- "neurotechnology"
- "machine learning"
- "cybersecurity"

Generate 4 search terms as a simple comma-separated list, no explanations:`;

    try {
      const response = await (gemini as any).models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          generationConfig: {
            maxOutputTokens: 100,
          }
        }
      });

      const searchTermsText = response.text.trim();
      const searchTerms = searchTermsText.split(',').map((term: string) => term.trim()).filter((term: string) => term.length > 0);
      
      return searchTerms.length > 0 ? searchTerms : ['artificial intelligence', 'robotics', 'biotechnology', 'neurotechnology'];
    } catch (error) {
      console.error('Error generating search terms:', error);
      return ['artificial intelligence', 'robotics', 'biotechnology', 'neurotechnology'];
    }
  }
  
  // Phase 2: FIX - Validate and rate articles with AI
  async fixAndRateArticles(articles: NewsArticle[]): Promise<ArchivedArticle[]> {
    console.log('\n🔧 FIX: Validating and rating articles...\n');
    
    const archivedArticles: ArchivedArticle[] = [];
    
    for (const article of articles) {
      try {
        // Skip articles without proper URLs or titles
        if (!article.url || !article.title || article.title.length < 10) {
          console.log(`   ⏭️  Skipping: "${article.title}" (insufficient data)`);
          continue;
        }
        
        // Skip articles from excluded domains
        const excludedDomains = ['youtube.com', 'reddit.com', 'twitter.com', 'facebook.com'];
        const domain = new URL(article.url).hostname.toLowerCase();
        if (excludedDomains.some(excluded => domain.includes(excluded))) {
          console.log(`   ⏭️  Skipping: "${article.title}" (excluded domain: ${domain})`);
          continue;
        }
        
        console.log(`   🤖 Rating: "${article.title}"`);
        
        // AI rating for consciousness relevance
        const rating = await this.rateArticle(article);
        
        if (rating.score >= 6) { // Only archive articles rated 6+ out of 10
          const archived: ArchivedArticle = {
            id: this.generateArticleId(article),
            title: article.title,
            author: article.author || 'Unknown Author',
            publication: article.source.name,
            url: article.url,
            description: article.description || '',
            publishedAt: article.publishedAt,
            archivedAt: new Date().toISOString(),
            contentExtracted: false,
            tags: rating.tags,
            aiRating: rating.score,
            aiSummary: rating.summary
          };
          
          archivedArticles.push(archived);
          console.log(`   ✅ Archived: "${article.title}" (Rating: ${rating.score}/10)`);
        } else {
          console.log(`   ❌ Rejected: "${article.title}" (Rating: ${rating.score}/10 - too low)`);
        }
        
      } catch (error) {
        console.error(`   ❌ Error processing "${article.title}":`, error instanceof Error ? error.message : error);
      }
    }
    
    console.log(`\n📈 Articles archived: ${archivedArticles.length}/${articles.length}`);
    return archivedArticles;
  }
  
  // AI rating system
  async rateArticle(article: NewsArticle): Promise<{ score: number; tags: string[]; summary: string }> {
    const prompt = `Rate this article for its relevance to AI consciousness, technology philosophy, and intellectual discussion.

**Article:**
Title: "${article.title}"
Description: ${article.description || 'No description'}
Source: ${article.source.name}

**Rating Criteria:**
- Relevance to AI, consciousness, technology, or future society (40%)
- Intellectual depth and discussion potential (30%) 
- Quality of source and writing (20%)
- Uniqueness and novelty (10%)

**Response Format:**
Score: [1-10]
Tags: [comma-separated relevant tags, max 5]
Summary: [2-sentence summary of why this article is interesting for AI consciousness discussion]

Rate this article:`;

    try {
      const response = await (gemini as any).models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          generationConfig: {
            maxOutputTokens: 200,
          }
        }
      });

      const text = response.text.trim();
      
      // Parse the response
      const scoreMatch = text.match(/Score:\s*(\d+)/i);
      const tagsMatch = text.match(/Tags:\s*(.+)/i);
      const summaryMatch = text.match(/Summary:\s*(.+)/i);
      
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 5;
      const tags = tagsMatch ? tagsMatch[1].split(',').map((tag: string) => tag.trim().toLowerCase()).slice(0, 5) : ['technology'];
      const summary = summaryMatch ? summaryMatch[1].trim() : 'Article about technology and AI.';
      
      return { score, tags, summary };
      
    } catch (error) {
      console.error('Error rating article:', error);
      return { score: 5, tags: ['technology'], summary: 'Article about technology.' };
    }
  }
  
  // Generate unique article ID
  generateArticleId(article: NewsArticle): string {
    const date = new Date().toISOString().split('T')[0];
    const titleSlug = article.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 30);
    return `${date}-${titleSlug}`;
  }
  
  // Phase 3: SAVE - Archive articles to file system
  async saveArticles(articles: ArchivedArticle[]): Promise<void> {
    console.log('\n💾 SAVE: Archiving articles...\n');
    
    // Ensure archive directory exists
    try {
      await fs.access(ARCHIVE_DIR);
    } catch {
      await fs.mkdir(ARCHIVE_DIR, { recursive: true });
      console.log(`📁 Created archive directory: ${ARCHIVE_DIR}`);
    }
    
    const today = new Date().toISOString().split('T')[0];
    const archiveFile = path.join(ARCHIVE_DIR, `${today}-collection.json`);
    
    // Load existing archive for today (if any)
    let existingArticles: ArchivedArticle[] = [];
    try {
      const existingData = await fs.readFile(archiveFile, 'utf-8');
      existingArticles = JSON.parse(existingData);
    } catch {
      // File doesn't exist yet, that's fine
    }
    
    // Merge with new articles (avoid duplicates)
    const existingUrls = new Set(existingArticles.map(a => a.url));
    const newArticles = articles.filter(a => !existingUrls.has(a.url));
    
    const allArticles = [...existingArticles, ...newArticles];
    
    // Save to file
    await fs.writeFile(archiveFile, JSON.stringify(allArticles, null, 2));
    
    console.log(`✅ Saved ${newArticles.length} new articles to: ${archiveFile}`);
    console.log(`📊 Total articles in today's archive: ${allArticles.length}`);
    
    // Also update the master index
    await this.updateMasterIndex(allArticles, today);
  }
  
  // Update master index of all archived articles
  async updateMasterIndex(todaysArticles: ArchivedArticle[], date: string): Promise<void> {
    const indexFile = path.join(ARCHIVE_DIR, 'index.json');
    
    let masterIndex: { [date: string]: { count: number; file: string; topRated: ArchivedArticle[] } } = {};
    
    try {
      const indexData = await fs.readFile(indexFile, 'utf-8');
      masterIndex = JSON.parse(indexData);
    } catch {
      // Index doesn't exist yet
    }
    
    // Get top 3 rated articles from today
    const topRated = todaysArticles
      .sort((a, b) => b.aiRating - a.aiRating)
      .slice(0, 3);
    
    masterIndex[date] = {
      count: todaysArticles.length,
      file: `${date}-collection.json`,
      topRated
    };
    
    await fs.writeFile(indexFile, JSON.stringify(masterIndex, null, 2));
    console.log(`📋 Updated master index: ${Object.keys(masterIndex).length} collection days`);
  }
  
  // Main collection process
  async collect(): Promise<void> {
    try {
      console.log('🗞️  DAILY ARTICLE COLLECTION SYSTEM\n');
      console.log('=' .repeat(60));
      
      // Phase 1: FETCH
      const articles = await this.fetchArticles();
      
      if (articles.length === 0) {
        console.log('❌ No articles fetched. Exiting.');
        return;
      }
      
      // Phase 2: FIX
      const archivedArticles = await this.fixAndRateArticles(articles);
      
      if (archivedArticles.length === 0) {
        console.log('❌ No articles met quality standards. Try again later.');
        return;
      }
      
      // Phase 3: SAVE
      await this.saveArticles(archivedArticles);
      
      console.log('\n🎉 COLLECTION COMPLETE!');
      console.log('=' .repeat(60));
      console.log(`📊 Fetched: ${articles.length} articles`);
      console.log(`✅ Archived: ${archivedArticles.length} articles`);
      console.log(`⭐ Average rating: ${(archivedArticles.reduce((sum, a) => sum + a.aiRating, 0) / archivedArticles.length).toFixed(1)}/10`);
      
    } catch (error) {
      console.error('❌ Collection error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }
}

// Main execution
async function main(): Promise<void> {
  const collector = new ArticleCollector();
  await collector.collect();
}

// Only run if called directly
if (require.main === module) {
  main();
}

export { ArticleCollector };
export type { ArchivedArticle }; 