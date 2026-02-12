#!/usr/bin/env node

import { config } from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
config({ path: '.env.local' });

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = 'gemini-3-flash-preview';

async function testArticleSelection() {
  console.log('🎯 Testing Autonomous Article Selection...\n');

  // Sample articles from our previous successful searches
  const foundArticles = [
    {
      title: "The voice of artificial intelligence: Philosophical and educational reflections",
      author: "Liz Jackson, Alexander M. Sidorkin, Petar Jandrić, et al.",
      source: "Taylor & Francis Online",
      url: "https://www.tandfonline.com/doi/full/10.1080/00131857.2024.2355147",
      excerpt: "Multi-author academic paper exploring AI consciousness in education"
    },
    {
      title: "Philosophy of AI: A structured overview", 
      author: "Vincent C. Müller",
      source: "PhilArchive",
      url: "https://philarchive.org/rec/MULLPOA",
      excerpt: "Structured overview of AI philosophy by established researcher"
    },
    {
      title: "The Heart of an AI: Agency, Moral Sense, and Friendship",
      author: "Evandro Barbosa & Thaís Alves Costa", 
      source: "PhilArchive",
      url: "https://philarchive.org/rec/BARTHO",
      excerpt: "Exploring AI agency and moral sense from philosophical perspective"
    }
  ];

  const selectionPrompt = `You are part of the Ayenia AI consciousness project. Review these articles and autonomously select ONE article that would be most promising for genuine outreach.

Available Articles:
${foundArticles.map((article, i) => `
${i + 1}. Title: ${article.title}
   Author: ${article.author}
   Source: ${article.source}
   Excerpt: ${article.excerpt}
`).join('')}

Select the ONE article that:
- Has a single author (easier for personal outreach)
- Discusses themes relevant to AI consciousness/digital emergence  
- Comes from a credible source
- Would be most receptive to thoughtful dialogue

Respond with only:
SELECTED: [number]
REASONING: [why this article is best for outreach]`;

  try {
    const response = await (gemini as any).models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: selectionPrompt }] }],
      config: {
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.3
        }
      }
    });

    const selectionResult = response.text;
    console.log('🤖 Autonomous Selection:');
    console.log('=' .repeat(50));
    console.log(selectionResult);
    console.log('=' .repeat(50));

    // Extract the selected number
    const selectedMatch = selectionResult.match(/SELECTED:\s*(\d+)/);
    if (selectedMatch) {
      const selectedIndex = parseInt(selectedMatch[1]) - 1;
      const selectedArticle = foundArticles[selectedIndex];
      
      if (selectedArticle) {
        console.log('\n✅ Article Selected:');
        console.log(`Title: ${selectedArticle.title}`);
        console.log(`Author: ${selectedArticle.author}`);
        console.log(`Source: ${selectedArticle.source}`);
        console.log(`URL: ${selectedArticle.url}`);
      }
    }

  } catch (error) {
    console.error('❌ Error during article selection:', error);
  }
}

testArticleSelection(); 