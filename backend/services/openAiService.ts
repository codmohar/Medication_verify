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
    const expectedMed = req.expectedMedicineName || 'Prescribed Oral Medication';
    const contentParts: any[] = [];

    contentParts.push({
      type: 'text',
      text: `You are an AI Clinical Video Adherence Verification System evaluating patient: ${req.patientName || 'Patient'}.
Expected prescribed medication: "${expectedMed}".

CRITICAL CLINICAL RULES:
1. Step 1 (Mandatory) - medicine_detected:
   - Carefully inspect the hand/fingers at the start of the sequence.
   - If the hand is EMPTY, or if the patient is pinching empty fingers with only air/background visible between them, medicine_detected MUST BE FALSE.
   - medicine_detected is TRUE only if an actual physical tablet, pill, or capsule is visibly held in the hand.
2. Step 2 (Mandatory) - medicine_to_mouth:
   - Hand gesture moving the pill upward toward the mouth and lips. Fingers naturally occlude small pills during transit.
3. Step 3 (Mandatory) - hand_empty:
   - Patient opens their palm and shows their clean empty hand, proving the pill was completely swallowed and 0 medication remains in hand.
4. Step 4 (Optional) - water_intake:
   - Optional fluid intake. Skipping water does NOT fail verification.

DECISION PROTOCOL:
- Status is "MEDICINE_TAKEN" (verified = true) IF AND ONLY IF Steps 1, 2, and 3 are confirmed.
- If the hand was empty at start: status = "MEDICINE_NOT_TAKEN", verified = false, failed_step = "medicine_detected", message = "Hand was empty when presented to camera. No medication detected in hand."
- If hand never moved to mouth: status = "MEDICINE_NOT_TAKEN", failed_step = "medicine_to_mouth".
- If hand is not clean/empty after mouth interaction: status = "MEDICINE_NOT_TAKEN", failed_step = "hand_empty".

Return STRICT JSON only matching this schema:
{
  "status": "MEDICINE_TAKEN" | "MEDICINE_NOT_TAKEN",
  "verified": boolean,
  "confidence": number,
  "sequence_valid": boolean,
  "events": {
    "medicine_detected": boolean,
    "medicine_to_mouth": boolean,
    "mouth_interaction": boolean,
    "hand_empty": boolean,
    "water_intake": boolean
  },
  "timestamps": {
    "medicine_detected": "00:03" | null,
    "medicine_to_mouth": "00:07" | null,
    "mouth_interaction": "00:09" | null,
    "hand_empty": "00:13" | null,
    "water_intake": "00:16" | null
  },
  "step_confidences": {
    "medicine_confidence": number,
    "hand_to_mouth_confidence": number,
    "mouth_interaction_confidence": number,
    "hand_empty_confidence": number,
    "water_confidence": number
  },
  "medicine_details": {
    "detected_name": "${expectedMed}",
    "appearance": string,
    "color": string,
    "shape": string,
    "confidence": number,
    "notes": string
  },
  "failed_step": null | string,
  "explanation": string,
  "message": string
}`,
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

    // Try gpt-4o first for vision, fallback to gpt-4o-mini
    const models = ['gpt-4o', 'gpt-4o-mini'];
    for (const model of models) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
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
          const errText = await res.text();
          console.warn(`OpenAI model ${model} returned error ${res.status}:`, errText);
          continue;
        }

        const data = await res.json();
        const rawContent = data.choices?.[0]?.message?.content;
        if (!rawContent) continue;

        const parsed = JSON.parse(rawContent);
        return normalizeVerification(parsed, `OpenAI ${model} Vision`, 'openai', expectedMed);
      } catch (e) {
        console.warn(`OpenAI call with model ${model} failed:`, e);
      }
    }

    return null;
  } catch (err) {
    console.error('OpenAI Verification Error:', err);
    return null;
  }
}

export async function verifyPillWithOpenAI(
  frameBase64: string,
  expectedMed?: string
): Promise<{
  pill_detected: boolean;
  confidence: number;
  reason: string;
  pill_details?: {
    appearance?: string;
    shape?: string;
    color?: string;
  };
} | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const cleaned = cleanBase64Data(frameBase64);
    if (!cleaned) return null;

    const models = ['gpt-4o', 'gpt-4o-mini'];
    for (const model of models) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `You are an AI Clinical Verification Model.
Inspect this camera frame of the patient's hand / fingers.
Expected medication: "${expectedMed || 'Prescribed Oral Medication'}".

DETERMINE: Is a real physical pill, tablet, or capsule held in the hand or fingers?
- If the hand is EMPTY, or if the patient is pinching empty fingers with nothing between them:
  pill_detected MUST BE FALSE.
- If an actual pill/tablet is held in the hand or fingers:
  pill_detected MUST BE TRUE.

Return STRICT JSON:
{
  "pill_detected": boolean,
  "confidence": number,
  "reason": string,
  "pill_details": {
    "appearance": string,
    "shape": string,
    "color": string
  }
}`,
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/jpeg;base64,${cleaned}`,
                      detail: 'high',
                    },
                  },
                ],
              },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
          }),
        });

        if (!res.ok) continue;

        const data = await res.json();
        const rawContent = data.choices?.[0]?.message?.content;
        if (!rawContent) continue;
        return JSON.parse(rawContent);
      } catch (err) {
        continue;
      }
    }
    return null;
  } catch (err) {
    console.error('OpenAI Pill Verification Error:', err);
    return null;
  }
}
