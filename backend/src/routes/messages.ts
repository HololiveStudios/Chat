import { Router } from 'express';
import Joi from 'joi';
import { getMessages, sendMessage } from '../controllers/messageController';
import { authenticateToken } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';

const router = Router();

const getMessagesSchema = Joi.object({
  page: Joi.string().pattern(/^\d+$/).optional(),
  limit: Joi.string().pattern(/^\d+$/).optional(),
  cursor: Joi.string().isoDate().optional(),
});

const sendMessageSchema = Joi.object({
  content: Joi.string().min(1).max(4000).required(),
  type: Joi.string().valid('text', 'image', 'file', 'system').default('text'),
  roomId: Joi.string().required(),
  replyToId: Joi.string().optional(),
});

router.get('/:roomId', authenticateToken, validateQuery(getMessagesSchema), getMessages);
router.post('/', authenticateToken, validateBody(sendMessageSchema), sendMessage);

export { router as messageRoutes };