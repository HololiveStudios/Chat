const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const result: ApiResponse<T> = await response.json();
    
    if (!result.success && result.error) {
      throw new Error(result.error);
    }

    return result.data as T;
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(username: string, email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(refreshToken: string) {
    return this.request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  // User endpoints
  async getUsers() {
    return this.request('/users');
  }

  async getUserProfile(id: string) {
    return this.request(`/users/${id}`);
  }

  async updateProfile(data: { username?: string; avatar?: string }) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Room endpoints
  async getRooms() {
    return this.request('/rooms');
  }

  async createRoom(data: {
    name: string;
    description?: string;
    type: 'direct' | 'group';
    isPrivate: boolean;
    memberIds: string[];
  }) {
    return this.request('/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRoomById(id: string) {
    return this.request(`/rooms/${id}`);
  }

  // Message endpoints
  async getMessages(roomId: string, options?: {
    page?: number;
    limit?: number;
    cursor?: string;
  }) {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.cursor) params.append('cursor', options.cursor);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/messages/${roomId}${query}`);
  }

  async sendMessage(data: {
    content: string;
    type?: 'text' | 'image' | 'file';
    roomId: string;
    replyToId?: string;
  }) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();