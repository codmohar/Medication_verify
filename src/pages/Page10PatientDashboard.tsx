import React, { useState } from 'react';
import { 
  Patient, 
  ActivePage, 
  DoseSlot,
  VerificationResult
} from '../types';
import { DoseCard } from '../components/DoseCard';
import { MedicationIntakeModal } from '../components/MedicationIntakeModal';
import { 
  Pill, 
  CheckCircle2, 
  Calendar, 
  Flame, 
  Award, 
  ShieldCheck, 
  Sparkles, 
  Battery, 
  Wifi, 
  User, 
  History, 
  LogOut,
  Camera,
  Video
} from 'lucide-react';

interface Page10PatientDashboardProps {
  patient: Patient;
  onNavigate: (page: ActivePage) => void;
  onTakeDoseAction: (patientId: string, slot: string, verificationResult?: VerificationResult) => void;
  onLogout: () => void;
}

export const Page10PatientDashboard: React.FC<Page10PatientDashboardProps> = ({
  patient,
  onNavigate,
  onTakeDoseAction,
  onLogout,
}) => {
  const [selectedSlotForIntake, setSelectedSlotForIntake] = useState<DoseSlot | null>(null);

  const handleOpenDoseIntake = (slot: DoseSlot) => {
    setSelectedSlotForIntake(slot);
  };

  const handleCloseDoseIntake = () => {
    setSelectedSlotForIntake(null);
  };

  const handleCompleteDose = (slot: DoseSlot, videoBlob?: Blob, verificationResult?: VerificationResult) => {
    onTakeDoseAction(patient.id, slot, verificationResult);
    setSelectedSlotForIntake(null);
  };

  // Find first pending dose or default to Evening
  const pendingDose = patient.todayDoses.find((d) => d.timingStatus === 'PENDING');
  const fallbackSlot: DoseSlot = pendingDose ? pendingDose.slot : 'Evening';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Top Patient Welcome Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-200/70">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                Patient Health Hub
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-semibold">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Welcome, {patient.fullName}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2">
              <span className="font-semibold text-slate-800">
                Patient ID: <strong className="font-mono text-teal-800">{patient.id}</strong>
              </span>
              <span>•</span>
              <span>Treatment: <strong className="text-teal-900">{patient.treatment}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('page11_patient_history')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-all shadow-xs"
            >
              <History className="w-4 h-4 text-teal-600" />
              <span>Full Dose History</span>
            </button>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200 transition-all"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
              <span>Log out</span>
            </button>
          </div>
        </div>

        {/* Adherence Score & Streak Encouraging Message */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-md shadow-teal-700/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
                Adherence Score
              </span>
              <span className="text-2xl font-black text-teal-950 font-mono">
                {patient.adherencePercentage}%
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-600/20">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                Current Streak
              </span>
              <span className="text-2xl font-black text-amber-950 font-mono">
                {patient.currentStreakDays} Days
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center sm:col-span-1 col-span-1">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Milestone
              </span>
              <p className="text-xs font-semibold text-emerald-900 leading-snug">
                “Great job! You have taken your last {patient.currentStreakDays} doses on time.”
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Doses Section: Morning & Evening */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" /> Today's Medication Schedule
            </h2>
            <p className="text-xs text-slate-500">
              Take each dose using your smart pillbox so the sequence is automatically verified
            </p>
          </div>
          <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            {patient.todayDoses.filter(d => d.timingStatus === 'ON_TIME' || d.timingStatus === 'LATE').length} of {patient.todayDoses.length} Completed
          </span>
        </div>

        {/* Dose Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patient.todayDoses.map((dose, idx) => (
            <DoseCard
              key={idx}
              slot={dose.slot}
              scheduledTime={dose.scheduledTime}
              takenTime={dose.takenTime}
              timingStatus={dose.timingStatus}
              verificationEvidence={dose.verificationEvidence}
              isPatientView={true}
              onTakeDose={() => handleOpenDoseIntake(dose.slot)}
            />
          ))}
        </div>

        {/* Quick Launch Button for Verification flow */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-teal-50/60 border border-teal-200">
          <div className="flex items-center gap-2.5 text-xs text-teal-950">
            <div className="p-2 rounded-xl bg-teal-600 text-white">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">
                Pillbox Sensor + 20-Second Video Verification
              </p>
              <p className="text-[11px] text-slate-600">
                Opens the hardware verification telemetry and live 20s ingestion video camera frame
              </p>
            </div>
          </div>

          <button
            id="launch-video-verification-btn"
            onClick={() => handleOpenDoseIntake(fallbackSlot)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Open Dose Verification ({fallbackSlot})</span>
          </button>
        </div>
      </div>

      {/* Pillbox Status, Caregiver & Care Worker Assigned Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Pillbox Status */}
        <div className="glass-panel p-5 rounded-2xl border border-white/80 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pillbox Status
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-600 flex items-center gap-1 font-mono">
              <Wifi className="w-3.5 h-3.5 text-teal-600" /> {patient.pillboxId}
            </span>
            <span className="text-slate-800 font-bold flex items-center gap-1 font-mono">
              <Battery className="w-3.5 h-3.5 text-emerald-600" /> {patient.deviceStatusDetails.batteryPercentage}%
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            Firmware: {patient.deviceStatusDetails.firmwareVersion}
          </div>
        </div>

        {/* Caregiver Notified */}
        <div className="glass-panel p-5 rounded-2xl border border-white/80 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Caregiver Notified
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Yes (Active)
            </span>
          </div>
          <div className="text-xs font-bold text-slate-900 pt-1">
            {patient.caregiverName}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {patient.whatsAppNumber} ({patient.caregiverRelationship})
          </div>
        </div>

        {/* Care Worker Assigned */}
        <div className="glass-panel p-5 rounded-2xl border border-white/80 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Supervising Care Worker
            </span>
            <User className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xs font-bold text-slate-900 pt-1">
            {patient.assignedCareWorker}
          </div>
          <div className="text-[10px] text-slate-500">
            {patient.treatmentCentre}
          </div>
        </div>
      </div>

      {/* Medication Intake Modal (Pillbox Sensor + 20s Video Interface) */}
      {selectedSlotForIntake && (
        <MedicationIntakeModal
          isOpen={Boolean(selectedSlotForIntake)}
          slot={selectedSlotForIntake}
          patient={patient}
          onClose={handleCloseDoseIntake}
          onCompleteDose={handleCompleteDose}
        />
      )}
    </div>
  );
};
