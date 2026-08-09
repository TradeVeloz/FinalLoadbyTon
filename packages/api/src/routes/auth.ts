import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validation';
import {
  registerSchema,
  loginSchema,
  mfaVerifySchema,
  mfaChallengeSchema,
  changePasswordSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../utils/validation';
import { generateMfaSecret, verifyMfaToken, hashPassword } from '../utils/security';
import * as authService from '../services/authService';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const response = await authService.register(req.body);
    return res.status(201).json(response);
  } catch (err: any) {
    return res.status(err.status || 500).json({ error: err.message || 'Registration failed' });
  }
});

router.post('/login', authLimiter, validate(loginSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const response = await authService.login(req.body.email, req.body.password);
    if (!response) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    return res.json(response);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

router.post('/mfa/setup', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const secret = generateMfaSecret();
  authService.setMfaSecret(req.user!.userId, secret);
  const qrCodeUrl = `otpauth://totp/Loadbyton:${req.user!.userId}?secret=${secret}&issuer=Loadbyton`;
  return res.json({ secret, qrCodeUrl });
});

router.post('/mfa/verify', authLimiter, validate(mfaVerifySchema), (req: AuthenticatedRequest, res: Response) => {
  const { token, secret } = req.body;
  const isValid = verifyMfaToken(token, secret);
  return res.json({ success: isValid, mfaEnabled: isValid });
});

router.post('/mfa/challenge', authLimiter, validate(mfaChallengeSchema), (req: AuthenticatedRequest, res: Response) => {
  const response = authService.verifyMfaChallenge(req.body.email, req.body.token);
  if (!response) {
    return res.status(401).json({ error: 'Invalid verification code' });
  }
  return res.json(response);
});

router.post('/mfa/disable', authenticate, (req: AuthenticatedRequest, res: Response) => {
  authService.clearMfaSecret(req.user!.userId);
  return res.json({ success: true, mfaEnabled: false });
});

router.post('/change-password', authenticate, validate(changePasswordSchema), async (req: AuthenticatedRequest, res: Response) => {
  const ok = await authService.changePassword(req.user!.userId, req.body.currentPassword, req.body.newPassword);
  if (!ok) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }
  return res.json({ message: 'Password changed successfully' });
});

router.post('/refresh', validate(refreshSchema), (req: AuthenticatedRequest, res: Response) => {
  const response = authService.refresh(req.body.refreshToken);
  if (!response) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
  return res.json(response);
});

router.post('/logout', authenticate, (_req: AuthenticatedRequest, res: Response) => {
  return res.json({ success: true, message: 'Logged out successfully' });
});

router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), (req: AuthenticatedRequest, res: Response) => {
  const user = authService.getUserByEmail(req.body.email);
  if (user) {
    // In production: send a signed reset link via email. Mock returns a dev token.
    const resetToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64url');
    return res.json({ message: 'If an account exists for that email, a reset link has been sent.', resetToken });
  }
  return res.json({ message: 'If an account exists for that email, a reset link has been sent.' });
});

router.post('/reset-password', authLimiter, validate(resetPasswordSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { token, password } = req.body;
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const userId = decoded.split(':')[0];
    const user = authService.getUserById(userId);
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    user.passwordHash = await hashPassword(password);
    return res.json({ message: 'Password reset successfully' });
  } catch {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }
});

export default router;
