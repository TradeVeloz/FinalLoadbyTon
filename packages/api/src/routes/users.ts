import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { profileUpdateSchema } from '../utils/validation';
import * as authService from '../services/authService';
import * as ratingService from '../services/ratingService';

const router = Router();

router.get('/profile', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = authService.getUserById(req.user!.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json(authService.toPublicUser(user));
});

router.put('/profile', authenticate, validate(profileUpdateSchema), (req: AuthenticatedRequest, res: Response) => {
  const user = authService.updateProfile(req.user!.userId, req.body);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({ message: 'Profile updated successfully', user: authService.toPublicUser(user) });
});

router.post('/verify', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = authService.requestVerification(req.user!.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({
    message: 'Verification request submitted. TRN & trade license documents under review.',
    status: 'PENDING_REVIEW',
  });
});

router.get('/notifications', authenticate, (req: AuthenticatedRequest, res: Response) => {
  return res.json({ prefs: authService.getNotificationPrefs(req.user!.userId) });
});

router.put('/notifications', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const raw = req.body as Record<string, unknown>;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return res.status(400).json({ error: 'Invalid notification preferences' });
  }
  const prefs: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'boolean') prefs[key] = value;
  }
  const saved = authService.setNotificationPrefs(req.user!.userId, prefs);
  return res.json({ message: 'Notification preferences updated', prefs: saved });
});

router.put('/:id/verify', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = authService.verifyUser(req.user!.userId, req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ message: `${user.profile?.companyName ?? 'User'} is now verified`, user: authService.toPublicUser(user) });
  } catch (err: any) {
    return res.status(err.status || 403).json({ error: err.message || 'Forbidden' });
  }
});

router.get('/:id/ratings', (req: AuthenticatedRequest, res: Response) => {
  const ratings = ratingService.listRatingsForUser(req.params.id);
  const average = ratings.length
    ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
    : 0;
  return res.json({ ratings, average: Math.round(average * 10) / 10, count: ratings.length });
});

router.get('/:id/stats', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const stats = authService.getStats(req.params.id);
  return res.json(stats);
});

export default router;
