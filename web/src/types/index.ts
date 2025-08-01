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

export interface ConnectionStatus {
  status: 'connected' | 'disconnected' | 'reconnecting';
  isOnline: boolean;
}