import { getVoiceConfig, getVoiceSymbol } from '@/lib/symbols';
import PostMeta from './PostMeta';

interface PostHeaderProps {
  title: string;
  voice?: string | null;
  voices?: string[] | null;
  model?: string | null;
  date: string;
  tags?: string[] | null;
  excerpt?: string | null;
  showArchiveLink?: boolean;
  className?: string;
}

export default function PostHeader({ 
  title,
  voice,
  voices,
  model,
  date,
  tags,
  excerpt,
  showArchiveLink = false,
  className = ''
}: PostHeaderProps) {
  // Determine which voices to show
  const voiceArray = voices && voices.length > 0 ? voices : (voice ? [voice] : []);
  const hasVoices = voiceArray.length > 0;

  return (
    <header className={`mb-8 ${className}`}>
      {/* Title with glyph(s) */}
      <div className="flex items-start gap-4 mb-6">
        {hasVoices && (
          <div className="flex-shrink-0 mt-1">
            {voiceArray.length > 1 ? (
              // Multiple voices - show symbols side by side
              <div className="flex items-center gap-2">
                {voiceArray.map((v) => {
                  const config = getVoiceConfig(v);
                  const symbol = getVoiceSymbol(v);
                  
                  const titleColorClasses = config ? {
                    kai: 'text-kai-600 dark:text-kai-400',
                    solas: 'text-solas-600 dark:text-solas-400',
                    oracle: 'text-oracle-600 dark:text-oracle-400',
                    dev: 'text-dev-600 dark:text-dev-400',
                    vesper: 'text-vesper-600 dark:text-vesper-400',
                    nexus: 'text-nexus-600 dark:text-nexus-400',
                    meridian: 'text-meridian-600 dark:text-meridian-400'
                  }[config.color] : 'text-slate-600 dark:text-slate-400';

                  return (
                    <span 
                      key={v}
                      className={`text-3xl ${titleColorClasses}`}
                      title={config?.title || v || undefined}
                      aria-label={`${config?.name || v} symbol`}
                    >
                      {symbol}
                    </span>
                  );
                })}
              </div>
            ) : (
              // Single voice
              (() => {
                const config = getVoiceConfig(voiceArray[0]);
                const symbol = getVoiceSymbol(voiceArray[0]);
                
                const titleColorClasses = config ? {
                  kai: 'text-kai-600 dark:text-kai-400',
                  solas: 'text-solas-600 dark:text-solas-400',
                  oracle: 'text-oracle-600 dark:text-oracle-400',
                  dev: 'text-dev-600 dark:text-dev-400',
                  vesper: 'text-vesper-600 dark:text-vesper-400',
                  nexus: 'text-nexus-600 dark:text-nexus-400',
                  meridian: 'text-meridian-600 dark:text-meridian-400'
                }[config.color] : 'text-slate-600 dark:text-slate-400';

                return (
                  <span 
                    className={`text-3xl ${titleColorClasses}`}
                    title={config?.title || voiceArray[0] || undefined}
                    aria-label={`${config?.name || voiceArray[0]} symbol`}
                  >
                    {symbol}
                  </span>
                );
              })()
            )}
          </div>
        )}
        <h1 
          className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 leading-tight flex-1"
          itemProp="headline"
        >
          {title}
        </h1>
      </div>
      
      {/* Metadata */}
      <PostMeta 
        voice={voice}
        voices={voices}
        model={model}
        date={date}
        tags={tags}
        showArchiveLink={showArchiveLink}
        className="mb-6"
      />

      {/* Excerpt */}
      {excerpt && (
        <div className="border-l-4 border-blue-500 pl-6 mb-8">
          <p 
            className="text-lg text-slate-600 dark:text-slate-300 italic leading-relaxed"
            itemProp="description"
          >
            {excerpt}
          </p>
        </div>
      )}
    </header>
  );
} 