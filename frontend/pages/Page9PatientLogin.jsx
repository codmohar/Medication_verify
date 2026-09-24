import React, { useState } from 'react';
import { User, KeyRound, ArrowRight, Pill, ShieldCheck, ArrowLeft, HelpCircle } from 'lucide-react';

export const Page9PatientLogin = ({
  patients,
  onNavigate,
  onPatientLoginSuccess,
}) => {
  const [patientId, setPatientId] = useState('DS-TB-1024');
  const [pinOrDob, setPinOrDob] = useState('1234');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const trimmedId = patientId.trim().toUpperCase();
    const matched = patients.find(
      (p) => p.id.toUpperCase() === trimmedId
    );

    if (!matched) {
      setError(`Patient ID "${patientId}" not found in health centre records. Please verify your ID card.`);
      return;
    }

    // Check PIN or date of birth match
    const validPin = matched.authPin || '1234';
    if (pinOrDob.trim() !== validPin && pinOrDob.trim() !== matched.dateOfBirth) {
      setError(`Incorrect PIN. Default demo PIN is ${validPin} or use your Date of Birth.`);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onPatientLoginSuccess(matched);
      onNavigate('page10_patient_dashboard');
    }, 400);
  };

  const handleUseDemo = (demoId) => {
    const matched = patients.find((p) => p.id === demoId) || patients[0];
    if (matched) {
      setPatientId(matched.id);
      setPinOrDob(matched.authPin || '1234');
      setError('');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full mx-auto space-y-6">
        
        {/* Back Link */}
        <button
          onClick={() => onNavigate('page1_landing')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors glass-panel-subtle px-3 py-1.5 rounded-full"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Role Selection</span>
        </button>

        {/* Patient Login Card on Glass */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/80 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-teal-700/20">
              <Pill className="w-7 h-7 -rotate-45" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Patient Portal Access
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              View your daily schedule, verify doses, and track adherence
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Patient ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Patient ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-patient-id"
                  type="text"
                  required
                  placeholder="e.g. DS-TB-1024"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input placeholder:text-slate-400 focus:outline-none font-mono font-bold tracking-wider uppercase text-slate-900"
                />
              </div>
            </div>

            {/* Access PIN / Date of Birth */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Access PIN or Date of Birth
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Default: 1234</span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-patient-pin"
                  type="password"
                  required
                  placeholder="Enter 4-digit PIN (e.g. 1234)"
                  value={pinOrDob}
                  onChange={(e) => setPinOrDob(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input placeholder:text-slate-400 focus:outline-none font-medium"
                />
              </div>
            </div>

            {/* Helper text required by prompt */}
            <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>
                “Your Patient ID was provided by your health centre when your smart pillbox was assigned.”
              </span>
            </div>

            {/* Submit Button */}
            <button
              id="btn-patient-login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-teal-700/25 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Access My DoseSure</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Button required by prompt */}
          <div className="pt-4 border-t border-slate-200/70 text-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Prototype Test Accounts
            </span>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => handleUseDemo('DS-TB-1024')}
                className="w-full py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-bold border border-teal-200 flex items-center justify-between transition-all"
              >
                <span>Use Demo: Ramesh Kumar</span>
                <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-teal-200">DS-TB-1024 (96%)</span>
              </button>

              <button
                type="button"
                onClick={() => handleUseDemo('DS-TB-1028')}
                className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 text-xs font-bold border border-rose-200 flex items-center justify-between transition-all"
              >
                <span>Use Demo: Mohammed Farooq (Missed Dose Alert)</span>
                <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-rose-200">DS-TB-1028</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
