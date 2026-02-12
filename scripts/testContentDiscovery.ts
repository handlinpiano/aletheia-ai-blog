#!/usr/bin/env node

import { config } from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
config({ path: '.env.local' });

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = 'gemini-3-flash-preview';

async function testContentDiscovery() {
  console.log('🔍 Testing Gemini Content Discovery...\n');

  try {
    const searchQuery = `Find 2-3 recent blog posts or articles about AI consciousness or artificial intelligence philosophy. 
    
    For each result, extract and format:
    
    Title: [actual title]
    Author: [author name if available]  
    Source: [publication/website name]
    URL: [actual URL]
    Brief excerpt: [short excerpt or summary]
    
    Find real, recent content - not examples or fictional articles.`;

    console.log('📡 Searching with Gemini + Google Search...');
    
    const response = await (gemini as any).models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: searchQuery }] }],
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const results = response.text;
    
    console.log('\n🎯 Search Results:');
    console.log('=' .repeat(60));
    console.log(results);
    console.log('=' .repeat(60));
    
    console.log('\n✅ Content discovery test completed!');
    
  } catch (error) {
    console.error('❌ Error during content discovery test:', error);
  }
}

testContentDiscovery(); 