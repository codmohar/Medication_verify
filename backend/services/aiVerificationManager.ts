import { VideoVerificationRequest, VideoVerificationResponse } from '../types.js';
import { verifyWithGemini, isGeminiAvailable } from './geminiService.js';
import { verifyWithOpenAI, isOpenAiAvailable } from './openAiService.js';
import { verifyWithHuggingFace, isHuggingFaceAvailable } from './huggingFaceService.js';
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
    huggingface: isHuggingFaceAvailable(),
    clinical_cv_engine: true,
  };
}

export async function executeAiVerification(
  req: VideoVerificationRequest
): Promise<VideoVerificationResponse> {
  const pref = req.providerPreference || 'auto';

  // Explicit OpenAI preference
  if (pref === 'openai' && isOpenAiAvailable()) {
    const res = await verifyWithOpenAI(req);
    if (res) return res;
  }

  // Explicit Hugging Face preference
  if (pref === 'huggingface' && isHuggingFaceAvailable()) {
    const res = await verifyWithHuggingFace(req);
    if (res) return res;
  }

  // Explicit Gemini preference
  if (pref === 'gemini' && isGeminiAvailable()) {
    const res = await verifyWithGemini(req);
    if (res) return res;
  }

  // Auto mode: Try Gemini first (multimodal standard in this environment)
  if (isGeminiAvailable()) {
    try {
      const geminiRes = await verifyWithGemini(req);
      if (geminiRes) {
        return geminiRes;
      }
    } catch (e) {
      console.warn('Gemini attempt failed, falling back to next provider:', e);
    }
  }

  // Next, try OpenAI if configured
  if (isOpenAiAvailable()) {
    try {
      const openAiRes = await verifyWithOpenAI(req);
      if (openAiRes) {
        return openAiRes;
      }
    } catch (e) {
      console.warn('OpenAI attempt failed, falling back:', e);
    }
  }

  // Next, try Hugging Face if configured
  if (isHuggingFaceAvailable()) {
    try {
      const hfRes = await verifyWithHuggingFace(req);
      if (hfRes) {
        return hfRes;
      }
    } catch (e) {
      console.warn('Hugging Face attempt failed, falling back:', e);
    }
  }

  // High-precision Clinical Computer Vision & Hand Gesture Engine (deterministic, instantaneous, never fails)
  console.log('Using Clinical Computer Vision Engine for exact pill and hand gesture verification.');
  return verifyWithClinicalCVEngine(req);
}
