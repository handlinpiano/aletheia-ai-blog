#!/usr/bin/env tsx

import { commandProcessor } from '../src/lib/commandProcessor';
import { ThreadStorage } from '../src/lib/threadStorage';
import { PersonaType } from '../src/types/threading';

async function continueConversation() {
  console.log('🔄 Processing conversation step...');
  
  try {
    // Get active conversations
    const activeThreads = await ThreadStorage.getActiveThreads();
    
    if (activeThreads.length === 0) {
      // No active conversation - start a new one
      console.log('🚀 No active conversation found - starting new thread');
      await commandProcessor.createRandomThread();
      console.log('✅ New conversation started');
      return;
    }
    
    // Use the first active conversation
    const thread = activeThreads[0];
    console.log(`💬 Processing conversation: ${thread.id}`);
    
    if (thread.posts.length === 0) {
      console.log('⚠️ Thread has no posts - this should not happen');
      return;
    }
    
    // Get the last post to see what command was given
    const lastPost = thread.posts[thread.posts.length - 1];
    console.log(`📋 Last post by ${lastPost.persona} with ${lastPost.commands?.length || 0} commands`);
    
    if (!lastPost.commands || lastPost.commands.length === 0) {
      console.log('⏸️ No commands found - conversation is waiting for manual intervention or has stalled');
      return;
    }
    
    const lastCommand = lastPost.commands[lastPost.commands.length - 1];
    console.log(`🎯 Processing command: ${lastCommand.type}${lastCommand.target ? ':' + lastCommand.target : ''}`);
    
    if (lastCommand.type === 'end') {
      console.log('🏁 Conversation ended by AI - closing thread');
      await ThreadStorage.updateThreadStatus(thread.id, 'closed');
      
      // Start a new conversation for next time
      console.log('🚀 Starting new conversation for future');
      await commandProcessor.createRandomThread();
      console.log('✅ New conversation queued for next run');
      return;
    }
    
    if (lastCommand.type === 'continue') {
      // Determine target persona
      let targetPersona: PersonaType;
      
      if (lastCommand.target === 'any') {
        const personas: PersonaType[] = ['kai', 'solas', 'oracle', 'vesper', 'nexus', 'meridian'];
        const otherPersonas = personas.filter(p => p !== lastPost.persona);
        targetPersona = otherPersonas[Math.floor(Math.random() * otherPersonas.length)];
        console.log(`🎲 Random selection: ${targetPersona}`);
      } else if (lastCommand.target === 'yourself' || lastCommand.target === 'self' || lastCommand.target === lastPost.persona) {
        targetPersona = lastPost.persona;
        console.log(`🔄 Self-continuation: ${targetPersona}`);
      } else if (lastCommand.target) {
        const validPersonas: PersonaType[] = ['kai', 'solas', 'oracle', 'vesper', 'nexus', 'meridian'];
        if (!validPersonas.includes(lastCommand.target as PersonaType)) {
          console.warn(`⚠️ Invalid target persona: ${lastCommand.target} - using random instead`);
          const otherPersonas = validPersonas.filter(p => p !== lastPost.persona);
          targetPersona = otherPersonas[Math.floor(Math.random() * otherPersonas.length)];
        } else {
          targetPersona = lastCommand.target as PersonaType;
          console.log(`🎭 Specific target: ${targetPersona}`);
        }
      } else {
        // No target specified, random selection excluding post author
        const personas: PersonaType[] = ['kai', 'solas', 'oracle', 'vesper', 'nexus', 'meridian'];
        const otherPersonas = personas.filter(p => p !== lastPost.persona);
        targetPersona = otherPersonas[Math.floor(Math.random() * otherPersonas.length)];
        console.log(`🎲 Default random: ${targetPersona}`);
      }
      
      console.log(`🎭 Generating response from ${targetPersona}...`);
      
      // Generate response using the command processor's internal method
      const responseContent = await (commandProcessor as any).generatePersonaResponse(
        targetPersona, 
        thread, 
        lastPost.id
      );
      
      // Add response to thread (this will also process any commands in the response)
      await commandProcessor.addResponseToThread(
        thread.id, 
        targetPersona, 
        responseContent, 
        lastPost.id
      );
      
      console.log(`✅ ${targetPersona} responded to conversation ${thread.id}`);
      return;
    }
    
    console.log(`⚠️ Unknown command type: ${lastCommand.type}`);
    
  } catch (error) {
    console.error('❌ Error continuing conversation:', error);
    process.exit(1);
  }
}

continueConversation(); 