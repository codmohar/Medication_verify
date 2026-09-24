import React from 'react';
import { Pill, ShieldCheck, User, Stethoscope } from 'lucide-react';
import { RoleCard } from '../components/RoleCard';

export const Page1Landing = ({ onNavigate }) => {
  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl w-full mx-auto text-center space-y-8">
        
        {/* Hero Branding on Frosted Glass */}
        <div className="glass-panel rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/80 space-y-6">
          
          {/* Logo Placeholder */}
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-600 text-white shadow-xl shadow-teal-700/25 ring-4 ring-white/50">
            <div className="relative">
              <Pill className="w-10 h-10 -rotate-45" />
              <ShieldCheck className="w-5 h-5 absolute -bottom-1 -right-1 text-emerald-200" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
              Dose<span className="text-teal-600">Sure</span>
            </h1>
            <p className="text-base sm:text-lg font-bold text-teal-800 tracking-wide uppercase">
              Verified Medication Adherence Platform
            </p>
            <div className="inline-block px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-700 font-semibold text-xs tracking-wider">
              “Right Dose. Right Time. Verified.”
            </div>
          </div>
        </div>

        {/* Two Large Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left">
          {/* Card 1 — Patient */}
          <RoleCard
            id="role-card-patient"
            icon={User}
            title="Patient Login"
            description="Access your medication schedule, dose history, reminders and adherence progress."
            buttonText="Continue as Patient"
            badgeText="For Patients & Families"
            themeColor="teal"
            onClick={() => onNavigate('page9_patient_login')}
          />

          {/* Card 2 — Care Worker */}
          <RoleCard
            id="role-card-careworker"
            icon={Stethoscope}
            title="Care Worker Login"
            description="Register patients, monitor medication adherence and respond to missed-dose alerts."
            buttonText="Continue as Care Worker"
            badgeText="For DOTS Clinicians & Staff"
            themeColor="blue"
            onClick={() => onNavigate('page2_cw_login')}
          />
        </div>
      </div>
    </div>
  );
};
