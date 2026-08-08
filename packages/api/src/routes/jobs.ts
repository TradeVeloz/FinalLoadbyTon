import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { jobCreateSchema, jobUpdateSchema, jobStatusSchema } from '../utils/validation';
import * as jobService from '../services/jobService';
import * as authService from '../services/authService';
import { broadcastToJob } from '../socket/emitter';

const router = Router();

router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const filters = {
    status: req.query.status as string | undefined,
    terminal: req.query.terminal as string | undefined,
    area: req.query.area as string | undefined,
    date: req.query.date as string | undefined,
  };
  return res.json(jobService.listJobs(filters));
});

router.post('/', authenticate, authorize(['SHIPPER']), validate(jobCreateSchema), (req: AuthenticatedRequest, res: Response) => {
  const user = authService.getUserById(req.user!.userId);
  const shipperName = user?.profile?.companyName ?? 'Unnamed Shipper';

  const job = jobService.createJob(
    {
      containerSize: req.body.containerSize,
      containerType: req.body.containerType,
      containerNumber: req.body.containerNumber,
      pickupTerminal: req.body.pickupTerminal,
      pickupAddress: req.body.pickupAddress,
      pickupLat: req.body.pickupLat,
      pickupLng: req.body.pickupLng,
      deliveryArea: req.body.deliveryArea,
      deliveryAddress: req.body.deliveryAddress,
      deliveryLat: req.body.deliveryLat,
      deliveryLng: req.body.deliveryLng,
      readyTime: req.body.readyTime,
      deadline: req.body.deadline,
      maxBudgetAED: req.body.maxBudgetAED,
      requiresReefer: req.body.requiresReefer,
      requiresHazmat: req.body.requiresHazmat,
      hazmatClass: req.body.hazmatClass,
      notes: req.body.notes,
    },
    req.user!.userId,
    shipperName
  );

  return res.status(201).json(job);
});

router.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const job = jobService.getJob(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  return res.json(job);
});

router.put('/:id', authenticate, authorize(['SHIPPER']), validate(jobUpdateSchema), (req: AuthenticatedRequest, res: Response) => {
  const job = jobService.getJob(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  if (job.shipperId !== req.user!.userId) {
    return res.status(403).json({ error: 'You can only edit your own jobs' });
  }
  if (job.status !== 'DRAFT' && job.status !== 'OPEN') {
    return res.status(400).json({ error: 'Only draft or open jobs can be edited' });
  }

  const updated = jobService.updateJob(req.params.id, req.body);
  return res.json(updated);
});

router.post('/:id/submit', authenticate, authorize(['SHIPPER']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const job = jobService.submitJob(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    broadcastToJob(job.id, 'job:status', { jobId: job.id, status: job.status });
    return res.json(job);
  } catch (err: any) {
    return res.status(err.status || 400).json({ error: err.message || 'Failed to submit job' });
  }
});

router.delete('/:id', authenticate, authorize(['SHIPPER']), (req: AuthenticatedRequest, res: Response) => {
  const job = jobService.getJob(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  if (job.shipperId !== req.user!.userId) {
    return res.status(403).json({ error: 'You can only delete your own jobs' });
  }
  if (job.status !== 'DRAFT') {
    return res.status(400).json({ error: 'Only draft jobs can be deleted' });
  }

  jobService.deleteJob(req.params.id);
  return res.status(204).send();
});

router.post('/:id/status', authenticate, authorize(['CARRIER', 'ADMIN']), validate(jobStatusSchema), (req: AuthenticatedRequest, res: Response) => {
  const job = jobService.setJobStatus(req.params.id, req.body.status);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  broadcastToJob(job.id, 'job:status', { jobId: job.id, status: job.status });
  return res.json(job);
});

export default router;
