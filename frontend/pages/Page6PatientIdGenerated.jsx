import React, { useState } from 'react';
import { 
  CheckCircle, 
  Copy, 
  Printer, 
  UserCheck, 
  ArrowRight, 
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Check
} from 'lucide-react';
import { PrintablePatientCard } from '../components/PrintablePatientCard';

export const Page6PatientIdGenerated = ({
  patient,
  onNavigate,
  onViewProfile,
}) => {
  const [copied, setCopied] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(patient.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-xl w-full mx-auto space-y-6">
        
        {/* Main Success Glass Card */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/80 shadow-2xl text-center space-y-6 relative overflow-hidden">
          
          {/* Top Decorative Sparkle Background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />

          {/* Large Success Icon */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white mx-auto flex items-center justify-center shadow-xl shadow-emerald-600/30 ring-4 ring-emerald-100/60 animate-in zoom-in-75 duration-300">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Patient Registered Successfully
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Hardware pairing verified & adherence schedule active
            </p>
          </div>

          {/* Generated Patient ID Hero Box */}
          <div className="p-5 rounded-2xl bg-teal-50/90 border-2 border-teal-500/50 shadow-inner relative">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-teal-800 block mb-1">
              Generated Unique Patient ID
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-wider text-teal-950">
              {patient.id}
            </div>
            <div className="mt-2 text-xs text-teal-700 font-semibold flex items-center justify-center gap-1.5">
              <span>Default Login PIN:</span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-teal-200">
                {patient.authPin || '1234'}
              </span>
            </div>
          </div>

          {/* Core Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-left text-xs p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Patient Name
              </span>
              <span className="font-bold text-slate-900">{patient.fullName}</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Patient ID
              </span>
              <span className="font-mono font-bold text-teal-700">{patient.id}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Treatment Regimen
              </span>
              <span className="font-bold text-slate-900">{patient.treatment}</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Assigned Device
              </span>
              <span className="font-mono font-bold text-slate-800">{patient.pillboxId}</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Supervising Care Worker
              </span>
              <span className="font-bold text-slate-800">{patient.assignedCareWorker}</span>
            </div>
          </div>

          {/* Important Notice Callout */}
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-left text-xs text-amber-900 flex items-start gap-3">
            <span className="text-base font-bold">⚠️</span>
            <div>
              <strong className="block font-bold mb-0.5">Important Security Notice:</strong>
              “Save this Patient ID. The patient will use this ID to access their DoseSure profile.”
            </div>
          </div>

          {/* Four Action Buttons explicitly required */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Button 1: Copy Patient ID */}
            <button
              id="btn-copy-patient-id"
              onClick={handleCopyId}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">ID Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy Patient ID</span>
                </>
              )}
            </button>

            {/* Button 2: Print Patient Card */}
            <button
              id="btn-print-patient-card"
              onClick={() => setShowPrintModal(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4 text-teal-600" />
              <span>Print Patient Card</span>
            </button>

            {/* Button 3: View Patient Profile */}
            <button
              id="btn-view-registered-profile"
              onClick={() => onViewProfile(patient)}
              className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2 sm:col-span-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>View Patient Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Button 4: Back to Dashboard */}
            <button
              onClick={() => onNavigate('page3_cw_dashboard')}
              className="w-full py-2 px-4 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors sm:col-span-2 flex items-center justify-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Card Modal Component */}
      <PrintablePatientCard
        patient={patient}
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
      />
    </div>
  );
};
