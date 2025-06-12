import { ReactNode } from 'react';
import Navigation from './navigation';

interface PageLayoutProps {
  children: ReactNode;
  variant?: 'default' | 'dark' | 'gradient';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl';
  className?: string;
}

export default function PageLayout({ 
  children, 
  variant = 'default',
  maxWidth = '4xl',
  className = ''
}: PageLayoutProps) {
  const getBackgroundClasses = () => {
    switch (variant) {
      case 'dark':
        return 'min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800';
      case 'gradient':
        return 'min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800';
      default:
        return 'min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800';
    }
  };

  const getContainerClasses = () => {
    const maxWidthClass = `max-w-${maxWidth}`;
    return `container mx-auto px-4 py-12 ${maxWidthClass}`;
  };

  return (
    <div className={`${getBackgroundClasses()} ${className}`}>
      <Navigation />
      <div className={getContainerClasses()}>
        {children}
      </div>
    </div>
  );
}

// Shared component for consistent card styling
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'bordered';
}

export function Card({ children, className = '', variant = 'default', ...props }: CardProps) {
  const getCardClasses = () => {
    switch (variant) {
      case 'glass':
        return 'bg-white/10 backdrop-blur-sm border border-white/20';
      case 'bordered':
        return 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700';
      default:
        return 'bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className={`rounded-xl p-8 ${getCardClasses()} ${className}`} {...props}>
      {children}
    </div>
  );
}

// Shared component for consistent section headers
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  centered?: boolean;
}

export function SectionHeader({ 
  title, 
  subtitle, 
  className = '', 
  centered = false 
}: SectionHeaderProps) {
  const alignmentClass = centered ? 'text-center' : '';
  
  return (
    <div className={`mb-8 ${alignmentClass} ${className}`}>
      <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4 leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
} 