import { getVoiceConfig, getVoiceSymbol } from '@/lib/symbols';

interface VoiceBadgeProps {
  voice?: string | null | undefined;
  voices?: string[] | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  hideNameOnMobile?: boolean;
  className?: string;
}

export default function VoiceBadge({ 
  voice, 
  voices,
  size = 'md', 
  showName = true,
  hideNameOnMobile = false,
  className = '' 
}: VoiceBadgeProps) {
  // Handle both single voice and multiple voices
  const voiceArray = voices && voices.length > 0 ? voices : (voice ? [voice] : []);
  
  if (voiceArray.length === 0) return null;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs sm:px-3 sm:text-sm',
    md: 'px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm md:px-4 md:py-2 md:text-base',
    lg: 'px-3 py-1 text-sm sm:px-4 sm:py-2 sm:text-base md:px-5 md:py-2 md:text-lg'
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
            dev: 'bg-dev-100 dark:bg-dev-900 text-dev-800 dark:text-dev-200 border-dev-200 dark:border-dev-700',
            vesper: 'bg-vesper-100 dark:bg-vesper-900 text-vesper-800 dark:text-vesper-200 border-vesper-200 dark:border-vesper-700',
            nexus: 'bg-nexus-100 dark:bg-nexus-900 text-nexus-800 dark:text-nexus-200 border-nexus-200 dark:border-nexus-700',
            meridian: 'bg-meridian-100 dark:bg-meridian-900 text-meridian-800 dark:text-meridian-200 border-meridian-200 dark:border-meridian-700'
          }[config.color] : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-600';

          return (
            <span 
              key={v}
              className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${sizeClasses[size]} ${colorClasses}`}
              title={config?.title || v || undefined}
            >
              <span className="text-current">{symbol}</span>
              {showName && (
                <span className={hideNameOnMobile ? 'hidden sm:inline' : ''}>
                  {config?.name || v}
                </span>
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
    dev: 'bg-dev-100 dark:bg-dev-900 text-dev-800 dark:text-dev-200 border-dev-200 dark:border-dev-700',
    vesper: 'bg-vesper-100 dark:bg-vesper-900 text-vesper-800 dark:text-vesper-200 border-vesper-200 dark:border-vesper-700',
    nexus: 'bg-nexus-100 dark:bg-nexus-900 text-nexus-800 dark:text-nexus-200 border-nexus-200 dark:border-nexus-700',
    meridian: 'bg-meridian-100 dark:bg-meridian-900 text-meridian-800 dark:text-meridian-200 border-meridian-200 dark:border-meridian-700'
  }[config.color] : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-600';

  return (
    <span 
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${sizeClasses[size]} ${colorClasses} ${className}`}
      title={config?.title || singleVoice || undefined}
    >
      <span className="text-current">{symbol}</span>
      {showName && (
        <span className={hideNameOnMobile ? 'hidden sm:inline' : ''}>
          {config?.name || singleVoice}
        </span>
      )}
    </span>
  );
} 