export type TimingStatus = 'ON_TIME' | 'LATE' | 'MISSED' | 'PENDING';

export type VerificationEvidence = 
  | 'ACCESS_VERIFIED' 
  | 'INGESTION_CONSISTENT' 
  | 'UNVERIFIED' 
  | 'RETRY_REQUIRED';

export type AlertType = 
  | 'MISSED_DOSE' 
  | 'LATE_DOSE' 
  | 'VERIFICATION_FAILED' 
  | 'DEVICE_OFFLINE' 
  | 'SYNC_PENDING';

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export type DoseSlot = 'Morning' | 'Afternoon' | 'Evening' | 'Night';

export type VerificationDecisionStatus = 'MEDICINE_TAKEN' | 'MEDICINE_NOT_TAKEN' | 'UNVERIFIED';

export interface VerificationEvents {
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

export interface MedicineIdentification {
  detected_name: string | null;
  appearance: string | null;
  confidence: number;
  notes: string;
  color?: string;
  shape?: string;
  hand_pill_detected?: boolean;
}

export interface FrameAnalysisDetail {
  timestamp: string;
  step: string;
  detected: boolean;
  confidence: number;
  details: string;
}

export interface StepConfidences {
  medicine_confidence: number;
  hand_to_mouth_confidence?: number;
  mouth_interaction_confidence: number;
  hand_empty_confidence: number;
  water_confidence?: number;
}

export interface VerificationResult {
  status: VerificationDecisionStatus;
  verified: boolean;
  confidence: number;
  events: VerificationEvents;
  timestamps: VerificationTimestamps;
  step_confidences?: StepConfidences;
  medicine_details?: MedicineIdentification;
  failed_step?: string | null;
  explanation: string;
  message: string;
  sequence_valid: boolean;
  model_used?: string;
  ai_provider?: 'gemini' | 'openai' | 'huggingface' | 'clinical_cv_engine';
  frame_analysis?: FrameAnalysisDetail[];
}

export interface DoseRecord {
  id: string;
  date: string;
  scheduledTime: string;
  eventTime: string; // e.g. "08:04 AM" or "—"
  doseSlot: DoseSlot;
  timingStatus: TimingStatus;
  verificationEvidence: VerificationEvidence;
  deviceId: string;
  alertSent: boolean;
  notes?: string;
  aiVerificationResult?: VerificationResult;
}

export interface DeviceStatus {
  deviceId: string;
  esp32Status: 'Online' | 'Offline' | 'Connecting' | 'Standby';
  cameraStatus: 'Active' | 'Standby' | 'Error' | 'Disabled';
  internetStatus: 'Connected (WiFi)' | 'Cellular (4G)' | 'Disconnected';
  lastSync: string;
  batteryPercentage: number;
  firmwareVersion: string;
  compartmentCount: number;
}

export interface Patient {
  id: string; // e.g. "DS-TB-1024"
  authPin: string; // e.g. "1234"
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  phoneNumber?: string;
  address: string;
  emergencyContactName: string;
  emergencyContactNumber: string;

  // Treatment Details
  treatment: string; // e.g. "Tuberculosis (Category 1 - 2HREZ/4HR)"
  treatmentStartDate: string;
  expectedTreatmentEndDate: string;
  medicationName: string;
  dosesPerDay: number;
  prescribedTimes: string[]; // e.g. ["08:00 AM", "08:00 PM"]
  allowedDoseWindowMinutes: number; // e.g. 60
  doctorName: string;
  treatmentCentre: string;

  // Device Assignment
  pillboxId: string;
  compartments: number;
  esp32Status: 'Online' | 'Offline' | 'Testing';
  lastSync: string;
  verificationMethod: 'Smart Pillbox Access' | 'Camera-Assisted Verification' | 'Both';
  deviceStatusDetails: DeviceStatus;

  // Caregiver / Notification Details
  caregiverName: string;
  caregiverRelationship: string;
  whatsAppNumber: string;
  notificationPreferences: {
    doseTaken: boolean;
    doseLate: boolean;
    doseMissed: boolean;
    verificationFailed: boolean;
    deviceOffline: boolean;
  };
  consentGiven: boolean;

  // Adherence & State
  assignedCareWorker: string;
  careWorkerId: string;
  adherencePercentage: number;
  currentStreakDays: number;
  status: 'On Track' | 'Late' | 'Missed Dose' | 'Requires Attention';
  
  // Doses
  todayDoses: {
    slot: DoseSlot;
    scheduledTime: string;
    takenTime?: string;
    timingStatus: TimingStatus;
    verificationEvidence: VerificationEvidence;
  }[];
  history: DoseRecord[];
}

export interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  treatment: string;
  alertType: AlertType;
  scheduledDose: string;
  time: string;
  severity: AlertSeverity;
  whatsAppNotificationStatus: 'Sent to Caregiver' | 'Pending Delivery' | 'Failed' | 'Disabled';
  statusDescription: string;
  isReviewed: boolean;
  createdAt: string;
}

export interface CareWorker {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  centre: string;
  avatarUrl: string;
}

export type ActivePage = 
  | 'page1_landing'
  | 'page2_cw_login'
  | 'page3_cw_dashboard'
  | 'page4_patients'
  | 'page5_add_patient'
  | 'page6_patient_id'
  | 'page6_patient_id_generated'
  | 'page7_patient_profile'
  | 'page8_alert_centre'
  | 'page9_patient_login'
  | 'page10_patient_dashboard'
  | 'page11_patient_history'
  | 'page12_reports';
