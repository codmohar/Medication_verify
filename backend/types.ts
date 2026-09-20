export interface VideoVerificationRequest {
  videoBase64?: string;
  mimeType?: string;
  keyFrames?: Array<{
    timestamp: string;
    imageBase64: string;
    label?: string;
  }>;
  realtimeEvents?: Partial<VerificationEventMap>;
  realtimeTimestamps?: Partial<VerificationTimestamps>;
  expectedMedicineName?: string;
  patientName?: string;
  doseSlot?: string;
  providerPreference?: 'auto' | 'gemini' | 'openai' | 'huggingface' | 'computer_vision';
}

export interface VerificationEventMap {
  medicine_detected: boolean;
  medicine_to_mouth: boolean;
  mouth_interaction: boolean;
  hand_empty: boolean;
  water_intake: boolean;
}

export interface VerificationTimestamps {
  medicine_detected: string | null;
  medicine_to_mouth: string | null;
  mouth_interaction: string | null;
  hand_empty: string | null;
  water_intake: string | null;
}

export interface StepConfidences {
  medicine_confidence: number;
  hand_to_mouth_confidence: number;
  mouth_interaction_confidence: number;
  hand_empty_confidence: number;
  water_confidence?: number;
}

export interface PillVisualDetails {
  detected_name: string;
  appearance: string;
  color?: string;
  shape?: string;
  confidence: number;
  notes: string;
  hand_pill_detected?: boolean;
}

export interface VideoVerificationResponse {
  status: 'MEDICINE_TAKEN' | 'MEDICINE_NOT_TAKEN' | 'UNVERIFIED';
  verified: boolean;
  confidence: number;
  sequence_valid: boolean;
  events: VerificationEventMap;
  timestamps: VerificationTimestamps;
  step_confidences: StepConfidences;
  medicine_details: PillVisualDetails;
  failed_step: string | null;
  explanation: string;
  message: string;
  model_used: string;
  ai_provider: 'gemini' | 'openai' | 'huggingface' | 'clinical_cv_engine';
  frame_analysis?: Array<{
    timestamp: string;
    step: string;
    detected: boolean;
    confidence: number;
    details: string;
  }>;
}
