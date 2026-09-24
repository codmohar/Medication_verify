import React from 'react';
import { Pill, ShieldCheck, Bell, LogOut, Menu, X, User, Home } from 'lucide-react';
import { CareWorker, Patient, ActivePage } from '../types';

interface NavbarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  careWorker?: CareWorker;
  activePatient?: Patient | null;
  patientUser?: Patient | null;
  unreadAlertCount?: number;
  unreviewedAlertsCount?: number;
  mobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  onNavigate,
  careWorker,
  activePatient,
  unreadAlertCount = 0,
  mobileMenuOpen = false,
  onToggleMobileMenu = () => {},
  ...props
}) => {
  const patient = activePatient || (props as any).patientUser;
  const alertCount = unreadAlertCount || (props as any).unreviewedAlertsCount || 0;
  const isCareWorkerArea = [
    'page3_cw_dashboard',
    'page4_patients',
    'page5_add_patient',
    'page6_patient_id_generated',
    'page7_patient_profile',
    'page8_alert_centre',
    'page12_reports',
  ].includes(activePage);

  const isPatientArea = [
    'page10_patient_dashboard',
    'page11_patient_history',
  ].includes(activePage);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo and Tagline */}
        <div 
          onClick={() => onNavigate('page1_landing')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          {/* Logo Placeholder */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform">
            <div className="relative">
              <Pill className="w-5 h-5 -rotate-45" />
              <ShieldCheck className="w-3 h-3 absolute -bottom-1 -right-1 text-emerald-200" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Dose<span className="text-teal-600">Sure</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                TB Care Edition
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 tracking-wide hidden sm:block">
              Right Dose. Right Time. Verified.
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Direct "Initial Page" button available anywhere outside landing */}
          {activePage !== 'page1_landing' && (
            <button
              id="navbar-initial-page-btn"
              onClick={() => onNavigate('page1_landing')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-teal-700 bg-white/80 hover:bg-white border border-slate-200/80 shadow-xs transition-all cursor-pointer group"
              title="Return to Initial Page / Role Selection"
            >
              <Home className="w-3.5 h-3.5 text-teal-600 group-hover:scale-110 transition-transform" />
              <span>Initial Page</span>
            </button>
          )}

          {/* Care Worker Context Header Info */}
          {isCareWorkerArea && careWorker && (
            <div className="hidden md:flex items-center gap-3 pl-3 border-l border-slate-200/80">
              <button
                onClick={() => onNavigate('page8_alert_centre')}
                className="relative p-2 rounded-xl text-slate-600 hover:text-teal-600 hover:bg-white/70 transition-colors"
                title="Alert Centre"
              >
                <Bell className="w-5 h-5" />
                {alertCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {alertCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2.5">
                <img
                  src={careWorker.avatarUrl}
                  alt={careWorker.name}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-teal-500/30"
                />
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900">{careWorker.name}</div>
                  <div className="text-[10px] text-teal-700 font-medium">TB Medical Officer</div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('page1_landing')}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50/80 rounded-xl transition-colors"
                title="Logout to Initial Page"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Patient Context Header Info */}
          {isPatientArea && patient && (
            <div className="flex items-center gap-3">
              <div className="glass-panel px-3 py-1 rounded-xl text-left hidden sm:block">
                <div className="text-[11px] text-slate-500">Patient Mode</div>
                <div className="text-xs font-bold text-slate-900">{patient.fullName} ({patient.id})</div>
              </div>
              <button
                onClick={() => onNavigate('page1_landing')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 glass-panel transition-all"
                title="Exit to Initial Page"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit</span>
              </button>
            </div>
          )}

          {/* If on Landing or Login, quick demo switcher */}
          {(!isCareWorkerArea && !isPatientArea) && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('page9_patient_login')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-teal-700 glass-panel-subtle hover:bg-white transition-all hidden sm:inline-flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-teal-600" />
                Patient Portal
              </button>
              <button
                onClick={() => onNavigate('page2_cw_login')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-all"
              >
                Care Worker Portal
              </button>
            </div>
          )}

          {/* Mobile hamburger button */}
          {isCareWorkerArea && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 glass-panel"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
