import { io, Socket } from 'socket.io-client';
import { Message, Room, User, ConnectionStatus } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3003';

interface SocketEvents {
  // Client to Server
  join_rooms: () => void;
  join_room: (roomId: string) => void;
  leave_room: (roomId: string) => void;
  send_message: (data: {
    content: string;
    type?: 'text' | 'image' | 'file';
    roomId: string;
    replyToId?: string;
  }) => void;
  typing_start: (data: { roomId: string }) => void;
  typing_stop: (data: { roomId: string }) => void;
  mark_message_read: (data: { messageId: string; roomId: string }) => void;

  // Server to Client
  rooms_joined: (data: { roomIds: string[] }) => void;
  message_received: (message: Message) => void;
  message_updated: (data: { id: string; status: string }) => void;
  user_joined: (data: { roomId: string; user: User }) => void;
  user_left: (data: { roomId: string; user: User }) => void;
  user_typing: (data: { roomId: string; user: User }) => void;
  user_stopped_typing: (data: { roomId: string; user: User }) => void;
  room_updated: (room: Room) => void;
  connection_status: (status: ConnectionStatus) => void;
  error: (data: { message: string }) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventHandlers();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.reconnectAttempts = 0;
      this.emit('join_rooms');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      this.emit('join_rooms');
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
    });
  }

  emit<K extends keyof SocketEvents>(event: K, ...args: Parameters<SocketEvents[K]>): void {
    if (this.socket?.connected) {
      (this.socket as any).emit(event, ...args);
    }
  }

  on<K extends keyof SocketEvents>(event: K, handler: SocketEvents[K]): void {
    if (this.socket) {
      (this.socket as any).on(event, handler);
    }
  }

  off<K extends keyof SocketEvents>(event: K, handler?: SocketEvents[K]): void {
    if (this.socket) {
      (this.socket as any).off(event, handler);
    }
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  get connectionState(): 'connected' | 'disconnected' | 'reconnecting' {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    if (this.reconnectAttempts > 0 && this.reconnectAttempts < this.maxReconnectAttempts) {
      return 'reconnecting';
    }
    return 'disconnected';
  }
}

export const socketService = new SocketService();