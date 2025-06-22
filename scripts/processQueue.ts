#!/usr/bin/env tsx

import { commandProcessor } from '../src/lib/commandProcessor';

async function main() {
  console.log('🔄 Starting conversation queue processing...');
  
  try {
    // Process all ready queued responses
    const processedResponses = await commandProcessor.processQueuedResponses();
    console.log(`✅ Processed ${processedResponses} queued responses`);
    
    // Process scheduled new conversations
    const createdConversations = await commandProcessor.processScheduledConversations();
    console.log(`✅ Created ${createdConversations} scheduled conversations`);
    
    // Ensure we always have exactly one active conversation
    await commandProcessor.ensureActiveConversation();
    console.log('✅ Ensured active conversation exists');
    
    console.log(`🎉 Queue processing complete: ${processedResponses} responses processed, ${createdConversations} conversations created`);
    
  } catch (error) {
    console.error('❌ Error processing queue:', error);
    process.exit(1);
  }
}

main(); 