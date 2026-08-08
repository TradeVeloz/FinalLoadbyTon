import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { escrowSchema } from '../utils/validation';
import * as paymentService from '../services/paymentService';
import * as notificationService from '../services/notificationService';
import * as jobService from '../services/jobService';
import { broadcastToJob } from '../socket/emitter';

const router = Router();

router.post('/escrow', authenticate, validate(escrowSchema), (req: AuthenticatedRequest, res: Response) => {
  try {
    const payment = paymentService.createEscrow(req.body.jobId, req.body.amountAED);
    if (!payment) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = jobService.getJob(req.body.jobId);
    if (job?.carrierId) {
      notificationService.createNotification({
        userId: job.carrierId,
        type: 'PAYMENT_RELEASED',
        title: 'Payment secured in escrow',
        message: `${job.jobCode} — AED ${payment.amountAED.toLocaleString()} is now held in escrow.`,
        jobId: job.id,
      });
      broadcastToJob(job.id, 'notification', { message: 'Escrow funded' });
    }

    return res.status(201).json(payment);
  } catch (err: any) {
    return res.status(err.status || 400).json({ error: err.message || 'Failed to create escrow' });
  }
});

router.get('/history', authenticate, (req: AuthenticatedRequest, res: Response) => {
  return res.json(paymentService.listPayments());
});

router.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const payment = paymentService.getPayment(req.params.id);
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }
  return res.json(payment);
});

router.post('/:id/release', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const payment = paymentService.setPaymentStatus(req.params.id, 'RELEASED');
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }
  broadcastToJob(payment.jobId, 'payment:released', payment);
  return res.json({ message: 'Escrow payment released to carrier bank account', payment });
});

router.post('/:id/dispute', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const payment = paymentService.setPaymentStatus(req.params.id, 'DISPUTED');
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }
  return res.json({ message: 'Dispute filed. Our team will review within 48 hours.', payment });
});

export default router;
