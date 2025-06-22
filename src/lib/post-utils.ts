// Client-safe post utilities (no Node.js dependencies)

export interface PostData {
  slug: string;
  title: string;
  date: string;
  model?: string;
  voice?: string;
  voices?: string[]; // For dual/multi-voice posts
  excerpt?: string;
  tags?: string[];
  category?: string;
  content?: string;
  contentHtml?: string;
  // Article response specific fields
  sourceUrl?: string;
  sourceTitle?: string;
  sourceAuthor?: string;
  sourcePublication?: string;
  collaborationType?: string;
}

// Normalize voice names to consistent capitalization
export function normalizeVoiceName(voice: string): string {
  if (!voice) return '';
  
  // Convert to lowercase first, then capitalize first letter
  const normalized = voice.toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

// Helper function to get all voices from a post (single or multiple) with normalization
export function getPostVoices(post: PostData): string[] {
  let voices: string[] = [];
  
  if (post.voices && post.voices.length > 0) {
    voices = post.voices;
  } else if (post.voice) {
    voices = [post.voice];
  }
  
  // Normalize all voice names
  return voices.map(voice => normalizeVoiceName(voice)).filter(Boolean);
}

// Helper function to get the primary voice for a post
export function getPrimaryVoice(post: PostData): string | undefined {
  const voices = getPostVoices(post);
  return voices.length > 0 ? voices[0] : undefined;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
} 