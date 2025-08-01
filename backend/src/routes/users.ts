import { Router } from 'express';
import Joi from 'joi';
import { getUsers, getUserProfile, updateProfile } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validation';

const router = Router();

const updateProfileSchema = Joi.object({
  username: Joi.string().min(3).max(30).optional(),
  avatar: Joi.string().uri().allow('').optional(),
});

router.get('/', authenticateToken, getUsers);
router.get('/:id', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, validateBody(updateProfileSchema), updateProfile);

export { router as userRoutes };