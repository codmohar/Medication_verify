import React from 'react';
import { TimingStatus } from '../types';
import { getTimingStatusConfig } from '../utils/helpers';
import { CheckCircle2, Clock, AlertCircle, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: TimingStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  showIcon = true 
}) => {
  const config = getTimingStatusConfig(status);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] font-semibold gap-1',
    md: 'px-2.5 py-1 text-xs font-semibold gap-1.5',
    lg: 'px-3 py-1.5 text-sm font-bold gap-2',
  }[size];

  const getIcon = () => {
    switch (status) {
      case 'ON_TIME':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'LATE':
        return <Clock className="w-3.5 h-3.5 text-amber-600" />;
      case 'MISSED':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-600" />;
      case 'PENDING':
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-sky-600" />;
    }
  };

  return (
    <span 
      className={`inline-flex items-center rounded-full border shadow-xs transition-colors whitespace-nowrap ${sizeClasses} ${config.badge}`}
      title={config.description}
    >
      {showIcon && getIcon()}
      <span className="tracking-wide uppercase">{config.label}</span>
    </span>
  );
};
