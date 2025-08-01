import React, { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { clsx } from 'clsx';

interface InputBarProps {
  onSend: (content: string) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({
  onSend,
  onTypingStart,
  onTypingStop,
  placeholder = "Digite uma mensagem...",
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || disabled) return;
    
    onSend(message.trim());
    setMessage('');
    
    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      onTypingStop?.();
    }
    
    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [message, disabled, onSend, isTyping, onTypingStop]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicators
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTypingStart?.();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    if (value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTypingStop?.();
      }, 1000);
    } else if (isTyping) {
      setIsTyping(false);
      onTypingStop?.();
    }
  }, [isTyping, onTypingStart, onTypingStop]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  }, [handleSubmit]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-background border-t border-border p-4">
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        {/* Attachment button */}
        <button
          type="button"
          disabled={disabled}
          className={clsx(
            'p-2 rounded-full transition-colors',
            disabled 
              ? 'text-textSecondary/50 cursor-not-allowed'
              : 'text-textSecondary hover:text-accent hover:bg-messageSent'
          )}
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Message input */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className={clsx(
              'w-full bg-messageSent text-textPrimary placeholder-textSecondary',
              'border border-border rounded-full px-4 py-2 pr-12',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
              'transition-all duration-150',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          />
          
          {/* Emoji button */}
          <button
            type="button"
            disabled={disabled}
            className={clsx(
              'absolute right-3 top-1/2 transform -translate-y-1/2',
              'p-1 rounded-full transition-colors',
              disabled 
                ? 'text-textSecondary/50 cursor-not-allowed'
                : 'text-textSecondary hover:text-accent'
            )}
          >
            <Smile className="w-4 h-4" />
          </button>
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className={clsx(
            'p-2 rounded-full transition-all duration-150',
            !message.trim() || disabled
              ? 'text-textSecondary/50 cursor-not-allowed'
              : 'text-white bg-accent hover:bg-accent/80 hover:scale-105'
          )}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};