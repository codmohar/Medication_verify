import { VideoVerificationRequest, VideoVerificationResponse } from '../types.js';
import { verifyWithGemini, verifyPillPresenceInHand, isGeminiAvailable } from './geminiService.js';
import { verifyWithOpenAI, isOpenAiAvailable } from './openAiService.js';
import { verifyWithClinicalCVEngine } from './computerVisionService.js';

export interface ProviderStatus {
  gemini: boolean;
  openai: boolean;
  huggingface: boolean;
  clinical_cv_engine: boolean;
}

export function getAvailableProviders(): ProviderStatus {
  return {
    gemini: isGeminiAvailable(),
    openai: isOpenAiAvailable(),
    huggingface: false, // Disabled per user request
    clinical_cv_engine: true,
  };
}

export async function executeAiVerification(
  req: VideoVerificationRequest
): Promise<VideoVerificationResponse> {
  console.log('--- Clinical AI Video Verification Starting ---');
  const expectedMed = req.expectedMedicineName || 'Prescribed Oral Tablet/Capsule';
  const presentationFrames = (req.keyFrames || []).slice(0, 2);

  // 1. Run local optical Computer Vision frame analysis (deterministic pixel & flood-fill verification)
  const cvRes = verifyWithClinicalCVEngine(req);
  console.log('Clinical CV Engine initial evaluation:', {
    medicine_detected: cvRes.events.medicine_detected,
    hand_to_mouth: cvRes.events.medicine_to_mouth,
    mouth_interaction: cvRes.events.mouth_interaction,
    hand_empty: cvRes.events.hand_empty,
    status: cvRes.status,
  });

  // 2. Primary: Google Gemini 3.5 Flash Vision Multimodal Pipeline
  if (isGeminiAvailable()) {
    try {
      // STAGE 1: Isolated Gate 1 Pill Presence Audit
      // Evaluates ONLY the presentation frames without seeing mouth/swallow frames to eliminate sequence-completion hallucination
      if (presentationFrames.length > 0) {
        console.log('--- STAGE 1: Auditing Physical Pill Presence in Hand (Presentation Frames) ---');
        const gate1 = await verifyPillPresenceInHand(presentationFrames, expectedMed);
        console.log('Gate 1 Audit Result:', gate1);

        if (!gate1.pill_detected) {
          console.warn('REJECTION: Gate 1 failed. Patient presented an empty hand / empty pinch before hand gesture to mouth.');
          return {
            status: 'MEDICINE_NOT_TAKEN',
            verified: false,
            confidence: 0.98,
            sequence_valid: false,
            events: {
              medicine_detected: false,
              medicine_to_mouth: false,
              mouth_interaction: false,
              hand_empty: false,
              water_intake: req.realtimeEvents?.water_intake || false,
            },
            timestamps: {
              medicine_detected: null,
              medicine_to_mouth: null,
              mouth_interaction: null,
              hand_empty: null,
              water_intake: req.realtimeEvents?.water_intake ? (req.realtimeTimestamps?.water_intake || '00:16') : null,
            },
            step_confidences: {
              medicine_confidence: 0.15,
              hand_to_mouth_confidence: 0.20,
              mouth_interaction_confidence: 0.20,
              hand_empty_confidence: 0.30,
              water_confidence: req.realtimeEvents?.water_intake ? 0.85 : 0.20,
            },
            medicine_details: {
              detected_name: expectedMed,
              appearance: `None (${gate1.visual_evidence})`,
              color: 'None',
              shape: 'None',
              confidence: 0.15,
              notes: `Verification rejected at Step 1: Hand was empty when presented to camera (${gate1.detailed_inspection}).`,
              hand_pill_detected: false,
            },
            failed_step: 'medicine_detected',
            explanation: `Clinical verification rejected at Step 1: No medication detected in hand (${gate1.visual_evidence}). Patient presented an empty hand or pinched empty air before moving hand to mouth. An actual solid pill/tablet must be visibly held in hand to verify intake.`,
            message: 'Medication not verified: Hand was empty when presented to camera. No pill was held in fingers or palm.',
            model_used: 'Google Gemini 3.5 Flash Vision (Gate 1 Forensic Audit)',
            ai_provider: 'gemini',
          };
        }
      }

      // STAGE 2: Pill is verified in hand! Now examine full ingestion sequence:
      console.log('--- STAGE 2: Pill confirmed in hand! Auditing Full Ingestion Sequence ---');
      const geminiRes = await verifyWithGemini(req);
      if (geminiRes) {
        console.log('Gemini verification completed. Status:', geminiRes.status, 'failed_step:', geminiRes.failed_step);
        return geminiRes;
      }
    } catch (e: any) {
      console.warn('Gemini attempt encountered error:', e?.message || e);
    }
  }

  // 3. Secondary: OpenAI GPT-4o Vision multimodal pipeline (if quota available)
  if (isOpenAiAvailable()) {
    try {
      console.log('Running AI Video Verification using OpenAI GPT-4o Vision...');
      const openAiRes = await verifyWithOpenAI(req);
      if (openAiRes) {
        if (!cvRes.events.medicine_detected && openAiRes.events.medicine_detected) {
          console.warn('ANTI-HALLUCINATION SHIELD: OpenAI claimed medicine_detected=true on empty hand. Enforcing rejection.');
          return {
            ...openAiRes,
            status: 'MEDICINE_NOT_TAKEN',
            verified: false,
            failed_step: 'medicine_detected',
            events: {
              ...openAiRes.events,
              medicine_detected: false,
            },
            message: 'Medication not verified: Hand was empty when presented to camera. No pill was held in hand.',
          };
        }
        return openAiRes;
      }
    } catch (e: any) {
      console.warn('OpenAI attempt encountered error:', e?.message || e);
    }
  }

  // 4. Return Computer Vision engine result
  console.log('Using Local Clinical Computer Vision Engine result.');
  return cvRes;
}
