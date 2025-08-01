import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../models/prisma';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export const setupSocketHandlers = (io: Server): void => {
  // Authentication middleware for socket connections
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, username: true, email: true },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user.id;
      socket.user = user;

      // Update user online status
      await prisma.user.update({
        where: { id: user.id },
        data: { isOnline: true, lastSeen: new Date() },
      });

      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.user?.username} connected`);

    // Join user rooms
    socket.on('join_rooms', async () => {
      try {
        const rooms = await prisma.room.findMany({
          where: {
            members: {
              some: {
                userId: socket.userId,
              },
            },
          },
          select: { id: true },
        });

        rooms.forEach(room => {
          socket.join(room.id);
        });

        socket.emit('rooms_joined', { roomIds: rooms.map(r => r.id) });
      } catch (error) {
        console.error('Join rooms error:', error);
      }
    });

    // Join specific room
    socket.on('join_room', async (roomId: string) => {
      try {
        // Verify user is member of the room
        const roomMember = await prisma.roomMember.findFirst({
          where: {
            roomId,
            userId: socket.userId,
          },
        });

        if (roomMember) {
          socket.join(roomId);
          socket.to(roomId).emit('user_joined', { 
            roomId, 
            user: socket.user 
          });
        }
      } catch (error) {
        console.error('Join room error:', error);
      }
    });

    // Leave room
    socket.on('leave_room', (roomId: string) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user_left', { 
        roomId, 
        user: socket.user 
      });
    });

    // Handle message sending
    socket.on('send_message', async (data) => {
      try {
        const { content, type = 'text', roomId, replyToId } = data;

        // Verify user is member of the room
        const roomMember = await prisma.roomMember.findFirst({
          where: {
            roomId,
            userId: socket.userId,
          },
        });

        if (!roomMember) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Create message
        const message = await prisma.message.create({
          data: {
            content,
            type,
            senderId: socket.userId!,
            roomId,
            replyToId,
            status: 'sent',
          },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
            replyTo: {
              include: {
                sender: {
                  select: {
                    id: true,
                    username: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        });

        // Update room's updatedAt timestamp
        await prisma.room.update({
          where: { id: roomId },
          data: { updatedAt: new Date() },
        });

        // Broadcast message to room members
        io.to(roomId).emit('message_received', message);

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { roomId } = data;
      socket.to(roomId).emit('user_typing', { 
        roomId, 
        user: socket.user 
      });
    });

    socket.on('typing_stop', (data) => {
      const { roomId } = data;
      socket.to(roomId).emit('user_stopped_typing', { 
        roomId, 
        user: socket.user 
      });
    });

    // Handle message read status
    socket.on('mark_message_read', async (data) => {
      try {
        const { messageId, roomId } = data;

        await prisma.message.update({
          where: { id: messageId },
          data: { status: 'read' },
        });

        socket.to(roomId).emit('message_updated', {
          id: messageId,
          status: 'read',
        });
      } catch (error) {
        console.error('Mark message read error:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User ${socket.user?.username} disconnected`);
      
      try {
        // Update user offline status
        if (socket.userId) {
          await prisma.user.update({
            where: { id: socket.userId },
            data: { isOnline: false, lastSeen: new Date() },
          });
        }
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });
  });
};