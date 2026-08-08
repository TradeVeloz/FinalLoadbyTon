import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import * as jobService from '../services/jobService';
import * as paymentService from '../services/paymentService';

const router = Router();

function adminOnly(req: AuthenticatedRequest, res: Response, next: () => void) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
  }
  next();
}

router.use(authenticate, adminOnly);

router.get('/dashboard', (req: AuthenticatedRequest, res: Response) => {
  const jobs = jobService.listJobs();
  const payments = paymentService.listPayments();
  const escrowBalance = payments.reduce((sum, p) => (p.status === 'ESCROW' ? sum + p.amountAED : sum), 0);

  return res.json({
    metrics: {
      totalVolumeTEU: 15420,
      activeContainersToday: 412,
      averageDrayageFeeAED: 1240,
      marketplaceTakeRate: '5.8%',
      escrowBalanceAED: escrowBalance,
      disputeRate: '0.4%',
    },
    jobsByStatus: jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    popularLanes: [
      { origin: 'Jebel Ali T2', destination: 'JAFZA South', avgPriceAED: 1150, volume24h: 128 },
      { origin: 'Jebel Ali T1', destination: 'Al Quoz Ind 3', avgPriceAED: 1280, volume24h: 94 },
      { origin: 'Jebel Ali T3', destination: 'Dubai Investments Park (DIP)', avgPriceAED: 1390, volume24h: 76 },
      { origin: 'Jebel Ali T4', destination: 'Dubai South / DWC', avgPriceAED: 1450, volume24h: 42 },
    ],
  });
});

router.get('/lanes', (req: AuthenticatedRequest, res: Response) => {
  return res.json({
    lanes: [
      { origin: 'Jebel Ali T1', destination: 'JAFZA North', avgPriceAED: 1120, minPriceAED: 940, maxPriceAED: 1380, trips30d: 3102, avgOnTime: '97.2%' },
      { origin: 'Jebel Ali T2', destination: 'JAFZA South', avgPriceAED: 1150, minPriceAED: 960, maxPriceAED: 1420, trips30d: 2844, avgOnTime: '98.1%' },
      { origin: 'Jebel Ali T3', destination: 'Al Quoz Ind', avgPriceAED: 1290, minPriceAED: 1080, maxPriceAED: 1550, trips30d: 2101, avgOnTime: '96.4%' },
      { origin: 'Jebel Ali T4', destination: 'Dubai South', avgPriceAED: 1450, minPriceAED: 1210, maxPriceAED: 1730, trips30d: 1188, avgOnTime: '95.8%' },
      { origin: 'Jebel Ali T1', destination: 'DIP', avgPriceAED: 1390, minPriceAED: 1150, maxPriceAED: 1660, trips30d: 930, avgOnTime: '96.9%' },
      { origin: 'Khalifa Port', destination: 'Abu Dhabi Ind', avgPriceAED: 1620, minPriceAED: 1400, maxPriceAED: 1910, trips30d: 540, avgOnTime: '97.6%' },
    ],
  });
});

router.get('/carriers', (req: AuthenticatedRequest, res: Response) => {
  return res.json({
    carriers: [
      { name: 'Emirates Overland Haulage Co.', rating: 4.85, jobsCompleted: 320, onTime: '98.6%', fleetSize: 42 },
      { name: 'Gulf Heavy Transport Fleet', rating: 4.9, jobsCompleted: 412, onTime: '99.1%', fleetSize: 58 },
      { name: 'Falcon Container Express LLC', rating: 4.7, jobsCompleted: 184, onTime: '95.2%', fleetSize: 27 },
      { name: 'Desert Line Drayage', rating: 4.6, jobsCompleted: 121, onTime: '94.3%', fleetSize: 18 },
    ],
  });
});

router.get('/shippers', (req: AuthenticatedRequest, res: Response) => {
  return res.json({
    shippers: [
      { name: 'Al-Majid Global Freight LLC', jobsPosted: 142, totalSpentAED: 168400, savings: '14.2%', satisfaction: 4.9 },
      { name: 'CMA CGM Gulf Logistics', jobsPosted: 210, totalSpentAED: 246300, savings: '12.8%', satisfaction: 4.7 },
      { name: 'Gulf Cargo Solutions', jobsPosted: 88, totalSpentAED: 110200, savings: '16.5%', satisfaction: 4.8 },
    ],
  });
});

router.get('/revenue', (req: AuthenticatedRequest, res: Response) => {
  return res.json({
    revenue: {
      grossVolumeAED: 482900,
      platformFeesAED: 28008,
      averageTakeRate: '5.8%',
      monthly: [
        { month: 'Mar', feesAED: 21400 },
        { month: 'Apr', feesAED: 23800 },
        { month: 'May', feesAED: 25100 },
        { month: 'Jun', feesAED: 26400 },
        { month: 'Jul', feesAED: 28008 },
      ],
    },
  });
});

export default router;
