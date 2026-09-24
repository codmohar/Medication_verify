import React, { useState } from 'react';
import { DeviceStatus, Patient } from '../types';
import { Cpu, Camera, Wifi, Battery, BatteryCharging, RefreshCw, Layers, Code, Copy, Download, Check } from 'lucide-react';
import { generatePatientESP32Code } from '../utils/helpers';

interface DeviceStatusCardProps {
  device: DeviceStatus;
  verificationMethod?: string;
  patient?: Patient;
}

export const DeviceStatusCard: React.FC<DeviceStatusCardProps> = ({ 
  device,
  verificationMethod,
  patient 
}) => {
  const [showFirmware, setShowFirmware] = useState(false);
  const [copied, setCopied] = useState(false);
  const isOnline = device.esp32Status === 'Online';
  const isBatteryLow = device.batteryPercentage < 20;

  const handleCopy = () => {
    if (!patient) return;
    const code = generatePatientESP32Code(patient);
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!patient) return;
    const code = generatePatientESP32Code(patient);
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dosesure_esp32_${patient.id}.ino`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-white/70 shadow-md">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/70">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Assigned Smart Device</h4>
            <span className="font-mono text-xs font-semibold text-teal-700">
              {device.deviceId}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
            isOnline 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            ESP32 {device.esp32Status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        {/* ESP32 Chip Status */}
        <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/50">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Cpu className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-medium">Firmware</span>
          </div>
          <span className="font-mono font-bold text-slate-800 text-[11px] block truncate">
            {device.firmwareVersion}
          </span>
        </div>

        {/* Camera / CV Module */}
        <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/50">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Camera className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-medium">Camera CV</span>
          </div>
          <span className={`font-bold text-xs ${
            device.cameraStatus === 'Active' ? 'text-teal-700' : 'text-slate-600'
          }`}>
            {device.cameraStatus}
          </span>
        </div>

        {/* Internet Connection */}
        <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/50">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Wifi className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-medium">Internet Status</span>
          </div>
          <span className="font-bold text-slate-800 text-xs truncate block">
            {device.internetStatus}
          </span>
        </div>

        {/* Battery Power */}
        <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/50">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Battery className={`w-3.5 h-3.5 ${isBatteryLow ? 'text-rose-500' : 'text-emerald-600'}`} />
            <span className="font-medium">Battery Level</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  isBatteryLow ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${device.batteryPercentage}%` }}
              />
            </div>
            <span className="font-mono font-bold text-slate-800">
              {device.batteryPercentage}%
            </span>
          </div>
        </div>

        {/* Compartments */}
        <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/50">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-medium">Compartments</span>
          </div>
          <span className="font-bold text-slate-800 text-xs">
            {device.compartmentCount} Slots (Multi-day)
          </span>
        </div>

        {/* Last Sync */}
        <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/50">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-medium">Last Sync</span>
          </div>
          <span className="font-bold text-slate-800 text-xs truncate block">
            {device.lastSync}
          </span>
        </div>
      </div>

      {verificationMethod && (
        <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">Verification Protocol Mode:</span>
          <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            {verificationMethod}
          </span>
        </div>
      )}

      {patient && (
        <div className="mt-3 pt-3 border-t border-slate-200/60">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-800">ESP32 Firmware:</span> Configured for {patient.fullName}
            </div>
            <button
              type="button"
              onClick={() => setShowFirmware(!showFirmware)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition-all cursor-pointer"
            >
              <Code className="w-3.5 h-3.5 text-teal-600" />
              <span>{showFirmware ? 'Hide Arduino Code' : 'View ESP32 Code'}</span>
            </button>
          </div>

          {showFirmware && (
            <div className="mt-3 p-4 rounded-2xl bg-slate-900 text-white text-left space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-teal-400 font-mono">
                  dosesure_esp32_{patient.id}.ino
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <pre className="p-2.5 rounded-xl bg-slate-950 text-[10.5px] font-mono text-slate-300 max-h-48 overflow-y-auto whitespace-pre leading-relaxed select-all">
                {generatePatientESP32Code(patient)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
