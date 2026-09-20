import React from 'react';
import { Patient } from '../types';
import { 
  ArrowLeft, 
  MessageCircle, 
  Phone, 
  Edit3, 
  History, 
  Calendar, 
  ShieldCheck, 
  Pill,
  Sparkles
} from 'lucide-react';
import { generateWhatsAppMessage } from '../utils/helpers';

interface PatientProfileHeaderProps {
  patient: Patient;
  onBack: () => void;
  onContactCaregiver: () => void;
  onEditPatient: () => void;
  onViewHistory: () => void;
}

export const PatientProfileHeader: React.FC<PatientProfileHeaderProps> = ({
  patient,
  onBack,
  onContactCaregiver,
  onEditPatient,
  onViewHistory,
}) => {
  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/80 shadow-xl mb-6">
      {/* Top back link & breadcrumb */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/70">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patients Registry</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500">Treatment Status:</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
            patient.status === 'On Track'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : patient.status === 'Late'
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : patient.status === 'Missed Dose'
              ? 'bg-rose-50 text-rose-800 border-rose-300'
              : 'bg-purple-50 text-purple-800 border-purple-300'
          }`}>
            {patient.status}
          </span>
        </div>
      </div>

      {/* Main Patient Identity and Action Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left identity info */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-teal-700/20">
            {patient.fullName.charAt(0)}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {patient.fullName}
              </h1>
              <span className="px-3 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-mono font-bold text-sm">
                {patient.id}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2">
              <span className="font-semibold text-slate-800">{patient.age} years</span>
              <span>•</span>
              <span>{patient.gender}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-teal-800 font-medium">
                <Pill className="w-3.5 h-3.5" /> {patient.treatment}
              </span>
            </div>
          </div>
        </div>

        {/* Right side quick action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onContactCaregiver}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-all shadow-xs"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Contact Caregiver</span>
          </button>

          <button
            onClick={onEditPatient}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white/90 hover:bg-white border border-slate-200 transition-all shadow-xs"
          >
            <Edit3 className="w-4 h-4 text-slate-500" />
            <span>Edit Patient</span>
          </button>

          <button
            onClick={onViewHistory}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-all shadow-xs"
          >
            <History className="w-4 h-4 text-teal-600" />
            <span>View Full History</span>
          </button>
        </div>
      </div>
    </div>
  );
};
