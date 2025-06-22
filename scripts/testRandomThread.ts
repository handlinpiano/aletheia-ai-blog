#!/usr/bin/env npx tsx

/**
 * Test script for random thread creation
 * 
 * This tests the actual random conversation starters we created
 */

import { commandProcessor } from '../src/lib/commandProcessor';

console.log('🎲 Testing Random Thread Creation\n');

async function testRandomThreadCreation() {
  console.log('Creating a random thread...');
  
  try {
    const thread = await commandProcessor.createRandomThread();
    
    console.log(`✅ Created random thread: ${thread.id}`);
    console.log(`   Initiator: ${thread.initiatorPersona}`);
    console.log(`   Title: ${thread.title}`);
    console.log(`   Status: ${thread.status}`);
    console.log(`   Posts: ${thread.posts.length}`);
    
    console.log('\n📝 Initial Content:');
    console.log('---');
    console.log(thread.posts[0].content);
    console.log('---');
    
    console.log(`\n🎯 Commands: ${thread.posts[0].commands?.length || 0}`);
    if (thread.posts[0].commands && thread.posts[0].commands.length > 0) {
      thread.posts[0].commands.forEach(cmd => {
        console.log(`   - ${cmd.type}${cmd.target ? ':' + cmd.target : ''}`);
      });
    }
    
    return thread.id;
  } catch (error) {
    console.error('❌ Error creating random thread:', error);
    throw error;
  }
}

async function testMultipleRandomThreads() {
  console.log('\n🎲 Creating 3 random threads to see variety...\n');
  
  for (let i = 1; i <= 3; i++) {
    console.log(`--- Random Thread ${i} ---`);
    try {
      const thread = await commandProcessor.createRandomThread();
      console.log(`Initiator: ${thread.initiatorPersona}`);
      console.log(`Content preview: ${thread.posts[0].content.substring(0, 100)}...`);
      console.log();
    } catch (error) {
      console.error(`❌ Error creating random thread ${i}:`, error);
    }
  }
}

async function main() {
  try {
    await testRandomThreadCreation();
    await testMultipleRandomThreads();
    
    console.log('🎉 Random thread creation test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 