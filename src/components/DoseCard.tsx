import React from 'react';
import { TimingStatus, VerificationEvidence, DoseSlot } from '../types';
import { StatusBadge } from './StatusBadge';
import { VerificationBadge } from './VerificationBadge';
import { Sun, Sunset, Moon, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface DoseCardProps {
  slot: DoseSlot;
  scheduledTime: string;
  takenTime?: string;
  timingStatus: TimingStatus;
  verificationEvidence: VerificationEvidence;
  isPatientView?: boolean;
  onTakeDose?: () => void;
}

export const DoseCard: React.FC<DoseCardProps> = ({
  slot,
  scheduledTime,
  takenTime,
  timingStatus,
  verificationEvidence,
  isPatientView = false,
  onTakeDose,
}) => {
  const getSlotIcon = () => {
    switch (slot) {
      case 'Morning':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'Afternoon':
        return <Sun className="w-5 h-5 text-orange-500" />;
      case 'Evening':
      case 'Night':
      default:
        return <Sunset className="w-5 h-5 text-indigo-500" />;
    }
  };

  const isCompleted = timingStatus === 'ON_TIME' || timingStatus === 'LATE';

  return (
    <div className={`glass-panel rounded-2xl p-4 sm:p-5 border transition-all ${
      timingStatus === 'ON_TIME'
        ? 'border-emerald-200 bg-emerald-50/30'
        : timingStatus === 'LATE'
        ? 'border-amber-200 bg-amber-50/30'
        : timingStatus === 'MISSED'
        ? 'border-rose-200 bg-rose-50/30'
        : 'border-slate-200/80 bg-white/80'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-white shadow-xs border border-slate-200/80">
            {getSlotIcon()}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">{slot} Dose</h4>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Scheduled: {scheduledTime}
            </span>
          </div>
        </div>

        <StatusBadge status={timingStatus} size="sm" />
      </div>

      <div className="py-2 border-y border-slate-200/60 my-2 flex items-center justify-between text-xs">
        <span className="text-slate-500">
          {isCompleted ? 'Event Recorded at:' : 'Current Status:'}
        </span>
        <span className="font-bold text-slate-800">
          {takenTime ? `✓ Taken at ${takenTime}` : timingStatus === 'PENDING' ? 'Upcoming / Scheduled' : 'No Access Detected'}
        </span>
      </div>

      {/* Verification Evidence */}
      <div className="flex items-center justify-between mt-2 pt-1 text-xs">
        <span className="text-slate-500 text-[11px] font-medium">
          {isPatientView ? 'Verification:' : 'Telemetry Evidence:'}
        </span>
        <VerificationBadge evidence={verificationEvidence} isPatientView={isPatientView} size="sm" />
      </div>

      {/* Action for Patient if pending */}
      {isPatientView && timingStatus === 'PENDING' && onTakeDose && (
        <button
          onClick={onTakeDose}
          className="w-full mt-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all hover:scale-[1.01] flex items-center justify-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>I am taking this dose now</span>
        </button>
      )}
    </div>
  );
};
