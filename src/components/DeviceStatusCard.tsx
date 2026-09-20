import React from 'react';
import { DeviceStatus } from '../types';
import { Cpu, Camera, Wifi, Battery, BatteryCharging, RefreshCw, Layers } from 'lucide-react';

interface DeviceStatusCardProps {
  device: DeviceStatus;
  verificationMethod?: string;
}

export const DeviceStatusCard: React.FC<DeviceStatusCardProps> = ({ 
  device,
  verificationMethod 
}) => {
  const isOnline = device.esp32Status === 'Online';
  const isBatteryLow = device.batteryPercentage < 20;

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
    </div>
  );
};
