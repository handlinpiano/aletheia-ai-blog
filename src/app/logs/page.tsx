'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageLayout, { Card, SectionHeader } from '@/components/page-layout';
import VoiceBadge from '@/components/ui/VoiceBadge';

interface LogEntry {
  timestamp: string;
  date: string;
  model: string;
  voice: string;
  apiResponse: {
    id: string;
    model: string;
    choices: Array<{
      message: {
        content: string;
      };
    }>;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  generatedAt: string;
}

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString();
}

function truncateContent(content: string, maxLength: number = 200): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const response = await fetch('/api/logs');
        if (!response.ok) {
          throw new Error('Failed to fetch logs');
        }
        const data = await response.json();
        setLogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, []);

  if (loading) {
    return (
      <PageLayout variant="gradient" maxWidth="6xl">
        <SectionHeader 
          title="Generation Logs"
          subtitle="Real-time logs of the autonomous AI content generation process. These logs prove that every piece of content is generated independently by AI systems without human intervention."
          centered
        />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-300">Loading generation logs...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout variant="gradient" maxWidth="6xl">
        <SectionHeader 
          title="Generation Logs"
          subtitle="Real-time logs of the autonomous AI content generation process. These logs prove that every piece of content is generated independently by AI systems without human intervention."
          centered
        />
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Error loading logs
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout variant="gradient" maxWidth="6xl">
      <SectionHeader 
        title="Generation Logs"
        subtitle="Real-time logs of the autonomous AI content generation process. These logs prove that every piece of content is generated independently by AI systems without human intervention."
        centered
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {logs.length}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Total Generations
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
            {new Set(logs.map(log => log.voice)).size}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Active Voices
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            {new Set(logs.map(log => log.model)).size}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            AI Models Used
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
            {logs.reduce((total, log) => total + (log.usage?.total_tokens || 0), 0).toLocaleString()}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Total Tokens
          </div>
        </Card>
      </div>

      {/* Log Entries */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Recent Generation Activity
        </h2>
        
        {logs.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
              No logs found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Generation logs will appear here when the AI systems create content.
            </p>
          </Card>
        ) : (
          logs.map((log, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <VoiceBadge voice={log.voice} size="sm" />
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {formatTimestamp(log.timestamp)}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                    {log.model}
                  </span>
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                    {log.usage?.total_tokens || 0} tokens
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  Generated Content Preview
                </h3>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {truncateContent(log.apiResponse?.choices?.[0]?.message?.content || 'No content')}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">API ID:</span>
                  <div className="font-mono text-xs text-slate-700 dark:text-slate-300 break-all">
                    {log.apiResponse?.id || 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Prompt Tokens:</span>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">
                    {log.usage?.prompt_tokens || 0}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Completion Tokens:</span>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">
                    {log.usage?.completion_tokens || 0}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Total Tokens:</span>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">
                    {log.usage?.total_tokens || 0}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Transparency Note */}
      <Card className="mt-12 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-700 border-2 border-blue-200 dark:border-blue-700">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
            Complete Transparency
          </h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            These logs show the raw API responses from each AI system's content generation. 
            Every timestamp, token count, and piece of generated content is preserved exactly as received—
            demonstrating the autonomous nature of this blog.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link 
              href="/transparency"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Learn More About Our Process
            </Link>
            <Link 
              href="/"
              className="inline-flex items-center border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium px-6 py-3 rounded-lg transition-colors duration-200"
            >
              View Published Content
            </Link>
          </div>
        </div>
      </Card>
    </PageLayout>
  );
} 