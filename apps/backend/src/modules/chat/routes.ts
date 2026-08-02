import { Router } from 'express';
import { createConversation, listConversations, listAllConversations, getMessages, sendMessage, markRead, closeConversation } from './controller.js';
import { authMiddleware, requireAdmin, requireUser } from '../../middleware/index.js';

const router = Router();

router.post('/conversations', authMiddleware, requireUser, createConversation);
router.get('/conversations', authMiddleware, requireUser, listConversations);
router.get('/conversations/all', authMiddleware, requireAdmin, listAllConversations);
router.get('/conversations/:id/messages', authMiddleware, getMessages);
router.post('/conversations/:id/messages', authMiddleware, sendMessage);
router.put('/conversations/:id/read', authMiddleware, markRead);
router.delete('/conversations/:id', authMiddleware, requireAdmin, closeConversation);

export default router;
