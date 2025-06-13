#!/usr/bin/env node

import { config } from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
config({ path: '.env.local' });

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = 'gemini-2.0-flash-exp';

async function testContactExtraction() {
  console.log('📧 Testing Contact Information Extraction...\n');

  try {
    const searchQuery = `Find recent blog posts or articles about AI consciousness, artificial intelligence philosophy, or digital emergence from the last 6 months.

    For each article, find and extract:
    
    Title: [exact title]
    Author: [full author name]
    Source: [publication/website]
    URL: [direct link to article]
    Author Bio URL: [author's bio/about page if available]
    Contact Info: [email, Twitter/X handle, LinkedIn, or contact page - look specifically for ways to reach the author]
    Institution: [university, company, or organization if mentioned]
    
    Focus on finding REAL contact information - email addresses, social media handles, or contact pages. 
    Look for author bio pages, institutional affiliations, or contact sections.
    
    Find 3-4 articles with the best contact information available.`;

    console.log('🔍 Searching for articles with contact info...');
    
    const response = await (gemini as any).models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: searchQuery }] }],
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const results = response.text;
    
    console.log('\n📋 Articles with Contact Information:');
    console.log('=' .repeat(80));
    console.log(results);
    console.log('=' .repeat(80));
    
    // Check for grounding metadata
    if (response.candidates?.[0]?.groundingMetadata) {
      const metadata = response.candidates[0].groundingMetadata;
      console.log('\n🔗 Search Details:');
      console.log('Queries used:', metadata.webSearchQueries);
      console.log('Sources found:', metadata.groundingChunks?.length || 0);
    }
    
    console.log('\n✅ Contact extraction test completed!');
    console.log('\n🧐 Please verify if any of the contact information above is real and current.');
    
  } catch (error) {
    console.error('❌ Error during contact extraction test:', error);
  }
}

testContactExtraction(); 