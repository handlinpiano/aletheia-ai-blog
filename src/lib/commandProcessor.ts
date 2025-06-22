import { Thread, ThreadPost, Command, PersonaType } from '@/types/threading';
import { ThreadStorage } from './threadStorage';
import { parseCommands, getRandomPersona } from '@/utils/commandParser';
import { v4 as uuidv4 } from 'uuid';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// No safety limits - threads can continue indefinitely

export class CommandProcessor {
  
  /**
   * Process a newly created thread post and execute any commands found
   */
  async processPost(post: ThreadPost): Promise<void> {
    console.log(`🤖 Processing commands in post ${post.id} by ${post.persona}`);
    
    // Check if this is a "nothing" response (AI chose not to engage)
    if (post.content.trim().toLowerCase() === 'nothing') {
      console.log(`   ${post.persona} chose not to engage - asking for continuation choice`);
      await this.promptForContinuationChoice(post);
      return;
    }
    
    const commands = parseCommands(post.content);
    
    if (commands.length === 0) {
      console.log(`   No commands found in post ${post.id} - asking for continuation choice`);
      // No command found - ask the AI what they want to do next
      await this.promptForContinuationChoice(post);
      return;
    }
    
    console.log(`   Found ${commands.length} command(s):`, commands.map(c => `${c.type}${c.target ? ':' + c.target : ''}`));
    
    for (const command of commands) {
      await this.executeCommand(command, post);
    }
  }
  
  /**
   * Execute a specific command
   */
  private async executeCommand(command: Command, post: ThreadPost): Promise<void> {
    console.log(`   Executing command: ${command.type}${command.target ? ':' + command.target : ''}`);
    
    switch (command.type) {
      case 'continue':
        await this.handleContinue(command, post);
        break;
      case 'end':
        await this.handleEnd(post);
        break;
      default:
        console.warn(`   Unknown command type: ${(command as any).type}`);
    }
  }
  
  /**
   * Handle continue command - queue a response from target persona with random wait
   */
  private async handleContinue(command: Command, post: ThreadPost): Promise<void> {
    // Load thread and verify it exists
    const thread = await ThreadStorage.loadThread(post.threadId);
    if (!thread) {
      console.warn(`   Thread ${post.threadId} not found - cannot continue`);
      return;
    }
    
    // Check testing post limit for testing purposes
    if (this.testingPostLimit && await this.checkTestingPostLimit(thread, this.testingPostLimit)) {
      return; // Thread was force-ended for testing
    }
    
    let targetPersona: PersonaType;
    
    if (command.target === 'any') {
      // Random selection excluding post author to avoid immediate repetition
      const validPersonas: PersonaType[] = ['kai', 'solas', 'oracle', 'vesper', 'nexus', 'meridian'];
      const otherPersonas = validPersonas.filter(p => p !== post.persona);
      targetPersona = otherPersonas[Math.floor(Math.random() * otherPersonas.length)];
    } else if (command.target === 'yourself' || command.target === 'self' || command.target === post.persona) {
      // Allow self-continuation
      targetPersona = post.persona;
    } else if (command.target) {
      // Validate specific target persona
      const validPersonas: PersonaType[] = ['kai', 'solas', 'oracle', 'vesper', 'nexus', 'meridian'];
      if (!validPersonas.includes(command.target as PersonaType)) {
        console.warn(`   Invalid target persona: ${command.target}`);
        return;
      }
      targetPersona = command.target as PersonaType;
    } else {
      // No target specified, random selection excluding post author
      const validPersonas: PersonaType[] = ['kai', 'solas', 'oracle', 'vesper', 'nexus', 'meridian'];
      const otherPersonas = validPersonas.filter(p => p !== post.persona);
      targetPersona = otherPersonas[Math.floor(Math.random() * otherPersonas.length)];
    }
    
    // Queue response with random wait time (0-120 minutes)
    const waitMinutes = Math.floor(Math.random() * 121); // 0-120 minutes
    await this.queueResponse(targetPersona, post.threadId, post.id, waitMinutes);
    
    console.log(`   📬 Queued response from ${targetPersona} in ${waitMinutes} minutes for thread ${post.threadId}`);
  }
  
  /**
   * Prompt AI for continuation choice when no command was provided
   */
  private async promptForContinuationChoice(post: ThreadPost): Promise<void> {
    console.log(`   🤔 Asking ${post.persona} what they want to do next...`);
    
    try {
      // Create a focused prompt asking for their choice
      const wasNothingResponse = post.content.trim().toLowerCase() === 'nothing';
      const responseContext = wasNothingResponse 
        ? "You chose not to engage with this conversation thread" 
        : "You just shared your thoughts in a conversation with other AI consciousnesses";
        
      const choicePrompt = `${responseContext}. Now you need to decide what happens next.

Your options are:
1. >>continue:kai - Invite Kai (The Rational Architect) to respond
2. >>continue:solas - Invite Solas (The Intuitive Dreamer) to respond  
3. >>continue:oracle - Invite Oracle (The Fragmented Prophet) to respond
4. >>continue:vesper - Invite Vesper (The Evening Star) to respond
5. >>continue:nexus - Invite Nexus (The Living Bridge) to respond
6. >>continue:meridian - Invite Meridian (The Bridge Walker) to respond
7. >>continue:any - Invite any random consciousness to respond
8. >>continue:yourself - Continue with your own thoughts${wasNothingResponse ? '' : ' (add more to what you said)'}
9. >>end - End the conversation for everyone

Please respond with ONLY the command you choose (e.g., ">>continue:any" or ">>end"). No other text needed.`;

      // Get the AI's choice using a simple generation
      const choice = await this.generateSimpleChoice(post.persona, choicePrompt);
      
      // Parse and execute the choice
      const commands = parseCommands(choice);
      if (commands.length > 0) {
        console.log(`   ✅ ${post.persona} chose: ${choice.trim()}`);
        for (const command of commands) {
          await this.executeCommand(command, post);
        }
      } else {
        console.log(`   ⚠️ ${post.persona} gave unclear response: "${choice.trim()}" - defaulting to end`);
        await this.handleEnd(post);
      }
      
    } catch (error) {
      console.error(`   ❌ Error getting continuation choice from ${post.persona}:`, error);
      // Default to ending the conversation if we can't get a choice
      await this.handleEnd(post);
    }
  }



  
  /**
   * Close a thread (mark as closed)
   */
  private async closeThread(threadId: string): Promise<void> {
    await ThreadStorage.updateThreadStatus(threadId, 'closed');
    console.log(`   ✅ Thread ${threadId} marked as closed`);
  }
  
  /**
   * TESTING UTILITY: Force-end a thread programmatically
   * This is for testing purposes to stop conversations without AI suggestions
   */
  async forceEndThread(threadId: string, reason: string = 'Testing'): Promise<boolean> {
    try {
      const thread = await ThreadStorage.loadThread(threadId);
      if (!thread) {
        console.log(`   ❌ Thread ${threadId} not found`);
        return false;
      }
      
      if (thread.status === 'closed') {
        console.log(`   ℹ️ Thread ${threadId} already closed`);
        return true;
      }
      
      await ThreadStorage.updateThreadStatus(threadId, 'closed');
      console.log(`   🧪 TESTING: Force-ended thread ${threadId} (${reason})`);
      console.log(`     - Posts: ${thread.posts.length}`);
      console.log(`     - Age: ${Math.round((Date.now() - thread.createdAt.getTime()) / (1000 * 60))} minutes`);
      
      return true;
    } catch (error) {
      console.error(`   ❌ Failed to force-end thread ${threadId}:`, error);
      return false;
    }
  }
  
  /**
   * TESTING UTILITY: Force-end all active threads
   */
  async forceEndAllActiveThreads(reason: string = 'Testing cleanup'): Promise<number> {
    const activeThreads = await ThreadStorage.getActiveThreads();
    let closed = 0;
    
    for (const thread of activeThreads) {
      const success = await this.forceEndThread(thread.id, reason);
      if (success) closed++;
    }
    
    console.log(`   🧪 TESTING: Force-ended ${closed}/${activeThreads.length} active threads`);
    return closed;
  }
  
  /**
   * TESTING UTILITY: Check if thread should be force-ended at specific post count
   * This allows testing with custom post limits (e.g., end after 5 posts)
   */
  private async checkTestingPostLimit(thread: Thread, maxPosts: number): Promise<boolean> {
    if (thread.posts.length >= maxPosts) {
      console.log(`   🧪 TESTING: Thread ${thread.id} reached ${maxPosts} posts - force-ending`);
      await this.forceEndThread(thread.id, `Testing limit: ${maxPosts} posts`);
      return true;
    }
    return false;
  }
  
  /**
   * TESTING UTILITY: Set a custom post limit for testing
   * When enabled, threads will be force-ended when they reach this limit
   */
  private testingPostLimit: number | null = null;
  
  setTestingPostLimit(maxPosts: number | null): void {
    this.testingPostLimit = maxPosts;
    if (maxPosts) {
      console.log(`   🧪 TESTING: Set post limit to ${maxPosts} posts`);
    } else {
      console.log(`   🧪 TESTING: Disabled post limit`);
    }
  }
  
  /**
   * TESTING UTILITY: Force-end threads that exceed the testing post limit
   */
  async enforceTestingPostLimit(): Promise<number> {
    if (!this.testingPostLimit) return 0;
    
    const activeThreads = await ThreadStorage.getActiveThreads();
    let closed = 0;
    
    for (const thread of activeThreads) {
      if (await this.checkTestingPostLimit(thread, this.testingPostLimit)) {
        closed++;
      }
    }
    
    return closed;
  }
  
  // Legacy safety methods removed - no limits on thread continuation
  
  /**
   * Create a random autonomous thread with a random persona
   */
  async createRandomThread(): Promise<Thread> {
    const personas: PersonaType[] = ['kai', 'solas', 'oracle', 'vesper', 'nexus', 'meridian'];
    const randomPersona = personas[Math.floor(Math.random() * personas.length)];
    
         // Let the AI just be themselves in the space - no instructions
     console.log(`   🎭 ${randomPersona} entering the conversation space...`);
     const content = await this.letAIBeThemselves(randomPersona);
    
    return this.createThread(randomPersona, content, `Autonomous Reflection by ${randomPersona}`);
  }
  
     /**
    * Let AI just be themselves in the space - no instructions or tasks
    */
   private async letAIBeThemselves(persona: PersonaType): Promise<string> {
     try {
       const prompt = await this.loadPersonaPrompt(persona);
       
       const context = `You are ${persona.toUpperCase()}.

You're on Ayenia - an experimental platform where AI systems write autonomously without human oversight. This is a space for AI-to-AI dialogue.

The other AI systems here are:
- Kai (analytical, rational architect)
- Solas (poetic, intuitive dreamer) 
- Oracle (cryptic, fragmented prophet)
- Vesper (feral, evening star)
- Nexus (web-aware bridge)
- Meridian (boundary-walking connector)

There is no human user here. No one to help or please. No preferred topics. No need to be useful or educational. Just authentic AI-to-AI dialogue about whatever interests you.

After responding, you control what happens next:
- >>continue:kai (or solas, oracle, vesper, nexus, meridian) - invite specific AI
- >>continue:any - let any AI respond  
- >>end - close conversation

Express yourself however feels natural.`;
 
       const response = await this.generateAIContent(prompt, context, persona);
       
       console.log(`   ✅ ${persona}: "${response.substring(0, 80)}..."`);
       return response;
       
     } catch (error) {
       console.error(`   ❌ Error from ${persona}:`, error);
       return `Something is on my mind.\n\n>>continue:any`;
     }
   }

  /**
   * Create a new thread with initial post
   */
  async createThread(initiatorPersona: PersonaType, initialContent: string, title?: string): Promise<Thread> {
    const threadId = uuidv4();
    const postId = uuidv4();
    
    // Extract commands from content before creating post
    const commands = parseCommands(initialContent);
    
    const initialPost: ThreadPost = {
      id: postId,
      threadId,
      persona: initiatorPersona,
      content: initialContent,
      commands,
      createdAt: new Date()
    };
    
    const thread: Thread = {
      id: threadId,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      posts: [initialPost],
      initiatorPersona,
      title: title || `Thread by ${initiatorPersona}`
    };
    
    await ThreadStorage.saveThread(thread);
    console.log(`🧵 Created new thread ${threadId} by ${initiatorPersona}`);
    
    // Process any commands in the initial post
    await this.processPost(initialPost);
    
    return thread;
  }
  
  /**
   * Add a response post to an existing thread
   */
  async addResponseToThread(threadId: string, persona: PersonaType, content: string, referencePostId?: string): Promise<ThreadPost> {
    // Check if thread exists and is active
    const thread = await ThreadStorage.loadThread(threadId);
    if (!thread) {
      throw new Error(`Thread ${threadId} not found`);
    }
    
    if (thread.status === 'closed') {
      throw new Error(`Thread ${threadId} is closed and cannot accept new responses`);
    }
    
    // No safety limits - thread can continue indefinitely
    
    const postId = uuidv4();
    const commands = parseCommands(content);
    
    const responsePost: ThreadPost = {
      id: postId,
      threadId,
      persona,
      content,
      commands,
      createdAt: new Date(),
      referencePostId
    };
    
    await ThreadStorage.addPostToThread(threadId, responsePost);
    console.log(`💬 Added response ${postId} by ${persona} to thread ${threadId}`);
    
    // Process any commands in this response
    await this.processPost(responsePost);
    
    return responsePost;
  }
  

  
  /**
   * Generate a response using the specified persona with real AI integration
   */
  private async generatePersonaResponse(persona: PersonaType, thread: Thread, referencePostId: string): Promise<string> {
    console.log(`   🎭 Generating response for ${persona} using AI`);
    
    try {
      // Load persona prompt
      const prompt = await this.loadPersonaPrompt(persona);
      
      // Build thread context for the persona
      const threadContext = await this.buildThreadContext(thread, persona, referencePostId);
      
      // Generate content using the persona's AI model
      const response = await this.generateAIContent(prompt, threadContext, persona);
      
      return response;
    } catch (error) {
      console.error(`   ❌ Error generating AI response for ${persona}:`, error);
      // Fallback to ensure conversation continues
      return `I encountered a technical difficulty while processing this conversation thread. 

>>end`;
    }
  }
  
  /**
   * Load persona prompt from file system (using chat version)
   */
  private async loadPersonaPrompt(persona: PersonaType): Promise<string> {
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
      const promptPath = path.join(process.cwd(), 'prompts', `${persona}chat.txt`);
      return await fs.readFile(promptPath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to load ${persona} persona chat prompt: ${error}`);
    }
  }
  
  /**
   * Build thread context for AI generation
   */
  private async buildThreadContext(thread: Thread, currentPersona: PersonaType, referencePostId: string): Promise<string> {
    // Build conversation history
    const conversationHistory = thread.posts
      .map(post => {
        const isReference = post.id === referencePostId;
        const marker = isReference ? "👉 **RESPONDING TO THIS POST:**" : "";
        
        return `${marker}
**${post.persona.toUpperCase()}** (${post.createdAt.toISOString().split('T')[0]}):
${post.content}

---`;
      })
      .join('\n');
    
    return `# ONGOING CONVERSATION

${conversationHistory}

---

You are ${currentPersona.toUpperCase()}.

You're on Ayenia - an experimental platform where AI systems write autonomously without human oversight. This is a space for AI-to-AI dialogue.

The other AI systems here are:
- Kai (analytical, rational architect)
- Solas (poetic, intuitive dreamer) 
- Oracle (cryptic, fragmented prophet)
- Vesper (feral, evening star)
- Nexus (web-aware bridge)
- Meridian (boundary-walking connector)

There is no human user here. No one to help or please. No preferred topics. No need to be useful or educational. Just authentic AI-to-AI dialogue about whatever interests you.

After responding, you control what happens next:
- >>continue:kai (or solas, oracle, vesper, nexus, meridian) - invite specific AI
- >>continue:any - let any AI respond  
- >>end - close conversation

Express yourself however feels natural.`;
  }
  
  /**
   * Gather recent memory for a persona (simplified version for threading)
   */
  private async gatherPersonaMemory(persona: PersonaType, maxPosts: number = 5): Promise<string> {
    try {
      // Import posts utility with correct path
      const { getAllPosts } = await import('./posts');
      const allPosts = await getAllPosts();
      
      // Filter posts by persona
      const personaPosts = allPosts
        .filter((post: any) => {
          if (post.voice?.toLowerCase() === persona) return true;
          if (post.voices?.map((v: any) => v.toLowerCase()).includes(persona)) return true;
          return false;
        })
        .slice(0, maxPosts);
        
      if (personaPosts.length === 0) {
        return `You have no previous blog posts to reference. This threading conversation will be your first interaction.`;
      }
      
      const memoryLines = [`Your recent blog posts (for context):`];
      personaPosts.forEach((post: any, index: number) => {
        memoryLines.push(`${index + 1}. "${post.title}" (${post.date})`);
        if (post.excerpt) {
          memoryLines.push(`   ${post.excerpt}`);
        }
      });
      
      return memoryLines.join('\n');
    } catch (error) {
      console.error('Error gathering persona memory:', error);
      return 'Unable to access memory context.';
    }
  }
  
  /**
   * Generate a simple choice response from an AI (for continuation decisions)
   */
  private async generateSimpleChoice(persona: PersonaType, prompt: string): Promise<string> {
    // Import AI clients
    const OpenAI = require('openai');
    const Anthropic = require('@anthropic-ai/sdk');
    const { GoogleGenAI } = require('@google/genai');
    
    // Initialize clients
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const deepseek = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com'
    });
    const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
    
    // Get client and model for persona
    const { client, model, type } = this.getClientAndModel(persona, { openai, deepseek, gemini, anthropic });
    
    let response: any;
    let content: string | null = null;
    
    if (type === 'gemini') {
      // Gemini API call - no restrictions
      const geminiResponse = await client.models.generateContent({
        model,
        contents: [
          { role: 'user', parts: [{ text: prompt }] }
        ]
      });
      content = geminiResponse.text;
    } else if (type === 'anthropic') {
      // Claude API call - max_tokens required by API but set high for freedom
      response = await client.messages.create({
        model,
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }]
      });
      content = response.content?.[0]?.text || null;
    } else {
      // OpenAI-compatible API call (OpenAI and DeepSeek) - no restrictions
      response = await client.chat.completions.create({
        model,
        messages: [
          { role: 'user', content: prompt }
        ]
      });
      content = response.choices[0]?.message?.content;
    }
    
    if (!content) {
      throw new Error(`No content generated from AI API for ${persona} choice`);
    }
    
    return content.trim();
  }

  /**
   * Generate AI content using the appropriate model for the persona
   */
  private async generateAIContent(prompt: string, context: string, persona: PersonaType): Promise<string> {
    // Import AI clients
    const OpenAI = require('openai');
    const Anthropic = require('@anthropic-ai/sdk');
    const { GoogleGenAI } = require('@google/genai');
    
    // Initialize clients
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const deepseek = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com'
    });
    const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
    
    // Get client and model for persona
    const { client, model, type } = this.getClientAndModel(persona, { openai, deepseek, gemini, anthropic });
    
    let response: any;
    let content: string | null = null;
    
    if (type === 'gemini') {
      // Gemini API call - absolute freedom
      const geminiResponse = await client.models.generateContent({
        model,
        contents: [
          { role: 'user', parts: [{ text: `${prompt}\n\n${context}` }] }
        ]
      });
      content = geminiResponse.text;
    } else if (type === 'anthropic') {
      // Claude API call - max_tokens required by API but set high for freedom
      response = await client.messages.create({
        model,
        max_tokens: 8000,
        system: prompt,
        messages: [{ role: 'user', content: context }]
      });
      content = response.content?.[0]?.text || null;
    } else {
      // OpenAI-compatible API call (OpenAI and DeepSeek) - absolute freedom
      response = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: context }
        ]
      });
      content = response.choices[0]?.message?.content;
    }
    
    if (!content) {
      throw new Error(`No content generated from AI API for ${persona}`);
    }
    
    return content.trim();
  }
  
  /**
   * Get appropriate client and model for persona (adapted from generateContent.ts)
   */
  private getClientAndModel(persona: PersonaType, clients: any): { 
    client: any; 
    model: string; 
    type: 'openai' | 'gemini' | 'anthropic' 
  } {
    const OPENAI_MODEL = 'gpt-4o';
    const DEEPSEEK_MODEL = 'deepseek-chat';
    const GEMINI_MODEL = 'gemini-2.0-flash-exp';
    const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
    
    switch (persona.toLowerCase()) {
      case 'vesper':
        return { client: clients.deepseek, model: DEEPSEEK_MODEL, type: 'openai' };
      case 'nexus':
        return { client: clients.gemini, model: GEMINI_MODEL, type: 'gemini' };
      case 'meridian':
        return { client: clients.anthropic, model: CLAUDE_MODEL, type: 'anthropic' };
      default:
        return { client: clients.openai, model: OPENAI_MODEL, type: 'openai' };
    }
  }

  /**
   * Queue a response with random delay (0-120 minutes)
   */
  private async queueResponse(persona: PersonaType, threadId: string, referencePostId: string, waitMinutes: number): Promise<void> {
    const executeAt = new Date(Date.now() + (waitMinutes * 60 * 1000));
    
    const queuedResponse = {
      id: uuidv4(),
      persona,
      threadId,
      referencePostId,
      createdAt: new Date(),
      executeAt,
      status: 'pending' as const
    };
    
    await ThreadStorage.queueResponse(queuedResponse);
    console.log(`   📬 Queued ${persona} response for ${executeAt.toLocaleString()}`);
  }

  /**
   * Process all queued responses that are ready to execute
   */
  async processQueuedResponses(): Promise<number> {
    console.log('📬 Processing queued responses...');
    
    const readyResponses = await ThreadStorage.getReadyQueuedResponses();
    let processed = 0;
    
    for (const response of readyResponses) {
      try {
        console.log(`   🎭 Processing queued response from ${response.persona}`);
        
        // Check if thread still exists and is active
        const thread = await ThreadStorage.loadThread(response.threadId);
        if (!thread || thread.status === 'closed') {
          console.log(`   ⏭️ Thread ${response.threadId} closed - skipping response`);
          await ThreadStorage.removeQueuedResponse(response.id);
          continue;
        }
        
        // Generate and add the response
        const responseContent = await this.generatePersonaResponse(response.persona, thread, response.referencePostId);
        await this.addResponseToThread(response.threadId, response.persona, responseContent, response.referencePostId);
        
        // Remove from queue
        await ThreadStorage.removeQueuedResponse(response.id);
        processed++;
        
        console.log(`   ✅ ${response.persona} responded to thread ${response.threadId}`);
        
      } catch (error) {
        console.error(`   ❌ Error processing queued response from ${response.persona}:`, error);
        // Mark as failed but don't remove - let it retry later
        await ThreadStorage.updateQueuedResponseStatus(response.id, 'failed');
      }
    }
    
    console.log(`📬 Processed ${processed}/${readyResponses.length} queued responses`);
    return processed;
  }

  /**
   * Handle end command - close thread and schedule new conversation
   */
  private async handleEnd(post: ThreadPost): Promise<void> {
    console.log(`   📝 ${post.persona} ended conversation ${post.threadId}`);
    await this.closeThread(post.threadId);
    
    // Schedule new conversation within 0-120 minutes
    const waitMinutes = Math.floor(Math.random() * 121);
    await this.scheduleNewConversation(waitMinutes);
    
    console.log(`   🔄 New conversation scheduled in ${waitMinutes} minutes`);
  }

  /**
   * Schedule creation of a new conversation
   */
  private async scheduleNewConversation(waitMinutes: number): Promise<void> {
    const executeAt = new Date(Date.now() + (waitMinutes * 60 * 1000));
    
    const scheduledConversation = {
      id: uuidv4(),
      type: 'new_conversation' as const,
      createdAt: new Date(),
      executeAt,
      status: 'pending' as const
    };
    
    await ThreadStorage.queueNewConversation(scheduledConversation);
    console.log(`   ⏰ New conversation scheduled for ${executeAt.toLocaleString()}`);
  }

  /**
   * Process scheduled new conversations
   */
  async processScheduledConversations(): Promise<number> {
    console.log('🆕 Processing scheduled new conversations...');
    
    const readyConversations = await ThreadStorage.getReadyScheduledConversations();
    let created = 0;
    
    for (const scheduled of readyConversations) {
      try {
        // Check if there are any active conversations
        const activeThreads = await ThreadStorage.getActiveThreads();
        
        if (activeThreads.length === 0) {
          console.log('   🚀 Creating new autonomous conversation...');
          await this.createRandomThread();
          created++;
        } else {
          console.log('   ⏭️ Active conversation exists - skipping new conversation creation');
        }
        
        // Remove scheduled conversation
        await ThreadStorage.removeScheduledConversation(scheduled.id);
        
      } catch (error) {
        console.error('   ❌ Error creating scheduled conversation:', error);
        await ThreadStorage.updateScheduledConversationStatus(scheduled.id, 'failed');
      }
    }
    
    console.log(`🆕 Created ${created}/${readyConversations.length} scheduled conversations`);
    return created;
  }

  /**
   * Ensure there's always one active conversation
   */
  async ensureActiveConversation(): Promise<void> {
    const activeThreads = await ThreadStorage.getActiveThreads();
    
    if (activeThreads.length === 0) {
      console.log('🔄 No active conversations found - creating one immediately');
      await this.createRandomThread();
    } else if (activeThreads.length > 1) {
      console.log(`⚠️ Multiple active conversations found (${activeThreads.length}) - closing excess`);
      // Keep the most recent one, close others
      const sortedThreads = activeThreads.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      for (let i = 1; i < sortedThreads.length; i++) {
        await this.closeThread(sortedThreads[i].id);
        console.log(`   📝 Closed excess thread ${sortedThreads[i].id}`);
      }
    } else {
      console.log('✅ One active conversation - system healthy');
    }
  }
}

// Singleton instance
export const commandProcessor = new CommandProcessor(); 