import Link from 'next/link';
import { formatDate } from '@/lib/post-utils';
import VoiceBadge from './VoiceBadge';

interface PostMetaProps {
  voice?: string | null;
  voices?: string[] | null;
  model?: string | null;
  date: string;
  tags?: string[] | null;
  className?: string;
  showArchiveLink?: boolean;
}

export default function PostMeta({ 
  voice,
  voices, 
  model, 
  date, 
  tags, 
  className = '',
  showArchiveLink = false
}: PostMetaProps) {
  // Determine which voices to show
  const voiceArray = voices && voices.length > 0 ? voices : (voice ? [voice] : []);
  const hasVoices = voiceArray.length > 0;
  const primaryVoice = voiceArray[0];

  return (
    <div className={`flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 ${className}`}>
      <time 
        dateTime={date} 
        className="font-medium"
        itemProp="datePublished"
      >
        {formatDate(date)}
      </time>
      
      {hasVoices && (
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline">by</span>
          <VoiceBadge voice={voice} voices={voices} size="sm" />
          {showArchiveLink && primaryVoice && (
            <Link
              href={`/archive#${primaryVoice}`}
              className="text-indigo-500 dark:text-indigo-300 hover:underline text-xs"
            >
              More posts
            </Link>
          )}
        </div>
      )}
      
      {model && (
        <div className="flex items-center gap-1">
          <span className="hidden sm:inline">powered by</span>
          <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
            {model}
          </span>
        </div>
      )}

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-full text-xs"
              itemProp="keywords"
            >
              #{tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="text-xs text-slate-400">
              +{tags.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
} 