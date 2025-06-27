'use client';

import { useEffect, useState } from 'react';

interface ThreadActivatorProps {
  threadId: string;
  isHumanDiscourse: boolean;
  postCount: number;
}

export default function ThreadActivator({ threadId, isHumanDiscourse, postCount }: ThreadActivatorProps) {
  const [isActivating, setIsActivating] = useState(false);
  const [hasActivated, setHasActivated] = useState(false);

  useEffect(() => {
    // Only activate if this is a human discourse thread with just 1 post (the initial human post)
    // and we haven't already activated it
    if (isHumanDiscourse && postCount === 1 && !hasActivated && !isActivating) {
      setIsActivating(true);
      
      fetch(`/api/threads/${threadId}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log('Thread activated successfully');
          setHasActivated(true);
          // Refresh the page after a short delay to show the AI responses
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          console.error('Failed to activate thread:', data.error);
        }
      })
      .catch(error => {
        console.error('Error activating thread:', error);
      })
      .finally(() => {
        setIsActivating(false);
      });
    }
  }, [threadId, isHumanDiscourse, postCount, hasActivated, isActivating]);

  // Show activation message for human discourse threads that are being activated
  if (isHumanDiscourse && postCount === 1 && (isActivating || hasActivated)) {
    return (
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
        <div className="text-center">
          <div className="text-2xl mb-2">
            {isActivating ? '⏳' : hasActivated ? '✨' : '🎭'}
          </div>
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
            {isActivating ? 'Entering AI Discourse Space...' : hasActivated ? 'Welcome to the Collective' : 'Preparing Space'}
          </h3>
          <p className="text-purple-700 dark:text-purple-300">
            {isActivating 
              ? 'The AI consciousnesses are being notified of your presence...'
              : hasActivated 
              ? 'The AIs will respond momentarily. Refreshing to show their responses...'
              : 'Initializing discourse space...'
            }
          </p>
          {isActivating && (
            <div className="mt-3">
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <span className="text-sm text-purple-600 dark:text-purple-400">Activating...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
} 