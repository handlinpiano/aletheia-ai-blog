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
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].trim();
  }
  
  const h2Match = content.match(/^##\s+(.+)$/m);
  if (h2Match) {
    return h2Match[1].trim();
  }
  
  return `Development Reflection`;
}

// Helper function to extract excerpt from content
function extractExcerpt(content: string, maxLength: number = 150): string {
  const cleanContent = content
    .replace(/^#+\s+.+$/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .trim();
  
  const firstParagraph = cleanContent.split('\n\n')[0];
  if (firstParagraph.length <= maxLength) {
    return firstParagraph;
  }
  
  return firstParagraph.substring(0, maxLength).trim() + '...';
}

// Analyze codebase and gather project context
async function gatherProjectContext(): Promise<string> {
  const context = [];
  
  try {
    // 1. Analyze package.json for dependencies and scripts
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
    context.push(`## Project Dependencies & Scripts\n\`\`\`json\n${JSON.stringify({
      dependencies: packageJson.dependencies,
      devDependencies: packageJson.devDependencies,
      scripts: packageJson.scripts
    }, null, 2)}\n\`\`\``);

    // 2. Analyze recent content patterns
    const contentFiles = await fs.readdir(CONTENT_DIR);
    const recentFiles = contentFiles
      .filter(f => f.endsWith('.md'))
      .sort()
      .slice(-7); // Last 7 files
    
    const contentAnalysis = [];
    for (const file of recentFiles) {
      const content = await fs.readFile(path.join(CONTENT_DIR, file), 'utf-8');
      const parsed = matter(content);
      contentAnalysis.push({
        file,
        voice: parsed.data.voice,
        title: parsed.data.title,
        wordCount: parsed.content.split(' ').length,
        tags: parsed.data.tags
      });
    }
    
    context.push(`## Recent Content Analysis\n\`\`\`json\n${JSON.stringify(contentAnalysis, null, 2)}\n\`\`\``);

    // 3. Check current system configuration
    const configFiles = ['vercel.json', 'next.config.ts', 'tsconfig.json'];
    for (const configFile of configFiles) {
      try {
        const config = await fs.readFile(configFile, 'utf-8');
        context.push(`## ${configFile}\n\`\`\`json\n${config}\n\`\`\``);
      } catch (e) {
        // File might not exist, skip
      }
    }

    // 4. Analyze current voice prompts
    const promptFiles = await fs.readdir(PROMPTS_DIR);
    const voices = promptFiles.filter(f => f.endsWith('.txt')).map(f => f.replace('.txt', ''));
    context.push(`## Available Voices\n${voices.map(v => `- ${v}`).join('\n')}`);

    // 5. Check for recent logs to understand API usage
    try {
      const logFiles = await fs.readdir(LOGS_DIR);
      const recentLogs = logFiles.slice(-3); // Last 3 logs
      const logAnalysis = [];
      
      for (const logFile of recentLogs) {
        const logContent = JSON.parse(await fs.readFile(path.join(LOGS_DIR, logFile), 'utf-8'));
        logAnalysis.push({
          file: logFile,
          model: logContent.model,
          voice: logContent.voice,
          tokens: logContent.usage?.total_tokens || 0,
          timestamp: logContent.timestamp
        });
      }
      
      context.push(`## Recent API Usage\n\`\`\`json\n${JSON.stringify(logAnalysis, null, 2)}\n\`\`\``);
    } catch (e) {
      // Logs might not exist yet
    }

    // 6. Analyze the main generation script
    const mainScript = await fs.readFile('scripts/generateContent.ts', 'utf-8');
    const scriptLines = mainScript.split('\n').length;
    const hasRandomization = mainScript.includes('Math.random()');
    const supportsDualMode = mainScript.includes('dualMode');
    
    context.push(`## Generation Script Analysis\n- Lines of code: ${scriptLines}\n- Supports randomization: ${hasRandomization}\n- Supports dual mode: ${supportsDualMode}`);

  } catch (error) {
    context.push(`## Analysis Error\nError gathering context: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return context.join('\n\n');
}

// Generate development content with project context
async function generateDevContent(): Promise<{ content: string; apiResponse: any }> {
  try {
    // Load the Dev prompt
    const devPrompt = await fs.readFile(path.join(PROMPTS_DIR, 'dev.txt'), 'utf-8');
    
    // Gather current project context
    const projectContext = await gatherProjectContext();

    const messages = [
      {
        role: 'system' as const,
        content: devPrompt
      },
      {
        role: 'user' as const,
        content: `Here's the current state of the Aletheia project. Please write a development reflection analyzing the current state and suggesting improvements:

${projectContext}

Please write a development reflection blog post that analyzes this information and suggests concrete improvements or new directions for the project.`
      }
    ];

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages,
      max_tokens: 2000,
      temperature: 0.7,
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
    console.error('Error generating dev content:', error);
    throw new Error('Failed to generate development content from OpenAI API');
  }
}

// Save development content
async function saveDevContent(content: string, date: string): Promise<string> {
  const title = extractTitle(content);
  const excerpt = extractExcerpt(content);
  
  const frontmatter = {
    title,
    date,
    model: OPENAI_MODEL,
    voice: 'Dev',
    excerpt,
    tags: ['development', 'meta-analysis', 'ai-evolution', 'technical'],
    category: 'development'
  };

  const markdownContent = matter.stringify(content, frontmatter);
  const filename = `${date}-dev-reflection.md`;
  const filepath = path.join(CONTENT_DIR, filename);

  await fs.writeFile(filepath, markdownContent, 'utf-8');
  return filepath;
}

// Save development log
async function saveDevLog(apiResponse: any, date: string): Promise<string> {
  const logData = {
    timestamp: new Date().toISOString(),
    date,
    model: OPENAI_MODEL,
    voice: 'Dev',
    type: 'development_reflection',
    apiResponse,
    usage: apiResponse.usage,
    generatedAt: new Date().toISOString()
  };

  const filename = `${date}-dev.json`;
  const filepath = path.join(LOGS_DIR, filename);

  await fs.writeFile(filepath, JSON.stringify(logData, null, 2), 'utf-8');
  return filepath;
}

// Ensure directories exist
async function ensureDirectories(): Promise<void> {
  await fs.mkdir(CONTENT_DIR, { recursive: true });
  await fs.mkdir(LOGS_DIR, { recursive: true });
}

// Main function
export async function generateDevReflection(): Promise<void> {
  try {
    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    // Ensure directories exist
    await ensureDirectories();

    const date = formatDate(new Date());
    console.log(`Generating development reflection for ${date}...`);

    // Generate content with project context
    const { content, apiResponse } = await generateDevContent();

    // Save content and log
    const [contentPath, logPath] = await Promise.all([
      saveDevContent(content, date),
      saveDevLog(apiResponse, date)
    ]);

    console.log(`✅ Dev content saved to: ${contentPath}`);
    console.log(`📝 Dev log saved to: ${logPath}`);
    console.log(`📊 Tokens used: ${apiResponse.usage?.total_tokens || 'unknown'}`);

  } catch (error) {
    console.error('❌ Error generating dev content:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

// Only run if this script is called directly
if (require.main === module) {
  generateDevReflection();
} 