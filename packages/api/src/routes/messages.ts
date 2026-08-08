import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { messageCreateSchema } from '../utils/validation';
import * as messageService from '../services/messageService';
import * as authService from '../services/authService';
import { broadcastToJob } from '../socket/emitter';

const router = Router();

router.get('/job/:jobId', (req: AuthenticatedRequest, res: Response) => {
  return res.json(messageService.listMessagesForJob(req.params.jobId));
});

router.post('/job/:jobId', authenticate, validate(messageCreateSchema), (req: AuthenticatedRequest, res: Response) => {
  const user = authService.getUserById(req.user!.userId);
  const message = messageService.createMessage(
    req.params.jobId,
    {
      content: req.body.content,
      attachmentUrl: req.body.attachmentUrl,
      attachmentName: req.body.attachmentName,
    },
    {
      id: req.user!.userId,
      name: user?.profile?.companyName ?? (req.user!.role === 'CARRIER' ? 'Carrier' : 'Shipper'),
    }
  );

  broadcastToJob(req.params.jobId, 'message:new', message);
  return res.status(201).json(message);
});

router.put('/:id/read', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const message = messageService.markMessageRead(req.params.id);
  if (!message) {
    return res.status(404).json({ error: 'Message not found' });
  }
  return res.json(message);
});

export default router;
