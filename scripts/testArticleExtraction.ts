#!/usr/bin/env node

import { config } from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
config({ path: '.env.local' });

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = 'gemini-3-flash-preview';

async function testArticleExtraction() {
  const url = 'https://gizmodo.com/chatgpt-tells-users-to-alert-the-media-that-it-is-trying-to-break-people-report-2000615600';
  
  console.log('🔍 Testing article content extraction...');
  console.log(`📄 URL: ${url}\n`);

  const extractionPrompt = `Extract the full article content from this URL: ${url}

Please provide:
1. Article title
2. Author name
3. Publication/website name
4. Main article content (full text, not just summary)

Format as:
TITLE: [article title]
AUTHOR: [author name]
PUBLICATION: [publication name]
CONTENT: [full article text]`;

  try {
    console.log('⚙️  Making Gemini API call with web search...\n');
    
    const response = await (gemini as any).models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: extractionPrompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        generationConfig: {
          maxOutputTokens: 3000,
        }
      }
    });

    const text = response.text;
    
    console.log('📄 RAW RESPONSE:');
    console.log('=' .repeat(80));
    console.log(text);
    console.log('=' .repeat(80));
    
    // Parse the structured response
    const titleMatch = text.match(/TITLE:\s*(.+)/);
    const authorMatch = text.match(/AUTHOR:\s*(.+)/);
    const publicationMatch = text.match(/PUBLICATION:\s*(.+)/);
    const contentMatch = text.match(/CONTENT:\s*([\s\S]+)/);
    
    console.log('\n📊 PARSED RESULTS:');
    console.log(`Title: ${titleMatch ? titleMatch[1].trim() : 'NOT FOUND'}`);
    console.log(`Author: ${authorMatch ? authorMatch[1].trim() : 'NOT FOUND'}`);
    console.log(`Publication: ${publicationMatch ? publicationMatch[1].trim() : 'NOT FOUND'}`);
    console.log(`Content Length: ${contentMatch ? contentMatch[1].trim().length : 0} characters`);
    
    if (contentMatch) {
      console.log('\n📝 CONTENT PREVIEW (first 500 chars):');
      console.log(contentMatch[1].trim().substring(0, 500) + '...');
    }
    
  } catch (error) {
    console.error('❌ Error during extraction:', error);
  }
}

testArticleExtraction(); 