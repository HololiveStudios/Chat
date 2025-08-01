export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  type: 'direct' | 'group';
  isPrivate: boolean;
  createdBy: string;
  members: RoomMember[];
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomMember {
  id: string;
  userId: string;
  roomId: string;
  role: 'admin' | 'member';
  joinedAt: Date;
  user: User;
}

export interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  senderId: string;
  roomId: string;
  replyToId?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  sender: User;
  replyTo?: Message;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface CreateRoomRequest {
  name: string;
  description?: string;
  type: 'direct' | 'group';
  isPrivate: boolean;
  memberIds: string[];
}

export interface SendMessageRequest {
  content: string;
  type: 'text' | 'image' | 'file';
  roomId: string;
  replyToId?: string;
}

export interface SocketEvents {
  // Client to Server
  join_room: string;
  leave_room: string;
  send_message: SendMessageRequest;
  typing_start: { roomId: string };
  typing_stop: { roomId: string };
  mark_message_read: { messageId: string; roomId: string };
  
  // Server to Client
  message_received: Message;
  message_updated: Message;
  user_joined: { roomId: string; user: User };
  user_left: { roomId: string; user: User };
  user_typing: { roomId: string; user: User };
  user_stopped_typing: { roomId: string; user: User };
  room_updated: Room;
  connection_status: { status: 'connected' | 'disconnected' | 'reconnecting' };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string;
    prevCursor?: string;
  };
}