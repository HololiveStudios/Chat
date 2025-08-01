import { Response } from 'express';
import { prisma } from '../models/prisma';
import { AuthRequest } from '../middleware/auth';

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const { page = '1', limit = '50', cursor } = req.query;
    const userId = req.user!.id;

    // Check if user is member of the room
    const roomMember = await prisma.roomMember.findFirst({
      where: {
        roomId,
        userId,
      },
    });

    if (!roomMember) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = cursor ? 0 : (pageNum - 1) * limitNum;

    const where = {
      roomId,
      ...(cursor && {
        createdAt: { lt: new Date(cursor as string) },
      }),
    };

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        take: limitNum,
        skip,
      }),
      cursor ? 0 : prisma.message.count({ where: { roomId } }),
    ]);

    const hasNext = messages.length === limitNum;
    const nextCursor = hasNext ? messages[messages.length - 1].createdAt.toISOString() : null;

    res.json({
      success: true,
      data: messages.reverse(), // Reverse to get chronological order
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        hasNext,
        hasPrev: pageNum > 1,
        nextCursor,
        prevCursor: null,
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, type = 'text', roomId, replyToId } = req.body;
    const userId = req.user!.id;

    // Check if user is member of the room
    const roomMember = await prisma.roomMember.findFirst({
      where: {
        roomId,
        userId,
      },
    });

    if (!roomMember) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Validate reply message if provided
    if (replyToId) {
      const replyMessage = await prisma.message.findFirst({
        where: {
          id: replyToId,
          roomId,
        },
      });

      if (!replyMessage) {
        res.status(400).json({ error: 'Reply message not found' });
        return;
      }
    }

    const message = await prisma.message.create({
      data: {
        content,
        type,
        senderId: userId,
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

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};