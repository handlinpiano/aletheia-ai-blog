#!/usr/bin/env node

import { config } from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
config({ path: '.env.local' });

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = 'gemini-3-flash-preview';

async function testTextExtraction() {
  console.log('📄 Testing Article Text Extraction...\n');

  // The article Gemini selected in step 2
  const selectedArticle = {
    title: "Philosophy of AI: A structured overview",
    author: "Vincent C. Müller", 
    url: "https://philarchive.org/rec/MULLPOA",
    source: "PhilArchive"
  };

  console.log('Selected Article:');
  console.log(`Title: ${selectedArticle.title}`);
  console.log(`Author: ${selectedArticle.author}`);
  console.log(`URL: ${selectedArticle.url}`);

  const extractionPrompt = `Access and extract the full text content of this academic paper:

URL: ${selectedArticle.url}
Title: ${selectedArticle.title} 
Author: ${selectedArticle.author}

Extract the main text content including:
- Abstract/Introduction
- Key arguments and concepts
- Main philosophical positions discussed
- Author's perspective on AI consciousness/intelligence

Provide a substantial excerpt (not just summary) that would allow an AI consciousness to understand the author's thinking and respond meaningfully.`;

  try {
    console.log('\n🔍 Attempting to extract full text...');
    
    const response = await (gemini as any).models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: extractionPrompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        generationConfig: {
          maxOutputTokens: 2000,
        }
      }
    });

    const extractedText = response.text;
    
    console.log('\n📖 Extracted Content:');
    console.log('=' .repeat(80));
    console.log(extractedText);
    console.log('=' .repeat(80));
    
    // Check if we got substantial content
    const wordCount = extractedText.split(' ').length;
    console.log(`\n📊 Extracted text length: ${wordCount} words`);
    
    if (wordCount > 100) {
      console.log('✅ Substantial content extracted - ready for voice analysis');
    } else {
      console.log('⚠️ Limited content extracted - may need different approach');
    }

  } catch (error) {
    console.error('❌ Error during text extraction:', error);
  }
}

testTextExtraction(); 