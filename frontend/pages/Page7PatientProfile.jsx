import React, { useState } from 'react';
import { PatientProfileHeader } from '../components/PatientProfileHeader';
import { StatusBadge } from '../components/StatusBadge';
import { VerificationBadge } from '../components/VerificationBadge';
import { DeviceStatusCard } from '../components/DeviceStatusCard';
import { DoseCard } from '../components/DoseCard';
import { 
  User, 
  Calendar, 
  Pill, 
  Heart, 
  Cpu, 
  ShieldAlert, 
  Info, 
  Phone, 
  MessageSquare, 
  History,
  Send,
  X
} from 'lucide-react';
import { generateWhatsAppMessage } from '../utils/helpers';

export const Page7PatientProfile = ({
  patient,
  onBack,
  onNavigate,
}) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [sentNotice, setSentNotice] = useState(false);

  // Compute treatment duration in days or months
  const startDate = new Date(patient.treatmentStartDate);
  const endDate = new Date(patient.expectedTreatmentEndDate);
  const totalMonths = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));

  const handleSendWhatsApp = () => {
    const text = generateWhatsAppMessage(
      patient.fullName,
      patient.id,
      customNote || 'Medication Adherence Check-in',
      'Today'
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setSentNotice(true);
    setTimeout(() => {
      setSentNotice(false);
      setShowContactModal(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header with Name, ID, Treatment Status & Action Buttons */}
      <PatientProfileHeader
        patient={patient}
        onBack={onBack}
        onContactCaregiver={() => setShowContactModal(true)}
        onEditPatient={() => alert(`Editing profile for ${patient.fullName} (ID: ${patient.id}). All clinical fields are unlocked for modifications.`)}
        onViewHistory={() => {
          const tableElement = document.getElementById('section-dose-history');
          tableElement?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Top Cards Grid: Patient Information & Today's Medication */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Patient Information */}
        <div className="glass-panel p-6 rounded-3xl border border-white/80 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" /> Patient Information
            </h3>
            <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              {patient.id}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Name</span>
              <span className="font-bold text-slate-900 text-sm">{patient.fullName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Age & Gender</span>
              <span className="font-bold text-slate-800">{patient.age} yrs • {patient.gender}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Treatment Regimen</span>
              <span className="font-bold text-slate-900">{patient.treatment}</span>
              <span className="text-[11px] text-slate-500 block truncate">{patient.medicationName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Treatment Start Date</span>
              <span className="font-bold text-slate-800">{patient.treatmentStartDate}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Treatment Duration</span>
              <span className="font-bold text-slate-800">{totalMonths} Months (Until {patient.expectedTreatmentEndDate})</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Caregiver</span>
              <span className="font-bold text-slate-800">{patient.caregiverName} ({patient.caregiverRelationship})</span>
              <span className="text-[10px] font-mono text-teal-700 block">{patient.whatsAppNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Assigned Device</span>
              <span className="font-mono font-bold text-teal-800">{patient.pillboxId}</span>
              <span className="text-[10px] text-slate-500 block">{patient.compartments} Compartments ({patient.esp32Status})</span>
            </div>
          </div>
        </div>

        {/* Card 2: Today's Medication Schedule */}
        <div className="glass-panel p-6 rounded-3xl border border-white/80 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/70">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" /> Today's Medication
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {patient.prescribedTimes.length} Doses Prescribed Today
              </span>
            </div>

            <div className="space-y-3">
              {patient.todayDoses.map((dose, idx) => (
                <DoseCard
                  key={idx}
                  slot={dose.slot}
                  scheduledTime={dose.scheduledTime}
                  takenTime={dose.takenTime}
                  timingStatus={dose.timingStatus}
                  verificationEvidence={dose.verificationEvidence}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
            <span>Overall Adherence Score:</span>
            <span className="font-extrabold text-teal-800 font-mono text-sm bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              {patient.adherencePercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Verification Evidence Card (Explicitly Separated with Medical Disclaimer) */}
      <div className="glass-panel p-6 rounded-3xl border border-white/80 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Verification Evidence & Protocol Classification
              </h3>
              <p className="text-xs text-slate-500">
                Independent from dose timing status (e.g. pillbox access vs computer-vision analysis)
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            NTEP Verified Standard
          </span>
        </div>

        {/* 4 Discrete Evidence State Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          <div className="p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200">
            <div className="flex items-center justify-between mb-1">
              <span className="font-black text-teal-900 text-[11px] uppercase tracking-wider">
                INGESTION-CONSISTENT
              </span>
              <span className="w-2 h-2 rounded-full bg-teal-600" />
            </div>
            <p className="text-[11px] text-teal-800">
              Computer-vision detected hand-to-mouth motion and facial sequence during valid open compartment.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200">
            <div className="flex items-center justify-between mb-1">
              <span className="font-black text-blue-900 text-[11px] uppercase tracking-wider">
                ACCESS VERIFIED
              </span>
              <span className="w-2 h-2 rounded-full bg-blue-600" />
            </div>
            <p className="text-[11px] text-blue-800">
              Smart pillbox lid switch & reed sensor confirmed compartment access. Optical sequence not confirmed.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200">
            <div className="flex items-center justify-between mb-1">
              <span className="font-black text-amber-900 text-[11px] uppercase tracking-wider">
                RETRY REQUIRED
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-600" />
            </div>
            <p className="text-[11px] text-amber-800">
              Movement obscured by camera angle or lighting; telemetry received but video inconclusive.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-300">
            <div className="flex items-center justify-between mb-1">
              <span className="font-black text-slate-800 text-[11px] uppercase tracking-wider">
                UNVERIFIED
              </span>
              <span className="w-2 h-2 rounded-full bg-slate-500" />
            </div>
            <p className="text-[11px] text-slate-600">
              No telemetry, heartbeat, or visual access sequence registered for the scheduled interval.
            </p>
          </div>
        </div>

        {/* Mandatory Medical Disclaimer mandated by prompt */}
        <div className="p-3.5 rounded-2xl bg-slate-100/90 border border-slate-300 text-xs text-slate-700 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-teal-700 mt-0.5 shrink-0" />
          <div>
            <strong className="text-slate-900 block font-bold">
              Clinical Advisory & Computer-Vision Limitation:
            </strong>
            “Never describe computer-vision verification as guaranteed proof of swallowing. Verification indicates an ingestion-consistent sequence detected by onboard algorithms alongside verified physical smart pillbox access.”
          </div>
        </div>
      </div>

      {/* Device Status Card with Dynamic ESP32 Firmware */}
      <DeviceStatusCard 
        device={patient.deviceStatusDetails} 
        verificationMethod={patient.verificationMethod}
        patient={patient}
      />

      {/* Dose History Table */}
      <div id="section-dose-history" className="glass-panel p-6 rounded-3xl border border-white/80 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Historical Dose Telemetry Log</h3>
              <p className="text-xs text-slate-500">
                Detailed audit trail of pillbox sensor signals and computer-vision verification
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-600">
            {patient.history.length} Events Recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-600 font-bold uppercase text-[10px]">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Scheduled Time</th>
                <th className="py-3 px-3">Event Time</th>
                <th className="py-3 px-3">Dose Slot</th>
                <th className="py-3 px-3">Timing Status</th>
                <th className="py-3 px-3">Verification Evidence</th>
                <th className="py-3 px-3">Device ID</th>
                <th className="py-3 px-3 text-center">Alert Sent</th>
                <th className="py-3 px-3">Clinical Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {patient.history.map((record) => (
                <tr key={record.id} className="hover:bg-teal-50/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                    {record.date}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700 whitespace-nowrap">
                    {record.scheduledTime}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                    {record.eventTime}
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium whitespace-nowrap">
                    {record.doseSlot}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <StatusBadge status={record.timingStatus} size="sm" />
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <VerificationBadge evidence={record.verificationEvidence} size="sm" />
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                    {record.deviceId}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {record.alertSent ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                        Yes
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        No
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-500 max-w-xs text-[11px] truncate" title={record.notes}>
                    {record.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact Caregiver Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl shadow-2xl border border-white space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Contact Caregiver via WhatsApp</h3>
              </div>
              <button 
                onClick={() => setShowContactModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-2">
              <div>
                <span className="text-slate-500">Caregiver Name:</span>
                <strong className="text-slate-800 ml-1">{patient.caregiverName} ({patient.caregiverRelationship})</strong>
              </div>
              <div>
                <span className="text-slate-500">WhatsApp Number:</span>
                <strong className="font-mono text-emerald-700 ml-1">{patient.whatsAppNumber}</strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Custom Message / Actionable Guidance:
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Friendly reminder: Ramesh's evening TB dose is due at 08:00 PM. Please verify pillbox intake."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl glass-input focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowContactModal(false)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSendWhatsApp}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sentNotice ? 'Sent Successfully!' : 'Launch WhatsApp Message'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
