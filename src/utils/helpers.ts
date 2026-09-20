import { TimingStatus, VerificationEvidence, AlertSeverity, AlertType } from '../types';

export function generateNextPatientId(existingCount: number): string {
  const number = 1026 + existingCount;
  return `DS-TB-${number}`;
}

export function getTimingStatusConfig(status: TimingStatus) {
  switch (status) {
    case 'ON_TIME':
      return {
        label: 'ON TIME',
        bg: 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30',
        dot: 'bg-emerald-500',
        border: 'border-emerald-500',
        text: 'text-emerald-700',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        description: 'Dose taken within prescribed protocol window',
      };
    case 'LATE':
      return {
        label: 'LATE',
        bg: 'bg-amber-500/15 text-amber-800 border-amber-500/30',
        dot: 'bg-amber-500',
        border: 'border-amber-500',
        text: 'text-amber-700',
        badge: 'bg-amber-100 text-amber-800 border-amber-300',
        description: 'Dose taken beyond prescribed window',
      };
    case 'MISSED':
      return {
        label: 'MISSED',
        bg: 'bg-rose-500/15 text-rose-800 border-rose-500/30',
        dot: 'bg-rose-500',
        border: 'border-rose-500',
        text: 'text-rose-700',
        badge: 'bg-rose-100 text-rose-800 border-rose-300',
        description: 'No pillbox access recorded during schedule',
      };
    case 'PENDING':
    default:
      return {
        label: 'PENDING',
        bg: 'bg-sky-500/15 text-sky-800 border-sky-500/30',
        dot: 'bg-sky-500',
        border: 'border-sky-500',
        text: 'text-sky-700',
        badge: 'bg-sky-100 text-sky-800 border-sky-300',
        description: 'Scheduled dose upcoming or awaiting telemetry sync',
      };
  }
}

export function getVerificationEvidenceConfig(evidence: VerificationEvidence) {
  switch (evidence) {
    case 'INGESTION_CONSISTENT':
      return {
        label: 'INGESTION-CONSISTENT',
        patientFriendly: 'Dose verification completed',
        bg: 'bg-teal-500/15 text-teal-800 border-teal-500/30',
        iconColor: 'text-teal-600',
        description: 'ESP32 compartment access + camera computer-vision facial ingestion sequence detected.',
      };
    case 'ACCESS_VERIFIED':
      return {
        label: 'ACCESS VERIFIED',
        patientFriendly: 'Smart pillbox access recorded',
        bg: 'bg-blue-500/15 text-blue-800 border-blue-500/30',
        iconColor: 'text-blue-600',
        description: 'ESP32 sensor confirmed pillbox compartment open/close. Optical video unverified or not equipped.',
      };
    case 'RETRY_REQUIRED':
      return {
        label: 'RETRY REQUIRED',
        patientFriendly: 'Verification retry needed',
        bg: 'bg-amber-500/15 text-amber-800 border-amber-500/30',
        iconColor: 'text-amber-600',
        description: 'Movement obscured by angle or poor lighting; pillbox opened but camera sequence inconclusive.',
      };
    case 'UNVERIFIED':
    default:
      return {
        label: 'UNVERIFIED',
        patientFriendly: 'Not yet verified',
        bg: 'bg-slate-500/15 text-slate-700 border-slate-500/30',
        iconColor: 'text-slate-500',
        description: 'No telemetry or computer-vision sequence received for this slot.',
      };
  }
}

export function getAlertSeverityConfig(severity: AlertSeverity) {
  switch (severity) {
    case 'CRITICAL':
      return {
        badge: 'bg-rose-100 text-rose-800 border-rose-300',
        border: 'border-l-rose-500',
        cardBg: 'bg-rose-50/60',
      };
    case 'WARNING':
      return {
        badge: 'bg-amber-100 text-amber-800 border-amber-300',
        border: 'border-l-amber-500',
        cardBg: 'bg-amber-50/60',
      };
    case 'INFO':
    default:
      return {
        badge: 'bg-sky-100 text-sky-800 border-sky-300',
        border: 'border-l-sky-500',
        cardBg: 'bg-sky-50/60',
      };
  }
}

export function getAlertTypeConfig(type: AlertType) {
  switch (type) {
    case 'MISSED_DOSE':
      return { label: 'MISSED DOSE', icon: 'AlertTriangle', color: 'text-rose-600' };
    case 'LATE_DOSE':
      return { label: 'LATE DOSE', icon: 'Clock', color: 'text-amber-600' };
    case 'VERIFICATION_FAILED':
      return { label: 'VERIFICATION FAILED', icon: 'CameraOff', color: 'text-amber-700' };
    case 'DEVICE_OFFLINE':
      return { label: 'DEVICE OFFLINE', icon: 'WifiOff', color: 'text-rose-700' };
    case 'SYNC_PENDING':
      return { label: 'SYNC PENDING', icon: 'RefreshCw', color: 'text-sky-600' };
  }
}

export function generateWhatsAppMessage(patientName: string, patientId: string, alertType: string, time: string): string {
  return encodeURIComponent(
    `*DoseSure Automated Care Alert*\n` +
    `Hello,\n` +
    `This is an adherence notification regarding patient *${patientName}* (ID: ${patientId}).\n` +
    `Alert Event: *${alertType}* at ${time}.\n` +
    `Please ensure the patient has taken their prescribed TB medication dose or contact your assigned DOTS field worker.\n` +
    `DoseSure – Right Dose. Right Time. Verified.`
  );
}

export function formatTimeRemaining(): string {
  // Return realistic remaining time to next 08:00 PM dose
  const now = new Date();
  const target = new Date();
  target.setHours(20, 0, 0, 0); // 8:00 PM
  
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) {
    return '01h 45m';
  }
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
}
