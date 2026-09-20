import React from 'react';
import { Patient } from '../types';
import { Pill, ShieldCheck, QrCode, Printer, X } from 'lucide-react';

interface PrintablePatientCardProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintablePatientCard: React.FC<PrintablePatientCardProps> = ({
  patient,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="glass-panel max-w-lg w-full p-6 sm:p-8 rounded-3xl shadow-2xl border border-white relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 bg-white/60 hover:bg-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Printable Card Area */}
        <div 
          id="printable-patient-card" 
          className="bg-white rounded-2xl p-6 border-2 border-teal-600 shadow-md text-slate-900 my-2"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4 mb-4 border-teal-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                <Pill className="w-5 h-5 -rotate-45" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-teal-900">
                  Dose<span className="text-teal-600">Sure</span>
                </h3>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Verified Medication Adherence Card
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">NTEP Protocol</span>
              <span className="text-xs font-mono font-bold text-teal-800">TB CARE</span>
            </div>
          </div>

          {/* Core ID Highlight */}
          <div className="bg-teal-50/80 rounded-xl p-4 border border-teal-200 text-center mb-4">
            <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block mb-1">
              Patient Identification Number
            </span>
            <div className="text-3xl font-black font-mono tracking-wider text-teal-900">
              {patient.id}
            </div>
            <span className="text-[10px] text-teal-600 mt-1 block">
              Default Access PIN: <strong className="font-mono">{patient.authPin || '1234'}</strong>
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs mb-4">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Patient Name</span>
              <span className="font-bold text-slate-900">{patient.fullName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Treatment Regimen</span>
              <span className="font-bold text-slate-900 truncate block">{patient.treatment}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Assigned Pillbox</span>
              <span className="font-mono font-bold text-teal-800">{patient.pillboxId}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Assigned Care Officer</span>
              <span className="font-bold text-slate-900">{patient.assignedCareWorker}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Prescribed Times</span>
              <span className="font-bold text-slate-800">{patient.prescribedTimes.join(' & ')}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Caregiver Contact</span>
              <span className="font-bold text-slate-800">{patient.caregiverName} ({patient.whatsAppNumber})</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span>Keep this card safely with your smart pillbox.</span>
            <span className="font-bold text-teal-700">Right Dose. Right Time. Verified.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-white/80"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-700/20 transition-all hover:scale-102"
          >
            <Printer className="w-4 h-4" />
            <span>Print Patient Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
