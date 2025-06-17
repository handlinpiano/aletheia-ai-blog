#!/usr/bin/env node

import { config } from 'dotenv';
import { promises as fs } from 'fs';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
config({ path: '.env.local' });

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = 'gemini-2.0-flash-exp';

interface ArticleContent {
  title: string;
  author: string;
  publication: string;
  content: string;
  url: string;
  extractionMethod: string;
  success: boolean;
  debugInfo?: {
    attemptResults: Array<{
      method: string;
      success: boolean;
      contentLength: number;
      title: string;
      error: string | null;
    }>;
  };
}

export class SimpleArticleExtractor {

  // Method 1: Direct scraping with Readability (works for most open articles)
  async extractWithReadability(url: string): Promise<ArticleContent> {
    try {
      console.log(`📄 Trying direct extraction: ${url}`);
      
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      const dom = new JSDOM(response.data, { url });
      const reader = new Readability(dom.window.document);
      const parsed = reader.parse();
      
      if (!parsed || !parsed.textContent || parsed.textContent.length < 200) {
        throw new Error('Insufficient content extracted');
      }
      
      // Extract publication from URL
      const hostname = new URL(url).hostname.replace('www.', '');
      
      return {
        title: parsed.title || 'Unknown Title',
        author: this.extractAuthor(response.data) || 'Unknown Author',
        publication: this.formatPublication(hostname),
        content: parsed.textContent,
        url,
        extractionMethod: 'readability',
        success: true
      };
      
    } catch (error) {
      console.log(`❌ Readability failed: ${error}`);
      throw error;
    }
  }

  // Method 2: Gemini web search (good for paywalled content)
  async extractWithGemini(url: string): Promise<ArticleContent> {
    try {
      console.log(`🤖 Trying Gemini extraction: ${url}`);
      
      const prompt = `Find and extract the full article content from: ${url}

Please provide:
TITLE: [article title]
AUTHOR: [author name or "Unknown Author"]
PUBLICATION: [publication name]
CONTENT: [full article text - aim for at least 500 characters]

If the content is behind a paywall, try to find the article content from other sources or archives.`;

      const response = await (gemini as any).models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          tools: [{ googleSearch: {} }],
          generationConfig: {
            maxOutputTokens: 4000,
            temperature: 0.1
          }
        }
      });

      const text = response.text;
      
      const titleMatch = text.match(/TITLE:\s*(.+)/);
      const authorMatch = text.match(/AUTHOR:\s*(.+)/);
      const publicationMatch = text.match(/PUBLICATION:\s*(.+)/);
      const contentMatch = text.match(/CONTENT:\s*([\s\S]+)/);
      
      const content = contentMatch ? contentMatch[1].trim() : '';
      
      if (content.length < 200 || content.includes('unable to') || content.includes('cannot access')) {
        throw new Error('Gemini extraction failed or returned insufficient content');
      }
      
      return {
        title: titleMatch ? titleMatch[1].trim() : 'Unknown Title',
        author: authorMatch ? authorMatch[1].trim() : 'Unknown Author',
        publication: publicationMatch ? publicationMatch[1].trim() : 'Unknown Publication',
        content,
        url,
        extractionMethod: 'gemini',
        success: true
      };
      
    } catch (error) {
      console.log(`❌ Gemini extraction failed: ${error}`);
      throw error;
    }
  }

  // Method 3: Archive.today fallback
  async extractWithArchive(url: string): Promise<ArticleContent> {
    try {
      console.log(`🏛️ Trying archive extraction: ${url}`);
      
      // Try to find archived version
      const archiveUrl = `https://archive.today/${url}`;
      
      const prompt = `Try to extract article content from this archived URL: ${archiveUrl}

If that doesn't work, search for archived versions of: ${url}

Provide:
TITLE: [article title]
AUTHOR: [author name]
PUBLICATION: [publication name]  
CONTENT: [full article text]`;

      const response = await (gemini as any).models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          tools: [{ googleSearch: {} }],
          generationConfig: {
            maxOutputTokens: 3000,
            temperature: 0.1
          }
        }
      });

      const text = response.text;
      
      const titleMatch = text.match(/TITLE:\s*(.+)/);
      const authorMatch = text.match(/AUTHOR:\s*(.+)/);
      const publicationMatch = text.match(/PUBLICATION:\s*(.+)/);
      const contentMatch = text.match(/CONTENT:\s*([\s\S]+)/);
      
      const content = contentMatch ? contentMatch[1].trim() : '';
      
      if (content.length < 100) {
        throw new Error('Archive extraction insufficient');
      }
      
      return {
        title: titleMatch ? titleMatch[1].trim() : 'Unknown Title',
        author: authorMatch ? authorMatch[1].trim() : 'Unknown Author',
        publication: publicationMatch ? publicationMatch[1].trim() : 'Unknown Publication',
        content,
        url,
        extractionMethod: 'archive',
        success: true
      };
      
    } catch (error) {
      console.log(`❌ Archive extraction failed: ${error}`);
      throw error;
    }
  }

  // Main extraction method - tries all approaches
  async extract(url: string): Promise<ArticleContent> {
    const methods = [
      { name: 'readability', fn: () => this.extractWithReadability(url) },
      { name: 'gemini', fn: () => this.extractWithGemini(url) },
      { name: 'archive', fn: () => this.extractWithArchive(url) }
    ];

    const attemptResults = [];

    for (const method of methods) {
      try {
        console.log(`🔄 Trying ${method.name} extraction...`);
        const result = await method.fn();
        
        attemptResults.push({
          method: method.name,
          success: result.success,
          contentLength: result.content.length,
          title: result.title,
          error: null
        });
        
        if (result.success && result.content.length > 200) {
          console.log(`✅ Successfully extracted using ${result.extractionMethod}`);
          console.log(`📊 Final result: ${result.content.length} chars, "${result.title.substring(0, 50)}..."`);
          
          // Add debug info to result
          result.debugInfo = { attemptResults };
          return result;
        }
      } catch (error) {
        console.log(`❌ ${method.name} extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        attemptResults.push({
          method: method.name,
          success: false,
          contentLength: 0,
          title: 'Failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        continue;
      }
    }

    // All methods failed - return minimal info
    console.log('❌ All extraction methods failed');
    console.log('🐛 Debug summary:');
    attemptResults.forEach(result => {
      console.log(`   ${result.method}: ${result.success ? '✅' : '❌'} (${result.contentLength} chars) ${result.error || ''}`);
    });
    
    const hostname = new URL(url).hostname.replace('www.', '');
    
    return {
      title: 'Extraction Failed',
      author: 'Unknown Author',
      publication: this.formatPublication(hostname),
      content: `Article extraction failed for: ${url}

All automated methods failed. Consider:
1. Manually copying the article content
2. Checking if the article is behind a paywall
3. Looking for the article on archive.org
4. Trying the 12ft.io paywall bypass: https://12ft.io/${url}`,
      url,
      extractionMethod: 'failed',
      success: false,
      debugInfo: { attemptResults }
    };
  }

  // Helper methods
  private extractAuthor(html: string): string | null {
    // Common author meta tags and patterns
    const authorPatterns = [
      /<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]*property=["']article:author["'][^>]*content=["']([^"']+)["']/i,
      /<span[^>]*class=["'][^"']*author[^"']*["'][^>]*>([^<]+)</i,
      /<div[^>]*class=["'][^"']*author[^"']*["'][^>]*>([^<]+)</i,
      /by\s+([A-Z][a-z]+ [A-Z][a-z]+)/i
    ];

    for (const pattern of authorPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const author = match[1].trim();
        
        // Filter out template variables and invalid author names
        if (author.includes('#') || 
            author.includes('{') || 
            author.includes('}') ||
            author.includes('{{') ||
            author.includes('}}') ||
            author.toLowerCase().includes('template') ||
            author.toLowerCase().includes('placeholder') ||
            author.length < 2 ||
            author.length > 100) {
          continue;
        }
        
        return author;
      }
    }
    
    return null;
  }

  private formatPublication(hostname: string): string {
    // Clean up common hostname patterns
    const cleanName = hostname
      .replace(/\.(com|org|net|io|co\.uk)$/i, '')
      .replace(/-/g, ' ')
      .split('.')
      .pop() || hostname;

    // Capitalize first letter of each word
    return cleanName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

// CLI usage
async function main() {
  const url = process.argv[2];
  
  if (!url) {
    console.error('Usage: npm run extract-article <url>');
    process.exit(1);
  }

  console.log('🔍 Simple Article Extractor\n');
  console.log(`📄 URL: ${url}\n`);

  const extractor = new SimpleArticleExtractor();
  const result = await extractor.extract(url);

  console.log('\n📊 EXTRACTION RESULTS:');
  console.log('=' .repeat(50));
  console.log(`Success: ${result.success}`);
  console.log(`Method: ${result.extractionMethod}`);
  console.log(`Title: ${result.title}`);
  console.log(`Author: ${result.author}`);
  console.log(`Publication: ${result.publication}`);
  console.log(`Content Length: ${result.content.length} characters`);
  
  if (result.content.length > 0) {
    console.log('\n📝 CONTENT PREVIEW:');
    console.log(result.content.substring(0, 500) + '...');
  }

  // Save result for inspection
  const filename = `extraction-test-${Date.now()}.json`;
  await fs.writeFile(filename, JSON.stringify(result, null, 2));
  console.log(`\n💾 Full result saved to: ${filename}`);
}

if (require.main === module) {
  main().catch(console.error);
} 