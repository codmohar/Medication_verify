import React, { useState } from 'react';
import { Stethoscope, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { CURRENT_CARE_WORKER } from '../data/mockData';

export const Page2CareWorkerLogin = ({
  onNavigate,
  onLoginSuccess,
}) => {
  const [identifier, setIdentifier] = useState('ananya.sharma@health.gov.in');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your Care Worker ID or Email');
      return;
    }

    setIsLoading(true);
    setError('');

    // Fast mock login for prototype
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(CURRENT_CARE_WORKER);
      onNavigate('page3_cw_dashboard');
    }, 400);
  };

  const handleUseDemo = (id) => {
    setIdentifier(id);
    setPassword('demoSecurePass2026!');
    setError('');
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

        {/* Login Card on Glass */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/80 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-teal-700/20">
              <Stethoscope className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Care Worker Portal
            </h2>
            <p className="text-xs text-slate-600">
              Authorized clinical personnel & TB treatment supervisors
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ID or Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Care Worker ID / Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-cw-id"
                  type="text"
                  required
                  placeholder="e.g. CW-408 or name@health.gov.in"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input placeholder:text-slate-400 focus:outline-none font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to registered institutional email.')}
                  className="text-[11px] font-semibold text-teal-700 hover:text-teal-900"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-cw-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your clinical password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl glass-input placeholder:text-slate-400 focus:outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="btn-cw-login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-teal-700/25 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Login to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials for Prototype */}
          <div className="pt-4 border-t border-slate-200/70 text-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              One-Click Demo Credentials
            </span>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => handleUseDemo('ananya.sharma@health.gov.in')}
                className="w-full py-1.5 px-3 rounded-lg bg-teal-50/80 hover:bg-teal-100/80 text-teal-800 text-[11px] font-semibold border border-teal-200 flex items-center justify-between"
              >
                <span>Dr. Ananya Sharma (Lead Medical Officer)</span>
                <span className="font-mono text-[10px] bg-teal-200/70 px-1.5 py-0.5 rounded">CW-408</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
