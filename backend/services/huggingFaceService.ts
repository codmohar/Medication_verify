import { VideoVerificationRequest, VideoVerificationResponse } from '../types.js';
import { cleanBase64Data } from './geminiService.js';
import { verifyWithClinicalCVEngine, analyzeBase64Frame } from './computerVisionService.js';

export const HUGGING_FACE_MODELS = {
  OBJECT_DETECTION: 'facebook/detr-resnet-50',
  VISION_TRANSFORMER: 'google/vit-base-patch16-224',
  CLASSIFICATION: 'microsoft/resnet-50',
} as const;

export function isHuggingFaceAvailable(): boolean {
  const token = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
  return !!(token && token.trim() !== '' && token !== 'MY_HF_TOKEN');
}

/**
 * Call Hugging Face DETR (DEtection TRansformer) for Object Detection
 * Detects person, cup, bottle, containers, and accessories with bounding boxes
 */
export async function detectObjectsWithHfDetr(
  imageBuffer: Buffer,
  token: string
): Promise<Array<{ label: string; score: number; box: any }>> {
  try {
    const res = await fetch(
      `https://router.huggingface.co/hf-inference/models/${HUGGING_FACE_MODELS.OBJECT_DETECTION}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'image/jpeg',
        },
        body: imageBuffer,
      }
    );

    if (res.ok) {
      const data: any = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Hugging Face DETR call warning:', err);
  }
  return [];
}

/**
 * Call Hugging Face ResNet / ViT for visual classification
 */
export async function classifyImageWithHf(
  imageBuffer: Buffer,
  token: string
): Promise<Array<{ label: string; score: number }>> {
  try {
    const res = await fetch(
      `https://router.huggingface.co/hf-inference/models/${HUGGING_FACE_MODELS.CLASSIFICATION}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'image/jpeg',
        },
        body: imageBuffer,
      }
    );

    if (res.ok) {
      const data: any = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Hugging Face ResNet call warning:', err);
  }
  return [];
}

export async function verifyWithHuggingFace(
  req: VideoVerificationRequest
): Promise<VideoVerificationResponse | null> {
  const token = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
  if (!token) return null;

  try {
    const expectedMed = req.expectedMedicineName || 'Prescribed Tablet/Capsule';
    if (!req.keyFrames || req.keyFrames.length === 0) {
      return verifyWithClinicalCVEngine(req);
    }

    const firstFrameClean = cleanBase64Data(req.keyFrames[0].imageBase64);
    if (!firstFrameClean) return null;

    const frameBuf = Buffer.from(firstFrameClean, 'base64');

    // Run parallel Hugging Face inferences: DETR object detection + ResNet classification
    const [detrDetections, resnetClasses] = await Promise.all([
      detectObjectsWithHfDetr(frameBuf, token),
      classifyImageWithHf(frameBuf, token),
    ]);

    const detectedObjects = detrDetections.map(d => `${d.label} (${Math.round(d.score * 100)}%)`);
    const visualClasses = resnetClasses.slice(0, 3).map(c => `${c.label} (${Math.round(c.score * 100)}%)`);

    console.log('HuggingFace DETR Objects:', detectedObjects);
    console.log('HuggingFace ResNet Classes:', visualClasses);

    // Run pixel-accurate sequential verification across all frames
    const baseResult = verifyWithClinicalCVEngine(req);

    // Check if DETR detected drinking cup/bottle in water frame
    let hfWaterDetected = false;
    if (req.keyFrames.length >= 4) {
      const waterFrameClean = cleanBase64Data(req.keyFrames[req.keyFrames.length - 1].imageBase64);
      if (waterFrameClean) {
        const waterBuf = Buffer.from(waterFrameClean, 'base64');
        const waterObjects = await detectObjectsWithHfDetr(waterBuf, token);
        hfWaterDetected = waterObjects.some(o => 
          o.label.toLowerCase().includes('cup') || 
          o.label.toLowerCase().includes('bottle') ||
          o.label.toLowerCase().includes('glass')
        );
      }
    }

    if (hfWaterDetected) {
      baseResult.events.water_intake = true;
    }

    const modelNotes = [
      `Verified via Hugging Face Models: [1] ${HUGGING_FACE_MODELS.OBJECT_DETECTION} (Object Detection) & [2] ${HUGGING_FACE_MODELS.CLASSIFICATION} (Visual Feature Extractor).`,
      detectedObjects.length > 0 ? `Entities Detected: ${detectedObjects.join(', ')}.` : null,
      visualClasses.length > 0 ? `Visual Attributes: ${visualClasses.join(', ')}.` : null,
    ].filter(Boolean).join(' ');

    return {
      ...baseResult,
      model_used: `Hugging Face DETR (${HUGGING_FACE_MODELS.OBJECT_DETECTION}) + ResNet-50 + Clinical CV Engine`,
      ai_provider: 'huggingface',
      medicine_details: {
        ...baseResult.medicine_details,
        notes: modelNotes,
      },
    };
  } catch (err) {
    console.error('Hugging Face Vision Pipeline Error:', err);
    return null;
  }
}
