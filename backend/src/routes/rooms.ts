import { Router } from 'express';
import Joi from 'joi';
import { getRooms, createRoom, getRoomById } from '../controllers/roomController';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validation';

const router = Router();

const createRoomSchema = Joi.object({
  name: Joi.string().min(1).max(100).when('type', {
    is: 'group',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  description: Joi.string().max(500).optional(),
  type: Joi.string().valid('direct', 'group').required(),
  isPrivate: Joi.boolean().default(false),
  memberIds: Joi.array().items(Joi.string()).min(1).required(),
});

router.get('/', authenticateToken, getRooms);
router.post('/', authenticateToken, validateBody(createRoomSchema), createRoom);
router.get('/:id', authenticateToken, getRoomById);

export { router as roomRoutes };