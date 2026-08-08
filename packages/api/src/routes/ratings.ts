import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';
import * as ratingService from '../services/ratingService';
import * as jobService from '../services/jobService';
import * as authService from '../services/authService';

const router = Router();

const ratingCreateSchema = z.object({
  jobId: z.string().min(3),
  rateeId: z.string().min(3),
  score: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
  category: z.enum(['PUNCTUALITY', 'COMMUNICATION', 'PROFESSIONALISM', 'VALUE']),
});

router.get('/user/:userId', (req: AuthenticatedRequest, res: Response) => {
  const ratings = ratingService.listRatingsForUser(req.params.userId);
  const average = ratings.length ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length : 0;
  return res.json({ ratings, average: Math.round(average * 10) / 10, count: ratings.length });
});

router.post('/', authenticate, validate(ratingCreateSchema), (req: AuthenticatedRequest, res: Response) => {
  try {
    const job = jobService.getJob(req.body.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    const rater = authService.getUserById(req.user!.userId);
    const rating = ratingService.createRating({
      jobId: req.body.jobId,
      raterId: req.user!.userId,
      rateeId: req.body.rateeId,
      raterName: rater?.profile?.companyName,
      score: req.body.score,
      comment: req.body.comment,
      category: req.body.category,
    });
    return res.status(201).json(rating);
  } catch (err: any) {
    return res.status(err.status || 400).json({ error: err.message || 'Failed to submit rating' });
  }
});

export default router;
