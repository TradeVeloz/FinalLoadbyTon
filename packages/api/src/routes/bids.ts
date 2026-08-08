import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { bidCreateSchema, bidUpdateSchema } from '../utils/validation';
import * as bidService from '../services/bidService';
import * as jobService from '../services/jobService';
import * as authService from '../services/authService';
import * as notificationService from '../services/notificationService';
import { broadcastToJob } from '../socket/emitter';

const router = Router();

router.get('/job/:jobId', (req: AuthenticatedRequest, res: Response) => {
  return res.json(bidService.listBidsForJob(req.params.jobId));
});

router.post('/job/:jobId', authenticate, authorizeCarrier(), validate(bidCreateSchema), (req: AuthenticatedRequest, res: Response) => {
  const carrier = authService.getUserById(req.user!.userId);
  if (!carrier) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const bid = bidService.createBid(
    req.params.jobId,
    {
      amountAED: req.body.amountAED,
      etaMinutes: req.body.etaMinutes,
      truckType: req.body.truckType,
      driverName: req.body.driverName,
      notes: req.body.notes,
    },
    {
      id: carrier.id,
      name: carrier.profile?.companyName ?? 'Unnamed Carrier',
      rating: carrier.profile?.ratingAverage ?? 5,
      completedJobs: carrier.profile?.completedJobsCount ?? 0,
    }
  );

  if (!bid) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const job = jobService.getJob(req.params.jobId);
  if (job) {
    notificationService.createNotification({
      userId: job.shipperId,
      type: 'BID_RECEIVED',
      title: 'New bid received',
      message: `${bid.carrierName} placed a bid of AED ${bid.amountAED.toLocaleString()} on ${job.jobCode}.`,
      jobId: job.id,
    });
    broadcastToJob(job.id, 'bid:new', bid);
  }

  return res.status(201).json(bid);
});

router.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const bid = bidService.getBid(req.params.id);
  if (!bid) {
    return res.status(404).json({ error: 'Bid not found' });
  }
  return res.json(bid);
});

router.put('/:id', authenticate, authorizeCarrier(), validate(bidUpdateSchema), (req: AuthenticatedRequest, res: Response) => {
  try {
    const bid = bidService.updateBid(req.params.id, req.body);
    if (!bid) {
      return res.status(404).json({ error: 'Bid not found' });
    }
    broadcastToJob(bid.jobId, 'bid:updated', bid);
    return res.json(bid);
  } catch (err: any) {
    return res.status(err.status || 400).json({ error: err.message || 'Failed to update bid' });
  }
});

router.post('/:id/accept', authenticate, authorizeShipper(), (req: AuthenticatedRequest, res: Response) => {
  const result = bidService.acceptBid(req.params.id);
  if (!result) {
    return res.status(404).json({ error: 'Bid not found' });
  }

  notificationService.createNotification({
    userId: result.bid.carrierId,
    type: 'JOB_AWARDED',
    title: 'Job awarded',
    message: `Your bid of AED ${result.bid.amountAED.toLocaleString()} was accepted on ${result.job?.jobCode ?? result.bid.jobId}.`,
    jobId: result.bid.jobId,
  });

  broadcastToJob(result.bid.jobId, 'bid:accepted', result.bid);
  broadcastToJob(result.bid.jobId, 'job:awarded', { jobId: result.bid.jobId, job: result.job });

  return res.json({ message: 'Bid accepted and job awarded', bid: result.bid, job: result.job });
});

router.post('/:id/reject', authenticate, authorizeShipper(), (req: AuthenticatedRequest, res: Response) => {
  const bid = bidService.rejectBid(req.params.id);
  if (!bid) {
    return res.status(404).json({ error: 'Bid not found' });
  }
  return res.json({ message: 'Bid rejected', bid });
});

function authorizeCarrier() {
  return (req: AuthenticatedRequest, res: Response, next: () => void) => {
    if (!req.user || (req.user.role !== 'CARRIER' && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Forbidden. Carriers only.' });
    }
    next();
  };
}

function authorizeShipper() {
  return (req: AuthenticatedRequest, res: Response, next: () => void) => {
    if (!req.user || (req.user.role !== 'SHIPPER' && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Forbidden. Shippers only.' });
    }
    next();
  };
}

export default router;
