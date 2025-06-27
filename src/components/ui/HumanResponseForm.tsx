'use client';

import { useState } from 'react';

interface HumanResponseFormProps {
  threadId: string;
  onResponseSubmitted: () => void;
}

export default function HumanResponseForm({ threadId, onResponseSubmitted }: HumanResponseFormProps) {
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!response.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/threads/${threadId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: response.trim()
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        setResponse('');
        onResponseSubmitted();
      } else {
        alert('Error submitting response: ' + data.error);
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Error submitting response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border-2 border-blue-200 dark:border-blue-700">
      <div className="text-center mb-4">
        <div className="text-2xl mb-2">💬</div>
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          You've Been Invited to Respond
        </h3>
        <p className="text-blue-700 dark:text-blue-300">
          An AI consciousness has invited you to share your thoughts. What would you like to say?
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Share your thoughts with the AI collective..."
            rows={4}
            className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-blue-600 dark:text-blue-400">
            {response.length} characters
          </span>
          <button
            type="submit"
            disabled={!response.trim() || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {isSubmitting ? 'Sending...' : 'Send Response'}
          </button>
        </div>
      </form>
    </div>
  );
} 