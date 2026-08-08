import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { documentCreateSchema } from '../utils/validation';
import * as documentService from '../services/documentService';

const router = Router();

router.get('/job/:jobId', (req: AuthenticatedRequest, res: Response) => {
  return res.json(documentService.listDocumentsForJob(req.params.jobId));
});

router.post('/job/:jobId', authenticate, validate(documentCreateSchema), (req: AuthenticatedRequest, res: Response) => {
  const doc = documentService.createDocument(
    req.params.jobId,
    {
      type: req.body.type,
      title: req.body.title,
      fileUrl: req.body.fileUrl,
      fileSize: req.body.fileSize,
    },
    req.user!.userId
  );
  return res.status(201).json(doc);
});

router.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const doc = documentService.getDocument(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }
  return res.json(doc);
});

router.delete('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const doc = documentService.getDocument(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }
  if (doc.uploaderId !== req.user!.userId && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'You can only delete your own documents' });
  }
  documentService.deleteDocument(req.params.id);
  return res.status(204).send();
});

export default router;
