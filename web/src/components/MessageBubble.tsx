import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Check, CheckCheck, Clock } from 'lucide-react';
import { Message } from '../types';
import { clsx } from 'clsx';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true,
  showTimestamp = true,
}) => {
  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3" />;
      case 'sent':
        return <Check className="w-3 h-3" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-accent" />;
      default:
        return null;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(messageDate, 'HH:mm');
    } else if (diffInHours < 48) {
      return 'Yesterday ' + format(messageDate, 'HH:mm');
    } else {
      return format(messageDate, 'dd/MM/yyyy HH:mm');
    }
  };

  return (
    <div className={clsx(
      'flex items-end space-x-2 animate-slide-in',
      isOwn ? 'flex-row-reverse space-x-reverse' : 'flex-row'
    )}>
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-messageReceived flex items-center justify-center">
          {message.sender.avatar ? (
            <img
              src={message.sender.avatar}
              alt={message.sender.username}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium text-textSecondary">
              {message.sender.username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      )}

      {/* Message Content */}
      <div className={clsx(
        'flex flex-col max-w-xs md:max-w-md lg:max-w-lg',
        isOwn ? 'items-end' : 'items-start'
      )}>
        {/* Sender name (only for received messages) */}
        {!isOwn && showAvatar && (
          <span className="text-username font-medium text-textSecondary mb-1 px-3">
            {message.sender.username}
          </span>
        )}

        {/* Reply message (if any) */}
        {message.replyTo && (
          <div className={clsx(
            'mb-1 px-3 py-1 border-l-2 border-accent bg-background/30 rounded text-sm',
            isOwn ? 'bg-messageSent/30' : 'bg-messageReceived/30'
          )}>
            <p className="text-accent font-medium text-xs">
              {message.replyTo.sender.username}
            </p>
            <p className="text-textSecondary text-xs truncate">
              {message.replyTo.content}
            </p>
          </div>
        )}

        {/* Message bubble */}
        <div className={clsx(
          'relative px-4 py-2 rounded-2xl',
          isOwn 
            ? 'bg-messageSent text-textPrimary rounded-br-sm' 
            : 'bg-messageReceived text-textPrimary rounded-bl-sm'
        )}>
          <p className="text-body leading-relaxed break-words">
            {message.content}
          </p>
          
          {/* Timestamp and status */}
          <div className={clsx(
            'flex items-center justify-end mt-1 space-x-1',
            isOwn ? 'flex-row' : 'flex-row-reverse space-x-reverse'
          )}>
            {showTimestamp && (
              <span className="text-timestamp text-textSecondary">
                {formatTime(message.createdAt)}
              </span>
            )}
            {isOwn && (
              <div className="text-textSecondary">
                {getStatusIcon()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};