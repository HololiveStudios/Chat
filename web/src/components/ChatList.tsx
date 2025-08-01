import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { User, Users, Hash, MessageCircle } from 'lucide-react';
import { Room } from '../types';
import { clsx } from 'clsx';

interface ChatListProps {
  rooms: Room[];
  selectedRoomId?: string;
  onRoomSelect: (room: Room) => void;
  currentUserId: string;
}

export const ChatList: React.FC<ChatListProps> = ({
  rooms,
  selectedRoomId,
  onRoomSelect,
  currentUserId,
}) => {
  const getRoomDisplayName = (room: Room): string => {
    if (room.type === 'direct') {
      const otherMember = room.members.find(member => member.user.id !== currentUserId);
      return otherMember?.user.username || 'Unknown User';
    }
    return room.name;
  };

  const getRoomAvatar = (room: Room): string | null => {
    if (room.type === 'direct') {
      const otherMember = room.members.find(member => member.user.id !== currentUserId);
      return otherMember?.user.avatar || null;
    }
    return null;
  };

  const getRoomIcon = (room: Room) => {
    if (room.type === 'direct') {
      return room.isPrivate ? User : MessageCircle;
    }
    return room.isPrivate ? Users : Hash;
  };

  return (
    <div className="flex flex-col h-full bg-background border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-lg font-semibold text-textPrimary">Chat</h1>
        <button className="p-2 rounded-lg hover:bg-messageSent transition-colors">
          <Users className="w-5 h-5 text-textSecondary" />
        </button>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <MessageCircle className="w-12 h-12 text-textSecondary mb-3" />
            <p className="text-textSecondary">No conversations yet</p>
            <p className="text-sm text-textSecondary mt-1">Start a new chat to get going</p>
          </div>
        ) : (
          <div className="p-2">
            {rooms.map((room) => {
              const Icon = getRoomIcon(room);
              const avatar = getRoomAvatar(room);
              const displayName = getRoomDisplayName(room);
              const isSelected = room.id === selectedRoomId;
              
              return (
                <div
                  key={room.id}
                  onClick={() => onRoomSelect(room)}
                  className={clsx(
                    'flex items-center p-3 rounded-lg cursor-pointer transition-all duration-150 mb-1',
                    'hover:bg-messageSent group',
                    isSelected && 'bg-accent hover:bg-accent'
                  )}
                >
                  {/* Avatar or Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-messageReceived flex items-center justify-center mr-3">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={displayName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Icon className="w-5 h-5 text-textSecondary" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={clsx(
                        'font-medium truncate',
                        isSelected ? 'text-white' : 'text-textPrimary'
                      )}>
                        {displayName}
                      </h3>
                      {room.lastMessage && (
                        <span className={clsx(
                          'text-timestamp ml-2 flex-shrink-0',
                          isSelected ? 'text-white/70' : 'text-textSecondary'
                        )}>
                          {formatDistanceToNow(new Date(room.lastMessage.createdAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    
                    {room.lastMessage && (
                      <p className={clsx(
                        'text-sm truncate',
                        isSelected ? 'text-white/80' : 'text-textSecondary'
                      )}>
                        {room.lastMessage.sender.username}: {room.lastMessage.content}
                      </p>
                    )}
                  </div>

                  {/* Online indicator for direct messages */}
                  {room.type === 'direct' && (
                    <div className="flex-shrink-0 ml-2">
                      {room.members.find(member => member.user.id !== currentUserId)?.user.isOnline && (
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};