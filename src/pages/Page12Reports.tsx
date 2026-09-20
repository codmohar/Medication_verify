import React, { useState } from 'react';
import { Patient, ActivePage, CareWorker } from '../types';
import { AdherenceChart } from '../components/AdherenceChart';
import { 
  BarChart3, 
  Download, 
  Printer, 
  TrendingUp, 
  Calendar, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';

interface Page12ReportsProps {
  patients: Patient[];
  careWorker: CareWorker;
  onNavigate: (page: ActivePage) => void;
}

export const Page12Reports: React.FC<Page12ReportsProps> = ({
  patients,
  careWorker,
  onNavigate,
}) => {
  const [reportPeriod, setReportPeriod] = useState<'Q3_2026' | 'SEP_2026' | 'ALL'>('SEP_2026');

  // Compute stats
  const total = patients.length;
  const avgAdherence = Math.round(
    patients.reduce((acc, p) => acc + p.adherencePercentage, 0) / (total || 1)
  );
  const compliantCount = patients.filter((p) => p.adherencePercentage >= 90).length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'Patient ID',
      'Name',
      'Age',
      'Gender',
      'Treatment Regimen',
      'Pillbox ID',
      'Adherence Rate %',
      'Status',
      'Caregiver WhatsApp',
      'Care Worker',
    ];

    const rows = patients.map((p) => [
      `"${p.id}"`,
      `"${p.fullName}"`,
      p.age,
      p.gender,
      `"${p.treatment}"`,
      `"${p.pillboxId}"`,
      p.adherencePercentage,
      `"${p.status}"`,
      `"${p.whatsAppNumber}"`,
      `"${p.assignedCareWorker}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DoseSure_TB_Adherence_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              NTEP Clinical Analytics
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-semibold">Cohort Adherence Audit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-teal-600" />
            <span>Medication Adherence Analytics & Reports</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Aggregated telemetry from ESP32 smart pillboxes and computer-vision verification streams
          </p>
        </div>

        {/* Action Buttons: Export & Print */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-700/20 transition-all hover:scale-102"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-xs transition-all"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Cohort KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/80 shadow-md">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Cohort Adherence
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{avgAdherence}%</span>
            <span className="text-xs font-bold text-emerald-600">+2.4% vs last month</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Target benchmark: &gt;90% adherence
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/80 shadow-md">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Compliant Patients
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700">{compliantCount} / {total}</span>
            <span className="text-xs font-bold text-emerald-600">
              {Math.round((compliantCount / (total || 1)) * 100)}%
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Patients maintaining &gt;90% adherence
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/80 shadow-md">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Optical Verification Rate
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-teal-700">92.8%</span>
            <span className="text-xs font-bold text-teal-600">Consistent</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Ingestion-consistent motion detected
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/80 shadow-md">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Caregiver Dispatches
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">42</span>
            <span className="text-xs font-bold text-slate-500">Alerts</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Automated WhatsApp intervention notices
          </span>
        </div>
      </div>

      {/* 4 Required Analytic Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Weekly Adherence Rate */}
        <div className="glass-panel p-6 rounded-3xl border border-white/80 shadow-lg">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/70">
            <div>
              <h3 className="text-base font-bold text-slate-900">Weekly Adherence Rate</h3>
              <p className="text-xs text-slate-500">Distribution of on-time, late, and missed doses across days</p>
            </div>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Current Week
            </span>
          </div>
          <AdherenceChart type="weekly" />
        </div>

        {/* Chart 2: Monthly Adherence Rate */}
        <div className="glass-panel p-6 rounded-3xl border border-white/80 shadow-lg">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/70">
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly Adherence Trend</h3>
              <p className="text-xs text-slate-500">6-month longitudinal adherence curve across clinic cohort</p>
            </div>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Apr - Sep 2026
            </span>
          </div>
          <AdherenceChart type="monthly" />
        </div>

        {/* Chart 3: Missed-Dose Trends */}
        <div className="glass-panel p-6 rounded-3xl border border-white/80 shadow-lg">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/70">
            <div>
              <h3 className="text-base font-bold text-slate-900">Missed-Dose & Verification Failure Trends</h3>
              <p className="text-xs text-slate-500">Tracking missed intervals vs optical retry sequence events</p>
            </div>
            <span className="text-xs font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Weekly Incidents
            </span>
          </div>
          <AdherenceChart type="missedTrend" />
        </div>

        {/* Chart 4: Patient Adherence Comparison */}
        <div className="glass-panel p-6 rounded-3xl border border-white/80 shadow-lg">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/70">
            <div>
              <h3 className="text-base font-bold text-slate-900">Patient Adherence Comparison</h3>
              <p className="text-xs text-slate-500">Benchmarking patient adherence percentages against the 90% target</p>
            </div>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Cohort Benchmark
            </span>
          </div>
          <AdherenceChart type="comparison" />
        </div>
      </div>
    </div>
  );
};
