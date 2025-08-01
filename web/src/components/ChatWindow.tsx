import React, { useEffect, useRef, useState } from 'react';
import { Phone, Video, MoreVertical, ArrowLeft, Users } from 'lucide-react';
import { Room, Message, User } from '../types';
import { MessageBubble } from './MessageBubble';
import { InputBar } from './InputBar';
import { clsx } from 'clsx';

interface ChatWindowProps {
  room: Room;
  messages: Message[];
  currentUser: User;
  onSendMessage: (content: string) => void;
  onTypingStart?: (roomId: string) => void;
  onTypingStop?: (roomId: string) => void;
  onBack?: () => void;
  typingUsers?: User[];
  isLoading?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  room,
  messages,
  currentUser,
  onSendMessage,
  onTypingStart,
  onTypingStop,
  onBack,
  typingUsers = [],
  isLoading = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setShowScrollButton(!isNearBottom);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getRoomDisplayName = (): string => {
    if (room.type === 'direct') {
      const otherMember = room.members.find(member => member.user.id !== currentUser.id);
      return otherMember?.user.username || 'Unknown User';
    }
    return room.name;
  };

  const getRoomSubtitle = (): string => {
    if (room.type === 'direct') {
      const otherMember = room.members.find(member => member.user.id !== currentUser.id);
      return otherMember?.user.isOnline ? 'Online' : 'Offline';
    }
    return `${room.members.length} members`;
  };

  const handleSendMessage = (content: string) => {
    onSendMessage(content);
  };

  const handleTypingStart = () => {
    onTypingStart?.(room.id);
  };

  const handleTypingStop = () => {
    onTypingStop?.(room.id);
  };

  const groupedMessages = messages.reduce((groups: Message[][], message, index) => {
    const prevMessage = messages[index - 1];
    
    // Group messages from the same sender within 5 minutes
    if (
      prevMessage &&
      prevMessage.senderId === message.senderId &&
      new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() < 5 * 60 * 1000
    ) {
      groups[groups.length - 1].push(message);
    } else {
      groups.push([message]);
    }
    
    return groups;
  }, []);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          {/* Back button (mobile) */}
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-messageSent transition-colors md:hidden"
            >
              <ArrowLeft className="w-5 h-5 text-textSecondary" />
            </button>
          )}

          {/* Room avatar/icon */}
          <div className="w-10 h-10 rounded-full bg-messageReceived flex items-center justify-center">
            {room.type === 'direct' ? (
              (() => {
                const otherMember = room.members.find(member => member.user.id !== currentUser.id);
                return otherMember?.user.avatar ? (
                  <img
                    src={otherMember.user.avatar}
                    alt={getRoomDisplayName()}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-textSecondary">
                    {getRoomDisplayName().charAt(0).toUpperCase()}
                  </span>
                );
              })()
            ) : (
              <Users className="w-5 h-5 text-textSecondary" />
            )}
          </div>

          {/* Room info */}
          <div>
            <h2 className="font-semibold text-textPrimary">
              {getRoomDisplayName()}
            </h2>
            <p className="text-sm text-textSecondary">
              {getRoomSubtitle()}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-lg hover:bg-messageSent transition-colors">
            <Phone className="w-5 h-5 text-textSecondary" />
          </button>
          <button className="p-2 rounded-lg hover:bg-messageSent transition-colors">
            <Video className="w-5 h-5 text-textSecondary" />
          </button>
          <button className="p-2 rounded-lg hover:bg-messageSent transition-colors">
            <MoreVertical className="w-5 h-5 text-textSecondary" />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        ) : groupedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-messageReceived flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-textSecondary" />
              </div>
              <h3 className="text-lg font-semibold text-textPrimary mb-2">
                Start the conversation
              </h3>
              <p className="text-textSecondary">
                Send a message to get started
              </p>
            </div>
          </div>
        ) : (
          <>
            {groupedMessages.map((messageGroup, groupIndex) => (
              <div key={groupIndex} className="space-y-1">
                {messageGroup.map((message, messageIndex) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.senderId === currentUser.id}
                    showAvatar={messageIndex === messageGroup.length - 1}
                    showTimestamp={messageIndex === messageGroup.length - 1}
                  />
                ))}
              </div>
            ))}

            {/* Typing indicators */}
            {typingUsers.length > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-messageReceived flex items-center justify-center">
                  <span className="text-xs text-textSecondary">...</span>
                </div>
                <div className="bg-messageReceived px-4 py-2 rounded-2xl rounded-bl-sm">
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-textSecondary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-textSecondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-textSecondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-6 p-3 bg-accent text-white rounded-full shadow-lg hover:bg-accent/80 transition-all duration-150 hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5 rotate-90" />
        </button>
      )}

      {/* Input bar */}
      <InputBar
        onSend={handleSendMessage}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        placeholder={`Message ${getRoomDisplayName()}...`}
      />
    </div>
  );
};