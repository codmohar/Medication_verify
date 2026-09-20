import React, { useState } from 'react';
import { Patient, ActivePage } from '../types';
import { StatusBadge } from './StatusBadge';
import { VerificationBadge } from './VerificationBadge';
import { Search, Plus, Filter, User, ArrowUpRight, AlertTriangle, Shield } from 'lucide-react';

interface PatientTableProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onAddNewPatient: () => void;
}

export const PatientTable: React.FC<PatientTableProps> = ({
  patients,
  onSelectPatient,
  onAddNewPatient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'On Track' | 'Late' | 'Missed Dose' | 'Requires Attention'>('All');

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = 
      patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.treatment.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'All') return true;
    return patient.status === selectedFilter;
  });

  return (
    <div className="space-y-4">
      {/* Header & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Patient Registry
          </h2>
          <p className="text-xs text-slate-500">
            Real-time monitoring of enrolled patients on verified DOTS therapy
          </p>
        </div>

        <button
          id="btn-add-patient-header"
          onClick={onAddNewPatient}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md shadow-teal-700/25 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Patient</span>
        </button>
      </div>

      {/* Search and Filters Glass Card */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/70">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-patient-search"
            type="text"
            placeholder="Search by Patient Name or Patient ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl glass-input placeholder:text-slate-400 focus:outline-none"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {(['All', 'On Track', 'Late', 'Missed Dose', 'Requires Attention'] as const).map((filter) => {
            const count = filter === 'All' 
              ? patients.length 
              : patients.filter(p => p.status === filter).length;

            return (
              <button
                key={filter}
                id={`filter-${filter.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  selectedFilter === filter
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                <span>{filter}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedFilter === filter ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Patient Table Glass Panel */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/70 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Patient ID</th>
                <th className="py-3.5 px-4">Patient Name</th>
                <th className="py-3.5 px-3">Age</th>
                <th className="py-3.5 px-4">Treatment</th>
                <th className="py-3.5 px-4">Assigned Care Worker</th>
                <th className="py-3.5 px-4 text-center">Adherence %</th>
                <th className="py-3.5 px-4">Last Dose</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertTriangle className="w-8 h-8 text-amber-500" />
                      <p className="font-semibold text-sm">No patients found</p>
                      <p className="text-xs text-slate-400">Try adjusting your search criteria or filter options</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  const latestDose = patient.history[0] || (patient.todayDoses[0] ? {
                    timingStatus: patient.todayDoses[0].timingStatus,
                    verificationEvidence: patient.todayDoses[0].verificationEvidence,
                    scheduledTime: patient.todayDoses[0].scheduledTime,
                  } : null);

                  return (
                    <tr
                      key={patient.id}
                      className="hover:bg-teal-50/40 transition-colors group cursor-pointer"
                      onClick={() => onSelectPatient(patient)}
                    >
                      {/* Patient ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {patient.id}
                        </span>
                      </td>

                      {/* Patient Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">
                            {patient.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                              {patient.fullName}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {patient.gender} • {patient.phoneNumber || 'No phone'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Age */}
                      <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">
                        {patient.age} yrs
                      </td>

                      {/* Treatment */}
                      <td className="py-3.5 px-4 text-slate-800">
                        <div className="max-w-[200px] truncate font-medium" title={patient.treatment}>
                          {patient.treatment}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {patient.medicationName}
                        </div>
                      </td>

                      {/* Assigned Care Worker */}
                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                        {patient.assignedCareWorker}
                      </td>

                      {/* Adherence % */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <div className="w-12 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                patient.adherencePercentage >= 90
                                  ? 'bg-emerald-500'
                                  : patient.adherencePercentage >= 75
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${patient.adherencePercentage}%` }}
                            />
                          </div>
                          <span className="font-bold font-mono text-slate-800">
                            {patient.adherencePercentage}%
                          </span>
                        </div>
                      </td>

                      {/* Last Dose */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {latestDose ? (
                          <div className="flex flex-col gap-1 items-start">
                            <StatusBadge status={latestDose.timingStatus} size="sm" />
                            <VerificationBadge evidence={latestDose.verificationEvidence} size="sm" />
                          </div>
                        ) : (
                          <span className="text-slate-400">No events</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          patient.status === 'On Track'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : patient.status === 'Late'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : patient.status === 'Missed Dose'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {patient.status}
                        </span>
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          id={`btn-view-profile-${patient.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPatient(patient);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-teal-600 text-teal-700 hover:text-white border border-teal-200 shadow-xs transition-colors"
                        >
                          <span>View Profile</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
