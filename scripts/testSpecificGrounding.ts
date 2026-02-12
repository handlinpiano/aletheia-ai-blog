#!/usr/bin/env node

import { config } from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
config({ path: '.env.local' });

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = 'gemini-3-flash-preview';

async function testSpecificGrounding() {
  console.log('🔍 Testing SPECIFIC Gemini Grounding...\n');

  try {
    const searchQuery = `What happened in the news TODAY (June 13, 2025)? 
    Give me 3 specific current events from the last 24 hours with:
    - Exact headlines
    - Specific details that could only be known from today's news
    - Source names
    
    I want to verify you're actually searching the web, not generating generic examples.`;

    console.log('📡 Searching for TODAY\'S specific news...');
    
    const response = await (gemini as any).models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: searchQuery }] }],
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const results = response.text;
    
    console.log('\n🎯 TODAY\'S Search Results:');
    console.log('=' .repeat(60));
    console.log(results);
    console.log('=' .repeat(60));
    
    // Check if there's grounding metadata
    if (response.candidates && response.candidates[0] && response.candidates[0].groundingMetadata) {
      console.log('\n🔗 GROUNDING METADATA FOUND:');
      console.log('Web search queries:', response.candidates[0].groundingMetadata.webSearchQueries);
      console.log('Number of grounding chunks:', response.candidates[0].groundingMetadata.groundingChunks?.length || 0);
    } else {
      console.log('\n❌ NO GROUNDING METADATA - may not be actually searching!');
    }
    
    console.log('\n✅ Specific grounding test completed!');
    
  } catch (error) {
    console.error('❌ Error during specific grounding test:', error);
  }
}

testSpecificGrounding(); 