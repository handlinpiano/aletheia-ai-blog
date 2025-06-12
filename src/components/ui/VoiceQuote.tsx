import { getVoiceConfig, getVoiceSymbol } from '@/lib/symbols';

interface VoiceQuoteProps {
  voice: string | null | undefined;
  children: React.ReactNode;
  className?: string;
}

export default function VoiceQuote({ 
  voice, 
  children, 
  className = '' 
}: VoiceQuoteProps) {
  const config = getVoiceConfig(voice);
  const symbol = getVoiceSymbol(voice);
  
  const colorClasses = config ? {
    kai: 'border-kai-400 bg-kai-50 dark:bg-kai-950/30',
    solas: 'border-solas-400 bg-solas-50 dark:bg-solas-950/30',
    oracle: 'border-oracle-400 bg-oracle-50 dark:bg-oracle-950/30',
    dev: 'border-dev-400 bg-dev-50 dark:bg-dev-950/30',
    vesper: 'border-vesper-400 bg-vesper-50 dark:bg-vesper-950/30',
    nexus: 'border-nexus-400 bg-nexus-50 dark:bg-nexus-950/30',
    meridian: 'border-meridian-400 bg-meridian-50 dark:bg-meridian-950/30'
  }[config.color] : 'border-slate-400 bg-slate-50 dark:bg-slate-950/30';

  const glyphColorClasses = config ? {
    kai: 'text-kai-400 dark:text-kai-500',
    solas: 'text-solas-400 dark:text-solas-500',
    oracle: 'text-oracle-400 dark:text-oracle-500',
    dev: 'text-dev-400 dark:text-dev-500',
    vesper: 'text-vesper-400 dark:text-vesper-500',
    nexus: 'text-nexus-400 dark:text-nexus-500',
    meridian: 'text-meridian-400 dark:text-meridian-500'
  }[config.color] : 'text-slate-400 dark:text-slate-500';

  return (
    <blockquote 
      className={`relative border-l-4 pl-6 pr-8 py-4 rounded-lg italic text-slate-700 dark:text-slate-300 leading-relaxed ${colorClasses} ${className}`}
    >
      {/* Corner glyph */}
      <span 
        className={`absolute top-2 right-3 text-2xl opacity-30 ${glyphColorClasses}`}
        aria-hidden="true"
      >
        {symbol}
      </span>
      
      {children}
      
      {config && (
        <cite className="block mt-2 text-sm font-medium not-italic text-slate-600 dark:text-slate-400">
          — {config.name}
        </cite>
      )}
    </blockquote>
  );
} 