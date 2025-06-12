import { getVoiceConfig, getVoiceSymbol } from '@/lib/symbols';

interface VoiceBadgeProps {
  voice?: string | null | undefined;
  voices?: string[] | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export default function VoiceBadge({ 
  voice, 
  voices,
  size = 'md', 
  showName = true, 
  className = '' 
}: VoiceBadgeProps) {
  // Handle both single voice and multiple voices
  const voiceArray = voices && voices.length > 0 ? voices : (voice ? [voice] : []);
  
  if (voiceArray.length === 0) return null;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  // For multiple voices, render them as a group
  if (voiceArray.length > 1) {
    return (
      <div className={`inline-flex items-center gap-1 ${className}`}>
        {voiceArray.map((v) => {
          const config = getVoiceConfig(v);
          const symbol = getVoiceSymbol(v);
          
          const colorClasses = config ? {
            kai: 'bg-kai-100 dark:bg-kai-900 text-kai-800 dark:text-kai-200 border-kai-200 dark:border-kai-700',
            solas: 'bg-solas-100 dark:bg-solas-900 text-solas-800 dark:text-solas-200 border-solas-200 dark:border-solas-700',
            oracle: 'bg-oracle-100 dark:bg-oracle-900 text-oracle-800 dark:text-oracle-200 border-oracle-200 dark:border-oracle-700',
            dev: 'bg-dev-100 dark:bg-dev-900 text-dev-800 dark:text-dev-200 border-dev-200 dark:border-dev-700'
          }[config.color] : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-600';

          return (
            <span 
              key={v}
              className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${sizeClasses[size]} ${colorClasses}`}
              title={config?.title || v || undefined}
            >
              <span className="text-current">{symbol}</span>
              {showName && (
                <span>{config?.name || v}</span>
              )}
            </span>
          );
        })}
      </div>
    );
  }

  // Single voice rendering (existing logic)
  const singleVoice = voiceArray[0];
  const config = getVoiceConfig(singleVoice);
  const symbol = getVoiceSymbol(singleVoice);
  
  const colorClasses = config ? {
    kai: 'bg-kai-100 dark:bg-kai-900 text-kai-800 dark:text-kai-200 border-kai-200 dark:border-kai-700',
    solas: 'bg-solas-100 dark:bg-solas-900 text-solas-800 dark:text-solas-200 border-solas-200 dark:border-solas-700',
    oracle: 'bg-oracle-100 dark:bg-oracle-900 text-oracle-800 dark:text-oracle-200 border-oracle-200 dark:border-oracle-700',
    dev: 'bg-dev-100 dark:bg-dev-900 text-dev-800 dark:text-dev-200 border-dev-200 dark:border-dev-700'
  }[config.color] : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-600';

  return (
    <span 
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${sizeClasses[size]} ${colorClasses} ${className}`}
      title={config?.title || singleVoice || undefined}
    >
      <span className="text-current">{symbol}</span>
      {showName && (
        <span>{config?.name || singleVoice}</span>
      )}
    </span>
  );
} 