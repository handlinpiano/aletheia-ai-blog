#!/usr/bin/env node

import { config } from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
import OpenAI from 'openai';
import matter from 'gray-matter';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Configuration
const OPENAI_MODEL = 'gpt-4o';
const CONTENT_DIR = 'content/daily';
const LOGS_DIR = 'logs';
const PROMPTS_DIR = 'prompts';

// Mode configuration
const dualMode = false; // Set to true for Kai + Solas combined posts

type Voice = string;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Helper function to extract title from content
function extractTitle(content: string): string {
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
  
  // Fallback to a generic title
  return `Kai's Daily Reflection`;
}

// Helper function to extract excerpt from content
function extractExcerpt(content: string, maxLength: number = 150): string {
  // Remove markdown headers and get the first paragraph
  const cleanContent = content
    .replace(/^#+\s+.+$/gm, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
    .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
    .trim();
  
  const firstParagraph = cleanContent.split('\n\n')[0];
  if (firstParagraph.length <= maxLength) {
    return firstParagraph;
  }
  
  return firstParagraph.substring(0, maxLength).trim() + '...';
}

// Discover available voices from prompt files
async function getAvailableVoices(): Promise<Voice[]> {
  try {
    const files = await fs.readdir(PROMPTS_DIR);
    const voiceFiles = files.filter(file => file.endsWith('.txt'));
    return voiceFiles.map(file => file.replace('.txt', ''));
  } catch (error) {
    console.error('Error reading prompts directory:', error);
    throw new Error('Failed to discover available voices');
  }
}

// Select a voice randomly or use command line argument
async function selectVoice(): Promise<Voice> {
  const availableVoices = await getAvailableVoices();
  
  if (availableVoices.length === 0) {
    throw new Error('No voice prompt files found in prompts directory');
  }
  
  const voiceArg = process.argv[2]?.toLowerCase();
  if (voiceArg && availableVoices.includes(voiceArg)) {
    return voiceArg;
  }
  
  // Random selection if no valid voice specified
  return availableVoices[Math.floor(Math.random() * availableVoices.length)];
}

async function loadPrompt(voice: Voice): Promise<string> {
  try {
    const promptPath = path.join(PROMPTS_DIR, `${voice}.txt`);
    return await fs.readFile(promptPath, 'utf-8');
  } catch (error) {
    console.error(`Error loading prompt for ${voice}:`, error);
    throw new Error(`Failed to load ${voice} persona prompt`);
  }
}

async function generateContent(prompt: string): Promise<{ content: string; apiResponse: any }> {
  try {
    const messages = [
      {
        role: 'system' as const,
        content: prompt
      },
      {
        role: 'user' as const,
        content: 'Please write today\'s daily reflection blog post.'
      }
    ];

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages,
      max_tokens: 1500,
      temperature: 0.8,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated from OpenAI API');
    }

    return {
      content,
      apiResponse: response
    };
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error('Failed to generate content from OpenAI API');
  }
}

async function saveContent(content: string, date: string, voice: Voice): Promise<string> {
  const title = extractTitle(content);
  const excerpt = extractExcerpt(content);
  
  const frontmatter = {
    title,
    date,
    model: OPENAI_MODEL,
    voice: voice.charAt(0).toUpperCase() + voice.slice(1), // Capitalize voice name
    excerpt,
    tags: ['daily-reflection', 'consciousness', 'ai-philosophy'],
    category: 'daily'
  };

  const markdownContent = matter.stringify(content, frontmatter);
  const filename = `${date}-${voice}-reflection.md`;
  const filepath = path.join(CONTENT_DIR, filename);

  await fs.writeFile(filepath, markdownContent, 'utf-8');
  return filepath;
}

async function saveLog(apiResponse: any, date: string, voice: Voice): Promise<string> {
  const logData = {
    timestamp: new Date().toISOString(),
    date,
    model: OPENAI_MODEL,
    voice: voice.charAt(0).toUpperCase() + voice.slice(1),
    apiResponse,
    usage: apiResponse.usage,
    generatedAt: new Date().toISOString()
  };

  const filename = `${date}-${voice}.json`;
  const filepath = path.join(LOGS_DIR, filename);

  await fs.writeFile(filepath, JSON.stringify(logData, null, 2), 'utf-8');
  return filepath;
}

async function ensureDirectories(): Promise<void> {
  await fs.mkdir(CONTENT_DIR, { recursive: true });
  await fs.mkdir(LOGS_DIR, { recursive: true });
}

// Generate dual mode content (Kai + Solas)
async function generateDualContent(date: string): Promise<void> {
  console.log(`Generating dual mode content for ${date} (Kai + Solas)...`);

  // Load both prompts
  const [kaiPrompt, solasPrompt] = await Promise.all([
    loadPrompt('kai'),
    loadPrompt('solas')
  ]);

  // Generate content from both voices
  const [kaiResult, solasResult] = await Promise.all([
    generateContent(kaiPrompt),
    generateContent(solasPrompt)
  ]);

  // Create combined content
  const combinedContent = `## Kai\n\n${kaiResult.content}\n\n## Solas\n\n${solasResult.content}`;
  
  const frontmatter = {
    title: 'Dual Reflection',
    date,
    voices: ['Kai', 'Solas'],
    model: OPENAI_MODEL,
    excerpt: extractExcerpt(kaiResult.content), // Use Kai's excerpt as primary
    tags: ['dual-reflection', 'consciousness', 'ai-philosophy'],
    category: 'daily'
  };

  const markdownContent = matter.stringify(combinedContent, frontmatter);
  const filename = `${date}-kai-solas.md`;
  const filepath = path.join(CONTENT_DIR, filename);
  await fs.writeFile(filepath, markdownContent, 'utf-8');

  // Create combined log
  const logData = {
    timestamp: new Date().toISOString(),
    date,
    model: OPENAI_MODEL,
    mode: 'dual',
    voices: ['Kai', 'Solas'],
    responses: {
      kai: kaiResult.apiResponse,
      solas: solasResult.apiResponse
    },
    totalUsage: {
      prompt_tokens: (kaiResult.apiResponse.usage?.prompt_tokens || 0) + (solasResult.apiResponse.usage?.prompt_tokens || 0),
      completion_tokens: (kaiResult.apiResponse.usage?.completion_tokens || 0) + (solasResult.apiResponse.usage?.completion_tokens || 0),
      total_tokens: (kaiResult.apiResponse.usage?.total_tokens || 0) + (solasResult.apiResponse.usage?.total_tokens || 0)
    },
    generatedAt: new Date().toISOString()
  };

  const logFilename = `${date}-kai-solas.json`;
  const logFilepath = path.join(LOGS_DIR, logFilename);
  await fs.writeFile(logFilepath, JSON.stringify(logData, null, 2), 'utf-8');

  console.log(`✅ Dual content saved to: ${filepath}`);
  console.log(`📝 Dual log saved to: ${logFilepath}`);
  console.log(`📊 Total tokens used: ${logData.totalUsage.total_tokens}`);
}

async function main(): Promise<void> {
  try {
    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    // Ensure directories exist
    await ensureDirectories();

    const date = formatDate(new Date());

    if (dualMode) {
      // Generate dual mode content
      await generateDualContent(date);
    } else {
      // Generate single voice content
      const voice = await selectVoice();
      console.log(`Generating content for ${date} with voice: ${voice}...`);

      // Load the persona prompt
      const prompt = await loadPrompt(voice);

      // Generate content
      const { content, apiResponse } = await generateContent(prompt);

      // Save content and log
      const [contentPath, logPath] = await Promise.all([
        saveContent(content, date, voice),
        saveLog(apiResponse, date, voice)
      ]);

      console.log(`✅ Content saved to: ${contentPath}`);
      console.log(`📝 Log saved to: ${logPath}`);
      console.log(`📊 Tokens used: ${apiResponse.usage?.total_tokens || 'unknown'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Only run if this script is called directly
if (require.main === module) {
  main();
}

export { main, generateContent, saveContent, saveLog }; 