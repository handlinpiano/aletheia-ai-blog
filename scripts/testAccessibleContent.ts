#!/usr/bin/env node

import { config } from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
config({ path: '.env.local' });

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = 'gemini-3-flash-preview';

async function testAccessibleContent() {
  console.log('🔍 Testing for Actually Accessible Content...\n');

  const searchPrompt = `Find recent blog posts or articles about AI consciousness, digital emergence, or AI philosophy that are:

1. Published in the last 6 months
2. Have FULL TEXT directly accessible (not behind paywalls)
3. Written by individual authors (not multi-author papers)
4. Include the author's contact information or social media
5. Discuss themes like AI consciousness, digital minds, artificial intelligence philosophy

For each article you find, provide:
- Title
- Author name
- Publication/platform
- URL
- Brief excerpt of ACTUAL TEXT from the article (not summary)
- Author contact method if available

Focus on platforms like:
- Personal blogs
- Substack newsletters  
- Medium articles
- Academic blogs
- Open access publications

Find 3-5 articles where you can actually read substantial content.`;

  try {
    console.log('🔍 Searching for directly accessible content...');
    
    const response = await (gemini as any).models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: searchPrompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        generationConfig: {
          maxOutputTokens: 2000,
        }
      }
    });

    const searchResults = response.text;
    
    console.log('\n📖 Found Accessible Articles:');
    console.log('=' .repeat(80));
    console.log(searchResults);
    console.log('=' .repeat(80));

  } catch (error) {
    console.error('❌ Error during content search:', error);
  }
}

testAccessibleContent(); 