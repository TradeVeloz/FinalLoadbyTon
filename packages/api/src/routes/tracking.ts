import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { trackingUpdateSchema } from '../utils/validation';
import * as trackingService from '../services/trackingService';
import { broadcastToJob } from '../socket/emitter';

const router = Router();

router.get('/:jobId', (req: AuthenticatedRequest, res: Response) => {
  const tracking = trackingService.getTracking(req.params.jobId);
  if (!tracking) {
    return res.status(404).json({ error: 'No tracking data for this job' });
  }
  return res.json(tracking);
});

router.put('/:jobId', authenticate, validate(trackingUpdateSchema), (req: AuthenticatedRequest, res: Response) => {
  const tracking = trackingService.upsertTracking(req.params.jobId, {
    status: req.body.status,
    lat: req.body.lat,
    lng: req.body.lng,
    speedKmH: req.body.speedKmH,
    etaMinutes: req.body.etaMinutes,
  });

  broadcastToJob(req.params.jobId, 'tracking:update', {
    jobId: req.params.jobId,
    location: tracking.currentLocation,
    speedKmH: tracking.speedKmH,
    etaMinutes: tracking.etaMinutes,
    status: tracking.status,
  });

  return res.json(tracking);
});

export default router;
