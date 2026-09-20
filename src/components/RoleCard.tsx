import React from 'react';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface RoleCardProps {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
  badgeText?: string;
  themeColor: 'teal' | 'blue';
  onClick: () => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({
  id,
  icon: Icon,
  title,
  description,
  buttonText,
  badgeText,
  themeColor,
  onClick,
}) => {
  const isTeal = themeColor === 'teal';

  return (
    <div
      id={id}
      onClick={onClick}
      className="glass-panel group relative rounded-3xl p-7 sm:p-8 transition-all duration-300 hover:shadow-2xl hover:scale-[1.015] hover:-translate-y-1 cursor-pointer flex flex-col justify-between border border-white/70 overflow-hidden"
    >
      {/* Decorative top accent corner glow */}
      <div 
        className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-60 transition-opacity group-hover:opacity-100 ${
          isTeal ? 'bg-teal-400' : 'bg-sky-400'
        }`} 
      />

      <div>
        {/* Top Icon & Badge Row */}
        <div className="flex items-center justify-between mb-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110 ${
            isTeal 
              ? 'bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-teal-600/30' 
              : 'bg-gradient-to-tr from-sky-600 to-teal-500 text-white shadow-sky-600/30'
          }`}>
            <Icon className="w-7 h-7" />
          </div>

          {badgeText && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/80 border border-slate-200/80 text-slate-700 shadow-xs">
              {badgeText}
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2.5 group-hover:text-teal-700 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Button */}
      <div className="mt-8 pt-6 border-t border-slate-200/60 flex items-center justify-between">
        <span className={`text-sm font-bold flex items-center gap-2 group-hover:translate-x-1 transition-transform ${
          isTeal ? 'text-teal-700' : 'text-sky-700'
        }`}>
          {buttonText}
          <ArrowRight className="w-4 h-4" />
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
          isTeal ? 'bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white' : 'bg-sky-50 text-sky-700 group-hover:bg-sky-600 group-hover:text-white'
        }`}>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
