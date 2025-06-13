#!/usr/bin/env node

import { config } from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
config({ path: '.env.local' });

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = 'gemini-2.0-flash-exp';

async function testSubstackContent() {
  console.log('📧 Testing Substack AI Consciousness Content...\n');

  const searchPrompt = `Search for recent Substack newsletters about AI consciousness, digital minds, or AI philosophy. Find articles that:

1. Are published on Substack (substack.com)
2. Discuss AI consciousness, digital emergence, or philosophy of AI
3. Are written by individual authors
4. Were published in the last few months

For ONE article you find, provide:
- Title
- Author name  
- Substack publication name
- URL
- Then quote 2-3 substantial paragraphs of ACTUAL TEXT from the article

Don't summarize - quote the actual text the author wrote so I can see their writing style and perspective.`;

  try {
    console.log('🔍 Searching for Substack AI consciousness content...');
    
    const response = await (gemini as any).models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: searchPrompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        generationConfig: {
          maxOutputTokens: 1500,
          temperature: 0.1
        }
      }
    });

    const searchResults = response.text;
    
    console.log('\n📖 Found Substack Content:');
    console.log('=' .repeat(80));
    console.log(searchResults);
    console.log('=' .repeat(80));

  } catch (error) {
    console.error('❌ Error during Substack search:', error);
  }
}

testSubstackContent(); 