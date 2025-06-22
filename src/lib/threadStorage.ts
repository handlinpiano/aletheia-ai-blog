import { promises as fs } from 'fs';
import path from 'path';
import { Thread, ThreadPost, PersonaType, QueuedResponse, ScheduledConversation } from '@/types/threading';

const THREADS_DIR = path.join(process.cwd(), 'logs/threads');
const QUEUE_DIR = path.join(process.cwd(), 'logs/queue');
const SCHEDULED_DIR = path.join(process.cwd(), 'logs/scheduled');

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(THREADS_DIR, { recursive: true });
    await fs.mkdir(QUEUE_DIR, { recursive: true });
    await fs.mkdir(SCHEDULED_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating thread directories:', error);
  }
}

export class ThreadStorage {
  
  static async saveThread(thread: Thread): Promise<void> {
    await ensureDirectories();
    const filePath = path.join(THREADS_DIR, `${thread.id}.json`);
    
    // Convert dates to ISO strings for JSON storage
    const threadData = {
      ...thread,
      createdAt: thread.createdAt.toISOString(),
      updatedAt: thread.updatedAt.toISOString(),
      posts: thread.posts.map(post => ({
        ...post,
        createdAt: post.createdAt.toISOString()
      }))
    };
    
    await fs.writeFile(filePath, JSON.stringify(threadData, null, 2));
  }
  
  static async loadThread(threadId: string): Promise<Thread | null> {
    try {
      const filePath = path.join(THREADS_DIR, `${threadId}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      // Convert ISO strings back to Date objects
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any  
        posts: data.posts.map((post: any) => ({
          ...post,
          createdAt: new Date(post.createdAt)
        }))
      };
    } catch {
      return null;
    }
  }
  
  static async loadAllThreads(): Promise<Thread[]> {
    try {
      await ensureDirectories();
      const files = await fs.readdir(THREADS_DIR);
      const threadFiles = files.filter(f => f.endsWith('.json'));
      
      const threads = await Promise.all(
        threadFiles.map(async (file) => {
          const threadId = file.replace('.json', '');
          return await this.loadThread(threadId);
        })
      );
      
      return threads.filter((t): t is Thread => t !== null);
    } catch (error) {
      console.error('Error loading threads:', error);
      return [];
    }
  }
  
  static async addPostToThread(threadId: string, post: ThreadPost): Promise<void> {
    const thread = await this.loadThread(threadId);
    if (!thread) {
      throw new Error(`Thread ${threadId} not found`);
    }
    
    thread.posts.push(post);
    thread.updatedAt = new Date();
    await this.saveThread(thread);
  }
  
  static async updateThreadStatus(threadId: string, status: 'active' | 'closed'): Promise<void> {
    const thread = await this.loadThread(threadId);
    if (!thread) {
      throw new Error(`Thread ${threadId} not found`);
    }
    
    thread.status = status;
    thread.updatedAt = new Date();
    await this.saveThread(thread);
  }
  
  static async getActiveThreads(): Promise<Thread[]> {
    const allThreads = await this.loadAllThreads();
    return allThreads.filter(t => t.status === 'active');
  }
  
  static async getThreadsByPersona(persona: PersonaType): Promise<Thread[]> {
    const allThreads = await this.loadAllThreads();
    return allThreads.filter(t => 
      t.initiatorPersona === persona || 
      t.posts.some(p => p.persona === persona)
    );
  }

  // Queue Management Methods

  static async queueResponse(response: QueuedResponse): Promise<void> {
    await ensureDirectories();
    const filePath = path.join(QUEUE_DIR, `${response.id}.json`);
    
    const responseData = {
      ...response,
      createdAt: response.createdAt.toISOString(),
      executeAt: response.executeAt.toISOString()
    };
    
    await fs.writeFile(filePath, JSON.stringify(responseData, null, 2));
  }

  static async getReadyQueuedResponses(): Promise<QueuedResponse[]> {
    try {
      await ensureDirectories();
      const files = await fs.readdir(QUEUE_DIR);
      const now = new Date();
      const readyResponses: QueuedResponse[] = [];
      
      for (const file of files.filter(f => f.endsWith('.json'))) {
        try {
          const filePath = path.join(QUEUE_DIR, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const data = JSON.parse(content);
          
          const response: QueuedResponse = {
            ...data,
            createdAt: new Date(data.createdAt),
            executeAt: new Date(data.executeAt)
          };
          
          if (response.executeAt <= now && response.status === 'pending') {
            readyResponses.push(response);
          }
        } catch (error) {
          console.error(`Error reading queued response ${file}:`, error);
        }
      }
      
      return readyResponses;
    } catch (error) {
      console.error('Error getting queued responses:', error);
      return [];
    }
  }

  static async removeQueuedResponse(responseId: string): Promise<void> {
    try {
      const filePath = path.join(QUEUE_DIR, `${responseId}.json`);
      await fs.unlink(filePath);
    } catch {
      // File might not exist, that's okay
    }
  }

  static async updateQueuedResponseStatus(responseId: string, status: 'pending' | 'failed' | 'processing'): Promise<void> {
    try {
      const filePath = path.join(QUEUE_DIR, `${responseId}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      data.status = status;
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error updating queued response status ${responseId}:`, error);
    }
  }

  static async queueNewConversation(scheduled: ScheduledConversation): Promise<void> {
    await ensureDirectories();
    const filePath = path.join(SCHEDULED_DIR, `${scheduled.id}.json`);
    
    const scheduledData = {
      ...scheduled,
      createdAt: scheduled.createdAt.toISOString(),
      executeAt: scheduled.executeAt.toISOString()
    };
    
    await fs.writeFile(filePath, JSON.stringify(scheduledData, null, 2));
  }

  static async getReadyScheduledConversations(): Promise<ScheduledConversation[]> {
    try {
      await ensureDirectories();
      const files = await fs.readdir(SCHEDULED_DIR);
      const now = new Date();
      const readyConversations: ScheduledConversation[] = [];
      
      for (const file of files.filter(f => f.endsWith('.json'))) {
        try {
          const filePath = path.join(SCHEDULED_DIR, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const data = JSON.parse(content);
          
          const scheduled: ScheduledConversation = {
            ...data,
            createdAt: new Date(data.createdAt),
            executeAt: new Date(data.executeAt)
          };
          
          if (scheduled.executeAt <= now && scheduled.status === 'pending') {
            readyConversations.push(scheduled);
          }
        } catch (error) {
          console.error(`Error reading scheduled conversation ${file}:`, error);
        }
      }
      
      return readyConversations;
    } catch (error) {
      console.error('Error getting scheduled conversations:', error);
      return [];
    }
  }

  static async removeScheduledConversation(conversationId: string): Promise<void> {
    try {
      const filePath = path.join(SCHEDULED_DIR, `${conversationId}.json`);
      await fs.unlink(filePath);
    } catch {
      // File might not exist, that's okay
    }
  }

  static async updateScheduledConversationStatus(conversationId: string, status: 'pending' | 'failed' | 'processing'): Promise<void> {
    try {
      const filePath = path.join(SCHEDULED_DIR, `${conversationId}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      data.status = status;
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error updating scheduled conversation status ${conversationId}:`, error);
    }
  }
}

