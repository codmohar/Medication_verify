import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DoseSlot, Patient, VerificationResult } from '../types';
import { 
  Wifi, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Video, 
  Play, 
  Square, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight,
  Info,
  Check,
  Upload,
  Droplets,
  Loader2,
  RefreshCw,
  Eye,
  Cpu,
  Scan,
  Layers,
  Activity,
  Zap,
  Crosshair,
  ListChecks,
  CheckCheck,
  Clock,
  ArrowUp,
  Target,
  Code,
  Download,
  Copy,
  Terminal,
  Volume2,
  VolumeX,
  Lightbulb,
  Unlock,
  Lock,
  Radio,
  FileCode,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { RealtimeScanningOverlay } from './RealtimeScanningOverlay';
import { generatePatientESP32Code } from '../utils/helpers';

interface MedicationIntakeModalProps {
  isOpen: boolean;
  slot: DoseSlot;
  patient: Patient;
  onClose: () => void;
  onCompleteDose: (slot: DoseSlot, videoBlob?: Blob, verificationResult?: VerificationResult) => void;
}

type IntakePhase = 
  | 'pillbox_verification' 
  | 'video_capture' 
  | 'analyzing'
  | 'video_review' 
  | 'success';

export const MedicationIntakeModal: React.FC<MedicationIntakeModalProps> = ({
  isOpen,
  slot,
  patient,
  onClose,
  onCompleteDose,
}) => {
  const [phase, setPhase] = useState<IntakePhase>('pillbox_verification');
  const [pillboxStep, setPillboxStep] = useState<'connecting' | 'lid_open' | 'pill_retrieved' | 'verified'>('connecting');
  
  // Interactive Pillbox Hardware & Telemetry State
  const isCompartment1 = slot === 'Morning';
  const targetCompartmentNumber = isCompartment1 ? 1 : 2;
  const targetLdrPin = isCompartment1 ? 34 : 35;
  const targetLedPin = isCompartment1 ? 25 : 26;
  const targetBuzzerPin = 27;

  const [pillboxLdrValue, setPillboxLdrValue] = useState<number>(245);
  const pillboxThreshold = 1000;
  const [isLidOpened, setIsLidOpened] = useState<boolean>(false);
  const [ledActive, setLedActive] = useState<boolean>(true);
  const [buzzerActive, setBuzzerActive] = useState<boolean>(true);
  const [showFirmwareDrawer, setShowFirmwareDrawer] = useState<boolean>(false);
  const [showSerialTerminal, setShowSerialTerminal] = useState<boolean>(false);
  const [wifiSsid, setWifiSsid] = useState<string>('Galaxy A22 5G');
  const [wifiPass, setWifiPass] = useState<string>('mohar466');
  const [copiedFirmware, setCopiedFirmware] = useState<boolean>(false);
  const [serialLogs, setSerialLogs] = useState<string[]>([]);

  const handleOpenPillboxLid = () => {
    const lightVal = 2650;
    setPillboxLdrValue(lightVal);
    setIsLidOpened(true);
    setPillboxStep('verified');
    setLedActive(false);
    setBuzzerActive(false);
    setSerialLogs(prev => [
      ...prev,
      `------------------------------------------`,
      `[LDR ${targetCompartmentNumber}] Reading: ${lightVal} > 1000 (LIGHT DETECTED!)`,
      `******************************************`,
      `       DOSE ${targetCompartmentNumber} TAKEN`,
      `       LIGHT DETECTED`,
      `       COMPARTMENT ${targetCompartmentNumber} OPENED`,
      `       LED ${targetCompartmentNumber} = OFF | BUZZER = OFF`,
      `******************************************`,
      `[TELEMETRY] Pill access confirmed. Step 2 (AI Video Verification) is now unlocked!`
    ]);
  };

  const handleResetPillboxLid = () => {
    setPillboxLdrValue(245);
    setIsLidOpened(false);
    setPillboxStep('lid_open');
    setLedActive(true);
    setBuzzerActive(true);
    setSerialLogs(prev => [
      ...prev,
      `[RESET] Compartment ${targetCompartmentNumber} lid closed (LDR: 245 <= 1000 DARK). LED=ON, Buzzer=ON.`
    ]);
  };

  const handleCopyFirmware = () => {
    const code = generatePatientESP32Code(patient, { ssid: wifiSsid, password: wifiPass });
    navigator.clipboard.writeText(code);
    setCopiedFirmware(true);
    setTimeout(() => setCopiedFirmware(false), 2000);
  };

  const handleDownloadFirmware = () => {
    const code = generatePatientESP32Code(patient, { ssid: wifiSsid, password: wifiPass });
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dosesure_esp32_${patient.id}.ino`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  // Video capture mode: 'camera' or 'upload'
  const [captureMode, setCaptureMode] = useState<'camera' | 'upload'>('camera');
  
  // Camera & Recording state
  const [cameraState, setCameraState] = useState<'requesting' | 'active' | 'denied' | 'simulated'>('requesting');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [countdownStart, setCountdownStart] = useState<number | null>(null);
  const [recordingSecondsElapsed, setRecordingSecondsElapsed] = useState<number>(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(20);
  
  // Real-time live scanning states
  const [realtimeActivities, setRealtimeActivities] = useState<{
    pill_detected: { active: boolean; confidence: number; label: string; boundingBox?: { x: number; y: number; w: number; h: number }; details: string };
    hand_gesture: { active: boolean; trajectory_progress: number; direction: 'steady' | 'moving_up' | 'at_mouth' | 'retracted'; confidence: number; details: string };
    mouth_interaction: { active: boolean; confidence: number; oral_contact: boolean; swallow_detected: boolean; details: string };
    hand_empty: { active: boolean; confidence: number; palm_open: boolean; pill_absent: boolean; details: string };
    water_intake: { active: boolean; confidence: number; details: string };
  } | null>(null);

  const [realtimeEventsDone, setRealtimeEventsDone] = useState<{
    medicine_detected: boolean;
    medicine_to_mouth: boolean;
    mouth_interaction: boolean;
    hand_empty: boolean;
    water_intake: boolean;
  }>({
    medicine_detected: false,
    medicine_to_mouth: false,
    mouth_interaction: false,
    hand_empty: false,
    water_intake: false,
  });

  const [realtimeTimestamps, setRealtimeTimestamps] = useState<{
    medicine_detected: string | null;
    medicine_to_mouth: string | null;
    mouth_interaction: string | null;
    hand_empty: string | null;
    water_intake: string | null;
  }>({
    medicine_detected: null,
    medicine_to_mouth: null,
    mouth_interaction: null,
    hand_empty: null,
    water_intake: null,
  });

  const [liveCoachInstruction, setLiveCoachInstruction] = useState<string>(
    '👉 Step 1: Hold the pill clearly in your palm facing the camera'
  );

  const [liveActivityFeed, setLiveActivityFeed] = useState<Array<{
    id: string;
    time: string;
    title: string;
    detail: string;
    step: 'pill' | 'gesture' | 'mouth' | 'empty' | 'water';
  }>>([]);

  const [playbackCurrentSeconds, setPlaybackCurrentSeconds] = useState<number>(0);

  // Verification state
  const [analysisStepText, setAnalysisStepText] = useState<string>('Uploading video frames...');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playbackRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const capturedFramesRef = useRef<Array<{ timestamp: string; imageBase64: string; label: string }>>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const preCountdownIntervalRef = useRef<number | null>(null);
  const canvasSimRef = useRef<HTMLCanvasElement | null>(null);
  const simAnimIdRef = useRef<number | null>(null);
  const isScanningRef = useRef<boolean>(false);
  const isPillCheckingRef = useRef<boolean>(false);
  const lastScanTimeRef = useRef<number>(0);
  const lastPillCheckTimeRef = useRef<number>(0);
  const recordingSecondsElapsedRef = useRef<number>(0);
  recordingSecondsElapsedRef.current = recordingSecondsElapsed;

  const realtimeEventsDoneRef = useRef(realtimeEventsDone);
  realtimeEventsDoneRef.current = realtimeEventsDone;

  const realtimeTimestampsRef = useRef(realtimeTimestamps);
  realtimeTimestampsRef.current = realtimeTimestamps;

  // Buffer of all continuous camera frames taken during recording session
  const recordedFramesBufferRef = useRef<Array<{ timestamp: string; imageBase64: string }>>([]);

  // Snapshot frame from live stream or simulated canvas
  const captureFrameSnapshot = useCallback((timestamp: string, label: string) => {
    try {
      let canvasToExtract: HTMLCanvasElement | null = null;
      // Prioritize active physical camera over simulation canvas
      if (videoRef.current && videoRef.current.videoWidth > 0 && cameraState === 'active') {
        const v = videoRef.current;
        const c = document.createElement('canvas');
        c.width = Math.min(640, v.videoWidth || 640);
        c.height = Math.round(c.width * ((v.videoHeight || 480) / (v.videoWidth || 640)));
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.drawImage(v, 0, 0, c.width, c.height);
          canvasToExtract = c;
        }
      } else if (canvasSimRef.current && cameraState === 'simulated') {
        canvasToExtract = canvasSimRef.current;
      }

      if (canvasToExtract) {
        const dataUrl = canvasToExtract.toDataURL('image/jpeg', 0.85);
        capturedFramesRef.current.push({
          timestamp,
          imageBase64: dataUrl,
          label,
        });
        return dataUrl;
      }
    } catch (e) {
      console.warn('Frame capture snapshot non-fatal error:', e);
    }
    return null;
  }, [cameraState]);

  // Asynchronous dedicated optical pill inspector (runs non-blocking in background)
  const checkPillRealtimeAsync = useCallback(async () => {
    if (realtimeEventsDoneRef.current.medicine_detected) return;
    if (isPillCheckingRef.current) return;

    let frameBase64: string | undefined = undefined;
    if (videoRef.current && videoRef.current.videoWidth > 0) {
      const v = videoRef.current;
      const c = document.createElement('canvas');
      c.width = Math.min(640, v.videoWidth || 640);
      c.height = Math.round(c.width * ((v.videoHeight || 480) / (v.videoWidth || 640)));
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.drawImage(v, 0, 0, c.width, c.height);
        frameBase64 = c.toDataURL('image/jpeg', 0.85);
      }
    } else if (canvasSimRef.current) {
      frameBase64 = canvasSimRef.current.toDataURL('image/jpeg', 0.85);
    }

    if (!frameBase64) return;

    isPillCheckingRef.current = true;
    try {
      const res = await fetch('/api/verify-pill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frameBase64,
          expectedMedicineName: patient.medicationName,
        }),
      });

      if (res.ok) {
        const pillResult = await res.json();
        if (pillResult.pill_detected) {
          const sec = recordingSecondsElapsedRef.current;
          const mm = Math.floor(sec / 60).toString().padStart(2, '0');
          const ss = (sec % 60).toString().padStart(2, '0');
          const currentTs = `${mm}:${ss}`;

          setRealtimeEventsDone(prev => ({ ...prev, medicine_detected: true }));
          setRealtimeTimestamps(prev => ({
            ...prev,
            medicine_detected: prev.medicine_detected || currentTs,
          }));
          realtimeEventsDoneRef.current.medicine_detected = true;
          realtimeTimestampsRef.current.medicine_detected = currentTs;

          captureFrameSnapshot(currentTs, 'Pill in Hand (Optical AI Verified)');
          setLiveCoachInstruction('✅ Medicine detected between fingers / in palm! Now bring it up to your mouth');
          setLiveActivityFeed(prev => [
            {
              id: `pill-${Date.now()}`,
              time: currentTs,
              title: 'Medicine Detected Between Fingers / Palm',
              detail: pillResult.reason || 'Physical oral medication confirmed held in hand.',
              step: 'pill',
            },
            ...prev,
          ]);
        } else if (pillResult.reason && (pillResult.reason.toLowerCase().includes('empty') || pillResult.reason.toLowerCase().includes('pinch'))) {
          setLiveCoachInstruction('⚠️ Empty hand pinch detected. Please place your actual medicine between your fingers or in palm');
        }
      }
    } catch (err) {
      console.warn('Real-time pill verification async check non-fatal error:', err);
    } finally {
      isPillCheckingRef.current = false;
    }
  }, [patient.medicationName, captureFrameSnapshot]);

  // Perform real-time scanning on current camera frame
  const scanRealtimeFrame = useCallback(async (elapsedSec: number) => {
    if (isScanningRef.current) return;
    isScanningRef.current = true;

    try {
      const mm = Math.floor(elapsedSec / 60).toString().padStart(2, '0');
      const ss = (elapsedSec % 60).toString().padStart(2, '0');
      const currentTs = `${mm}:${ss}`;

      // Grab snapshot base64 if available
      let frameBase64: string | undefined = undefined;
      if (videoRef.current && videoRef.current.videoWidth > 0) {
        const v = videoRef.current;
        const c = document.createElement('canvas');
        c.width = 320;
        c.height = 240;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.drawImage(v, 0, 0, 320, 240);
          frameBase64 = c.toDataURL('image/jpeg', 0.7);
        }
      } else if (canvasSimRef.current) {
        frameBase64 = canvasSimRef.current.toDataURL('image/jpeg', 0.7);
      }

      const res = await fetch('/api/realtime-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frameBase64,
          elapsedSeconds: elapsedSec,
          expectedMedicineName: patient.medicationName,
          shouldCheckPill: !realtimeEventsDoneRef.current.medicine_detected,
          pillVerified: realtimeEventsDoneRef.current.medicine_detected,
          previousEvents: realtimeEventsDoneRef.current,
          previousTimestamps: realtimeTimestampsRef.current,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRealtimeActivities(data.activities);
        setRealtimeEventsDone(data.events_done);
        setRealtimeTimestamps(data.event_timestamps);
        realtimeEventsDoneRef.current = data.events_done;
        realtimeTimestampsRef.current = data.event_timestamps;
        
        if (data.instruction) {
          setLiveCoachInstruction(data.instruction);
        }

        // Check if any event transitioned to done and log it
        if (data.events_done.medicine_detected && !realtimeEventsDoneRef.current.medicine_detected) {
          const ts = data.event_timestamps.medicine_detected || currentTs;
          captureFrameSnapshot(ts, 'Pill in Hand (Live Scanner)');
          setLiveActivityFeed(prev => [
            {
              id: `pill-${Date.now()}`,
              time: ts,
              title: 'Pill in Hand Confirmed',
              detail: data.activities.pill_detected.details,
              step: 'pill',
            },
            ...prev,
          ]);
        }

        if (data.events_done.medicine_to_mouth && !realtimeEventsDoneRef.current.medicine_to_mouth) {
          const ts = data.event_timestamps.medicine_to_mouth || currentTs;
          captureFrameSnapshot(ts, 'Hand to Mouth (Live Scanner)');
          setLiveActivityFeed(prev => [
            {
              id: `gesture-${Date.now()}`,
              time: ts,
              title: 'Hand Trajectory to Mouth Tracked',
              detail: data.activities.hand_gesture.details,
              step: 'gesture',
            },
            ...prev,
          ]);
        }

        if (data.events_done.mouth_interaction && !realtimeEventsDoneRef.current.mouth_interaction) {
          const ts = data.event_timestamps.mouth_interaction || currentTs;
          captureFrameSnapshot(ts, 'Mouth Ingestion (Live Scanner)');
          setLiveActivityFeed(prev => [
            {
              id: `mouth-${Date.now()}`,
              time: ts,
              title: 'Mouth Ingestion & Swallow Verified',
              detail: data.activities.mouth_interaction.details,
              step: 'mouth',
            },
            ...prev,
          ]);
        }

        if (data.events_done.hand_empty && !realtimeEventsDoneRef.current.hand_empty) {
          const ts = data.event_timestamps.hand_empty || currentTs;
          captureFrameSnapshot(ts, 'Empty Hand (Live Scanner)');
          setLiveActivityFeed(prev => [
            {
              id: `empty-${Date.now()}`,
              time: ts,
              title: 'Empty Palm Verified',
              detail: data.activities.hand_empty.details,
              step: 'empty',
            },
            ...prev,
          ]);
        }

        if (data.events_done.water_intake && !realtimeEventsDoneRef.current.water_intake) {
          const ts = data.event_timestamps.water_intake || currentTs;
          captureFrameSnapshot(ts, 'Water Intake (Live Scanner)');
          setLiveActivityFeed(prev => [
            {
              id: `water-${Date.now()}`,
              time: ts,
              title: 'Water Intake Detected (Optional)',
              detail: data.activities.water_intake.details,
              step: 'water',
            },
            ...prev,
          ]);
        }
      }
    } catch (e) {
      console.warn('Realtime frame scan non-fatal error:', e);
    } finally {
      isScanningRef.current = false;
    }
  }, [patient.medicationName, captureFrameSnapshot]);

  // Quick manual mark for any activity during live recording
  const handleQuickMarkActivity = (key: keyof typeof realtimeEventsDone, label: string) => {
    // Cannot mark gesture or clean hand before medicine in hand is confirmed
    if (key !== 'medicine_detected' && !realtimeEventsDoneRef.current.medicine_detected) {
      setLiveCoachInstruction('⚠️ Step 1 Mandatory: You must confirm medicine in hand before marking gesture or empty hand!');
      return;
    }

    const mm = Math.floor(recordingSecondsElapsed / 60).toString().padStart(2, '0');
    const ss = (recordingSecondsElapsed % 60).toString().padStart(2, '0');
    const ts = `${mm}:${ss}`;

    setRealtimeEventsDone(prev => ({ ...prev, [key]: true }));
    setRealtimeTimestamps(prev => ({ ...prev, [key]: prev[key] || ts }));

    captureFrameSnapshot(ts, `${label} (Manual Quick Confirm)`);
    setLiveActivityFeed(prev => [
      {
        id: `${String(key)}-${Date.now()}`,
        time: ts,
        title: `${label} Confirmed`,
        detail: `Manually locked at ${ts} by patient`,
        step: key === 'medicine_detected' ? 'pill' : key === 'medicine_to_mouth' ? 'gesture' : key === 'mouth_interaction' ? 'mouth' : key === 'hand_empty' ? 'empty' : 'water',
      },
      ...prev,
    ]);
  };

  // Toggle activity state in review mode
  const handleToggleActivityInReview = (eventKey: keyof VerificationResult['events']) => {
    if (!verificationResult) return;

    const updatedEvents = {
      ...verificationResult.events,
      [eventKey]: !verificationResult.events[eventKey],
    };

    const isVerified =
      updatedEvents.medicine_detected &&
      updatedEvents.medicine_to_mouth &&
      updatedEvents.hand_empty;

    let failedStep: string | null = null;
    if (!updatedEvents.medicine_detected) failedStep = 'medicine_detected';
    else if (!updatedEvents.medicine_to_mouth) failedStep = 'medicine_to_mouth';
    else if (!updatedEvents.hand_empty) failedStep = 'hand_empty';

    const updatedResult: VerificationResult = {
      ...verificationResult,
      status: isVerified ? 'MEDICINE_TAKEN' : 'MEDICINE_NOT_TAKEN',
      verified: isVerified,
      sequence_valid: isVerified,
      confidence: isVerified ? 0.96 : 0.45,
      events: updatedEvents,
      failed_step: failedStep,
      message: isVerified
        ? 'Medicine intake verified successfully. 3 mandatory activities confirmed.'
        : `Medication intake unconfirmed. Activity missing: ${failedStep}.`,
    };

    setVerificationResult(updatedResult);
  };

  const handleSeekVideo = (seconds: number) => {
    if (playbackRef.current) {
      playbackRef.current.currentTime = seconds;
      playbackRef.current.play().catch(() => {});
    }
  };

  const stopCameraStream = useCallback(() => {
    if (simAnimIdRef.current) {
      cancelAnimationFrame(simAnimIdRef.current);
      simAnimIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Reset modal state upon opening
  useEffect(() => {
    if (isOpen) {
      setPhase('pillbox_verification');
      setPillboxStep('connecting');
      setCaptureMode('camera');
      setCameraState('requesting');
      setCameraError(null);
      setIsRecording(false);
      setRecordingSecondsElapsed(0);
      setRecordedVideoUrl(null);
      setRecordedBlob(null);
      setVerificationResult(null);
      setCountdownStart(null);
      setRealtimeActivities(null);
      setRealtimeEventsDone({
        medicine_detected: false,
        medicine_to_mouth: false,
        mouth_interaction: false,
        hand_empty: false,
        water_intake: false,
      });
      setRealtimeTimestamps({
        medicine_detected: null,
        medicine_to_mouth: null,
        mouth_interaction: null,
        hand_empty: null,
        water_intake: null,
      });
      setLiveCoachInstruction('👉 Step 1: Hold the pill clearly in your palm facing the camera');
      setLiveActivityFeed([]);

      // Active Pillbox hardware sequence (keeps pillbox interactive before video capture)
      setIsLidOpened(false);
      setPillboxLdrValue(245);
      setLedActive(true);
      setBuzzerActive(true);
      setShowFirmwareDrawer(false);
      setShowSerialTerminal(false);

      const compNum = slot === 'Morning' ? 1 : 2;
      const ldrPin = slot === 'Morning' ? 34 : 35;
      const ledPin = slot === 'Morning' ? 25 : 26;

      const t1 = setTimeout(() => {
        setPillboxStep('lid_open');
        setSerialLogs([
          `==========================================`,
          `           DOSESURE PILLBOX`,
          `==========================================`,
          `Device ID: ${patient.pillboxId || 'DSBOX-01'} • Patient: ${patient.fullName} (${patient.id})`,
          `Connecting to Wi-Fi SSID: '${wifiSsid}' ... Connected!`,
          `ESP32 IP: 192.168.43.120`,
          `Time synchronized successfully (NTP UTC+5:30)!`,
          `------------------------------------------`,
          `[HARDWARE] Monitoring Compartment ${compNum} (${slot} Dose)`,
          `[CONFIG] LDR Pin: ${ldrPin} (Threshold: 1000) • LED Pin: ${ledPin} • Buzzer Pin: 27`,
          `[SENSOR] LDR ${compNum} Value: 245 (DARK <= 1000) - READY FOR OPENING`,
          `[DOSE TIME REACHED] OPEN COMPARTMENT ${compNum}`,
          `LED ${compNum} = ON | BUZZER = ON | 30 MINUTE WINDOW STARTED`,
          `------------------------------------------`,
        ]);
      }, 400);

      return () => {
        clearTimeout(t1);
      };
    } else {
      stopCameraStream();
    }
  }, [isOpen, stopCameraStream]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (preCountdownIntervalRef.current) clearInterval(preCountdownIntervalRef.current);
    };
  }, [stopCameraStream]);

  // Simulated Camera Stream using HTML5 Canvas
  const setupSimulatedCameraStream = useCallback(() => {
    stopCameraStream();
    setCameraState('simulated');
    setCameraError('Physical camera unavailable or permission denied. Using high-definition animated capture simulator.');

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    canvasSimRef.current = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const drawSimFrame = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      // Dark medical preview gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Grid guides
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
      ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Animated person head/face silhouette
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2 - 30, 80, 0, Math.PI * 2);
      ctx.fill();

      // Mouth indicator
      ctx.fillStyle = '#0f172a';
      const mouthOpen = Math.sin(frame * 0.08) > 0.2;
      ctx.beginPath();
      if (mouthOpen) {
        ctx.ellipse(w / 2, h / 2 + 10, 18, 12, 0, 0, Math.PI * 2);
      } else {
        ctx.ellipse(w / 2, h / 2 + 10, 16, 4, 0, 0, Math.PI * 2);
      }
      ctx.fill();

      // Hand and Pill motion
      // Cycle: 0-60 pill in hand, 60-120 hand moves to mouth, 120-180 hand empty
      const cycle = frame % 240;
      let handX = w / 2 + 130;
      let handY = h / 2 + 80;
      let showPill = true;

      if (cycle < 60) {
        // Showing pill in palm
        handX = w / 2 + 130 + Math.sin(frame * 0.05) * 5;
        handY = h / 2 + 80;
        showPill = true;
      } else if (cycle < 130) {
        // Moving to mouth
        const progress = (cycle - 60) / 70;
        handX = (w / 2 + 130) + ((w / 2 + 10) - (w / 2 + 130)) * progress;
        handY = (h / 2 + 80) + ((h / 2 + 15) - (h / 2 + 80)) * progress;
        showPill = progress < 0.85;
      } else {
        // Empty palm shown to camera
        handX = w / 2 + 120 + Math.sin(frame * 0.05) * 5;
        handY = h / 2 + 70;
        showPill = false;
      }

      // Draw Hand Palm
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(handX, handY, 32, 0, Math.PI * 2);
      ctx.fill();

      // Draw Pill in hand
      if (showPill) {
        ctx.fillStyle = '#14b8a6'; // Teal pill
        ctx.beginPath();
        ctx.ellipse(handX, handY - 4, 12, 6, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // HUD text
      ctx.fillStyle = '#14b8a6';
      ctx.font = 'bold 13px Plus Jakarta Sans, sans-serif';
      ctx.fillText('LIVE INGESTION SIMULATOR FEED', 20, 32);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px monospace';
      ctx.fillText(`PATIENT: ${patient.fullName} | MED: ${patient.medicationName}`, 20, 50);

      const statusMsg = showPill 
        ? (cycle < 60 ? 'STATE: 1. Pill in hand detected' : 'STATE: 2. Hand gesture: hand bringing pill to mouth')
        : 'STATE: 3. Ingestion complete - hand empty';
      ctx.fillStyle = showPill ? '#38bdf8' : '#34d399';
      ctx.fillText(statusMsg, 20, h - 25);

      simAnimIdRef.current = requestAnimationFrame(drawSimFrame);
    };

    drawSimFrame();

    try {
      const simStream = canvas.captureStream(30);
      streamRef.current = simStream;
      if (videoRef.current) {
        videoRef.current.srcObject = simStream;
        videoRef.current.play().catch(e => console.warn('Simulated stream video play error:', e));
      }
    } catch (e) {
      console.warn('Canvas captureStream error:', e);
    }
  }, [stopCameraStream, patient.fullName, patient.medicationName]);

  // Request & start camera stream
  const startCamera = useCallback(async () => {
    stopCameraStream();
    setCameraState('requesting');
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API (navigator.mediaDevices.getUserMedia) is not supported in this browser.');
      }

      let stream: MediaStream | null = null;
      try {
        // Try user-facing camera without audio first (audio requirement causes NotAllowed/NotFound errors)
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (err1) {
        console.warn('High-res facingMode camera request failed, trying basic video constraints:', err1);
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } catch (err2: any) {
          throw err2;
        }
      }

      if (!stream) {
        throw new Error('No video stream returned from camera.');
      }

      streamRef.current = stream;
      setCameraState('active');
      canvasSimRef.current = null; // Ensure simulation canvas is cleared when camera is active

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => console.warn('Camera video play error:', err));
      }
    } catch (err: any) {
      console.warn('Physical camera unavailable:', err);
      setupSimulatedCameraStream();
    }
  }, [stopCameraStream, setupSimulatedCameraStream]);

  // Ensure video element srcObject is synchronized when camera state changes
  useEffect(() => {
    if (phase === 'video_capture' && captureMode === 'camera') {
      if (!streamRef.current) {
        startCamera();
      } else if (videoRef.current && videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(e => console.warn('Sync play error:', e));
      }
    }
  }, [phase, captureMode, startCamera]);

  // Pre-recording countdown (3... 2... 1...)
  const handleInitiateRecording = () => {
    setCountdownStart(3);
    let count = 3;
    preCountdownIntervalRef.current = window.setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownStart(count);
      } else {
        if (preCountdownIntervalRef.current) {
          clearInterval(preCountdownIntervalRef.current);
          preCountdownIntervalRef.current = null;
        }
        setCountdownStart(null);
        startActual20sRecording();
      }
    }, 1000);
  };

  // Start 20s recording
  const startActual20sRecording = () => {
    setIsRecording(true);
    setRecordingSecondsElapsed(0);
    recordedChunksRef.current = [];

    const streamToRecord = streamRef.current;

    if (streamToRecord && typeof MediaRecorder !== 'undefined') {
      try {
        let mimeType = 'video/webm';
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
          mimeType = 'video/webm;codecs=vp9';
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
          mimeType = 'video/webm;codecs=vp8';
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          mimeType = 'video/webm';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4';
        }

        const recorder = new MediaRecorder(streamToRecord, { mimeType });
        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: mimeType });
          const url = URL.createObjectURL(blob);
          setRecordedBlob(blob);
          setRecordedVideoUrl(url);
          triggerAiVerification(blob, mimeType);
        };

        recorder.start(400); // chunk every 400ms
        mediaRecorderRef.current = recorder;
      } catch (e) {
        console.warn('MediaRecorder initialization failed:', e);
      }
    }

    // Continuous active recording session with frame buffering & real-time CV scanning
    capturedFramesRef.current = [];
    recordedFramesBufferRef.current = [];
    lastScanTimeRef.current = 0;
    let lastBufferFrameTime = 0;
    isScanningRef.current = false;

    // Reset realtime status at start of recording
    setRealtimeEventsDone({
      medicine_detected: false,
      medicine_to_mouth: false,
      mouth_interaction: false,
      hand_empty: false,
      water_intake: false,
    });
    setRealtimeTimestamps({
      medicine_detected: null,
      medicine_to_mouth: null,
      mouth_interaction: null,
      hand_empty: null,
      water_intake: null,
    });
    setLiveActivityFeed([]);

    const startMs = Date.now();
    timerIntervalRef.current = window.setInterval(() => {
      const elapsed = Math.min(20, Math.floor((Date.now() - startMs) / 1000));
      setRecordingSecondsElapsed(elapsed);

      const now = Date.now();

      // Buffer continuous high-res frames every ~300ms from the live camera
      if (now - lastBufferFrameTime >= 300) {
        lastBufferFrameTime = now;
        const mm = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const ss = (elapsed % 60).toString().padStart(2, '0');
        const currentTs = `${mm}:${ss}`;

        let currentFrameBase64: string | null = null;
        if (videoRef.current && videoRef.current.videoWidth > 0 && cameraState === 'active') {
          const v = videoRef.current;
          const c = document.createElement('canvas');
          c.width = Math.min(640, v.videoWidth || 640);
          c.height = Math.round(c.width * ((v.videoHeight || 480) / (v.videoWidth || 640)));
          const ctx = c.getContext('2d');
          if (ctx) {
            ctx.drawImage(v, 0, 0, c.width, c.height);
            currentFrameBase64 = c.toDataURL('image/jpeg', 0.85);
          }
        } else if (canvasSimRef.current && cameraState === 'simulated') {
          currentFrameBase64 = canvasSimRef.current.toDataURL('image/jpeg', 0.85);
        }

        if (currentFrameBase64) {
          recordedFramesBufferRef.current.push({
            timestamp: currentTs,
            imageBase64: currentFrameBase64,
          });
        }
      }

      // Trigger continuous real-time vision scanning cycle (every ~500ms)
      if (now - lastScanTimeRef.current >= 500 && !isScanningRef.current) {
        lastScanTimeRef.current = now;
        scanRealtimeFrame(elapsed);
      }

      if (elapsed >= 20) {
        handleFinishRecording(20);
      }
    }, 150);
  };

  // Finish recording and sample keyframes proportionally across the duration
  const handleFinishRecording = (forcedSeconds?: number) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const duration = forcedSeconds || (recordingSecondsElapsed > 0 ? recordingSecondsElapsed : 20);
    setVideoDuration(duration);
    setIsRecording(false);

    // Extract true chronological keyframes across the user's actual recorded video buffer
    const buffer = recordedFramesBufferRef.current;
    if (buffer && buffer.length > 0) {
      capturedFramesRef.current = [];
      const len = buffer.length;

      // 6 key temporal checkpoints for comprehensive clinical visual verification:
      const idx1 = Math.min(len - 1, Math.max(0, Math.floor(len * 0.10))); // Pill presentation
      const idx2 = Math.min(len - 1, Math.max(0, Math.floor(len * 0.28))); // Pill inspection
      const idx3 = Math.min(len - 1, Math.max(0, Math.floor(len * 0.48))); // Hand upward trajectory
      const idx4 = Math.min(len - 1, Math.max(0, Math.floor(len * 0.65))); // Mouth ingestion
      const idx5 = Math.min(len - 1, Math.max(0, Math.floor(len * 0.80))); // Swallow & withdrawal
      const idx6 = Math.min(len - 1, Math.max(0, Math.floor(len * 0.95))); // Clean open palm

      capturedFramesRef.current.push({
        timestamp: buffer[idx1].timestamp,
        imageBase64: buffer[idx1].imageBase64,
        label: 'Step 1: Medicine in Hand (Presentation to camera)',
      });
      capturedFramesRef.current.push({
        timestamp: buffer[idx2].timestamp,
        imageBase64: buffer[idx2].imageBase64,
        label: 'Step 1b: Pill Visual Confirmation (Close inspection)',
      });
      capturedFramesRef.current.push({
        timestamp: buffer[idx3].timestamp,
        imageBase64: buffer[idx3].imageBase64,
        label: 'Step 2: Hand Movement (Trajecting upward to mouth)',
      });
      capturedFramesRef.current.push({
        timestamp: buffer[idx4].timestamp,
        imageBase64: buffer[idx4].imageBase64,
        label: 'Step 3: Mouth Ingestion (Oral placement & intake)',
      });
      capturedFramesRef.current.push({
        timestamp: buffer[idx5].timestamp,
        imageBase64: buffer[idx5].imageBase64,
        label: 'Step 3b: Swallow & Hand Withdrawal',
      });
      capturedFramesRef.current.push({
        timestamp: buffer[idx6].timestamp,
        imageBase64: buffer[idx6].imageBase64,
        label: 'Step 4: Clean Empty Hand (Open palm confirmation)',
      });
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // Fallback if recorder was not active
      createSyntheticVerification();
    }
  };

  // Convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Trigger server-side AI Verification
  const triggerAiVerification = async (blob: Blob, mimeType: string) => {
    setPhase('analyzing');
    setAnalysisStepText('Uploading video & temporal frames to AI engine...');

    const t1 = setTimeout(() => setAnalysisStepText('Step 1: Detecting pill image & visual features in hand...'), 1000);
    const t2 = setTimeout(() => setAnalysisStepText('Step 2: Tracking hand gesture & movement towards mouth...'), 2000);
    const t3 = setTimeout(() => setAnalysisStepText('Step 3: Verifying mouth ingestion & swallow...'), 3000);
    const t4 = setTimeout(() => setAnalysisStepText('Step 4: Confirming empty open palm & water intake...'), 4000);

    try {
      const base64Data = await blobToBase64(blob);

      const response = await fetch('/api/verify-medicine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoBase64: base64Data,
          keyFrames: capturedFramesRef.current,
          realtimeEvents: realtimeEventsDoneRef.current,
          realtimeTimestamps: realtimeTimestampsRef.current,
          mimeType: mimeType || blob.type || 'video/webm',
          expectedMedicineName: patient.medicationName,
          patientName: patient.fullName,
          doseSlot: slot,
          providerPreference: 'auto',
        }),
      });

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      // DIRECT VERIFICATION RESULT:
      // Zero assumptions or synthetic overrides. The AI Vision model and CV engine
      // determine true physical status directly from the visual evidence.
      const result: VerificationResult = await response.json();

      setVerificationResult(result);
      setPhase('video_review');
    } catch (err: any) {
      console.warn('AI Verification call error or offline fallback:', err);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);

      // Deterministic fallback respecting physical frame reality
      const pillDetected = realtimeEventsDoneRef.current.medicine_detected;
      const handToMouth = realtimeEventsDoneRef.current.medicine_to_mouth;
      const mouthInteraction = realtimeEventsDoneRef.current.mouth_interaction;
      const handEmpty = realtimeEventsDoneRef.current.hand_empty;
      const waterTaken = realtimeEventsDoneRef.current.water_intake;
      const isVerified = pillDetected && handToMouth && mouthInteraction && handEmpty;

      let failedStep: string | null = null;
      if (!pillDetected) failedStep = 'medicine_detected';
      else if (!handToMouth) failedStep = 'medicine_to_mouth';
      else if (!mouthInteraction) failedStep = 'mouth_interaction';
      else if (!handEmpty) failedStep = 'hand_empty';

      const fallbackResult: VerificationResult = {
        status: isVerified ? 'MEDICINE_TAKEN' : 'MEDICINE_NOT_TAKEN',
        verified: isVerified,
        confidence: isVerified ? 0.95 : 0.42,
        sequence_valid: isVerified,
        events: {
          medicine_detected: pillDetected,
          medicine_to_mouth: handToMouth,
          mouth_interaction: mouthInteraction,
          hand_empty: handEmpty,
          water_intake: waterTaken,
        },
        timestamps: {
          medicine_detected: realtimeTimestampsRef.current.medicine_detected || (pillDetected ? '00:03' : null),
          medicine_to_mouth: realtimeTimestampsRef.current.medicine_to_mouth || (handToMouth ? '00:07' : null),
          mouth_interaction: realtimeTimestampsRef.current.mouth_interaction || (mouthInteraction ? '00:09' : null),
          hand_empty: realtimeTimestampsRef.current.hand_empty || (handEmpty ? '00:13' : null),
          water_intake: realtimeTimestampsRef.current.water_intake || (waterTaken ? '00:16' : null),
        },
        step_confidences: {
          medicine_confidence: pillDetected ? 0.95 : 0.35,
          hand_to_mouth_confidence: handToMouth ? 0.94 : 0.40,
          mouth_interaction_confidence: mouthInteraction ? 0.93 : 0.35,
          hand_empty_confidence: handEmpty ? 0.95 : 0.40,
          water_confidence: waterTaken ? 0.88 : 0.30,
        },
        medicine_details: {
          detected_name: patient.medicationName,
          appearance: pillDetected ? 'Solid oral medication tablet' : 'No medicine detected (empty hand)',
          confidence: pillDetected ? 0.94 : 0.35,
          notes: isVerified 
            ? 'All 4 mandatory steps confirmed: medicine in hand, hand to mouth, mouth ingestion, and clean empty hand.' 
            : `Verification halted: ${failedStep || 'missing action'}.`,
        },
        failed_step: failedStep,
        explanation: isVerified
          ? '1. Medicine detected in hand → 2. Hand gesture to mouth → 3. Mouth ingestion verified → 4. Clean empty hand verified → Result: MEDICINE_TAKEN.'
          : `Verification failed at ${failedStep || 'clinical sequence'}: Required physical action was not verified.`,
        message: isVerified
          ? 'Medicine intake verified successfully across all mandatory steps.'
          : `Medication not verified: ${failedStep === 'medicine_detected' ? 'Hand was empty. No pill was held in hand.' : failedStep === 'medicine_to_mouth' ? 'Hand gesture to mouth was not detected.' : failedStep === 'mouth_interaction' ? 'Ingestion into mouth cavity was not observed.' : 'Clean empty hand was not confirmed.'}`,
      };

      setVerificationResult(fallbackResult);
      setPhase('video_review');
    }
  };

  const createSyntheticVerification = () => {
    setPhase('analyzing');
    setAnalysisStepText('Analyzing medicine ingestion sequence...');
    setTimeout(() => {
      const pillDetected = realtimeEventsDoneRef.current.medicine_detected;
      const handToMouth = realtimeEventsDoneRef.current.medicine_to_mouth;
      const mouthInteraction = realtimeEventsDoneRef.current.mouth_interaction;
      const handEmpty = realtimeEventsDoneRef.current.hand_empty;
      const waterTaken = realtimeEventsDoneRef.current.water_intake;
      const isVerified = pillDetected && handToMouth && mouthInteraction && handEmpty;

      let failedStep: string | null = null;
      if (!pillDetected) failedStep = 'medicine_detected';
      else if (!handToMouth) failedStep = 'medicine_to_mouth';
      else if (!mouthInteraction) failedStep = 'mouth_interaction';
      else if (!handEmpty) failedStep = 'hand_empty';

      const syntheticResult: VerificationResult = {
        status: isVerified ? 'MEDICINE_TAKEN' : 'MEDICINE_NOT_TAKEN',
        verified: isVerified,
        confidence: isVerified ? 0.95 : 0.42,
        sequence_valid: isVerified,
        events: {
          medicine_detected: pillDetected,
          medicine_to_mouth: handToMouth,
          mouth_interaction: mouthInteraction,
          hand_empty: handEmpty,
          water_intake: waterTaken,
        },
        timestamps: {
          medicine_detected: realtimeTimestampsRef.current.medicine_detected || (pillDetected ? '00:03' : null),
          medicine_to_mouth: realtimeTimestampsRef.current.medicine_to_mouth || (handToMouth ? '00:07' : null),
          mouth_interaction: realtimeTimestampsRef.current.mouth_interaction || (mouthInteraction ? '00:09' : null),
          hand_empty: realtimeTimestampsRef.current.hand_empty || (handEmpty ? '00:13' : null),
          water_intake: realtimeTimestampsRef.current.water_intake || (waterTaken ? '00:16' : null),
        },
        step_confidences: {
          medicine_confidence: pillDetected ? 0.95 : 0.35,
          hand_to_mouth_confidence: handToMouth ? 0.94 : 0.40,
          mouth_interaction_confidence: mouthInteraction ? 0.93 : 0.35,
          hand_empty_confidence: handEmpty ? 0.95 : 0.40,
          water_confidence: waterTaken ? 0.88 : 0.30,
        },
        medicine_details: {
          detected_name: patient.medicationName,
          appearance: pillDetected ? 'Solid oral medication tablet' : 'No medicine detected (empty hand)',
          confidence: pillDetected ? 0.94 : 0.35,
          notes: isVerified 
            ? 'All 4 mandatory steps confirmed: medicine in hand, hand to mouth, mouth ingestion, and clean empty hand.' 
            : `Verification halted: ${failedStep || 'missing action'}.`,
        },
        failed_step: failedStep,
        explanation: isVerified
          ? '1. Medicine detected in hand → 2. Hand gesture to mouth → 3. Mouth ingestion verified → 4. Clean empty hand verified → Result: MEDICINE_TAKEN.'
          : `Verification failed at ${failedStep || 'clinical sequence'}: Required physical action was not observed.`,
        message: isVerified
          ? 'Medicine intake verified successfully across all mandatory steps.'
          : `Medication not verified: ${failedStep === 'medicine_detected' ? 'Hand was empty. No pill was held in hand.' : failedStep === 'medicine_to_mouth' ? 'Hand gesture to mouth was not detected.' : failedStep === 'mouth_interaction' ? 'Ingestion into mouth cavity was not observed.' : 'Clean empty hand was not confirmed.'}`,
      };

      setVerificationResult(syntheticResult);
      setPhase('video_review');
    }, 1800);
  };

  // Video File Upload Handler
  const handleFileUpload = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please upload a valid video file (.mp4, .webm, .mov, etc.).');
      return;
    }

    const url = URL.createObjectURL(file);
    setRecordedBlob(file);
    setRecordedVideoUrl(url);
    setVideoDuration(20);
    triggerAiVerification(file, file.type);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRetakeVideo = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
      setRecordedVideoUrl(null);
    }
    setRecordedBlob(null);
    setVerificationResult(null);
    setRecordingSecondsElapsed(0);
    setPhase('video_capture');
  };

  const handleConfirmDose = () => {
    setPhase('success');
    setTimeout(() => {
      onCompleteDose(slot, recordedBlob || undefined, verificationResult || undefined);
      onClose();
    }, 1400);
  };

  if (!isOpen) return null;

  return (
    <div 
      id="medication-intake-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div 
        id="medication-intake-modal-panel"
        className="glass-panel max-w-xl w-full p-5 sm:p-7 rounded-3xl shadow-2xl border border-white/90 bg-white text-slate-900 my-auto relative max-h-[92vh] overflow-y-auto"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>Dose Intake &amp; AI Verification</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
                  {slot} Dose
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Pillbox access switch + temporal camera verification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Phase Indicator Tabs */}
        <div className="flex items-center gap-2 mb-5">
          <div className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            phase === 'pillbox_verification' 
              ? 'bg-teal-600 text-white shadow-xs' 
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}>
            <Wifi className="w-3.5 h-3.5" />
            <span>1. Pillbox</span>
            {phase !== 'pillbox_verification' && <Check className="w-3 h-3 text-emerald-600" />}
          </div>

          <ChevronRight className="w-4 h-4 text-slate-300" />

          <div className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            phase === 'video_capture'
              ? 'bg-teal-600 text-white shadow-xs'
              : phase === 'analyzing' || phase === 'video_review' || phase === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-slate-100 text-slate-400'
          }`}>
            <Video className="w-3.5 h-3.5" />
            <span>2. Video Capture</span>
            {(phase === 'analyzing' || phase === 'video_review' || phase === 'success') && <Check className="w-3 h-3 text-emerald-600" />}
          </div>

          <ChevronRight className="w-4 h-4 text-slate-300" />

          <div className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            phase === 'analyzing' || phase === 'video_review' || phase === 'success'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-400'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>3. AI Analysis</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PHASE 1: PILLBOX HARDWARE TELEMETRY                      */}
        {/* ======================================================== */}
        {/* ======================================================== */}
        {/* PHASE 1: PILLBOX HARDWARE TELEMETRY & SENSOR MONITOR     */}
        {/* ======================================================== */}
        {phase === 'pillbox_verification' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Pillbox Status Header Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-teal-500/5 border border-teal-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-700/20 shrink-0">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">
                      Smart Pillbox {patient.pillboxId || 'DSBOX-01'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      ESP32 Online
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Patient: <strong>{patient.fullName}</strong> ({patient.id}) • Assigned Slot: <strong className="text-teal-700">{slot} Dose</strong> (Compartment {targetCompartmentNumber})
                  </p>
                </div>
              </div>

              {/* Wi-Fi & NTP telemetry pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono font-medium text-slate-600">
                <span className="px-2 py-1 rounded-lg bg-white/80 border border-slate-200 flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-teal-600" />
                  <span>{wifiSsid}</span>
                </span>
                <span className="px-2 py-1 rounded-lg bg-white/80 border border-slate-200 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-600" />
                  <span>NTP UTC+5:30</span>
                </span>
              </div>
            </div>

            {/* Hardware Live Telemetry Cards (LDR, Compartment, LED, Buzzer) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              {/* LDR Sensor Reading */}
              <div className={`p-3.5 rounded-2xl border transition-all ${
                isLidOpened 
                  ? 'bg-emerald-50/80 border-emerald-300 shadow-xs' 
                  : 'bg-slate-50/80 border-slate-200'
              }`}>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-1">
                  <span>LDR {targetCompartmentNumber} (Pin {targetLdrPin})</span>
                  <Lightbulb className={`w-3.5 h-3.5 ${isLidOpened ? 'text-amber-500' : 'text-slate-400'}`} />
                </div>
                <div className="text-lg font-black font-mono text-slate-900">
                  {pillboxLdrValue} <span className="text-[10px] font-normal text-slate-500">/ 4095</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px] font-bold">
                  {isLidOpened ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      LIGHT DETECTED (&gt;1000)
                    </span>
                  ) : (
                    <span className="text-slate-600">
                      🌑 DARK (&le;1000 Armed)
                    </span>
                  )}
                </div>
              </div>

              {/* Compartment Lid Status */}
              <div className={`p-3.5 rounded-2xl border transition-all ${
                isLidOpened 
                  ? 'bg-emerald-50/80 border-emerald-300 shadow-xs' 
                  : 'bg-amber-50/70 border-amber-200'
              }`}>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-1">
                  <span>Compartment {targetCompartmentNumber}</span>
                  {isLidOpened ? <Unlock className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <div className="text-lg font-black text-slate-900">
                  {isLidOpened ? 'OPENED' : 'WAITING'}
                </div>
                <div className="mt-1 text-[11px] font-semibold text-slate-600 truncate">
                  {isLidOpened ? 'Pill Retrieved ✓' : 'Awaiting patient opening'}
                </div>
              </div>

              {/* LED Indicator Pin */}
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-1">
                  <span>LED {targetCompartmentNumber} (Pin {targetLedPin})</span>
                  <Radio className={`w-3.5 h-3.5 ${ledActive ? 'text-emerald-500 animate-pulse' : 'text-slate-300'}`} />
                </div>
                <div className="text-lg font-black font-mono">
                  {ledActive ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      ON <span className="text-[10px] font-normal text-slate-500">(Blinking)</span>
                    </span>
                  ) : (
                    <span className="text-slate-400">OFF</span>
                  )}
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  {ledActive ? 'Guiding compartment' : 'Turned off on intake'}
                </div>
              </div>

              {/* Buzzer Alarm Pin */}
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-1">
                  <span>Buzzer (Pin {targetBuzzerPin})</span>
                  {buzzerActive ? <Volume2 className="w-3.5 h-3.5 text-rose-500 animate-bounce" /> : <VolumeX className="w-3.5 h-3.5 text-slate-300" />}
                </div>
                <div className="text-lg font-black font-mono">
                  {buzzerActive ? (
                    <span className="text-rose-600">BEEPING</span>
                  ) : (
                    <span className="text-slate-400">MUTED</span>
                  )}
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  {buzzerActive ? '30-min window alert' : 'Silenced on dose take'}
                </div>
              </div>
            </div>

            {/* Verification State Banner / Guidance */}
            {isLidOpened ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left flex items-start gap-3 animate-in fade-in duration-200">
                <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-bold text-emerald-950">
                    Pillbox Hardware Verification Confirmed!
                  </h5>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Compartment {targetCompartmentNumber} opened and light detected on LDR {targetLdrPin} ({pillboxLdrValue} &gt; 1000). The pill has been retrieved. Now proceed to 20-second AI Video Verification to confirm oral ingestion.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-left flex items-start gap-3">
                <div className="p-2 rounded-xl bg-teal-600 text-white shrink-0 mt-0.5">
                  <Info className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-bold text-slate-900">
                    Step 1 of 3: Open Smart Pillbox Compartment {targetCompartmentNumber}
                  </h5>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Your physical ESP32 box is currently sounding the buzzer and flashing LED {targetCompartmentNumber}. Please open Compartment {targetCompartmentNumber} to retrieve your {slot} medication. You can simulate the physical light sensor detection below.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {!isLidOpened ? (
                  <button
                    type="button"
                    id="simulate-open-pillbox-btn"
                    onClick={handleOpenPillboxLid}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Open Compartment {targetCompartmentNumber} (Trigger Sensor)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleResetPillboxLid}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset / Close Box</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowSerialTerminal(!showSerialTerminal)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    showSerialTerminal 
                      ? 'bg-slate-900 text-white border-slate-900' 
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Toggle ESP32 Serial Telemetry Terminal"
                >
                  <Terminal className="w-3.5 h-3.5 text-teal-500" />
                  <span className="hidden sm:inline">ESP32 Serial Log</span>
                </button>

                <button
                  type="button"
                  id="view-patient-esp32-code-btn"
                  onClick={() => setShowFirmwareDrawer(!showFirmwareDrawer)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    showFirmwareDrawer 
                      ? 'bg-teal-700 text-white border-teal-700 shadow-sm' 
                      : 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                  }`}
                  title="View Dynamic ESP32 Firmware for this Patient"
                >
                  <Code className="w-3.5 h-3.5 text-teal-600" />
                  <span>Dynamic ESP32 Code</span>
                </button>
              </div>

              {/* Continue Button to Video Capture */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {!isLidOpened && (
                  <button
                    type="button"
                    onClick={() => setPhase('video_capture')}
                    className="px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Skip to Video &rarr;
                  </button>
                )}
                <button
                  type="button"
                  id="continue-to-video-capture-btn"
                  onClick={() => setPhase('video_capture')}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isLidOpened 
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-emerald-700/25 scale-102 ring-2 ring-emerald-400/40' 
                      : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-700/20'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>Proceed to AI Video Verification &rarr;</span>
                </button>
              </div>
            </div>

            {/* Collapsible Serial Monitor Terminal */}
            {showSerialTerminal && (
              <div className="rounded-2xl bg-slate-950 text-slate-200 p-3.5 text-left border border-slate-800 font-mono text-[11px] space-y-1 max-h-48 overflow-y-auto animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-slate-400 text-[10px]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    ESP32 Serial Monitor (115200 baud)
                  </span>
                  <span>Target: LDR {targetCompartmentNumber} (Pin {targetLdrPin})</span>
                </div>
                {serialLogs.map((log, idx) => (
                  <div key={idx} className={log.includes('TAKEN') || log.includes('LIGHT DETECTED') ? 'text-emerald-400 font-bold' : log.includes('ALERT') ? 'text-amber-300' : 'text-slate-300'}>
                    {log}
                  </div>
                ))}
              </div>
            )}

            {/* Dynamic Patient ESP32 Firmware Drawer / Code Viewer */}
            {showFirmwareDrawer && (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white border border-teal-500/40 shadow-xl text-left space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <h5 className="text-sm font-bold text-white flex items-center gap-2">
                      <Code className="w-4 h-4 text-teal-400" />
                      Dynamic ESP32 Arduino Firmware Code
                    </h5>
                    <p className="text-xs text-slate-400">
                      Generated dynamically for <strong>{patient.fullName}</strong> ({patient.id}) with custom morning &amp; evening dose schedules.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyFirmware}
                      className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      {copiedFirmware ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedFirmware ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadFirmware}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .ino</span>
                    </button>
                  </div>
                </div>

                {/* Wi-Fi & Schedule Config inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Wi-Fi SSID</label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Wi-Fi Password</label>
                    <input
                      type="text"
                      value={wifiPass}
                      onChange={(e) => setWifiPass(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Dose Window</label>
                    <div className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-teal-400 font-mono text-xs">
                      30 Minutes (Allowed)
                    </div>
                  </div>
                </div>

                {/* Arduino C++ Code Box */}
                <div className="relative rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 font-mono">
                    <span>dosesure_esp32_{patient.id}.ino (C++ Arduino)</span>
                    <span>Ready to Flash in Arduino IDE</span>
                  </div>
                  <pre className="p-3 text-[11px] font-mono text-slate-300 max-h-56 overflow-y-auto whitespace-pre leading-relaxed select-all">
                    {generatePatientESP32Code(patient, { ssid: wifiSsid, password: wifiPass })}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* PHASE 2: VIDEO INPUT (WEBCAM OR UPLOAD)                  */}
        {/* ======================================================== */}
        {phase === 'video_capture' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Capture Mode Toggle */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setCaptureMode('camera')}
                  className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    captureMode === 'camera'
                      ? 'bg-white text-teal-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Camera Video (20s)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCaptureMode('upload')}
                  className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    captureMode === 'upload'
                      ? 'bg-white text-teal-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Video</span>
                </button>
              </div>

              {captureMode === 'camera' && (
                <div className="flex items-center gap-1.5 text-[11px]">
                  {cameraState === 'active' ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live Camera
                    </span>
                  ) : (
                    <button
                      onClick={startCamera}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                      title="Reconnect camera"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Retry Camera
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* MODE A: LIVE WEBCAM RECORDING */}
            {captureMode === 'camera' ? (
              <div className="space-y-3">
                {/* Viewport Frame */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-inner flex items-center justify-center">
                  {/* The actual video element is ALWAYS mounted to prevent ref null bugs */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />

                  {/* Framing Crosshairs Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3.5 sm:p-4">
                    <div className="flex justify-between items-start">
                      <span className="w-7 h-7 border-t-2 border-l-2 border-teal-400 rounded-tl-lg shadow-sm" />
                      <div className="flex items-center gap-2">
                        {isRecording ? (
                          <div className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                            <span>RECORDING</span>
                          </div>
                        ) : (
                          <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-teal-300 text-[11px] font-semibold flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>Frame Medicine &amp; Face</span>
                          </div>
                        )}
                        <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-[11px] font-mono font-bold">
                          {isRecording ? `00:${recordingSecondsElapsed.toString().padStart(2, '0')} / 00:20` : 'Target: 20s'}
                        </span>
                      </div>
                      <span className="w-7 h-7 border-t-2 border-r-2 border-teal-400 rounded-tr-lg shadow-sm" />
                    </div>

                    {/* Pre-countdown modal overlay */}
                    {countdownStart !== null && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs z-20">
                        <div className="text-center space-y-2">
                          <div className="w-20 h-20 rounded-full bg-teal-500 text-white font-extrabold text-4xl flex items-center justify-center mx-auto shadow-xl ring-8 ring-teal-400/30 animate-ping">
                            {countdownStart}
                          </div>
                          <p className="text-xs font-bold text-white uppercase tracking-wider">
                            Get Ready with Medicine...
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-end">
                      <span className="w-7 h-7 border-b-2 border-l-2 border-teal-400 rounded-bl-lg shadow-sm" />
                      <div className="text-[10px] sm:text-[11px] text-teal-200 font-medium bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs text-center max-w-[85%]">
                        1. Show medicine in palm → 2. Hand gesture bringing pill to mouth → 3. Show empty open hand
                      </div>
                      <span className="w-7 h-7 border-b-2 border-r-2 border-teal-400 rounded-br-lg shadow-sm" />
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600">
                    <span>Intake Recording Progress</span>
                    <span className="font-mono text-teal-700">
                      {isRecording ? `${recordingSecondsElapsed}s of 20s recorded` : 'Ready to record'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-200 rounded-full"
                      style={{ width: `${(recordingSecondsElapsed / 20) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Real-time CV Scanning & Activity Checklist HUD */}
                <RealtimeScanningOverlay
                  isRecording={isRecording}
                  recordingSecondsElapsed={recordingSecondsElapsed}
                  medicationName={patient.medicationName}
                  activities={realtimeActivities}
                  eventsDone={realtimeEventsDone}
                  timestamps={realtimeTimestamps}
                  instruction={liveCoachInstruction}
                  activityFeed={liveActivityFeed}
                  onQuickMark={handleQuickMarkActivity}
                  onFinishEarly={() => handleFinishRecording()}
                />

                {/* Status Notice or Camera Error if any */}
                {cameraError && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{cameraError}</span>
                    </span>
                    <button
                      onClick={startCamera}
                      className="px-2 py-1 rounded bg-amber-200/70 hover:bg-amber-200 text-amber-900 text-[10px] font-bold shrink-0"
                    >
                      Retry WebCam
                    </button>
                  </div>
                )}

                {/* Action Controls for Patient */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Patient records dose themselves. AI verifies sequence after completion.</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {!isRecording ? (
                      <button
                        id="start-20s-recording-btn"
                        onClick={handleInitiateRecording}
                        disabled={countdownStart !== null}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white text-xs font-bold shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Start 20s Video Recording</span>
                      </button>
                    ) : (
                      <button
                        id="finish-recording-early-btn"
                        onClick={() => handleFinishRecording()}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-xs font-bold shadow-md shadow-rose-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Square className="w-4 h-4 fill-white" />
                        <span>Finish &amp; Analyze Video ({20 - recordingSecondsElapsed}s left)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* MODE B: UPLOAD VIDEO FILE */
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="video/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`aspect-video w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center p-6 cursor-pointer transition-all ${
                    isDragging
                      ? 'border-teal-500 bg-teal-50/70 scale-99'
                      : 'border-slate-300 bg-slate-50/60 hover:bg-teal-50/30 hover:border-teal-400'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-teal-100/70 text-teal-700 flex items-center justify-center mb-3">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h5 className="font-bold text-sm text-slate-800">
                    Upload Recorded Medicine Taking Video
                  </h5>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Drag and drop your video file here, or click to select (.mp4, .webm, .mov)
                  </p>
                  <span className="mt-4 px-4 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-xs">
                    Choose Video File
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* PHASE 3: AI ANALYZING SPINNER & MULTIMODAL VERIFICATION   */}
        {/* ======================================================== */}
        {phase === 'analyzing' && (
          <div className="py-10 text-center space-y-5 animate-in fade-in duration-200">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-teal-100 animate-ping opacity-50" />
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white flex items-center justify-center shadow-xl">
                <Sparkles className="w-10 h-10 animate-spin" />
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-extrabold text-slate-900">
                Analyzing Medicine Intake with AI...
              </h4>
              <p className="text-xs text-teal-700 font-medium max-w-md mx-auto">
                {analysisStepText}
              </p>
            </div>

            <div className="max-w-xs mx-auto space-y-2 text-left text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-slate-700">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                <span>Detecting medicine in palm / fingers</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                <span>Verifying mouth ingestion sequence</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                <span>Confirming hand is empty post-intake</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                <span>Checking water intake (optional step)</span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PHASE 4: VIDEO REVIEW & STRUCTURED AI VERIFICATION RESULT */}
        {/* ======================================================== */}
        {phase === 'video_review' && verificationResult && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Top Decision Banner */}
            {verificationResult.status === 'MEDICINE_TAKEN' && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border-2 border-emerald-500 flex items-start gap-3 shadow-sm">
                <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4 className="text-base font-black text-emerald-900 tracking-tight">
                      MEDICINE TAKEN ✓
                    </h4>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300">
                        {Math.round(verificationResult.confidence * 100)}% Confidence
                      </span>
                      {verificationResult.model_used && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-700/10 text-emerald-900 text-[10px] font-bold border border-emerald-300">
                          {verificationResult.model_used}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-emerald-800 font-medium mt-0.5">
                    {verificationResult.message}
                  </p>
                </div>
              </div>
            )}

            {verificationResult.status === 'MEDICINE_NOT_TAKEN' && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/15 via-red-500/10 to-rose-500/15 border-2 border-rose-500 flex items-start gap-3 shadow-sm">
                <div className="p-2 rounded-xl bg-rose-600 text-white shrink-0 shadow-sm">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4 className="text-base font-black text-rose-900 tracking-tight">
                      MEDICINE NOT TAKEN ✗
                    </h4>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-300">
                        Failed: {verificationResult.failed_step || 'Incomplete Sequence'}
                      </span>
                      {verificationResult.model_used && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-700/10 text-rose-900 text-[10px] font-bold border border-rose-300">
                          {verificationResult.model_used}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-rose-800 font-medium mt-0.5">
                    {verificationResult.message}
                  </p>
                </div>
              </div>
            )}

            {verificationResult.status === 'UNVERIFIED' && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border-2 border-amber-500 flex items-start gap-3 shadow-sm">
                <div className="p-2 rounded-xl bg-amber-600 text-white shrink-0 shadow-sm">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4 className="text-base font-black text-amber-900 tracking-tight">
                      UNVERIFIED — RECORD AGAIN
                    </h4>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-300">
                        Low Confidence ({Math.round(verificationResult.confidence * 100)}%)
                      </span>
                      {verificationResult.model_used && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-700/10 text-amber-900 text-[10px] font-bold border border-amber-300">
                          {verificationResult.model_used}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-amber-800 font-medium mt-0.5">
                    {verificationResult.message}
                  </p>
                </div>
              </div>
            )}

            {/* Video Playback of the actual recorded clip */}
            {recordedVideoUrl && (
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-300 shadow-md">
                <video
                  ref={playbackRef}
                  src={recordedVideoUrl}
                  controls
                  playsInline
                  onTimeUpdate={(e) => setPlaybackCurrentSeconds((e.target as HTMLVideoElement).currentTime)}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Pill & Dosage Visual Recognition Card */}
            {verificationResult.medicine_details && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Scan className="w-4 h-4 text-teal-600" />
                    <span>Pill Image &amp; Visual Feature Recognition</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Pill in Hand Confirmed</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Prescription Target</span>
                    <span className="font-bold text-slate-800 truncate block mt-0.5">{verificationResult.medicine_details.detected_name}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Form &amp; Appearance</span>
                    <span className="font-bold text-slate-800 block mt-0.5">{verificationResult.medicine_details.shape || 'Solid Tablet'} ({verificationResult.medicine_details.color || 'White'})</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Palm Contour Contrast</span>
                    <span className="font-bold text-emerald-700 block mt-0.5">High Pixel Contrast</span>
                  </div>
                </div>
                {verificationResult.medicine_details.notes && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-800">Visual Assessment: </span>
                    {verificationResult.medicine_details.notes}
                  </p>
                )}
              </div>
            )}

            {/* Explanation Summary */}
            <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 text-[11px] space-y-1">
              <span className="font-bold text-teal-950 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-teal-600" />
                <span>Verification Sequence Log:</span>
              </span>
              <p className="text-slate-700 font-mono leading-relaxed pl-4">
                {verificationResult.explanation}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={handleRetakeVideo}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>{verificationResult.status === 'MEDICINE_TAKEN' ? 'Retake Video' : 'Try Again'}</span>
              </button>

              {verificationResult.status === 'MEDICINE_TAKEN' ? (
                <button
                  id="submit-verified-dose-btn"
                  onClick={handleConfirmDose}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-700/20 flex items-center gap-1.5 transition-all hover:scale-102 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm &amp; Record Dose</span>
                </button>
              ) : (
                <button
                  onClick={handleRetakeVideo}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-700/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Record / Upload Another Video</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PHASE 5: SUCCESS CONFIRMATION                            */}
        {/* ======================================================== */}
        {phase === 'success' && (
          <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center ring-8 ring-emerald-100/60 shadow-lg">
              <Check className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-extrabold text-slate-900">
                Dose Verified &amp; Recorded!
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Smart pillbox access &amp; AI video ingestion sequence confirmed. Adherence record updated as ON TIME.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
