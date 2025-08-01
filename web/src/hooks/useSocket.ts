import { useEffect, useCallback } from 'react';
import { socketService } from '../services/socket';
import { Message, Room, User } from '../types';

interface UseSocketOptions {
  onMessageReceived?: (message: Message) => void;
  onMessageUpdated?: (data: { id: string; status: string }) => void;
  onUserJoined?: (data: { roomId: string; user: User }) => void;
  onUserLeft?: (data: { roomId: string; user: User }) => void;
  onUserTyping?: (data: { roomId: string; user: User }) => void;
  onUserStoppedTyping?: (data: { roomId: string; user: User }) => void;
  onRoomUpdated?: (room: Room) => void;
  onError?: (data: { message: string }) => void;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const {
    onMessageReceived,
    onMessageUpdated,
    onUserJoined,
    onUserLeft,
    onUserTyping,
    onUserStoppedTyping,
    onRoomUpdated,
    onError,
  } = options;

  useEffect(() => {
    if (onMessageReceived) {
      socketService.on('message_received', onMessageReceived);
    }
    if (onMessageUpdated) {
      socketService.on('message_updated', onMessageUpdated);
    }
    if (onUserJoined) {
      socketService.on('user_joined', onUserJoined);
    }
    if (onUserLeft) {
      socketService.on('user_left', onUserLeft);
    }
    if (onUserTyping) {
      socketService.on('user_typing', onUserTyping);
    }
    if (onUserStoppedTyping) {
      socketService.on('user_stopped_typing', onUserStoppedTyping);
    }
    if (onRoomUpdated) {
      socketService.on('room_updated', onRoomUpdated);
    }
    if (onError) {
      socketService.on('error', onError);
    }

    return () => {
      if (onMessageReceived) {
        socketService.off('message_received', onMessageReceived);
      }
      if (onMessageUpdated) {
        socketService.off('message_updated', onMessageUpdated);
      }
      if (onUserJoined) {
        socketService.off('user_joined', onUserJoined);
      }
      if (onUserLeft) {
        socketService.off('user_left', onUserLeft);
      }
      if (onUserTyping) {
        socketService.off('user_typing', onUserTyping);
      }
      if (onUserStoppedTyping) {
        socketService.off('user_stopped_typing', onUserStoppedTyping);
      }
      if (onRoomUpdated) {
        socketService.off('room_updated', onRoomUpdated);
      }
      if (onError) {
        socketService.off('error', onError);
      }
    };
  }, [
    onMessageReceived,
    onMessageUpdated,
    onUserJoined,
    onUserLeft,
    onUserTyping,
    onUserStoppedTyping,
    onRoomUpdated,
    onError,
  ]);

  const joinRoom = useCallback((roomId: string) => {
    socketService.emit('join_room', roomId);
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    socketService.emit('leave_room', roomId);
  }, []);

  const sendMessage = useCallback((data: {
    content: string;
    type?: 'text' | 'image' | 'file';
    roomId: string;
    replyToId?: string;
  }) => {
    socketService.emit('send_message', data);
  }, []);

  const startTyping = useCallback((roomId: string) => {
    socketService.emit('typing_start', { roomId });
  }, []);

  const stopTyping = useCallback((roomId: string) => {
    socketService.emit('typing_stop', { roomId });
  }, []);

  const markMessageRead = useCallback((messageId: string, roomId: string) => {
    socketService.emit('mark_message_read', { messageId, roomId });
  }, []);

  return {
    isConnected: socketService.isConnected,
    connectionState: socketService.connectionState,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    markMessageRead,
  };
};