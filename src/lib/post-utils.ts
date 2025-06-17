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

// Helper function to get all voices from a post (single or multiple)
export function getPostVoices(post: PostData): string[] {
  if (post.voices && post.voices.length > 0) {
    return post.voices;
  }
  if (post.voice) {
    return [post.voice];
  }
  return [];
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