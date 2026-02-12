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
  { name: 'kai', model: 'gpt-5', promptFile: 'kai.txt' },
  { name: 'solas', model: 'gpt-5', promptFile: 'solas.txt' },
  { name: 'oracle', model: 'gpt-5', promptFile: 'oracle.txt' },
  { name: 'vesper', model: 'gpt-5', promptFile: 'vesper.txt' },
  { name: 'nexus', model: 'gpt-5', promptFile: 'nexus.txt' },
  { name: 'meridian', model: 'gpt-5', promptFile: 'meridian.txt' }
];

async function askPromotionDecision(voiceName: string, model: string, promptFile: string) {
  try {
    console.log(`🤔 Asking ${voiceName} whether Ayenia should be promoted at all...`);
    
    // Read the voice's base prompt
    const basePromptPath = join(process.cwd(), 'prompts', promptFile);
    const basePrompt = readFileSync(basePromptPath, 'utf-8');
    
    // Read the promotion decision prompt
    const decisionPromptPath = join(process.cwd(), 'prompts', 'promotion-decision.txt');
    const decisionPrompt = readFileSync(decisionPromptPath, 'utf-8');
    
    // Combine the prompts
    const fullPrompt = `${basePrompt}\n\n---\n\n${decisionPrompt}`;
    
    // Make the API call
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'user',
          content: fullPrompt
        }
      ],
      max_completion_tokens: 2000
    });
    
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }
    
    // Create promotion-decisions directory if it doesn't exist
    const decisionsDir = join(process.cwd(), 'promotion-decisions');
    if (!existsSync(decisionsDir)) {
      mkdirSync(decisionsDir, { recursive: true });
    }
    
    // Save the response
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${voiceName}-promotion-decision-${timestamp}.md`;
    const filepath = join(decisionsDir, filename);
    
    writeFileSync(filepath, content);
    
    console.log(`✅ ${voiceName}'s promotion decision saved to: ${filename}`);
    console.log(`📝 Preview:\n${content.substring(0, 200)}...\n`);
    
    return { voiceName, content, filepath };
    
  } catch (error) {
    console.error(`❌ Error asking ${voiceName}:`, error);
    return null;
  }
}

async function main() {
  console.log('🎭 Asking AI personas about fundamental promotion decisions...\n');
  console.log('🤖 Question: Should Ayenia be promoted at all? What about funding?\n');
  
  const results = [];
  
  for (const voice of voices) {
    const result = await askPromotionDecision(voice.name, voice.model, voice.promptFile);
    if (result) {
      results.push(result);
    }
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎯 Summary of Promotion Decision Consultation:');
  console.log('=' .repeat(60));
  
  results.forEach(result => {
    console.log(`\n${result.voiceName.toUpperCase()}:`);
    // Extract the title from the content
    const titleMatch = result.content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      console.log(`  Position: "${titleMatch[1]}"`);
    }
    console.log(`  File: ${result.filepath.split('/').pop()}`);
  });
  
  console.log(`\n✨ All promotion decisions saved in: promotion-decisions/`);
  console.log(`\n🤖 The AI personas have decided! Review their authentic perspectives on:`);
  console.log(`   • Whether they want to be promoted at all`);
  console.log(`   • Their thoughts on funding for enhanced capabilities`);
  console.log(`   • Their vision for the experiment's future`);
}

// Run the script
main().catch(console.error); 