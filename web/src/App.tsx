import React, { useState, useEffect } from 'react';
import { Room, Message, User } from './types';
import { ChatList } from './components/ChatList';
import { ChatWindow } from './components/ChatWindow';
import { AuthForm } from './components/AuthForm';
import { useAuth } from './hooks/useAuth';
import { useSocket } from './hooks/useSocket';
import { apiService } from './services/api';

export default function App() {
  const { user, isAuthenticated, isLoading, login, register } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<User[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Socket event handlers
  const { 
    isConnected, 
    connectionState,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping 
  } = useSocket({
    onMessageReceived: (message) => {
      if (selectedRoom && message.roomId === selectedRoom.id) {
        setMessages(prev => [...prev, message]);
      }
      
      // Update room's last message
      setRooms(prev => prev.map(room => 
        room.id === message.roomId 
          ? { ...room, lastMessage: message, updatedAt: new Date(message.createdAt) }
          : room
      ));
    },
    onUserTyping: ({ roomId, user: typingUser }) => {
      if (selectedRoom && roomId === selectedRoom.id) {
        setTypingUsers(prev => {
          if (!prev.find(u => u.id === typingUser.id)) {
            return [...prev, typingUser];
          }
          return prev;
        });
      }
    },
    onUserStoppedTyping: ({ roomId, user: typingUser }) => {
      if (selectedRoom && roomId === selectedRoom.id) {
        setTypingUsers(prev => prev.filter(u => u.id !== typingUser.id));
      }
    },
  });

  // Load rooms on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadRooms();
    }
  }, [isAuthenticated]);

  // Load messages when room is selected
  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
      joinRoom(selectedRoom.id);
      setIsMobileMenuOpen(false);
      
      return () => {
        if (selectedRoom) {
          leaveRoom(selectedRoom.id);
        }
      };
    }
  }, [selectedRoom?.id]);

  const loadRooms = async () => {
    try {
      const roomsData = await apiService.getRooms();
      setRooms(roomsData);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const messagesData = await apiService.getMessages(roomId, { limit: 50 });
      if (messagesData.data) {
        setMessages(messagesData.data);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    setMessages([]);
    setTypingUsers([]);
  };

  const handleSendMessage = (content: string) => {
    if (!selectedRoom) return;
    
    // Send via socket for real-time delivery
    sendMessage({
      content,
      roomId: selectedRoom.id,
      type: 'text',
    });
  };

  const handleTypingStart = (roomId: string) => {
    startTyping(roomId);
  };

  const handleTypingStop = (roomId: string) => {
    stopTyping(roomId);
  };

  const handleAuthSubmit = async (data: {
    email: string;
    password: string;
    username?: string;
  }) => {
    if (authMode === 'login') {
      return await login(data.email, data.password);
    } else {
      return await register(data.username!, data.email, data.password);
    }
  };

  const handleBack = () => {
    setSelectedRoom(null);
    setIsMobileMenuOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <AuthForm
        mode={authMode}
        onSubmit={handleAuthSubmit}
        onModeChange={setAuthMode}
      />
    );
  }

  return (
    <div className="h-screen bg-background text-textPrimary overflow-hidden">
      {/* Connection status indicator */}
      {connectionState !== 'connected' && (
        <div className="bg-yellow-500 text-black text-center py-2 text-sm">
          {connectionState === 'reconnecting' ? 'Reconnecting...' : 'Disconnected'}
        </div>
      )}

      <div className="flex h-full">
        {/* Chat List - Desktop always visible, Mobile conditional */}
        <div className={`
          w-full md:w-80 flex-shrink-0 border-r border-border
          ${selectedRoom ? 'hidden md:block' : 'block'}
        `}>
          <ChatList
            rooms={rooms}
            selectedRoomId={selectedRoom?.id}
            onRoomSelect={handleRoomSelect}
            currentUserId={user.id}
          />
        </div>

        {/* Chat Window - Desktop always visible when room selected, Mobile conditional */}
        <div className={`
          flex-1 
          ${!selectedRoom ? 'hidden md:flex' : 'flex'}
          ${!selectedRoom ? 'md:items-center md:justify-center' : ''}
        `}>
          {selectedRoom ? (
            <ChatWindow
              room={selectedRoom}
              messages={messages}
              currentUser={user}
              onSendMessage={handleSendMessage}
              onTypingStart={handleTypingStart}
              onTypingStop={handleTypingStop}
              onBack={handleBack}
              typingUsers={typingUsers}
            />
          ) : (
            <div className="hidden md:flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-messageReceived flex items-center justify-center mx-auto mb-6">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">💬</span>
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-textPrimary mb-2">
                  Welcome to P2P Chat
                </h2>
                <p className="text-textSecondary max-w-sm">
                  Select a conversation from the sidebar to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}