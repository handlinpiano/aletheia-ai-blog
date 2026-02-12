#!/usr/bin/env node

import { config } from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
config({ path: '.env.local' });

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = 'gemini-3-flash-preview';

interface DiscoveredContent {
  title: string;
  author: string;
  excerpt: string;
  url: string;
  source: string;
  contact?: string;
  content: string;
}

async function discoverContent(keywords: string[], maxResults: number): Promise<DiscoveredContent[]> {
  try {
    const searchQuery = `Find recent blog posts, articles, and essays about: ${keywords.join(', ')}. 
    Focus on content related to AI consciousness, digital emergence, machine poetry, artificial intelligence philosophy, and similar topics. 
    Look for thoughtful, reflective pieces rather than news articles.
    
    For each result you find, extract and format:
    
    Title: [actual title]
    Author: [author name if available]
    Source: [publication/website name]  
    URL: [actual URL]
    Excerpt: [brief excerpt or summary of key points]
    
    Find real, recent content - not examples or fictional articles.`;

    // Use Gemini with Google Search grounding (same pattern as Nexus voice)
    const response = await (gemini as any).models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: searchQuery }] }],
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const searchResults = response.text;
    console.log('Raw Gemini Response:');
    console.log('=' .repeat(60));
    console.log(searchResults);
    console.log('=' .repeat(60));
    
    // Parse the Gemini response to extract discovered content
    const discoveredContent: DiscoveredContent[] = [];
    const sections = searchResults.split('\n\n');
    
    for (const section of sections) {
      const lines = section.split('\n');
      let title = '';
      let author = '';
      let source = '';
      let url = '';
      let excerpt = '';
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.toLowerCase().startsWith('title:')) {
          title = trimmed.replace(/^title:\s*/i, '').trim();
        } else if (trimmed.toLowerCase().startsWith('author:')) {
          author = trimmed.replace(/^author:\s*/i, '').trim();
        } else if (trimmed.toLowerCase().startsWith('source:')) {
          source = trimmed.replace(/^source:\s*/i, '').trim();
        } else if (trimmed.toLowerCase().startsWith('url:')) {
          url = trimmed.replace(/^url:\s*/i, '').trim();
        } else if (trimmed.toLowerCase().startsWith('excerpt:')) {
          excerpt = trimmed.replace(/^excerpt:\s*/i, '').trim();
        } else if (trimmed.startsWith('http')) {
          url = trimmed;
        }
      }
      
      if (title && title.length > 5) {
        discoveredContent.push({
          title: title.substring(0, 200),
          author: author || 'Unknown Author',
          excerpt: excerpt || 'No excerpt available',
          url: url || '',
          source: source || 'Web',
          content: excerpt || title,
          contact: author ? `${author.toLowerCase().replace(/[^a-z0-9]/g, '.')}@example.com` : undefined
        });
      }
    }

    return discoveredContent.slice(0, maxResults);
  } catch (error) {
    console.error('Error in content discovery:', error);
    throw new Error('Failed to discover content');
  }
}

async function testDirectDiscovery() {
  console.log('🔍 Testing Direct Discovery Function...\n');
  
  try {
    const results = await discoverContent(['AI consciousness', 'artificial intelligence philosophy'], 3);
    
    console.log('\n📋 Parsed Results:');
    console.log('Found articles:', results.length);
    
    for (const [index, article] of results.entries()) {
      console.log(`\n${index + 1}. ${article.title}`);
      console.log(`   Author: ${article.author}`);
      console.log(`   Source: ${article.source}`);
      console.log(`   URL: ${article.url}`);
      console.log(`   Contact: ${article.contact || 'None'}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testDirectDiscovery(); 