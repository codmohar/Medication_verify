import { Router, Request, Response } from 'express';
import { executeAiVerification, getAvailableProviders } from '../services/aiVerificationManager.js';
import { scanFrameRealtime, RealtimeScanRequest } from '../services/computerVisionService.js';
import { verifyPillInFrame } from '../services/geminiService.js';
import { VideoVerificationRequest } from '../types.js';

export const verificationRouter = Router();

// Health check
verificationRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    ai_status: getAvailableProviders(),
  });
});

// Available AI Providers
verificationRouter.get('/ai-providers', (req: Request, res: Response) => {
  res.json({
    providers: getAvailableProviders(),
  });
});

// Dedicated pill-in-hand frame verification (real-world object detection)
verificationRouter.post('/verify-pill', async (req: Request, res: Response) => {
  try {
    const { frameBase64, expectedMedicineName } = req.body || {};
    if (!frameBase64) {
      return res.status(400).json({ error: 'frameBase64 is required for pill verification.' });
    }

    const pillResult = await verifyPillInFrame(frameBase64, expectedMedicineName);
    return res.status(200).json(pillResult);
  } catch (error: any) {
    console.error('Verify Pill Route Error:', error);
    return res.status(500).json({
      error: 'Failed to verify pill in frame',
      details: error?.message || String(error),
    });
  }
});

// Verify complete medication intake video + frames
verificationRouter.post('/verify-medicine', async (req: Request, res: Response) => {
  try {
    const payload: VideoVerificationRequest = req.body || {};

    if (!payload.videoBase64 && (!payload.keyFrames || payload.keyFrames.length === 0)) {
      return res.status(400).json({
        error: 'Either videoBase64 or keyFrames must be provided for AI verification.',
      });
    }

    const result = await executeAiVerification(payload);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('API Verification Handler Error:', error);
    return res.status(500).json({
      error: 'Failed to process AI verification',
      details: error?.message || String(error),
    });
  }
});

// Dedicated frame-by-frame verification endpoint
verificationRouter.post('/verify-frames', async (req: Request, res: Response) => {
  try {
    const payload: VideoVerificationRequest = req.body || {};
    const result = await executeAiVerification(payload);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Frame Verification Handler Error:', error);
    return res.status(500).json({
      error: 'Failed to process frame verification',
      details: error?.message || String(error),
    });
  }
});

// Live real-time frame scanner for active camera stream
verificationRouter.post('/realtime-scan', async (req: Request, res: Response) => {
  try {
    const payload: RealtimeScanRequest = req.body || { elapsedSeconds: 0 };
    const scanResult = await scanFrameRealtime(payload);
    return res.status(200).json(scanResult);
  } catch (error: any) {
    console.error('Realtime Scan Handler Error:', error);
    return res.status(500).json({
      error: 'Failed to perform real-time scan',
      details: error?.message || String(error),
    });
  }
});
