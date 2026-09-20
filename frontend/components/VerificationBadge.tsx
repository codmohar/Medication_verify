import React from 'react';
import { VerificationEvidence } from '../types';
import { getVerificationEvidenceConfig } from '../utils/helpers';
import { ShieldCheck, Video, AlertTriangle, HelpCircle } from 'lucide-react';

interface VerificationBadgeProps {
  evidence: VerificationEvidence;
  isPatientView?: boolean;
  size?: 'sm' | 'md';
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  evidence,
  isPatientView = false,
  size = 'md',
}) => {
  const config = getVerificationEvidenceConfig(evidence);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] font-medium gap-1',
    md: 'px-2.5 py-1 text-xs font-semibold gap-1.5',
  }[size];

  const getIcon = () => {
    switch (evidence) {
      case 'INGESTION_CONSISTENT':
        return <Video className="w-3.5 h-3.5 text-teal-600" />;
      case 'ACCESS_VERIFIED':
        return <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />;
      case 'RETRY_REQUIRED':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
      case 'UNVERIFIED':
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <span 
      className={`inline-flex items-center rounded-md border transition-all whitespace-nowrap ${sizeClasses} ${config.bg}`}
      title={config.description}
    >
      {getIcon()}
      <span className="tracking-tight">
        {isPatientView ? config.patientFriendly : config.label}
      </span>
    </span>
  );
};
