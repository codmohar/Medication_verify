import React from 'react';
import { Alert, Patient } from '../types';
import { getAlertSeverityConfig, getAlertTypeConfig, generateWhatsAppMessage } from '../utils/helpers';
import { 
  AlertTriangle, 
  Clock, 
  CameraOff, 
  WifiOff, 
  RefreshCw, 
  CheckCheck, 
  MessageSquare, 
  ArrowRight,
  Send
} from 'lucide-react';

interface AlertCardProps {
  alert: Alert;
  onViewPatient: (patientId: string) => void;
  onToggleReviewed: (alertId: string) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onViewPatient,
  onToggleReviewed,
}) => {
  const severityConfig = getAlertSeverityConfig(alert.severity);
  const typeConfig = getAlertTypeConfig(alert.alertType);

  const getAlertIcon = () => {
    switch (alert.alertType) {
      case 'MISSED_DOSE':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      case 'LATE_DOSE':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'VERIFICATION_FAILED':
        return <CameraOff className="w-5 h-5 text-amber-700" />;
      case 'DEVICE_OFFLINE':
        return <WifiOff className="w-5 h-5 text-rose-700" />;
      case 'SYNC_PENDING':
      default:
        return <RefreshCw className="w-5 h-5 text-sky-600" />;
    }
  };

  const handleOpenWhatsApp = () => {
    const text = generateWhatsAppMessage(
      alert.patientName,
      alert.patientId,
      typeConfig.label,
      alert.time
    );
    // WhatsApp Web API or demo preview
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className={`glass-panel rounded-2xl p-5 border-l-4 transition-all hover:shadow-xl ${severityConfig.border} ${
      alert.isReviewed ? 'opacity-70 bg-white/60' : 'bg-white/85'
    }`}>
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-white/90 shadow-xs border border-slate-200/80">
            {getAlertIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider uppercase text-slate-800">
                {typeConfig.label}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${severityConfig.badge}`}>
                {alert.severity}
              </span>
              {alert.isReviewed && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                  <CheckCheck className="w-3 h-3 text-emerald-600" /> Reviewed
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{alert.time}</p>
          </div>
        </div>

        {/* WhatsApp Notification Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold whitespace-nowrap">
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>WhatsApp Alert: {alert.whatsAppNotificationStatus}</span>
        </div>
      </div>

      {/* Patient & Incident Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3 p-3 rounded-xl bg-slate-50/70 border border-slate-200/60 text-xs">
        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Patient
          </span>
          <span className="font-bold text-slate-900">{alert.patientName}</span>
          <span className="text-[11px] font-mono text-teal-700 block font-semibold">
            ID: {alert.patientId}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Scheduled Dose
          </span>
          <span className="font-bold text-slate-800">{alert.scheduledDose}</span>
          <span className="text-[10px] text-slate-500 block truncate">{alert.treatment}</span>
        </div>

        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Telemetry / CV Status
          </span>
          <p className="text-[11px] text-slate-700 font-medium line-clamp-2">
            {alert.statusDescription}
          </p>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/60">
        <button
          onClick={handleOpenWhatsApp}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors"
        >
          <Send className="w-3 h-3" />
          <span>Resend WhatsApp Notification</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleReviewed(alert.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              alert.isReviewed
                ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            {alert.isReviewed ? 'Mark Unreviewed' : 'Mark Reviewed'}
          </button>

          <button
            onClick={() => onViewPatient(alert.patientId)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-all hover:scale-102"
          >
            <span>View Patient</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
