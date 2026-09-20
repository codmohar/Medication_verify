import React, { useState } from 'react';
import { Sliders, Eye, Image as ImageIcon } from 'lucide-react';

interface BackgroundOverlayProps {
  children: React.ReactNode;
}

export const BackgroundOverlay: React.FC<BackgroundOverlayProps> = ({ children }) => {
  const [glassBlur, setGlassBlur] = useState<number>(14);
  const [glassOpacity, setGlassOpacity] = useState<number>(85);
  const [showControl, setShowControl] = useState<boolean>(false);
  const [bgType, setBgType] = useState<'atrium' | 'modern' | 'minimal'>('atrium');

  // Realistic hospital atrium architectural backgrounds
  const bgUrls = {
    atrium: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=2600&q=85', // Grand hospital atrium with natural light & multi-tier balconies
    modern: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=2600&q=85', // Modern healthcare center atrium glass
    minimal: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=2600&q=85', // Clean architectural medical facility
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-slate-900 bg-slate-950">
      {/* Fixed Architectural Hospital Atrium Background with Caduceus Centerpiece */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 pointer-events-none transform scale-100"
        style={{
          backgroundImage: `url("${bgUrls[bgType]}")`,
          filter: `brightness(0.95) saturate(1.05)`,
        }}
      >
        {/* Luminous Hospital Atrium Architectural Glass & Caduceus Overlay Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-900/15 to-slate-950/45 mix-blend-multiply" />
        
        {/* Architectural Centerpiece Light Glow */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Floating Glassmorphism Tuning Toolbar */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
        {showControl && (
          <div className="glass-panel p-3.5 rounded-2xl shadow-2xl flex flex-col gap-3 text-xs w-72 animate-in fade-in slide-in-from-bottom-3 duration-200 border border-white/80">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 font-semibold text-slate-800">
              <span className="flex items-center gap-1.5 text-teal-800">
                <Sliders className="w-3.5 h-3.5 text-teal-600" /> Glassmorphism Controls
              </span>
              <button 
                onClick={() => setShowControl(false)}
                className="text-slate-400 hover:text-slate-700 px-1 py-0.5"
              >
                ✕
              </button>
            </div>
            <div>
              <div className="flex justify-between mb-1 text-slate-600">
                <span>Glass Frost (Blur)</span>
                <span className="font-mono text-teal-700">{glassBlur}px</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="24" 
                value={glassBlur} 
                onChange={(e) => setGlassBlur(Number(e.target.value))}
                className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1 text-slate-600">
                <span>Glass Opacity</span>
                <span className="font-mono text-teal-700">{glassOpacity}%</span>
              </div>
              <input 
                type="range" 
                min="40" 
                max="98" 
                value={glassOpacity} 
                onChange={(e) => setGlassOpacity(Number(e.target.value))}
                className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
            <div className="pt-1 flex gap-1.5">
              {(['atrium', 'modern', 'minimal'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setBgType(type)}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    bgType === type 
                      ? 'bg-teal-600 text-white shadow-sm' 
                      : 'bg-white/80 text-slate-700 hover:bg-white'
                  }`}
                >
                  {type === 'atrium' ? 'Atrium' : type === 'modern' ? 'Glass Hall' : 'Clinical'}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setShowControl(!showControl)}
          title="Adjust Glass & Hospital Background"
          className="glass-panel p-2.5 rounded-full shadow-lg hover:scale-105 transition-all text-slate-700 hover:text-teal-700 flex items-center gap-1.5 text-xs font-medium px-3.5 bg-white/90"
        >
          <Sliders className="w-4 h-4 text-teal-600" />
          <span className="hidden sm:inline">Glass Settings</span>
        </button>
      </div>

      {/* Dynamic CSS Variables injected for user-customized glassmorphism */}
      <style>{`
        .glass-panel {
          background: rgba(255, 255, 255, ${glassOpacity / 100}) !important;
          backdrop-filter: blur(${glassBlur}px) !important;
          -webkit-backdrop-filter: blur(${glassBlur}px) !important;
        }
        .glass-panel-subtle {
          background: rgba(255, 255, 255, ${(glassOpacity * 0.85) / 100}) !important;
          backdrop-filter: blur(${Math.max(4, glassBlur - 4)}px) !important;
          -webkit-backdrop-filter: blur(${Math.max(4, glassBlur - 4)}px) !important;
        }
      `}</style>

      {/* Main Content Rendered on Top of the Hospital Atrium Background */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
};
