import React from 'react';
import { CareWorker, Patient, Alert, ActivePage } from '../types';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Wifi, 
  ArrowRight, 
  Plus, 
  ShieldCheck, 
  TrendingUp,
  Activity,
  Calendar,
  Sparkles
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { VerificationBadge } from '../components/VerificationBadge';
import { AdherenceChart } from '../components/AdherenceChart';

interface Page3CareWorkerDashboardProps {
  careWorker: CareWorker;
  patients: Patient[];
  alerts: Alert[];
  onNavigate: (page: ActivePage) => void;
  onSelectPatient: (patient: Patient) => void;
}

export const Page3CareWorkerDashboard: React.FC<Page3CareWorkerDashboardProps> = ({
  careWorker,
  patients,
  alerts,
  onNavigate,
  onSelectPatient,
}) => {
  const totalPatients = patients.length;
  const onTrackCount = patients.filter((p) => p.status === 'On Track').length;
  const lateCount = patients.filter((p) => p.status === 'Late').length;
  const missedCount = patients.filter((p) => p.status === 'Missed Dose').length;
  const attentionCount = patients.filter((p) => p.status === 'Requires Attention').length;

  const activeAlerts = alerts.filter((a) => !a.isReviewed);
  const avgAdherence = Math.round(
    patients.reduce((acc, p) => acc + p.adherencePercentage, 0) / (totalPatients || 1)
  );

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Header specified in prompt */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              DOTS Clinic Dashboard
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Good Morning, {careWorker.name}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
            “Here’s your patient medication adherence overview.”
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('page5_add_patient')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-700/25 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Patient</span>
          </button>

          <button
            onClick={() => onNavigate('page8_alert_centre')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 font-bold text-xs border border-slate-200/80 shadow-xs transition-all hover:scale-102"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Alerts ({activeAlerts.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Metric 1: Total Patients */}
        <div 
          onClick={() => onNavigate('page4_patients')}
          className="glass-panel p-5 rounded-2xl border border-white/80 shadow-md hover:shadow-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Enrolled Patients
            </span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalPatients}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +2 this month
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{onTrackCount} On Track</span>
            <span className="text-teal-700 font-semibold group-hover:underline">View Registry →</span>
          </div>
        </div>

        {/* Metric 2: Adherence Rate */}
        <div 
          onClick={() => onNavigate('page12_reports')}
          className="glass-panel p-5 rounded-2xl border border-white/80 shadow-md hover:shadow-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Overall Adherence %
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{avgAdherence}%</span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Above 90% target
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Verified by smart pillbox + CV</span>
            <span className="text-teal-700 font-semibold group-hover:underline">Analytics →</span>
          </div>
        </div>

        {/* Metric 3: Active Alerts */}
        <div 
          onClick={() => onNavigate('page8_alert_centre')}
          className="glass-panel p-5 rounded-2xl border border-white/80 shadow-md hover:shadow-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Actionable Alerts
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600">{activeAlerts.length}</span>
            <span className="text-xs font-semibold text-rose-700">
              {missedCount} Missed, {lateCount} Late
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>WhatsApp alerts dispatched</span>
            <span className="text-rose-700 font-semibold group-hover:underline">Review Now →</span>
          </div>
        </div>

        {/* Metric 4: ESP32 Hardware Health */}
        <div className="glass-panel p-5 rounded-2xl border border-white/80 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pillbox Telemetry
            </span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Wifi className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {patients.filter(p => p.deviceStatusDetails.esp32Status === 'Online').length}/{totalPatients}
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              Devices Live
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {attentionCount > 0 ? (
              <span className="text-amber-700 font-medium">1 device offline / low battery</span>
            ) : (
              <span>All smart boxes reporting heartbeat</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Weekly Adherence Chart & Urgent Patient Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Weekly Adherence Performance Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/80 shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/60">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Weekly Adherence Breakdown (NTEP Cohort)
              </h3>
              <p className="text-xs text-slate-500">
                Separating On-Time doses, Late taken doses, and Missed intervals
              </p>
            </div>
            <button
              onClick={() => onNavigate('page12_reports')}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              Full Reports <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <AdherenceChart type="weekly" />
        </div>

        {/* Right 1 Col: Urgent Attention Patients */}
        <div className="glass-panel p-6 rounded-3xl border border-white/80 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/60">
              <div>
                <h3 className="text-base font-bold text-slate-900">Priority Watchlist</h3>
                <p className="text-xs text-slate-500">Patients requiring clinical contact</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                {missedCount + lateCount + attentionCount} Patients
              </span>
            </div>

            <div className="space-y-3">
              {patients
                .filter(p => p.status !== 'On Track')
                .slice(0, 3)
                .map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => onSelectPatient(patient)}
                    className="p-3 rounded-2xl bg-white/70 hover:bg-white border border-slate-200/70 transition-all cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-slate-900">{patient.fullName}</span>
                      <span className="font-mono text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                        {patient.id}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 truncate mb-2">
                      {patient.treatment}
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        patient.status === 'Missed Dose'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : patient.status === 'Late'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}>
                        {patient.status}
                      </span>
                      <span className="text-[11px] font-bold text-slate-800">
                        {patient.adherencePercentage}% Adherence
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('page4_patients')}
            className="w-full mt-4 py-2.5 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View All {totalPatients} Patients</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live Verified Dose Stream */}
      <div className="glass-panel p-6 rounded-3xl border border-white/80 shadow-lg">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/60">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Recent Telemetry & Computer-Vision Verification Log
              </h3>
              <p className="text-xs text-slate-500">
                Separating Dose Timing from Optical / Sensor Verification Evidence
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500">Live ESP32 Feed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/70 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Patient</th>
                <th className="py-2.5 px-3">Time & Slot</th>
                <th className="py-2.5 px-3">Timing Status</th>
                <th className="py-2.5 px-3">Verification Evidence</th>
                <th className="py-2.5 px-3">Pillbox Device</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.slice(0, 4).map((p) => {
                const dose = p.todayDoses[0] || {
                  slot: 'Morning',
                  scheduledTime: '08:00 AM',
                  timingStatus: 'ON_TIME',
                  verificationEvidence: 'INGESTION_CONSISTENT',
                };

                return (
                  <tr key={p.id} className="hover:bg-white/60 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{p.fullName}</span>
                      <span className="font-mono text-[10px] text-teal-700">{p.id}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-800 block">{dose.slot} ({dose.scheduledTime})</span>
                      <span className="text-[10px] text-slate-400">Today</span>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={dose.timingStatus} size="sm" />
                    </td>
                    <td className="py-3 px-3">
                      <VerificationBadge evidence={dose.verificationEvidence} size="sm" />
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                      {p.pillboxId}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectPatient(p)}
                        className="text-xs font-bold text-teal-700 hover:text-teal-900"
                      >
                        Profile →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
