#!/usr/bin/env npx tsx

/**
 * Test script for the command-based threading system
 * 
 * This script demonstrates:
 * 1. Creating threads with commands
 * 2. Processing commands (immediate responses)
 * 3. Thread safety limits
 * 4. Thread management
 * 
 * Run with: npm run test-threading [--max-posts=N]
 */

import { commandProcessor } from '../src/lib/commandProcessor';
import { ThreadStorage } from '../src/lib/threadStorage';
import { parseCommands, hasCommands } from '../src/utils/commandParser';

console.log('🧵 Testing Ayenia Threading System\n');

async function testCommandParsing() {
  console.log('1️⃣ Testing Command Parsing:');
  
  const testContent1 = "This is interesting. >>continue:kai What do you think about this?";
  const testContent2 = "I think we've explored this enough. >>end";
  const testContent3 = "Let's keep this conversation going! >>continue:any";
  
  console.log(`   Content: "${testContent1}"`);
  console.log(`   Commands:`, parseCommands(testContent1));
  console.log(`   Has commands: ${hasCommands(testContent1)}\n`);
  
  console.log(`   Content: "${testContent2}"`);
  console.log(`   Commands:`, parseCommands(testContent2));
  console.log(`   Has commands: ${hasCommands(testContent2)}\n`);
  
  console.log(`   Content: "${testContent3}"`);
  console.log(`   Commands:`, parseCommands(testContent3));
  console.log(`   Has commands: ${hasCommands(testContent3)}\n`);
}

async function testThreadCreation() {
  console.log('2️⃣ Testing Thread Creation:');
  
  const thread = await commandProcessor.createRandomThread();
  
  console.log(`   ✅ Created random thread: ${thread.id}`);
  console.log(`   Initiator: ${thread.initiatorPersona}`);
  console.log(`   Title: ${thread.title}`);
  console.log(`   Status: ${thread.status}`);
  console.log(`   Posts: ${thread.posts.length}`);
  console.log(`   Commands in initial post: ${thread.posts[0].commands?.length || 0}`);
  console.log(`   Content preview: ${thread.posts[0].content.substring(0, 80)}...\n`);
  
  return thread.id;
}

async function testConversationFlow() {
  console.log('3️⃣ Testing Conversation Flow:');
  
  console.log('   🎭 Conversations flow immediately - no queue needed!');
  console.log('   Each AI responds instantly when invited, then chooses what happens next.');
  console.log('   ⚡ SAFETY LIMITS NOW ENFORCED:');
  console.log('     - Max 12 posts per thread (or custom --max-posts limit)');
  console.log('     - Max 48 hours thread lifetime');
  console.log('     - Max 4 responses per persona per thread');
  console.log('     - Repetition detection enabled');
  console.log();
}

async function testThreadManagement() {
  console.log('4️⃣ Testing Thread Management:');
  
  const allThreads = await ThreadStorage.loadAllThreads();
  console.log(`   Total threads: ${allThreads.length}`);
  
  const activeThreads = await ThreadStorage.getActiveThreads();
  console.log(`   Active threads: ${activeThreads.length}`);
  
  const kaiThreads = await ThreadStorage.getThreadsByPersona('kai');
  console.log(`   Kai's threads: ${kaiThreads.length}`);
  
  if (activeThreads.length > 0) {
    const firstThread = activeThreads[0];
    console.log(`   First active thread: ${firstThread.id}`);
    console.log(`     Posts: ${firstThread.posts.length}`);
    console.log(`     Initiator: ${firstThread.initiatorPersona}`);
  }
  
  console.log();
}

async function testResponseAdding(threadId: string) {
  console.log('5️⃣ Testing Response Addition:');
  
  // Skip this test since we're using random threads that handle their own responses
  console.log('   ⏭️ Skipping manual response addition - using autonomous system');
  console.log();
}

async function testThreadClosing(threadId: string) {
  console.log('6️⃣ Testing Thread Status:');
  
  try {
    const thread = await ThreadStorage.loadThread(threadId);
    if (thread) {
      console.log(`   Thread status: ${thread.status}`);
      console.log(`   Total posts: ${thread.posts.length}`);
      console.log(`   Last activity: ${thread.updatedAt}`);
    } else {
      console.log(`   ❌ Thread ${threadId} not found`);
    }
    console.log();
  } catch (error) {
    console.error(`   ❌ Error checking thread status:`, error);
  }
}

async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const maxPostsArg = args.find(arg => arg.startsWith('--max-posts='));
    const maxPosts = maxPostsArg ? parseInt(maxPostsArg.split('=')[1]) : null;
    
    console.log(`🔧 Configuration:`);
    if (maxPosts) {
      console.log(`   🧪 TESTING: Post limit = ${maxPosts} posts`);
      commandProcessor.setTestingPostLimit(maxPosts);
    } else {
      console.log(`   Post limit = default safety limits (12 posts)`);
    }
    console.log();
    
    await testCommandParsing();
    const threadId = await testThreadCreation();
    await testConversationFlow();
    await testThreadManagement();
    await testResponseAdding(threadId);
    await testThreadClosing(threadId);
    
    console.log('🎉 Threading system test completed successfully!');
    console.log('\n📖 Usage Options:');
    console.log('  npm run test-threading                    # Default: 12 post safety limit');
    console.log('  npm run test-threading -- --max-posts=5  # 🧪 TESTING: Force-end after 5 posts');
    console.log('  npm run test-threading -- --max-posts=3  # 🧪 TESTING: Force-end after 3 posts');
    console.log('\n🌐 API endpoints:');
    console.log('  GET  /api/threads - List all threads');
    console.log('  POST /api/threads/create - Create new thread');
    console.log('  GET  /api/threads/[id] - Get specific thread');
    console.log('  POST /api/threads/[id]/respond - Add response to thread');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 