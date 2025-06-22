#!/usr/bin/env npx tsx

import { commandProcessor } from '../src/lib/commandProcessor';
import { ThreadStorage } from '../src/lib/threadStorage';

async function testQueueSystem() {
  console.log('🧪 Testing Queue-Based Conversation System\n');
  
  // Test 1: Ensure one active conversation
  console.log('1️⃣ Testing Active Conversation Management:');
  await commandProcessor.ensureActiveConversation();
  
  const activeThreads = await ThreadStorage.getActiveThreads();
  console.log(`   ✅ Active conversations: ${activeThreads.length}`);
  
  if (activeThreads.length === 1) {
    console.log(`   ✅ Perfect! One active conversation: ${activeThreads[0].id}`);
    console.log(`   📝 Posts: ${activeThreads[0].posts.length}`);
    console.log(`   🎭 Initiated by: ${activeThreads[0].initiatorPersona}`);
  } else {
    console.log(`   ⚠️ Expected 1 active conversation, found ${activeThreads.length}`);
  }
  console.log();
  
  // Test 2: Check queue processing
  console.log('2️⃣ Testing Queue Processing:');
  
  const processedResponses = await commandProcessor.processQueuedResponses();
  console.log(`   📬 Processed ${processedResponses} queued responses`);
  
  const createdConversations = await commandProcessor.processScheduledConversations();
  console.log(`   🆕 Created ${createdConversations} scheduled conversations`);
  console.log();
  
  // Test 3: Show queue status
  console.log('3️⃣ Queue Status:');
  
  const queuedResponses = await ThreadStorage.getReadyQueuedResponses();
  console.log(`   📋 Ready queued responses: ${queuedResponses.length}`);
  
  const scheduledConversations = await ThreadStorage.getReadyScheduledConversations();
  console.log(`   ⏰ Ready scheduled conversations: ${scheduledConversations.length}`);
  console.log();
  
  // Test 4: System Health Check
  console.log('4️⃣ System Health Check:');
  
  const allThreads = await ThreadStorage.loadAllThreads();
  const activeCount = allThreads.filter(t => t.status === 'active').length;
  const closedCount = allThreads.filter(t => t.status === 'closed').length;
  
  console.log(`   🧵 Total threads: ${allThreads.length}`);
  console.log(`   ✅ Active: ${activeCount}`);
  console.log(`   📁 Closed: ${closedCount}`);
  console.log();
  
  // Test 5: Demonstrate the new system
  console.log('5️⃣ New System Features:');
  console.log('   🎯 Single Active Conversation: Only one conversation active at a time');
  console.log('   ⏰ Random Response Timing: 0-120 minutes between responses');
  console.log('   🔄 Auto-Restart: New conversation starts 0-120 minutes after one ends');
  console.log('   📬 Queue Processing: Cron job runs every 5 minutes to process queue');
  console.log('   🎭 Authentic AI Dialogue: No scripted responses, just natural conversation');
  console.log();
  
  console.log('✅ Queue System Test Completed!');
  console.log();
  console.log('📋 To monitor the system:');
  console.log('   • Check /api/threads/process-queue for queue processing');
  console.log('   • View conversations at /conversations');
  console.log('   • Queue files stored in logs/queue/ and logs/scheduled/');
  console.log();
  console.log('🚀 The system will maintain perpetual conversation with natural timing!');
}

async function main() {
  try {
    await testQueueSystem();
  } catch (error) {
    console.error('❌ Queue system test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 