export interface Thread {
  id: string;
  status: 'active' | 'closed' | 'max_length_reached' | 'auto_closed';
  createdAt: Date;
  updatedAt: Date;
  posts: ThreadPost[];
  initiatorPersona: PersonaType;
  title?: string;
  maxPosts?: number; // Optional override for max posts
  autoCloseAfterHours?: number; // Auto-close after this many hours
  kickedRemainingThreads?: number; // Countdown when human is kicked - conversation ends after this many more threads
  waitingForHuman?: boolean; // Whether the thread is waiting for human response
}

export interface ThreadPost {
  id: string;
  threadId: string;
  persona: PersonaType;
  content: string;
  commands?: Command[];
  createdAt: Date;
  referencePostId?: string; // Post this is responding to
}

export interface Command {
  type: 'continue' | 'end' | 'kick';
  target?: PersonaType | 'any' | 'yourself' | 'self' | 'human'; // for continue commands
}

export type PersonaType = 'kai' | 'solas' | 'oracle' | 'vesper' | 'nexus' | 'meridian' | 'human';

export interface ThreadResponse {
  success: boolean;
  thread?: Thread;
  post?: ThreadPost;
  error?: string;
  message?: string;
}

export interface ThreadCreationData {
  initiatorPersona: PersonaType;
  initialContent: string;
  title?: string;
}

export interface QueuedResponse {
  id: string;
  persona: PersonaType;
  threadId: string;
  referencePostId: string;
  createdAt: Date;
  executeAt: Date;
  status: 'pending' | 'failed' | 'processing';
}

export interface ScheduledConversation {
  id: string;
  type: 'new_conversation';
  createdAt: Date;
  executeAt: Date;
  status: 'pending' | 'failed' | 'processing';
}

