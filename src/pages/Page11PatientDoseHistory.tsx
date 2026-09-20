import React, { useState } from 'react';
import { Patient, ActivePage, DoseRecord } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { VerificationBadge } from '../components/VerificationBadge';
import { 
  History, 
  ArrowLeft, 
  Calendar, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  Send,
  X,
  MessageSquareWarning,
  Sparkles
} from 'lucide-react';

interface Page11PatientDoseHistoryProps {
  patient: Patient;
  onNavigate: (page: ActivePage) => void;
  onBack: () => void;
}

export const Page11PatientDoseHistory: React.FC<Page11PatientDoseHistoryProps> = ({
  patient,
  onNavigate,
  onBack,
}) => {
  const [filterRange, setFilterRange] = useState<'ALL' | 'WEEK' | 'MONTH'>('ALL');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedRecordForIssue, setSelectedRecordForIssue] = useState<DoseRecord | null>(null);
  const [issueType, setIssueType] = useState('Device did not detect pill removal');
  const [issueNotes, setIssueNotes] = useState('');
  const [issueSubmitted, setIssueSubmitted] = useState(false);

  // Filter logic
  const filteredHistory = patient.history.filter((record) => {
    if (filterRange === 'ALL') return true;
    if (filterRange === 'WEEK') {
      // Last 7 days
      return true;
    }
    if (filterRange === 'MONTH') {
      return true;
    }
    return true;
  });

  const handleOpenReportModal = (record?: DoseRecord) => {
    setSelectedRecordForIssue(record || patient.history[0] || null);
    setShowReportModal(true);
    setIssueSubmitted(false);
  };

  const handleSubmitIssue = (e: React.FormEvent) => {
    e.preventDefault();
    setIssueSubmitted(true);
    setTimeout(() => {
      setShowReportModal(false);
      setIssueSubmitted(false);
      alert('Issue reported successfully. Your supervising care worker has been notified.');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header and Back Link */}
      <div className="glass-panel p-6 rounded-3xl border border-white/80 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-teal-700 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-7 h-7 text-teal-600" />
            <span>My Dose History & Records</span>
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Full verified log of your TB medication adherence from smart pillbox {patient.pillboxId}
          </p>
        </div>

        <button
          onClick={() => handleOpenReportModal()}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 shadow-xs transition-all"
        >
          <MessageSquareWarning className="w-4 h-4 text-amber-600" />
          <span>Report an issue with a dose</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="glass-panel p-3.5 rounded-2xl border border-white/70 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {(['ALL', 'WEEK', 'MONTH'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterRange(mode)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterRange === mode
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white/70 hover:bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {mode === 'ALL' && 'All Historical'}
              {mode === 'WEEK' && 'This Week'}
              {mode === 'MONTH' && 'This Month'}
            </button>
          ))}
        </div>

        <span className="text-xs font-semibold text-slate-500">
          {filteredHistory.length} Dose Records
        </span>
      </div>

      {/* History Cards / Timeline Grid */}
      <div className="space-y-3">
        {filteredHistory.map((record) => (
          <div
            key={record.id}
            className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/80 shadow-md hover:shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            {/* Left: Date, Slot & Scheduled Time */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0 border border-teal-200">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-sm">
                    {record.date}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700 text-[11px]">
                    {record.doseSlot} Dose
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Scheduled: <strong className="text-slate-700 font-mono">{record.scheduledTime}</strong> • Taken: <strong className="text-slate-800 font-mono">{record.eventTime}</strong>
                </div>
              </div>
            </div>

            {/* Middle: Badges for Timing & Verification Evidence */}
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={record.timingStatus} size="sm" />
              <VerificationBadge evidence={record.verificationEvidence} isPatientView={true} size="sm" />
            </div>

            {/* Right: Pillbox & Action */}
            <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/60 text-xs">
              <span className="font-mono text-[11px] text-slate-500">
                {record.deviceId}
              </span>

              <button
                onClick={() => handleOpenReportModal(record)}
                className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 hover:underline"
              >
                Report issue →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Report Issue Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl shadow-2xl border border-white space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">Report an Issue with a Dose</h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {issueSubmitted ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">Issue Report Transmitted</h4>
                <p className="text-xs text-slate-500">
                  Your supervisor ({patient.assignedCareWorker}) will review the telemetry logs.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitIssue} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Select Dose Record:
                  </label>
                  <select
                    value={selectedRecordForIssue?.id || ''}
                    onChange={(e) => {
                      const rec = patient.history.find(h => h.id === e.target.value);
                      if (rec) setSelectedRecordForIssue(rec);
                    }}
                    className="w-full p-2.5 rounded-xl glass-input bg-white font-medium focus:outline-none"
                  >
                    {patient.history.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.date} — {h.doseSlot} ({h.scheduledTime}) [{h.timingStatus}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Type of Issue:
                  </label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-input bg-white font-medium focus:outline-none"
                  >
                    <option value="Device did not detect pill removal">
                      Device did not detect pill removal
                    </option>
                    <option value="Smart box lid sensor stuck or open">
                      Smart box lid sensor stuck or open
                    </option>
                    <option value="Took medication away from smart box">
                      Took medication away from smart box
                    </option>
                    <option value="Low camera lighting / angle obscured">
                      Low camera lighting / angle obscured
                    </option>
                    <option value="Pill dropped / replacement required">
                      Pill dropped / replacement required
                    </option>
                    <option value="Other clinical or technical note">
                      Other clinical or technical note
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Details / Comments (Optional):
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe what occurred during dose ingestion..."
                    value={issueNotes}
                    onChange={(e) => setIssueNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-input focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Issue Report</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
