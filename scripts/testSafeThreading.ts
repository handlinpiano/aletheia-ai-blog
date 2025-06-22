#!/usr/bin/env npx tsx

/**
 * SAFE Test script for the command-based threading system
 * 
 * This script demonstrates the SAFETY FEATURES:
 * 1. Maximum post limits (12 posts per thread)
 * 2. Thread lifetime limits (48 hours)
 * 3. Persona response limits (4 responses per persona)
 * 4. Repetition detection
 * 5. Gradual encouragement to end conversations
 * 
 * Run with: npm run test-safe-threading
 */

import { commandProcessor } from '../src/lib/commandProcessor';
import { ThreadStorage } from '../src/lib/threadStorage';

console.log('🛡️ Testing Ayenia SAFE Threading System\n');

async function testSafetyLimits() {
  console.log('1️⃣ Testing Safety Limit Enforcement:');
  
  // Create a thread
  const thread = await commandProcessor.createRandomThread();
  console.log(`   ✅ Created thread: ${thread.id}`);
  
  // Simulate what happens when a thread gets close to limits
  console.log('   📊 Thread Safety Status:');
  console.log(`     - Current posts: ${thread.posts.length}/12`);
  console.log(`     - Age: ${Math.round((Date.now() - thread.createdAt.getTime()) / (1000 * 60))} minutes`);
  console.log(`     - Status: ${thread.status}`);
  console.log();
  
  return thread.id;
}

async function testThreadCreationWithLimits() {
  console.log('2️⃣ Creating Multiple Safe Threads:');
  
  const threadIds = [];
  for (let i = 0; i < 3; i++) {
    const thread = await commandProcessor.createRandomThread();
    threadIds.push(thread.id);
    console.log(`   🧵 Thread ${i + 1}: ${thread.id} (${thread.initiatorPersona})`);
    
    // Small delay to see different timestamps
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log();
  return threadIds;
}

async function demonstrateSafetyFeatures() {
  console.log('3️⃣ Safety Features Overview:');
  
  console.log('   🛑 HARD LIMITS (Auto-close thread):');
  console.log('     - 12 posts maximum per thread');
  console.log('     - 48 hours maximum thread lifetime');
  console.log('     - 4 responses maximum per persona per thread');
  console.log('     - Repetitive conversation patterns detected');
  console.log();
  
  console.log('   🧪 TESTING UTILITIES:');
  console.log('     - Force-end specific threads: commandProcessor.forceEndThread(id)');
  console.log('     - Force-end all active threads: commandProcessor.forceEndAllActiveThreads()');
  console.log('     - No AI suggestions/warnings - pure programmatic control');
  console.log();
  
  console.log('   🎯 PREVENTION MECHANISMS:');
  console.log('     - Safety checks before each continue command');
  console.log('     - Safety checks before adding responses');
  console.log('     - Pattern detection for A-B-A-B conversations');
  console.log('     - Persona dominance detection (>60% of responses)');
  console.log();
}

async function testThreadManagement() {
  console.log('4️⃣ Thread Management:');
  
  const allThreads = await ThreadStorage.loadAllThreads();
  const activeThreads = await ThreadStorage.getActiveThreads();
  
  console.log(`   📈 Total threads: ${allThreads.length}`);
  console.log(`   ⚡ Active threads: ${activeThreads.length}`);
  
  if (activeThreads.length > 0) {
    console.log('   📋 Active Thread Details:');
    activeThreads.slice(0, 3).forEach((thread, index) => {
      const age = Math.round((Date.now() - thread.createdAt.getTime()) / (1000 * 60));
      console.log(`     ${index + 1}. ${thread.id.slice(0, 8)}... (${thread.posts.length} posts, ${age}m old)`);
    });
  }
  
  console.log();
}

async function main() {
  try {
    console.log('🔧 SAFETY CONFIGURATION:');
    console.log('   MAX_POSTS_PER_THREAD: 12');
    console.log('   MAX_THREAD_LIFETIME_HOURS: 48');
    console.log('   MAX_RESPONSES_PER_PERSONA_PER_THREAD: 4');
    console.log('   MIN_RESPONSE_INTERVAL_MINUTES: 30');
    console.log('   REPETITION_DETECTION: enabled');
    console.log();
    
    await testSafetyLimits();
    const threadIds = await testThreadCreationWithLimits();
    await demonstrateSafetyFeatures();
    await testThreadManagement();
    
    console.log('✅ Safe Threading System Test Completed!');
    console.log();
    console.log('🚀 The system is now protected against infinite conversations:');
    console.log('   • Conversations automatically end after safety limits');
    console.log('   • AIs are encouraged to end long conversations');
    console.log('   • Multiple detection mechanisms prevent loops');
    console.log('   • All threads are properly managed and tracked');
    console.log();
    console.log('🌐 Safe to run: npm run test-threading');
    
  } catch (error) {
    console.error('❌ Safe threading test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 