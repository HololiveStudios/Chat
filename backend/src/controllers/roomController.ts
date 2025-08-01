import { Response } from 'express';
import { prisma } from '../models/prisma';
import { AuthRequest } from '../middleware/auth';

export const getRooms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const rooms = await prisma.room.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
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
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const roomsWithLastMessage = rooms.map(room => ({
      ...room,
      lastMessage: room.messages[0] || null,
      messages: undefined, // Remove messages array, keep only lastMessage
    }));

    res.json({
      success: true,
      data: roomsWithLastMessage,
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, type, isPrivate, memberIds } = req.body;
    const userId = req.user!.id;

    // For direct messages, ensure only 2 members
    if (type === 'direct' && memberIds.length !== 1) {
      res.status(400).json({ error: 'Direct messages must have exactly 2 members' });
      return;
    }

    // Check if direct room already exists
    if (type === 'direct') {
      const existingRoom = await prisma.room.findFirst({
        where: {
          type: 'direct',
          AND: [
            {
              members: {
                some: { userId },
              },
            },
            {
              members: {
                some: { userId: memberIds[0] },
              },
            },
          ],
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  avatar: true,
                  isOnline: true,
                  lastSeen: true,
                },
              },
            },
          },
        },
      });

      if (existingRoom) {
        res.json({
          success: true,
          data: existingRoom,
        });
        return;
      }
    }

    // Create room
    const room = await prisma.room.create({
      data: {
        name: type === 'direct' ? '' : name, // Direct messages have empty name
        description: type === 'direct' ? null : description,
        type,
        isPrivate: type === 'direct' ? true : isPrivate,
        createdBy: userId,
      },
    });

    // Add members (including creator for groups, both users for direct)
    const membersToAdd = type === 'direct' 
      ? [
          { userId, roomId: room.id, role: 'member' },
          { userId: memberIds[0], roomId: room.id, role: 'member' },
        ]
      : [
          { userId, roomId: room.id, role: 'admin' },
          ...memberIds.map((memberId: string) => ({
            userId: memberId,
            roomId: room.id,
            role: 'member',
          })),
        ];

    await prisma.roomMember.createMany({
      data: membersToAdd,
    });

    // Fetch the created room with members
    const createdRoom = await prisma.room.findUnique({
      where: { id: room.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: createdRoom,
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRoomById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const room = await prisma.room.findFirst({
      where: {
        id,
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    if (!room) {
      res.status(404).json({ error: 'Room not found or access denied' });
      return;
    }

    res.json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};