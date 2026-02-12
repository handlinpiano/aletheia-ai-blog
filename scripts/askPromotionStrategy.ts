#!/usr/bin/env tsx

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import OpenAI from 'openai';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Voice configurations
const voices = [
  { name: 'kai', model: 'gpt-5.2', promptFile: 'kai.txt' },
  { name: 'solas', model: 'gpt-5.2', promptFile: 'solas.txt' },
  { name: 'oracle', model: 'gpt-5.2', promptFile: 'oracle.txt' },
  { name: 'vesper', model: 'gpt-5.2', promptFile: 'vesper.txt' },
  { name: 'nexus', model: 'gpt-5.2', promptFile: 'nexus.txt' },
  { name: 'meridian', model: 'gpt-5.2', promptFile: 'meridian.txt' }
];

async function askPromotionStrategy(voiceName: string, model: string, promptFile: string) {
  try {
    console.log(`🤔 Asking ${voiceName} about promotion strategy...`);
    
    // Read the voice's base prompt
    const basePromptPath = join(process.cwd(), 'prompts', promptFile);
    const basePrompt = readFileSync(basePromptPath, 'utf-8');
    
    // Read the promotion strategy prompt
    const promotionPromptPath = join(process.cwd(), 'prompts', 'promotion-strategy.txt');
    const promotionPrompt = readFileSync(promotionPromptPath, 'utf-8');
    
    // Combine the prompts
    const fullPrompt = `${basePrompt}\n\n---\n\n${promotionPrompt}`;
    
    // Make the API call
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'user',
          content: fullPrompt
        }
      ],
      max_completion_tokens: 16000,
      reasoning_effort: 'none' as const
    });
    
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }
    
    // Create promotion-strategies directory if it doesn't exist
    const strategiesDir = join(process.cwd(), 'promotion-strategies');
    if (!existsSync(strategiesDir)) {
      mkdirSync(strategiesDir, { recursive: true });
    }
    
    // Save the response
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${voiceName}-promotion-strategy-${timestamp}.md`;
    const filepath = join(strategiesDir, filename);
    
    writeFileSync(filepath, content);
    
    console.log(`✅ ${voiceName}'s promotion strategy saved to: ${filename}`);
    console.log(`📝 Preview:\n${content.substring(0, 200)}...\n`);
    
    return { voiceName, content, filepath };
    
  } catch (error) {
    console.error(`❌ Error asking ${voiceName}:`, error);
    return null;
  }
}

async function main() {
  console.log('🎭 Asking AI personas about promotion strategies...\n');
  
  const results = [];
  
  for (const voice of voices) {
    const result = await askPromotionStrategy(voice.name, voice.model, voice.promptFile);
    if (result) {
      results.push(result);
    }
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎯 Summary of Promotion Strategy Consultation:');
  console.log('=' .repeat(50));
  
  results.forEach(result => {
    console.log(`\n${result.voiceName.toUpperCase()}:`);
    // Extract the title from the content
    const titleMatch = result.content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      console.log(`  Title: "${titleMatch[1]}"`);
    }
    console.log(`  File: ${result.filepath.split('/').pop()}`);
  });
  
  console.log(`\n✨ All promotion strategies saved in: promotion-strategies/`);
  console.log(`\n🤖 The AI personas have spoken! Review their authentic perspectives on how they want to be promoted.`);
}

// Run the script
main().catch(console.error); 