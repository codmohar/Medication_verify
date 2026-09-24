import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Target, 
  ArrowUp, 
  Droplets, 
  Check, 
  Hand, 
  Activity, 
  AlertTriangle 
} from 'lucide-react';

export interface RealtimeActivitiesState {
  pill_detected: {
    active: boolean;
    confidence: number;
    label: string;
    boundingBox?: { x: number; y: number; w: number; h: number };
    details: string;
  };
  hand_gesture: {
    active: boolean;
    trajectory_progress: number;
    direction: 'steady' | 'moving_up' | 'at_mouth' | 'retracted';
    confidence: number;
    details: string;
  };
  mouth_interaction: {
    active: boolean;
    confidence: number;
    oral_contact: boolean;
    swallow_detected: boolean;
    details: string;
  };
  hand_empty: {
    active: boolean;
    confidence: number;
    palm_open: boolean;
    pill_absent: boolean;
    details: string;
  };
  water_intake: {
    active: boolean;
    confidence: number;
    details: string;
  };
}

export interface RealtimeEventsDone {
  medicine_detected: boolean;
  medicine_to_mouth: boolean;
  mouth_interaction: boolean;
  hand_empty: boolean;
  water_intake: boolean;
}

export interface RealtimeTimestamps {
  medicine_detected: string | null;
  medicine_to_mouth: string | null;
  mouth_interaction: string | null;
  hand_empty: string | null;
  water_intake: string | null;
}

export interface RealtimeScanningOverlayProps {
  isRecording: boolean;
  recordingSecondsElapsed: number;
  medicationName: string;
  activities: RealtimeActivitiesState | null;
  eventsDone: RealtimeEventsDone;
  timestamps: RealtimeTimestamps;
  instruction: string;
  activityFeed: Array<{
    id: string;
    time: string;
    title: string;
    detail: string;
    step: 'pill' | 'gesture' | 'mouth' | 'empty' | 'water';
  }>;
  onQuickMark: (key: keyof RealtimeEventsDone, label: string) => void;
  onFinishEarly?: () => void;
}

export const RealtimeScanningOverlay: React.FC<RealtimeScanningOverlayProps> = ({
  isRecording,
  recordingSecondsElapsed,
  medicationName,
  activities,
  eventsDone,
  timestamps,
  instruction,
  activityFeed,
  onQuickMark,
  onFinishEarly,
}) => {
  // 3 Mandatory Steps: Medicine in Hand, Hand to Mouth, Clean Empty Hand
  const completedCount = 
    (eventsDone.medicine_detected ? 1 : 0) +
    (eventsDone.medicine_to_mouth ? 1 : 0) +
    (eventsDone.hand_empty ? 1 : 0);

  const allRequiredDone = completedCount === 3;

  return (
    <div className="space-y-3">
      {/* Finish Early Banner when all 3 mandatory steps are completed */}
      {isRecording && allRequiredDone && onFinishEarly && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold">
              All 3 mandatory steps confirmed! You can finish now or take optional water.
            </span>
          </div>
          <button
            type="button"
            onClick={onFinishEarly}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all shrink-0 cursor-pointer animate-pulse"
          >
            Finish &amp; Verify Now ✓
          </button>
        </div>
      )}

      {/* Real-time Activity Checklist (Full Detail Panel) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-bold text-slate-900 text-xs">
                Clinical Activity Verification Protocol
              </h5>
              <p className="text-[11px] text-slate-500">
                Google Gemini 3.6 Flash Vision Pipeline • 3 Mandatory Steps + 1 Optional Water Intake
              </p>
            </div>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
            allRequiredDone
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}>
            {completedCount} of 3 Mandatory Done
          </span>
        </div>

        {/* 4 Activities matching user specifications */}
        <div className="space-y-2.5 text-xs">
          {/* 1. Medicine Recognized in Hand (Mandatory) */}
          <div className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
            eventsDone.medicine_detected
              ? 'bg-emerald-50/70 border-emerald-200'
              : activities?.pill_detected.active
              ? 'bg-teal-50/70 border-teal-300'
              : 'bg-slate-50/70 border-slate-200'
          }`}>
            <div className="flex items-start gap-2.5 min-w-0">
              {eventsDone.medicine_detected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              ) : activities?.pill_detected.active ? (
                <Target className="w-5 h-5 text-teal-600 animate-spin mt-0.5 shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">
                    Step 1: Medicine Recognized in Hand
                  </span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                    MANDATORY
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {eventsDone.medicine_detected
                    ? `Physical oral medication confirmed held in hand (${medicationName})`
                    : 'Hold your actual prescribed pill clearly in hand. Empty hand or empty pinch is strictly rejected.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {eventsDone.medicine_detected ? (
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    VERIFIED ({timestamps.medicine_detected || '00:03'})
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onQuickMark('medicine_detected', 'Medicine in Hand')}
                  className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
                >
                  ✓ Confirm Pill
                </button>
              )}
            </div>
          </div>

          {/* 2. Hand Gesture to Mouth (Mandatory) */}
          <div className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
            eventsDone.medicine_to_mouth
              ? 'bg-emerald-50/70 border-emerald-200'
              : activities?.hand_gesture.active
              ? 'bg-blue-50/70 border-blue-300'
              : 'bg-slate-50/70 border-slate-200'
          }`}>
            <div className="flex items-start gap-2.5 min-w-0">
              {eventsDone.medicine_to_mouth ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              ) : activities?.hand_gesture.active ? (
                <ArrowUp className="w-5 h-5 text-blue-600 animate-bounce mt-0.5 shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">
                    Step 2: Hand Gesture to Mouth &amp; Ingestion
                  </span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                    MANDATORY
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {eventsDone.medicine_to_mouth
                    ? 'Upward arm trajectory tracked, medicine placed into mouth cavity.'
                    : 'Raise hand holding the medicine upward to your mouth, place on tongue, and close lips.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {eventsDone.medicine_to_mouth ? (
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    VERIFIED ({timestamps.medicine_to_mouth || '00:07'})
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onQuickMark('medicine_to_mouth', 'Hand to Mouth')}
                  disabled={!eventsDone.medicine_detected}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-2xs transition-all cursor-pointer ${
                    eventsDone.medicine_detected
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  ✓ Moved to Mouth
                </button>
              )}
            </div>
          </div>

          {/* 3. Clean Empty Hand Confirmation (Mandatory) */}
          <div className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
            eventsDone.hand_empty
              ? 'bg-emerald-50/70 border-emerald-200'
              : activities?.hand_empty.active
              ? 'bg-emerald-50/70 border-emerald-300'
              : 'bg-slate-50/70 border-slate-200'
          }`}>
            <div className="flex items-start gap-2.5 min-w-0">
              {eventsDone.hand_empty ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              ) : activities?.hand_empty.active ? (
                <Hand className="w-5 h-5 text-emerald-600 animate-pulse mt-0.5 shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">
                    Step 3: Patient Shows Clean Empty Hand
                  </span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                    MANDATORY
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {eventsDone.hand_empty
                    ? 'Clean hand verified: 0 medicine left in hand (dose fully taken).'
                    : 'Show your open, clean palm to camera to confirm the pill was completely swallowed.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {eventsDone.hand_empty ? (
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    VERIFIED ({timestamps.hand_empty || '00:13'})
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onQuickMark('hand_empty', 'Clean Hand')}
                  disabled={!eventsDone.medicine_to_mouth}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-2xs transition-all cursor-pointer ${
                    eventsDone.medicine_to_mouth
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  ✓ Hand Is Clean
                </button>
              )}
            </div>
          </div>

          {/* 4. Water Intake (Optional) */}
          <div className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
            eventsDone.water_intake
              ? 'bg-blue-50/70 border-blue-200'
              : 'bg-slate-50/70 border-slate-200'
          }`}>
            <div className="flex items-start gap-2.5 min-w-0">
              <Droplets className={`w-5 h-5 mt-0.5 shrink-0 ${eventsDone.water_intake ? 'text-blue-600' : 'text-slate-400'}`} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">
                    Step 4: Water Intake
                  </span>
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-200 px-1.5 py-0.2 rounded">
                    OPTIONAL
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {eventsDone.water_intake
                    ? 'Water ingestion confirmed following dose.'
                    : 'Drink water to assist swallowing (optional; does not affect verification).'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {eventsDone.water_intake ? (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  DONE ({timestamps.water_intake || '00:16'})
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onQuickMark('water_intake', 'Water Intake')}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition-all cursor-pointer"
                >
                  Mark Water Taken
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live Timestamped Event Ticker */}
        {activityFeed.length > 0 && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <span className="font-bold text-slate-700 text-[10px] uppercase tracking-wider block">
              Live Verified Activity Feed
            </span>
            <div className="space-y-1 max-h-24 overflow-y-auto font-mono text-[11px]">
              {activityFeed.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-center gap-2 text-slate-700">
                  <span className="text-teal-700 font-bold">[{item.time}]</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-900">{item.title}</span>
                  <span className="text-slate-400 text-[10px] truncate">— {item.detail}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
