import React, { useState } from 'react';
import { AlertCard } from '../components/AlertCard';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  MessageCircle, 
  WifiOff, 
  Search,
  Sparkles
} from 'lucide-react';
import { generateWhatsAppMessage } from '../utils/helpers';

export const Page8AlertCentre = ({
  alerts,
  patients,
  onNavigate,
  onSelectPatientById,
  onToggleReviewAlert,
}) => {
  const [filterType, setFilterType] = useState('UNREVIEWED');
  const [searchQuery, setSearchQuery] = useState('');

  const unreviewedCount = alerts.filter((a) => !a.isReviewed).length;
  const highCount = alerts.filter((a) => a.severity === 'CRITICAL' && !a.isReviewed).length;

  const filteredAlerts = alerts.filter((alert) => {
    // Tab filter
    if (filterType === 'UNREVIEWED' && alert.isReviewed) return false;
    if (filterType === 'HIGH' && alert.severity !== 'CRITICAL') return false;
    if (filterType === 'MISSED' && alert.alertType !== 'MISSED_DOSE') return false;
    if (filterType === 'DEVICE' && alert.alertType !== 'DEVICE_OFFLINE') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        alert.patientName.toLowerCase().includes(q) ||
        alert.patientId.toLowerCase().includes(q) ||
        alert.statusDescription.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Panel */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Adherence Response Center
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-semibold">Real-time Telemetry Triggers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Active Care Alerts & Escalations
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Automated alerts triggered when smart pillbox access or computer vision fails to verify scheduled doses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold text-center shadow-xs">
            <span className="text-lg font-black text-rose-600 block leading-tight">{unreviewedCount}</span>
            <span>Needs Review</span>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold text-center shadow-xs">
            <span className="text-lg font-black text-amber-600 block leading-tight">{highCount}</span>
            <span>High Severity</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          {[
            { id: 'UNREVIEWED', label: 'Action Required', count: unreviewedCount },
            { id: 'ALL', label: 'All Alerts', count: alerts.length },
            { id: 'HIGH', label: 'Critical Severity', count: highCount },
            { id: 'MISSED', label: 'Dose Missed', count: alerts.filter(a => a.alertType === 'MISSED_DOSE').length },
            { id: 'DEVICE', label: 'Device Offline', count: alerts.filter(a => a.alertType === 'DEVICE_OFFLINE').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filterType === tab.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white/70 hover:bg-white text-slate-600 border border-slate-200/80'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                filterType === tab.id ? 'bg-teal-700 text-white' : 'bg-slate-200/80 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient, ID, or alert..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl glass-input placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Alert Cards List */}
      {filteredAlerts.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/80 shadow-md text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No matching alerts found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All current patients have verified smart pillbox adherence or no alerts match the filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onToggleReviewed={onToggleReviewAlert}
              onViewPatient={onSelectPatientById}
            />
          ))}
        </div>
      )}
    </div>
  );
};
