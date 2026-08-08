import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';

const router = Router();

router.post('/stripe', (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string | undefined;
  const event = req.body;

  if (!signature) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  // In production, verify with stripe.webhooks.constructEvent() using
  // STRIPE_WEBHOOK_SECRET. The mock layer logs and acknowledges.
  logger.info(`Stripe webhook received: ${event?.type ?? 'unknown'}`);
  res.status(200).json({ received: true });
});

router.post('/supabase', (req: Request, res: Response) => {
  const payload = req.body;
  logger.info(`Supabase auth webhook received: ${payload?.type ?? 'unknown'}`);
  res.status(200).json({ received: true });
});

export default router;
