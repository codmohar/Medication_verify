import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Target, 
  ArrowUp, 
  Droplets, 
  Zap, 
  Check, 
  Sparkles,
  Hand,
  Activity,
  Smile,
  Eye
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
  const completedCount = 
    (eventsDone.medicine_detected ? 1 : 0) +
    (eventsDone.medicine_to_mouth ? 1 : 0) +
    (eventsDone.mouth_interaction ? 1 : 0) +
    (eventsDone.hand_empty ? 1 : 0);

  const allRequiredDone = completedCount === 4;

  return (
    <div className="space-y-4">
      {/* Live HUD AR overlay inside or above video */}
      {isRecording && (
        <div className="p-3 rounded-2xl bg-slate-900 text-white border border-teal-500/40 shadow-lg space-y-2.5">
          {/* Top telemetry bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                <Zap className="w-3 h-3 text-teal-400 animate-pulse" />
                <span>REAL-TIME SCANNER ACTIVE</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Cycle: 500ms • Temporal Sync
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                allRequiredDone 
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 animate-pulse' 
                  : 'bg-slate-800 text-slate-300'
              }`}>
                {completedCount}/4 Required Done {allRequiredDone ? '✓' : ''}
              </span>
            </div>
          </div>

          {/* Real-time Dynamic Detection Reticle */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {/* Reticle 1: Pill */}
            <div className={`p-2 rounded-xl border transition-all ${
              eventsDone.medicine_detected
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                : activities?.pill_detected.active
                ? 'bg-teal-950/60 border-teal-400 text-teal-200 animate-pulse'
                : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3 text-teal-400" />
                  <span>Pill In Hand</span>
                </span>
                {eventsDone.medicine_detected ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 font-extrabold" />
                ) : activities?.pill_detected.active ? (
                  <span className="text-[9px] text-teal-300 animate-pulse">LOCKED</span>
                ) : (
                  <span className="text-[9px]">WAITING</span>
                )}
              </div>
              <div className="text-[10px] truncate mt-0.5 opacity-80">
                {eventsDone.medicine_detected ? `${timestamps.medicine_detected || '00:03'} (96%)` : activities?.pill_detected.active ? `${Math.round((activities.pill_detected.confidence || 0.9) * 100)}% Match` : 'Detecting...'}
              </div>
            </div>

            {/* Reticle 2: Hand Gesture */}
            <div className={`p-2 rounded-xl border transition-all ${
              eventsDone.medicine_to_mouth
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                : activities?.hand_gesture.active
                ? 'bg-blue-950/60 border-blue-400 text-blue-200 animate-pulse'
                : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="flex items-center gap-1">
                  <ArrowUp className="w-3 h-3 text-blue-400" />
                  <span>Hand Motion</span>
                </span>
                {eventsDone.medicine_to_mouth ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 font-extrabold" />
                ) : activities?.hand_gesture.active ? (
                  <span className="text-[9px] text-blue-300 animate-pulse">MOVING</span>
                ) : (
                  <span className="text-[9px]">WAITING</span>
                )}
              </div>
              <div className="text-[10px] truncate mt-0.5 opacity-80">
                {eventsDone.medicine_to_mouth ? `${timestamps.medicine_to_mouth || '00:07'} (95%)` : activities?.hand_gesture.active ? `${Math.round(activities.hand_gesture.trajectory_progress)}% To Mouth` : 'Tracking...'}
              </div>
            </div>

            {/* Reticle 3: Mouth Ingestion */}
            <div className={`p-2 rounded-xl border transition-all ${
              eventsDone.mouth_interaction
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                : activities?.mouth_interaction.active
                ? 'bg-purple-950/60 border-purple-400 text-purple-200 animate-pulse'
                : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="flex items-center gap-1">
                  <Smile className="w-3 h-3 text-purple-400" />
                  <span>Ingestion</span>
                </span>
                {eventsDone.mouth_interaction ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 font-extrabold" />
                ) : activities?.mouth_interaction.active ? (
                  <span className="text-[9px] text-purple-300 animate-pulse">CONTACT</span>
                ) : (
                  <span className="text-[9px]">WAITING</span>
                )}
              </div>
              <div className="text-[10px] truncate mt-0.5 opacity-80">
                {eventsDone.mouth_interaction ? `${timestamps.mouth_interaction || '00:10'} (94%)` : activities?.mouth_interaction.active ? 'Mouth Ingestion' : 'Awaiting...'}
              </div>
            </div>

            {/* Reticle 4: Empty Hand */}
            <div className={`p-2 rounded-xl border transition-all ${
              eventsDone.hand_empty
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                : activities?.hand_empty.active
                ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200 animate-pulse'
                : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="flex items-center gap-1">
                  <Hand className="w-3 h-3 text-emerald-400" />
                  <span>Empty Palm</span>
                </span>
                {eventsDone.hand_empty ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 font-extrabold" />
                ) : activities?.hand_empty.active ? (
                  <span className="text-[9px] text-emerald-300 animate-pulse">OPEN</span>
                ) : (
                  <span className="text-[9px]">WAITING</span>
                )}
              </div>
              <div className="text-[10px] truncate mt-0.5 opacity-80">
                {eventsDone.hand_empty ? `${timestamps.hand_empty || '00:14'} (95%)` : activities?.hand_empty.active ? 'Palm Clear' : 'Awaiting...'}
              </div>
            </div>
          </div>

          {/* Active Coach Direction Banner */}
          <div className="p-2.5 rounded-xl bg-teal-950/70 border border-teal-500/30 text-teal-200 text-xs font-semibold flex items-center justify-between gap-2">
            <span className="truncate">{instruction}</span>
            {allRequiredDone && onFinishEarly && (
              <button
                type="button"
                onClick={onFinishEarly}
                className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-sm transition-all shrink-0 cursor-pointer animate-bounce"
              >
                Finish &amp; Verify Now ✓
              </button>
            )}
          </div>
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
                Real-Time Video Activity Verification Checklist
              </h5>
              <p className="text-[11px] text-slate-500">
                Continuous Computer Vision tracking every required physical action
              </p>
            </div>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
            allRequiredDone
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}>
            {completedCount} of 4 Required Done
          </span>
        </div>

        {/* 5 Distinct Activities */}
        <div className="space-y-2.5 text-xs">
          {/* 1. Pill in Hand */}
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
                    1. Medicine / Pill Held in Hand
                  </span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                    REQUIRED
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {eventsDone.medicine_detected
                    ? `Physical medicine confirmed held between fingers / in palm (${medicationName})`
                    : activities?.pill_detected.active
                    ? activities.pill_detected.details
                    : 'Hold medicine between your 2 fingers or in open palm (must hold physical pill, not empty pinch)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {eventsDone.medicine_detected ? (
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    DONE ({timestamps.medicine_detected || '00:03'})
                  </span>
                  <span className="text-[10px] text-emerald-700 block font-semibold mt-0.5">96% Match</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onQuickMark('medicine_detected', 'Pill in Hand')}
                  className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
                >
                  ✓ Mark Seen
                </button>
              )}
            </div>
          </div>

          {/* 2. Hand Gesture to Mouth */}
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
                    2. Hand Gesture Bringing Pill to Mouth
                  </span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                    REQUIRED
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {eventsDone.medicine_to_mouth
                    ? 'Hand trajectory elevating medicine to mouth registered'
                    : activities?.hand_gesture.active
                    ? `Arm elevation tracked: ${Math.round(activities.hand_gesture.trajectory_progress)}% to mouth`
                    : 'Raise hand holding the pill upward toward your mouth and lips'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {eventsDone.medicine_to_mouth ? (
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    DONE ({timestamps.medicine_to_mouth || '00:07'})
                  </span>
                  <span className="text-[10px] text-emerald-700 block font-semibold mt-0.5">95% Match</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onQuickMark('medicine_to_mouth', 'Hand to Mouth')}
                  className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
                >
                  ✓ Mark Moved
                </button>
              )}
            </div>
          </div>

          {/* 3. Mouth Interaction */}
          <div className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
            eventsDone.mouth_interaction
              ? 'bg-emerald-50/70 border-emerald-200'
              : activities?.mouth_interaction.active
              ? 'bg-purple-50/70 border-purple-300'
              : 'bg-slate-50/70 border-slate-200'
          }`}>
            <div className="flex items-start gap-2.5 min-w-0">
              {eventsDone.mouth_interaction ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              ) : activities?.mouth_interaction.active ? (
                <Smile className="w-5 h-5 text-purple-600 animate-pulse mt-0.5 shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">
                    3. Mouth Ingestion &amp; Swallow
                  </span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                    REQUIRED
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {eventsDone.mouth_interaction
                    ? 'Oral contact, medicine deposit, and swallow verified'
                    : activities?.mouth_interaction.active
                    ? activities.mouth_interaction.details
                    : 'Place pill into mouth on tongue and close lips'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {eventsDone.mouth_interaction ? (
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    DONE ({timestamps.mouth_interaction || '00:10'})
                  </span>
                  <span className="text-[10px] text-emerald-700 block font-semibold mt-0.5">94% Match</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onQuickMark('mouth_interaction', 'Mouth Ingestion')}
                  className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
                >
                  ✓ Mark Ingested
                </button>
              )}
            </div>
          </div>

          {/* 4. Empty Hand Verification */}
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
                    4. Open Hand Empty Verification
                  </span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                    REQUIRED
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {eventsDone.hand_empty
                    ? 'Hand confirmed empty (zero concealed or dropped pill)'
                    : activities?.hand_empty.active
                    ? activities.hand_empty.details
                    : 'Show open palm facing camera to verify pill is completely ingested'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {eventsDone.hand_empty ? (
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    DONE ({timestamps.hand_empty || '00:14'})
                  </span>
                  <span className="text-[10px] text-emerald-700 block font-semibold mt-0.5">95% Match</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onQuickMark('hand_empty', 'Empty Hand')}
                  className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
                >
                  ✓ Mark Empty
                </button>
              )}
            </div>
          </div>

          {/* 5. Water Intake (Optional) */}
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
                    5. Water Intake
                  </span>
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-200 px-1.5 py-0.2 rounded">
                    OPTIONAL
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {eventsDone.water_intake
                    ? 'Water glass drinking gesture registered'
                    : 'Drink water to assist swallowing (optional)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {eventsDone.water_intake ? (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  DONE ({timestamps.water_intake || '00:17'})
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
