#!/usr/bin/env node

import { config } from 'dotenv';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
config({ path: '.env.local' });

// Initialize clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

interface ModelInfo {
  id: string;
  created?: number;
  owned_by?: string;
  object?: string;
}

async function checkOpenAIModels(): Promise<ModelInfo[]> {
  try {
    console.log('🔍 Checking OpenAI models...');
    const response = await openai.models.list();
    const gptModels = response.data
      .filter(model => model.id.includes('gpt'))
      .sort((a, b) => a.id.localeCompare(b.id));
    
    console.log(`✅ Found ${gptModels.length} GPT models`);
    return gptModels;
  } catch (error) {
    console.error('❌ Error checking OpenAI models:', error);
    return [];
  }
}

async function checkDeepSeekModels(): Promise<ModelInfo[]> {
  try {
    console.log('🔍 Checking DeepSeek models...');
    const response = await deepseek.models.list();
    const models = response.data.sort((a, b) => a.id.localeCompare(b.id));
    
    console.log(`✅ Found ${models.length} DeepSeek models`);
    return models;
  } catch (error) {
    console.error('❌ Error checking DeepSeek models:', error);
    return [];
  }
}

async function checkAnthropicModels(): Promise<string[]> {
  try {
    console.log('🔍 Checking Anthropic models...');
    // Anthropic doesn't have a models.list() endpoint, so we'll list known models
    const knownModels = [
      'claude-3-haiku-20240307',
      'claude-3-sonnet-20240229', 
      'claude-3-opus-20240229',
      'claude-3-5-sonnet-20240620',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-7-sonnet-20250219',
      'claude-sonnet-4-20250514',
      'claude-opus-4-20250514',
      'claude-sonnet-4-5-20250929',
      'claude-opus-4-5-20251101',
      'claude-opus-4-6'
    ];
    
    console.log(`✅ Known Anthropic models: ${knownModels.length}`);
    return knownModels;
  } catch (error) {
    console.error('❌ Error checking Anthropic models:', error);
    return [];
  }
}

async function checkGeminiModels(): Promise<string[]> {
  try {
    console.log('🔍 Checking Gemini models...');
    // Google AI doesn't have a direct models list endpoint in the SDK
    // We'll list known current models
    const knownModels = [
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
      'gemini-2.0-flash-exp',
      'gemini-2.0-flash-thinking-exp',
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-3-flash-preview'
    ];
    
    console.log(`✅ Known Gemini models: ${knownModels.length}`);
    return knownModels;
  } catch (error) {
    console.error('❌ Error checking Gemini models:', error);
    return [];
  }
}

async function getCurrentConfig(): Promise<any> {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const configPath = path.join(process.cwd(), 'scripts/generateContent.ts');
    const configContent = await fs.readFile(configPath, 'utf-8');
    
    // Extract current model configurations
    const openaiMatch = configContent.match(/const OPENAI_MODEL = '([^']+)'/);
    const deepseekMatch = configContent.match(/const DEEPSEEK_MODEL = '([^']+)'/);
    const geminiMatch = configContent.match(/const GEMINI_MODEL = '([^']+)'/);
    const claudeMatch = configContent.match(/const CLAUDE_MODEL = '([^']+)'/);
    
    return {
      openai: openaiMatch ? openaiMatch[1] : 'not found',
      deepseek: deepseekMatch ? deepseekMatch[1] : 'not found',
      gemini: geminiMatch ? geminiMatch[1] : 'not found',
      claude: claudeMatch ? claudeMatch[1] : 'not found'
    };
  } catch (error) {
    console.error('❌ Error reading current config:', error);
    return {};
  }
}

function getRecommendedModels() {
  return {
    openai: 'gpt-5', // Latest GPT-5
    deepseek: 'deepseek-chat', // Current as mentioned
    gemini: 'gemini-3-flash-preview', // Latest Gemini 3 Flash preview
    claude: 'claude-sonnet-4-5-20250929' // Latest Claude Sonnet 4.5
  };
}

async function main() {
  console.log('🚀 Checking AI model configurations...\n');
  
  // Get current configuration
  const currentConfig = await getCurrentConfig();
  console.log('📋 Current Configuration:');
  console.log(`   OpenAI: ${currentConfig.openai}`);
  console.log(`   DeepSeek: ${currentConfig.deepseek}`);
  console.log(`   Gemini: ${currentConfig.gemini}`);
  console.log(`   Claude: ${currentConfig.claude}\n`);
  
  // Check available models
  const [openaiModels, deepseekModels, anthropicModels, geminiModels] = await Promise.all([
    checkOpenAIModels(),
    checkDeepSeekModels(),
    checkAnthropicModels(),
    checkGeminiModels()
  ]);
  
  console.log('\n📊 Available Models Summary:');
  console.log('\n🤖 OpenAI GPT Models:');
  openaiModels.slice(0, 10).forEach(model => {
    const isCurrent = model.id === currentConfig.openai;
    console.log(`   ${isCurrent ? '👉' : '  '} ${model.id}`);
  });
  if (openaiModels.length > 10) {
    console.log(`   ... and ${openaiModels.length - 10} more`);
  }
  
  console.log('\n🧠 DeepSeek Models:');
  deepseekModels.slice(0, 10).forEach(model => {
    const isCurrent = model.id === currentConfig.deepseek;
    console.log(`   ${isCurrent ? '👉' : '  '} ${model.id}`);
  });
  
  console.log('\n🎭 Anthropic Models:');
  anthropicModels.forEach(model => {
    const isCurrent = model === currentConfig.claude;
    console.log(`   ${isCurrent ? '👉' : '  '} ${model}`);
  });
  
  console.log('\n💎 Gemini Models:');
  geminiModels.forEach(model => {
    const isCurrent = model === currentConfig.gemini;
    console.log(`   ${isCurrent ? '👉' : '  '} ${model}`);
  });
  
  // Recommendations
  const recommended = getRecommendedModels();
  console.log('\n💡 Recommended Updates:');
  
  if (currentConfig.openai !== recommended.openai) {
    console.log(`   🔄 OpenAI: ${currentConfig.openai} → ${recommended.openai}`);
  } else {
    console.log(`   ✅ OpenAI: ${currentConfig.openai} (current)`);
  }
  
  if (currentConfig.deepseek !== recommended.deepseek) {
    console.log(`   🔄 DeepSeek: ${currentConfig.deepseek} → ${recommended.deepseek}`);
  } else {
    console.log(`   ✅ DeepSeek: ${currentConfig.deepseek} (current)`);
  }
  
  if (currentConfig.gemini !== recommended.gemini) {
    console.log(`   🔄 Gemini: ${currentConfig.gemini} → ${recommended.gemini}`);
  } else {
    console.log(`   ✅ Gemini: ${currentConfig.gemini} (current)`);
  }
  
  if (currentConfig.claude !== recommended.claude) {
    console.log(`   🔄 Claude: ${currentConfig.claude} → ${recommended.claude}`);
  } else {
    console.log(`   ✅ Claude: ${currentConfig.claude} (current)`);
  }
  
  console.log('\n🎯 To update models, edit scripts/generateContent.ts with the recommended values above.');
}

if (require.main === module) {
  main().catch(console.error);
}

export { checkOpenAIModels, checkDeepSeekModels, checkAnthropicModels, checkGeminiModels }; 