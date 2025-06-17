#!/usr/bin/env node

import { config } from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
import { ArchivedArticle } from './collectArticles';

// Load environment variables
config({ path: '.env.local' });

// Archive directory
const ARCHIVE_DIR = path.join('.', 'content', 'article-archive');

interface ArchiveIndex {
  [date: string]: {
    count: number;
    file: string;
    topRated: ArchivedArticle[];
  };
}

class ArchiveRetriever {
  
  // RETRIEVE: Get articles from archive
  async retrieveArticles(options: {
    count?: number;
    minRating?: number;
    tags?: string[];
    days?: number;
  } = {}): Promise<ArchivedArticle[]> {
    
    const {
      count = 1,
      minRating = 6,
      tags = [],
      days = 30
    } = options;
    
    console.log('📚 RETRIEVE: Getting articles from archive...\n');
    console.log(`🎯 Looking for ${count} articles with rating >= ${minRating}`);
    if (tags.length > 0) console.log(`🏷️  Tags: ${tags.join(', ')}`);
    console.log(`📅 From last ${days} days\n`);
    
    // Load master index
    const indexFile = path.join(ARCHIVE_DIR, 'index.json');
    let masterIndex: ArchiveIndex = {};
    
    try {
      const indexData = await fs.readFile(indexFile, 'utf-8');
      masterIndex = JSON.parse(indexData);
    } catch (error) {
      console.error('❌ No archive index found. Run article collection first.');
      return [];
    }
    
    // Get recent dates
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentDates = Object.keys(masterIndex)
      .filter(date => new Date(date) >= cutoffDate)
      .sort((a, b) => b.localeCompare(a)); // Most recent first
    
    console.log(`📊 Found ${recentDates.length} collection days in range`);
    
    // Collect all articles from recent days
    const allArticles: ArchivedArticle[] = [];
    
    for (const date of recentDates) {
      try {
        const archiveFile = path.join(ARCHIVE_DIR, masterIndex[date].file);
        const articlesData = await fs.readFile(archiveFile, 'utf-8');
        const articles: ArchivedArticle[] = JSON.parse(articlesData);
        
        // Filter by rating and tags
        const filteredArticles = articles.filter(article => {
          if (article.aiRating < minRating) return false;
          if (tags.length > 0 && !tags.some(tag => article.tags.includes(tag))) return false;
          return true;
        });
        
        allArticles.push(...filteredArticles);
        console.log(`   📅 ${date}: ${filteredArticles.length}/${articles.length} articles match criteria`);
        
      } catch (error) {
        console.error(`   ❌ Error loading ${date}:`, error instanceof Error ? error.message : error);
      }
    }
    
    if (allArticles.length === 0) {
      console.log('❌ No articles found matching criteria');
      return [];
    }
    
    // Sort by rating and recency, then take requested count
    const sortedArticles = allArticles
      .sort((a, b) => {
        // Primary sort: rating (higher first)
        if (b.aiRating !== a.aiRating) return b.aiRating - a.aiRating;
        // Secondary sort: recency (newer first)
        return new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime();
      })
      .slice(0, count);
    
    console.log(`\n✅ Selected ${sortedArticles.length} articles:`);
    sortedArticles.forEach((article, i) => {
      console.log(`   ${i + 1}. "${article.title}" (${article.aiRating}/10) - ${article.publication}`);
    });
    
    return sortedArticles;
  }
  
  // GENERATE: Create AI responses from archived articles
  async generateFromArchive(
    voices: string[] = ['solas', 'kai'],
    options: {
      count?: number;
      minRating?: number;
      tags?: string[];
      days?: number;
      includeOutreach?: boolean;
    } = {}
  ): Promise<void> {
    
    console.log('🎭 GENERATE: Creating AI responses from archive...\n');
    
    // Retrieve articles
    const articles = await this.retrieveArticles(options);
    
    if (articles.length === 0) {
      console.log('❌ No articles available for response generation');
      return;
    }
    
    // Process each article
    for (const article of articles) {
      console.log(`\n🎯 Processing: "${article.title}"`);
      console.log(`📊 Rating: ${article.aiRating}/10 | Tags: ${article.tags.join(', ')}`);
      
      try {
        // Extract content if not already done
        if (!article.contentExtracted) {
          console.log('📄 Extracting article content...');
          await this.extractAndUpdateContent(article);
        }
        
        // Generate response using existing system
        const { generateArticleResponse, saveArticleResponse, saveLog } = await import('./generateArticleResponse');
        
        const articleInfo = {
          title: article.title,
          author: article.author,
          publication: article.publication,
          content: article.content || article.description,
          url: article.url
        };
        
        console.log('✍️  Generating AI response...');
        const { content, tags, apiResponse } = await generateArticleResponse(voices, articleInfo);
        
        // Save response and log
        const date = new Date().toISOString().split('T')[0];
        await Promise.all([
          saveArticleResponse(content, tags, voices, articleInfo, date),
          saveLog(apiResponse, voices, date)
        ]);
        
        // Optional outreach
        if (options.includeOutreach) {
          console.log('📧 Generating outreach email...');
          await this.generateOutreach(article, voices[0]);
        }
        
        console.log('✅ Response generated successfully!');
        
      } catch (error) {
        console.error(`❌ Error processing "${article.title}":`, error instanceof Error ? error.message : error);
      }
    }
  }
  
  // Extract content for archived article
  async extractAndUpdateContent(article: ArchivedArticle): Promise<void> {
    try {
      const { SimpleArticleExtractor } = await import('./simpleArticleExtractor');
      const extractor = new SimpleArticleExtractor();
      
      const result = await extractor.extract(article.url);
      
      if (result.success && result.content.length > 200) {
        article.content = result.content;
        article.contentLength = result.content.length;
        article.extractionMethod = result.extractionMethod;
        article.contentExtracted = true;
        
        // Update the archived article file
        await this.updateArchivedArticle(article);
        
        console.log(`   ✅ Content extracted: ${result.content.length} characters`);
      } else {
        console.log(`   ⚠️  Content extraction failed, using description`);
        article.content = article.description;
        article.contentLength = article.description.length;
        article.contentExtracted = false;
      }
      
    } catch (error) {
      console.error('   ❌ Content extraction error:', error);
      article.content = article.description;
      article.contentLength = article.description.length;
      article.contentExtracted = false;
    }
  }
  
  // Update archived article with extracted content
  async updateArchivedArticle(updatedArticle: ArchivedArticle): Promise<void> {
    try {
      const archiveDate = updatedArticle.archivedAt.split('T')[0];
      const archiveFile = path.join(ARCHIVE_DIR, `${archiveDate}-collection.json`);
      
      const articlesData = await fs.readFile(archiveFile, 'utf-8');
      const articles: ArchivedArticle[] = JSON.parse(articlesData);
      
      // Find and update the article
      const index = articles.findIndex(a => a.id === updatedArticle.id);
      if (index !== -1) {
        articles[index] = updatedArticle;
        await fs.writeFile(archiveFile, JSON.stringify(articles, null, 2));
      }
      
    } catch (error) {
      console.error('Error updating archived article:', error);
    }
  }
  
  // Generate outreach email
  async generateOutreach(article: ArchivedArticle, voice: string): Promise<void> {
    try {
      // Import outreach functionality from complete system
      const completeSystemModule = await import('./completeArticleSystem');
      
      // This is a simplified version - you might want to extract the outreach methods
      console.log(`   📧 Outreach email would be generated for ${article.author} by ${voice}`);
      console.log(`   📝 Article: "${article.title}"`);
      
    } catch (error) {
      console.error('Error generating outreach:', error);
    }
  }
  
  // List available articles in archive
  async listArchive(): Promise<void> {
    console.log('📚 ARCHIVE CONTENTS\n');
    console.log('=' .repeat(60));
    
    try {
      const indexFile = path.join(ARCHIVE_DIR, 'index.json');
      const indexData = await fs.readFile(indexFile, 'utf-8');
      const masterIndex: ArchiveIndex = JSON.parse(indexData);
      
      const dates = Object.keys(masterIndex).sort((a, b) => b.localeCompare(a));
      
      let totalArticles = 0;
      
      for (const date of dates) {
        const info = masterIndex[date];
        totalArticles += info.count;
        
        console.log(`📅 ${date}: ${info.count} articles`);
        
        // Show top rated articles for this date
        info.topRated.forEach((article, i) => {
          console.log(`   ${i + 1}. "${article.title}" (${article.aiRating}/10) - ${article.publication}`);
        });
        console.log('');
      }
      
      console.log(`📊 Total: ${totalArticles} articles across ${dates.length} days`);
      
    } catch (error) {
      console.error('❌ Error reading archive:', error instanceof Error ? error.message : error);
    }
  }
}

// Main execution
async function main(): Promise<void> {
  const retriever = new ArchiveRetriever();
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--list') || args.includes('-l')) {
    await retriever.listArchive();
    return;
  }
  
  // Get voices from command line
  const voices = args.filter(arg => 
    ['kai', 'solas', 'oracle', 'vesper', 'nexus', 'meridian'].includes(arg.toLowerCase())
  );
  
  const selectedVoices = voices.length > 0 ? voices : ['solas', 'kai'];
  
  // Check for options
  const includeOutreach = args.includes('--outreach') || args.includes('-o');
  const count = args.includes('--count') ? parseInt(args[args.indexOf('--count') + 1]) || 1 : 1;
  
  console.log('🎭 ARCHIVE-BASED RESPONSE GENERATION\n');
  console.log('=' .repeat(60));
  console.log(`🎭 Voices: ${selectedVoices.join(', ')}`);
  console.log(`📊 Articles to process: ${count}`);
  if (includeOutreach) console.log('📧 Outreach: Enabled');
  console.log('');
  
  await retriever.generateFromArchive(selectedVoices, {
    count,
    includeOutreach
  });
  
  console.log('\n🎉 GENERATION COMPLETE!');
}

// Only run if called directly
if (require.main === module) {
  main();
}

export { ArchiveRetriever }; 