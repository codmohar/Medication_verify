import { VideoVerificationRequest, VideoVerificationResponse } from '../types.js';
import { cleanBase64Data, normalizeVerification } from './geminiService.js';

export function isOpenAiAvailable(): boolean {
  const key = process.env.OPENAI_API_KEY;
  return !!(key && key.trim() !== '' && key !== 'MY_OPENAI_API_KEY');
}

export async function verifyWithOpenAI(
  req: VideoVerificationRequest
): Promise<VideoVerificationResponse | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const expectedMed = req.expectedMedicineName || 'Prescribed Tablet/Capsule';
    const contentParts: any[] = [];

    contentParts.push({
      type: 'text',
      text: `You are an AI Clinical Video Adherence Verification System.
Analyze this sequence of medication administration frames for patient: ${req.patientName || 'Patient'}.
Expected medication: ${expectedMed}.

Evaluate 4 mandatory steps in order:
1. medicine_detected: Pill/tablet clearly held in palm or fingers.
2. medicine_to_mouth: Hand gesture moving the pill upward from lower frame to lips/mouth. Note: small pills (5-12mm) naturally get occluded by fingers as the hand moves toward the mouth; do NOT mark false simply because the pill is shielded by fingers.
3. mouth_interaction: Hand touches or inserts pill into mouth, mouth closes/swallows.
4. hand_empty: Palm opened or turned, visibly empty, proving the pill was not palmed or dropped.
5. water_intake: Optional water intake.

Return STRICT JSON only matching this format:
{
  "status": "MEDICINE_TAKEN" | "MEDICINE_NOT_TAKEN" | "UNVERIFIED",
  "verified": true/false,
  "confidence": 0.95,
  "sequence_valid": true/false,
  "events": {
    "medicine_detected": boolean,
    "medicine_to_mouth": boolean,
    "mouth_interaction": boolean,
    "hand_empty": boolean,
    "water_intake": boolean
  },
  "timestamps": {
    "medicine_detected": "00:03",
    "medicine_to_mouth": "00:07",
    "mouth_interaction": "00:09",
    "hand_empty": "00:13",
    "water_intake": "00:16"
  },
  "step_confidences": {
    "medicine_confidence": 0.95,
    "hand_to_mouth_confidence": 0.94,
    "mouth_interaction_confidence": 0.93,
    "hand_empty_confidence": 0.95,
    "water_confidence": 0.88
  },
  "medicine_details": {
    "detected_name": "${expectedMed}",
    "appearance": "string",
    "color": "string",
    "shape": "string",
    "confidence": 0.94,
    "notes": "string"
  },
  "failed_step": null | string,
  "explanation": "string",
  "message": "string"
}`
    });

    if (req.keyFrames && req.keyFrames.length > 0) {
      for (const kf of req.keyFrames) {
        const cleaned = cleanBase64Data(kf.imageBase64);
        if (cleaned) {
          contentParts.push({
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${cleaned}`,
              detail: 'high',
            },
          });
        }
      }
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: contentParts,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    if (!res.ok) {
      console.warn('OpenAI API Error:', res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content;
    if (!rawContent) return null;

    const parsed = JSON.parse(rawContent);
    return normalizeVerification(parsed, 'OpenAI GPT-4o Vision', 'openai', expectedMed);
  } catch (err) {
    console.error('OpenAI Verification Error:', err);
    return null;
  }
}
