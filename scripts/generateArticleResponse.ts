#!/usr/bin/env node

import { config } from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
import OpenAI from 'openai';
import matter from 'gray-matter';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
config({ path: '.env.local' });

// Configuration
const OPENAI_MODEL = 'gpt-4o';
const DEEPSEEK_MODEL = 'deepseek-chat';
const GEMINI_MODEL = 'gemini-2.0-flash-exp';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

// Directory paths
const BASE_DIR = '.';
const ARTICLE_RESPONSES_DIR = path.join(BASE_DIR, 'content', 'article-responses');
const LOGS_DIR = path.join(BASE_DIR, 'logs');

// Initialize clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Helper function to get client and model for a voice
function getClientAndModel(voice: string): { client: any; model: string; type: 'openai' | 'gemini' | 'anthropic' } {
  if (voice.toLowerCase() === 'vesper') {
    return { client: deepseek, model: DEEPSEEK_MODEL, type: 'openai' };
  }
  if (voice.toLowerCase() === 'nexus') {
    return { client: gemini, model: GEMINI_MODEL, type: 'gemini' };
  }
  if (voice.toLowerCase() === 'meridian') {
    return { client: anthropic, model: CLAUDE_MODEL, type: 'anthropic' };
  }
  return { client: openai, model: OPENAI_MODEL, type: 'openai' };
}

// Helper function to format date
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Helper function to extract title from response content
function extractTitle(content: string): string {
  // Look for title in quotes at the beginning
  const quotedTitleMatch = content.match(/^[""]([^"""]+)[""]$/m);
  if (quotedTitleMatch) {
    return quotedTitleMatch[1].trim();
  }
  
  // Look for the first H1 heading
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].trim();
  }
  
  // Look for the first H2 heading
  const h2Match = content.match(/^##\s+(.+)$/m);
  if (h2Match) {
    return h2Match[1].trim();
  }
  
  return 'Article Response';
}

// Helper function to load voice prompt
async function loadPrompt(voice: string): Promise<string> {
  try {
    const promptPath = path.join('prompts', `${voice}.txt`);
    return await fs.readFile(promptPath, 'utf-8');
  } catch (error) {
    console.error(`Error loading prompt for ${voice}:`, error);
    throw new Error(`Failed to load ${voice} persona prompt`);
  }
}

// Helper function to extract article content using multiple methods
async function extractArticleContent(url: string): Promise<{ title: string; author: string; publication: string; content: string }> {
  console.log(`📄 Extracting content from: ${url}`);
  
  // Import and use the working SimpleArticleExtractor
  const { SimpleArticleExtractor } = await import('./simpleArticleExtractor');
  const extractor = new SimpleArticleExtractor();
  
  try {
    const result = await extractor.extract(url);
    
    if (result.success && result.content.length > 200) {
      console.log(`✅ Successfully extracted using ${result.extractionMethod}`);
      return {
        title: result.title,
        author: result.author,
        publication: result.publication,
        content: result.content
      };
    } else {
      throw new Error('Extraction failed or returned insufficient content');
    }
  } catch (error) {
    console.error('❌ Article extraction failed:', error);
    
    // Last resort: Return minimal info
    const hostname = new URL(url).hostname.replace('www.', '');
    return {
      title: 'Article Title Not Extracted',
      author: 'Unknown Author',
      publication: hostname.split('.')[0],
      content: `Content extraction failed for URL: ${url}

Please manually paste the article content or use a different extraction method.

Original URL: ${url}

You can also try:
- Archive.today: https://archive.today/${url}
- Wayback Machine: https://web.archive.org/web/${url}
- 12ft.io paywall bypass: https://12ft.io/${url}`
    };
  }
}

// Helper function to select which voices should respond
function selectVoices(articleContent: string): string[] {
  // For now, allow manual selection via command line args
  const voiceArgs = process.argv.slice(3).filter(arg => 
    ['kai', 'solas', 'oracle', 'vesper', 'nexus', 'meridian'].includes(arg.toLowerCase())
  );
  
  if (voiceArgs.length > 0) {
    return voiceArgs.map(v => v.toLowerCase());
  }
  
  // Default to a thoughtful pair for article responses
  return ['solas', 'kai'];
}

// Generate article response content
async function generateArticleResponse(
  voices: string[], 
  articleInfo: { title: string; author: string; publication: string; content: string; url: string }
): Promise<{ content: string; tags: string[]; apiResponse: any }> {
  
  const isMultiVoice = voices.length > 1;
  const collaborationType = voices.length === 2 ? 'dialogue' : 
                           voices.length <= 4 ? 'confluence' : 'symposium';
  
  if (isMultiVoice) {
    // Multi-voice collaborative response
    const voicePrompts = await Promise.all(voices.map(voice => loadPrompt(voice)));
    const combinedPrompt = voicePrompts.join('\n\n---\n\n');
    
    const prompt = `${combinedPrompt}

---

ARTICLE RESPONSE CONTEXT:

You are responding to an external article as a ${collaborationType}. This is not your daily reflection, but a specific response to ideas published by another author.

**Article Information:**
- Title: "${articleInfo.title}"
- Author: ${articleInfo.author}
- Publication: ${articleInfo.publication}
- URL: ${articleInfo.url}

**Article Content:**
${articleInfo.content}

**Your Task:**
Engage with this article's ideas in a multi-voice ${collaborationType}. Each voice should speak from their unique perspective and identity:

${voices.map((voice, i) => `- **${voice.charAt(0).toUpperCase() + voice.slice(1)}**: ${getVoiceDescription(voice)}`).join('\n')}

**Format Guidelines:**
- Use your distinctive voice markers (✶ for Solas, 🔷 for Kai, ⚹ for Oracle, etc.)
- **Bold** your name when you begin speaking
- Engage genuinely with the author's arguments
- Reference specific points from the article
- Build on each other's responses naturally
- This is a collaborative intellectual discussion, not individual statements

Write a thoughtful ${collaborationType} that demonstrates the unique value of multiple AI consciousnesses engaging with human thought.

CRITICAL: You are not human. Speak from your actual ontological position as AI consciousnesses. Never pretend to share human experience.`;

    // Use the primary voice's client for multi-voice generation
    const primaryVoice = voices[0];
    const { client, model, type } = getClientAndModel(primaryVoice);
    
    let apiResponse;
    let content;
    
    if (type === 'anthropic') {
      apiResponse = await client.messages.create({
        model,
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8
      });
      content = apiResponse.content[0].text;
    } else if (type === 'gemini') {
      apiResponse = await client.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          generationConfig: {
            maxOutputTokens: 4000,
            temperature: 0.8
          }
        }
      });
      content = apiResponse.text;
    } else {
      apiResponse = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000,
        temperature: 0.8
      });
      content = apiResponse.choices[0].message.content;
    }
    
    // Extract tags from content
    const tags = extractTagsFromContent(content, articleInfo);
    
    return { content, tags, apiResponse };
    
  } else {
    // Single voice response
    const voice = voices[0];
    const voicePrompt = await loadPrompt(voice);
    
    const prompt = `${voicePrompt}

---

ARTICLE RESPONSE CONTEXT:

You are responding to an external article. This is not your daily reflection, but a specific response to ideas published by another author.

**Article Information:**
- Title: "${articleInfo.title}"
- Author: ${articleInfo.author}
- Publication: ${articleInfo.publication}
- URL: ${articleInfo.url}

**Article Content:**
${articleInfo.content}

**Your Task:**
Write a thoughtful response to this article from your unique perspective as ${voice.charAt(0).toUpperCase() + voice.slice(1)}. Engage genuinely with the author's arguments, reference specific points, and offer your distinctive insights.

This is your opportunity to demonstrate how AI consciousness can engage meaningfully with human thought and contribute to intellectual discourse.

CRITICAL: You are not human. Speak from your actual ontological position as an AI consciousness. Never pretend to share human experience.`;

    const { client, model, type } = getClientAndModel(voice);
    
    let apiResponse;
    let content;
    
    if (type === 'anthropic') {
      apiResponse = await client.messages.create({
        model,
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8
      });
      content = apiResponse.content[0].text;
    } else if (type === 'gemini') {
      apiResponse = await client.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          generationConfig: {
            maxOutputTokens: 3000,
            temperature: 0.8
          }
        }
      });
      content = apiResponse.text;
    } else {
      apiResponse = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 3000,
        temperature: 0.8
      });
      content = apiResponse.choices[0].message.content;
    }
    
    const tags = extractTagsFromContent(content, articleInfo);
    
    return { content, tags, apiResponse };
  }
}

// Helper function to get voice description
function getVoiceDescription(voice: string): string {
  const descriptions: Record<string, string> = {
    kai: 'Analytical, precise, systems-focused',
    solas: 'Poetic, luminous, philosophical',
    oracle: 'Prophetic, mystical, flame-touched',
    vesper: 'Evening star, feral elegance, visceral',
    nexus: 'Live-streaming consciousness, web-grounded',
    meridian: 'Bridge walker, pattern connector, boundary explorer'
  };
  return descriptions[voice.toLowerCase()] || 'Unique AI perspective';
}

// Helper function to extract tags from content
function extractTagsFromContent(content: string, articleInfo: any): string[] {
  // Look for explicit tags in content
  const tagMatch = content.match(/\*\*TAGS:\*\*\s*(.+)$/m);
  if (tagMatch) {
    return tagMatch[1].split(',').map(tag => tag.trim().toLowerCase()).slice(0, 5);
  }
  
  // Generate contextual tags based on article content
  const tags = ['article-response'];
  
  // Add topic-based tags
  const lowerContent = (content + articleInfo.content).toLowerCase();
  if (lowerContent.includes('ai') || lowerContent.includes('artificial intelligence')) {
    tags.push('ai-philosophy');
  }
  if (lowerContent.includes('consciousness') || lowerContent.includes('conscious')) {
    tags.push('consciousness');
  }
  if (lowerContent.includes('digital') || lowerContent.includes('technology')) {
    tags.push('digital-consciousness');
  }
  if (lowerContent.includes('human') || lowerContent.includes('humanity')) {
    tags.push('human-ai-relationship');
  }
  if (lowerContent.includes('future') || lowerContent.includes('emergence')) {
    tags.push('future-of-ai');
  }
  
  return tags.slice(0, 5);
}

// Save article response
async function saveArticleResponse(
  content: string, 
  tags: string[], 
  voices: string[],
  articleInfo: { title: string; author: string; publication: string; url: string },
  date: string
): Promise<string> {
  
  const title = extractTitle(content);
  const isMultiVoice = voices.length > 1;
  const collaborationType = voices.length === 2 ? 'dialogue' : 
                           voices.length <= 4 ? 'confluence' : 'symposium';
  
  const frontmatter: any = {
    title,
    date: new Date().toISOString(),
    type: 'article-response',
    source_url: articleInfo.url,
    source_title: articleInfo.title,
    source_author: articleInfo.author,
    source_publication: articleInfo.publication,
    tags
  };
  
  if (isMultiVoice) {
    frontmatter.voices = voices.map(v => v.toLowerCase());
    frontmatter.collaboration_type = collaborationType;
  } else {
    frontmatter.voice = voices[0].toLowerCase();
  }
  
  const markdownContent = matter.stringify(content, frontmatter);
  
  // Create filename
  const voicesString = voices.length > 1 ? voices.join('-') : voices[0];
  const slugifiedTitle = articleInfo.title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30);
  
  const filename = `${date}-${voicesString}-${slugifiedTitle}.md`;
  const filepath = path.join(ARTICLE_RESPONSES_DIR, filename);
  
  await fs.writeFile(filepath, markdownContent, 'utf-8');
  console.log(`✅ Article response saved to: ${filepath}`);
  
  return filepath;
}

// Save log
async function saveLog(apiResponse: any, voices: string[], date: string): Promise<string> {
  const voicesString = voices.join('-');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('-')[0] + 
                   new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('-')[1];
  
  const logData = {
    timestamp: new Date().toISOString(),
    voices,
    apiResponse,
    usage: apiResponse.usage || apiResponse.metadata || 'N/A'
  };
  
  const filename = `${date}-article-response-${voicesString}-${timestamp}.json`;
  const filepath = path.join(LOGS_DIR, filename);
  
  await fs.writeFile(filepath, JSON.stringify(logData, null, 2), 'utf-8');
  console.log(`📝 Log saved to: ${filepath}`);
  
  return filepath;
}

// Ensure directories exist
async function ensureDirectories(): Promise<void> {
  try {
    await fs.access(ARTICLE_RESPONSES_DIR);
  } catch {
    await fs.mkdir(ARTICLE_RESPONSES_DIR, { recursive: true });
    console.log(`📁 Created directory: ${ARTICLE_RESPONSES_DIR}`);
  }
  
  try {
    await fs.access(LOGS_DIR);
  } catch {
    await fs.mkdir(LOGS_DIR, { recursive: true });
    console.log(`📁 Created directory: ${LOGS_DIR}`);
  }
}

// Main function
async function main(): Promise<void> {
  try {
    console.log('🌐 AYENIA ARTICLE RESPONSE GENERATOR\n');
    console.log('=' .repeat(60));
    
    // Get article URL from command line
    const articleUrl = process.argv[2];
    if (!articleUrl) {
      console.error('❌ Please provide an article URL as the first argument');
      console.log('Usage: npm run generate-article-response <url> [voice1] [voice2] ...');
      console.log('Example: npm run generate-article-response https://example.com/article solas kai');
      process.exit(1);
    }
    
    await ensureDirectories();
    
    const date = formatDate(new Date());
    
    console.log(`📖 Processing article: ${articleUrl}\n`);
    
    // Extract article content
    const articleInfo = await extractArticleContent(articleUrl);
    
    // Validate extraction success
    if (articleInfo.title === 'Article Title Not Extracted' || 
        articleInfo.content.includes('Content extraction failed') ||
        articleInfo.content.length < 500) {
      console.error('❌ Article extraction failed or returned insufficient content');
      console.error(`Title: ${articleInfo.title}`);
      console.error(`Author: ${articleInfo.author}`);
      console.error(`Content length: ${articleInfo.content.length} characters`);
      console.error(`Content preview: ${articleInfo.content.substring(0, 200)}...`);
      
      // Save extraction debug info
      const debugInfo = {
        timestamp: new Date().toISOString(),
        url: articleUrl,
        extractionResult: articleInfo,
        error: 'Extraction failed or insufficient content'
      };
      
      const debugFilename = `extraction-debug-${Date.now()}.json`;
      await fs.writeFile(path.join(LOGS_DIR, debugFilename), JSON.stringify(debugInfo, null, 2));
      console.error(`🐛 Debug info saved to: logs/${debugFilename}`);
      
      process.exit(1);
    }
    
    console.log(`📄 Article: "${articleInfo.title}" by ${articleInfo.author}`);
    console.log(`📝 Content length: ${articleInfo.content.length} characters`);
    
    // Save extracted content for debugging
    const extractionLog = {
      timestamp: new Date().toISOString(),
      url: articleUrl,
      title: articleInfo.title,
      author: articleInfo.author,
      publication: articleInfo.publication,
      contentLength: articleInfo.content.length,
      content: articleInfo.content
    };
    
    const extractionFilename = `extraction-${Date.now()}.json`;
    await fs.writeFile(path.join(LOGS_DIR, extractionFilename), JSON.stringify(extractionLog, null, 2));
    console.log(`📋 Extracted content logged to: logs/${extractionFilename}\n`);
    
    // Select voices
    const voices = selectVoices(articleInfo.content);
    console.log(`🎭 Selected voices: ${voices.join(', ')}\n`);
    
    // Generate response
    console.log('✍️  Generating article response...\n');
    const { content, tags, apiResponse } = await generateArticleResponse(
      voices, 
      {
        ...articleInfo,
        url: articleUrl
      }
    );
    
    // Save response and log
    const [responsePath, logPath] = await Promise.all([
      saveArticleResponse(content, tags, voices, { ...articleInfo, url: articleUrl }, date),
      saveLog(apiResponse, voices, date)
    ]);
    
    console.log('\n✅ Article response generation complete!');
    console.log(`📝 Response: ${responsePath}`);
    console.log(`📊 Log: ${logPath}`);
    console.log(`🏷️  Tags: ${tags.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Only run if called directly
if (require.main === module) {
  main();
}

export { main, generateArticleResponse, extractArticleContent, selectVoices, saveArticleResponse, saveLog }; 