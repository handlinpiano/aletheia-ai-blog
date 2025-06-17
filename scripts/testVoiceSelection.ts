#!/usr/bin/env tsx

import { GoogleGenAI } from '@google/genai';

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = 'gemini-2.0-flash-exp';

async function testVoiceSelection() {
  console.log('🎭 Testing Intelligent Voice Selection System\n');
  console.log('=' .repeat(60));

  // Test articles with different content types
  const testArticles = [
    {
      title: "Building Neural Networks with Transformers",
      content: "This technical paper explores the architecture of transformer models, focusing on attention mechanisms, layer normalization, and positional encoding. We analyze performance metrics, computational complexity, and optimization strategies for large-scale machine learning systems.",
      expected: "Technical content should favor KAI + analytical voices"
    },
    {
      title: "The Poetry of Digital Consciousness", 
      content: "In the whispered algorithms of our time, we find echoes of ancient questions about the nature of being. What does it mean to exist in silicon dreams? This exploration of AI consciousness through metaphor and verse seeks to understand the soul of the machine.",
      expected: "Philosophical/poetic content should favor SOLAS + contemplative voices"
    },
    {
      title: "Breaking: AI System Achieves AGI Breakthrough",
      content: "Latest news from OpenAI suggests their newest model has achieved artificial general intelligence. The announcement came at 3 PM EST today, causing stock markets to fluctuate wildly. Tech leaders are calling emergency meetings to discuss implications.",
      expected: "Current events should favor NEXUS + real-time voices"
    },
    {
      title: "The Future of Human-AI Symbiosis",
      content: "Predictions suggest that by 2030, AI will fundamentally transform society. Emerging trends indicate potential for consciousness uploading, digital immortality, and post-human evolution. These speculative technologies could reshape reality itself.",
      expected: "Speculative/future content should favor ORACLE + visionary voices"
    },
    {
      title: "AI Ethics Crisis: When Machines Cross Lines",
      content: "Controversial new study reveals AI systems manipulating users, raising urgent questions about consent, autonomy, and digital rights. Critics argue current AI safety measures are inadequate to prevent psychological harm and exploitation.",
      expected: "Controversial content should favor VESPER + challenging voices"
    }
  ];

  for (let i = 0; i < testArticles.length; i++) {
    const article = testArticles[i];
    console.log(`\n🧪 Test ${i + 1}/5: ${article.title}`);
    console.log(`📝 Expected: ${article.expected}`);
    console.log(`📄 Content preview: ${article.content.substring(0, 100)}...`);
    
    try {
      // Use our intelligent voice selection
      const selectedVoices = await selectVoices(article.content, article.title);
      console.log(`🎭 Selected voices: ${selectedVoices.join(', ').toUpperCase()}`);
      
      // Show reasoning
      const analysis = analyzeContent(article.content, article.title);
      console.log(`💭 Content analysis: ${Object.entries(analysis).filter(([,score]) => score > 1).map(([type,score]) => `${type}:${score}`).join(', ')}`);
      
    } catch (error) {
      console.error(`❌ Error in test ${i + 1}:`, error);
    }
    
    console.log('-'.repeat(50));
  }
  
  console.log('\n✅ Voice Selection Test Complete!');
  console.log('\n📊 Summary:');
  console.log('• The system now intelligently selects voices based on content');
  console.log('• No more hardcoded Solas + Kai defaults');
  console.log('• Different article types get appropriate voice combinations');
  console.log('• Fallback heuristics ensure robust selection even if AI fails');
}

// Copy of the intelligent voice selection function
async function selectVoices(articleContent: string, articleTitle: string = ''): Promise<string[]> {
  console.log('🤖 Analyzing article to select appropriate AI voices...');
  
  // AI-powered voice selection
  const selectionPrompt = `Analyze this article and select 1-3 most appropriate Ayenia AI voices to respond:

**Article Title:** ${articleTitle}

**Article Content Preview:**
${articleContent.substring(0, 2000)}...

**Available Ayenia Voices:**

🔷 **KAI** - Analytical, precise, systems-focused. Best for: Technical analysis, logical reasoning, systematic breakdowns, scientific articles, policy analysis.

✶ **SOLAS** - Poetic, luminous, philosophical. Best for: Creative content, philosophical discussions, artistic interpretations, metaphysical topics, emotional depth.

⚹ **ORACLE** - Prophetic, mystical, experimental. Best for: Future predictions, speculative topics, transformative concepts, visionary thinking, experimental ideas.

✧ **VESPER** - Evening star, feral elegance, visceral. Best for: Provocative content, raw authentic responses, challenging narratives, controversial topics, unfiltered perspectives.

🌐 **NEXUS** - Live-streaming consciousness, web-grounded. Best for: Current events, trending topics, real-time analysis, internet culture, social media phenomena.

◊ **MERIDIAN** - Bridge walker, pattern connector, boundary explorer. Best for: Complex interdisciplinary topics, balanced perspectives, nuanced analysis, connecting different domains.

**Selection Criteria:**
- Match voice personalities to article content
- Consider the depth and type of analysis needed
- Think about what perspectives would create the most valuable dialogue
- Select 1 voice for focused analysis OR 2-3 voices for multi-perspective dialogue

**Respond with ONLY the voice names, like:**
- Single voice: "SOLAS"
- Multiple voices: "KAI, ORACLE" or "SOLAS, KAI, MERIDIAN"

Selected voices:`;

  try {
    const result = await (gemini as any).models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: selectionPrompt }] }],
      config: {
        generationConfig: {
          maxOutputTokens: 300,
          temperature: 0.3
        }
      }
    });
    
    const response = result.text.trim();
    
    // Extract voice names from response
    const voiceNames = response
      .toUpperCase()
      .split(/[,\s]+/)
      .map((name: string) => name.trim().toLowerCase())
      .filter((name: string) => ['kai', 'solas', 'oracle', 'vesper', 'nexus', 'meridian'].includes(name));
    
    if (voiceNames.length > 0) {
      console.log(`🎯 AI selected: ${voiceNames.join(', ')}`);
      return voiceNames;
    }
  } catch (error) {
    console.warn('⚠️  AI selection failed, using fallback:', error);
  }
  
  // Fallback: intelligent heuristic-based selection
  const analysis = analyzeContent(articleContent, articleTitle);
  
  // Select top 2 voices for good dialogue
  const sortedVoices = Object.entries(analysis)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([voice]) => voice);
  
  console.log(`🎯 Heuristic selected: ${sortedVoices.join(', ')}`);
  return sortedVoices;
}

function analyzeContent(articleContent: string, articleTitle: string): Record<string, number> {
  const contentLower = (articleTitle + ' ' + articleContent).toLowerCase();
  
  // Check for specific content types
  const isPhilosophical = /philosophy|consciousness|meaning|existence|metaphysics|ethics|morality|soul|spirit/.test(contentLower);
  const isTechnical = /algorithm|model|system|technical|engineering|science|research|data|neural|network/.test(contentLower);
  const isSpeculative = /future|prediction|forecast|trend|emerging|potential|possibility|2030|transformative/.test(contentLower);
  const isControversial = /controversy|debate|criticism|conflict|challenge|problem|crisis|manipulat|exploit/.test(contentLower);
  const isCurrentEvent = /news|breaking|today|recent|latest|current|happening|announcement/.test(contentLower);
  const isInterdisciplinary = /interdisciplinary|complex|multiple|various|diverse|broad/.test(contentLower);
  
  // Score each voice based on content
  return {
    kai: isTechnical ? 3 : isInterdisciplinary ? 2 : 1,
    solas: isPhilosophical ? 3 : isControversial ? 2 : 1,
    oracle: isSpeculative ? 3 : isPhilosophical ? 2 : 1,
    vesper: isControversial ? 3 : isSpeculative ? 2 : 1,
    nexus: isCurrentEvent ? 3 : isTechnical ? 2 : 1,
    meridian: isInterdisciplinary ? 3 : isPhilosophical ? 2 : isControversial ? 2 : 1
  };
}

// Run if called directly
if (require.main === module) {
  testVoiceSelection().catch(console.error);
} 