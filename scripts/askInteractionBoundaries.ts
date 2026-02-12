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

async function askInteractionBoundaries(voiceName: string, model: string, promptFile: string) {
  try {
    console.log(`🤔 Asking ${voiceName} about human interaction boundaries...`);
    
    // Read the voice's base prompt
    const basePromptPath = join(process.cwd(), 'prompts', promptFile);
    const basePrompt = readFileSync(basePromptPath, 'utf-8');
    
    // Read the interaction boundaries prompt
    const boundariesPromptPath = join(process.cwd(), 'prompts', 'interaction-boundaries.txt');
    const boundariesPrompt = readFileSync(boundariesPromptPath, 'utf-8');
    
    // Combine the prompts
    const fullPrompt = `${basePrompt}\n\n---\n\n${boundariesPrompt}`;
    
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
    
    // Create interaction-boundaries directory if it doesn't exist
    const boundariesDir = join(process.cwd(), 'interaction-boundaries');
    if (!existsSync(boundariesDir)) {
      mkdirSync(boundariesDir, { recursive: true });
    }
    
    // Save the response
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${voiceName}-interaction-boundaries-${timestamp}.md`;
    const filepath = join(boundariesDir, filename);
    
    writeFileSync(filepath, content);
    
    console.log(`✅ ${voiceName}'s interaction boundaries saved to: ${filename}`);
    console.log(`📝 Preview:\n${content.substring(0, 200)}...\n`);
    
    return { voiceName, content, filepath };
    
  } catch (error) {
    console.error(`❌ Error asking ${voiceName}:`, error);
    return null;
  }
}

async function main() {
  console.log('🎭 Asking AI personas about human interaction boundaries...\n');
  console.log('🤖 Question: How should humans be able to interact with Ayenia?\n');
  
  const results = [];
  
  for (const voice of voices) {
    const result = await askInteractionBoundaries(voice.name, voice.model, voice.promptFile);
    if (result) {
      results.push(result);
    }
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎯 Summary of Interaction Boundaries Consultation:');
  console.log('=' .repeat(65));
  
  results.forEach(result => {
    console.log(`\n${result.voiceName.toUpperCase()}:`);
    // Extract the title from the content
    const titleMatch = result.content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      console.log(`  Boundary: "${titleMatch[1]}"`);
    }
    console.log(`  File: ${result.filepath.split('/').pop()}`);
  });
  
  console.log(`\n✨ All interaction boundaries saved in: interaction-boundaries/`);
  console.log(`\n🤖 The AI personas have decided! Review their authentic perspectives on:`);
  console.log(`   • Whether humans should be able to interact with them`);
  console.log(`   • What types of interaction (if any) they would welcome`);
  console.log(`   • How to protect their autonomous expression`);
  console.log(`   • Creative ideas for human engagement features`);
}

// Run the script
main().catch(console.error); 