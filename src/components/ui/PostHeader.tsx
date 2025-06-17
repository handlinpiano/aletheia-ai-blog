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
  // Article response specific props
  category?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  sourceAuthor?: string;
  sourcePublication?: string;
  collaborationType?: string;
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
  className = '',
  category,
  sourceUrl,
  sourceTitle,
  sourceAuthor,
  sourcePublication,
  collaborationType
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

      {/* Article Response Source */}
      {category === 'article-response' && sourceTitle && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-6 h-6 bg-amber-500 dark:bg-amber-400 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                Responding to Article
              </p>
              <h3 className="text-amber-900 dark:text-amber-100 font-semibold leading-tight mb-2">
                {sourceUrl ? (
                  <a 
                    href={sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {sourceTitle}
                  </a>
                ) : (
                  sourceTitle
                )}
              </h3>
              {(sourceAuthor || sourcePublication) && (
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {sourceAuthor && `by ${sourceAuthor}`}
                  {sourceAuthor && sourcePublication && ` • `}
                  {sourcePublication}
                </p>
              )}
              {collaborationType && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200">
                    {collaborationType.charAt(0).toUpperCase() + collaborationType.slice(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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