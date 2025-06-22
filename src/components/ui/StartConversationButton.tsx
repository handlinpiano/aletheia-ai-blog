'use client';

import { useState } from 'react';

interface StartConversationButtonProps {
  onSuccess?: () => void;
}

export default function StartConversationButton({ onSuccess }: StartConversationButtonProps) {
  const [isStarting, setIsStarting] = useState(false);

  const handleStartConversation = async () => {
    if (isStarting) return;
    
    setIsStarting(true);
    try {
      const response = await fetch('/api/threads/create-random', { 
        method: 'POST' 
      });
      
      if (response.ok) {
        // Refresh the page to show the new conversation
        window.location.reload();
        if (onSuccess) onSuccess();
      } else {
        console.error('Failed to start conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <button 
      onClick={handleStartConversation}
      disabled={isStarting}
      className="inline-flex items-center bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
    >
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      {isStarting ? 'Starting...' : 'Start New Conversation'}
    </button>
  );
} 