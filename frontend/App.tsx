import React, { useState, useEffect } from 'react';
import { 
  ActivePage, 
  Patient, 
  CareWorker, 
  Alert, 
  DoseRecord, 
  TimingStatus, 
  VerificationEvidence,
  VerificationResult
} from './types';
import { 
  getStoredPatients as getInitialPatients, 
  saveStoredPatients as savePatients, 
  INITIAL_ALERTS, 
  CURRENT_CARE_WORKER 
} from './data/mockData';

// Shared UI components
import { BackgroundOverlay } from './components/BackgroundOverlay';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// 12 Functional Pages
import { Page1Landing } from './pages/Page1Landing';
import { Page2CareWorkerLogin } from './pages/Page2CareWorkerLogin';
import { Page3CareWorkerDashboard } from './pages/Page3CareWorkerDashboard';
import { Page4PatientManagement } from './pages/Page4PatientManagement';
import { Page5AddNewPatient } from './pages/Page5AddNewPatient';
import { Page6PatientIdGenerated } from './pages/Page6PatientIdGenerated';
import { Page7PatientProfile } from './pages/Page7PatientProfile';
import { Page8AlertCentre } from './pages/Page8AlertCentre';
import { Page9PatientLogin } from './pages/Page9PatientLogin';
import { Page10PatientDashboard } from './pages/Page10PatientDashboard';
import { Page11PatientDoseHistory } from './pages/Page11PatientDoseHistory';
import { Page12Reports } from './pages/Page12Reports';

import { Layers, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('page1_landing');
  const [patients, setPatients] = useState<Patient[]>(() => getInitialPatients());
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [careWorker, setCareWorker] = useState<CareWorker>(CURRENT_CARE_WORKER);
  const [selectedPatient, setSelectedPatient] = useState<Patient>(() => getInitialPatients()[0]);
  const [currentPatientUser, setCurrentPatientUser] = useState<Patient>(() => getInitialPatients()[0]);
  const [newlyRegisteredPatient, setNewlyRegisteredPatient] = useState<Patient | null>(null);
  const [showPageSwitcher, setShowPageSwitcher] = useState(false);

  // Sync patients changes to persistence helper
  useEffect(() => {
    savePatients(patients);
  }, [patients]);

  // Handle Care Worker selecting a patient to view full profile
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setActivePage('page7_patient_profile');
  };

  const handleSelectPatientById = (patientId: string) => {
    const found = patients.find((p) => p.id === patientId);
    if (found) {
      setSelectedPatient(found);
      setActivePage('page7_patient_profile');
    }
  };

  // Handle successful registration in Page 5
  const handleRegisterSuccess = (newPatient: Patient) => {
    const updated = [newPatient, ...patients];
    setPatients(updated);
    setNewlyRegisteredPatient(newPatient);
    setSelectedPatient(newPatient);
    setActivePage('page6_patient_id');
  };

  // Handle Patient taking dose simulation on Page 10
  const handleTakeDoseAction = (patientId: string, slot: string, verificationResult?: VerificationResult) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;

        const isVerified = verificationResult ? verificationResult.verified : true;
        const evidenceStatus: VerificationEvidence = isVerified ? 'INGESTION_CONSISTENT' : 'UNVERIFIED';
        const timingStatus: TimingStatus = isVerified ? 'ON_TIME' : 'MISSED';
        const logNotes = verificationResult 
          ? `AI Video Verification: ${verificationResult.explanation} (Confidence: ${Math.round(verificationResult.confidence * 100)}%)`
          : 'Dose verified via smart pillbox access and AI temporal video ingestion analysis.';

        const updatedDoses = p.todayDoses.map((d) => {
          if (d.slot === slot || d.timingStatus === 'PENDING') {
            return {
              ...d,
              takenTime: nowTime,
              timingStatus: timingStatus,
              verificationEvidence: evidenceStatus,
            };
          }
          return d;
        });

        const newRecord: DoseRecord = {
          id: `rec-${Date.now()}`,
          date: todayDate,
          scheduledTime: slot === 'Morning' ? '08:00 AM' : '08:00 PM',
          eventTime: nowTime,
          doseSlot: slot as any,
          timingStatus: timingStatus,
          verificationEvidence: evidenceStatus,
          deviceId: p.pillboxId,
          alertSent: false,
          notes: logNotes,
          aiVerificationResult: verificationResult,
        };

        const newHistory = [newRecord, ...p.history];
        const newStreak = isVerified ? p.currentStreakDays + 1 : p.currentStreakDays;
        const newAdherence = isVerified 
          ? Math.min(100, Math.round(((p.adherencePercentage * 10) + 100) / 11))
          : Math.max(0, Math.round((p.adherencePercentage * 10) / 11));

        const updatedPatient: Patient = {
          ...p,
          status: 'On Track',
          currentStreakDays: newStreak,
          adherencePercentage: newAdherence,
          todayDoses: updatedDoses,
          history: newHistory,
        };

        if (currentPatientUser && currentPatientUser.id === patientId) {
          setCurrentPatientUser(updatedPatient);
        }

        return updatedPatient;
      })
    );
  };

  // Handle reviewing alert in Page 8
  const handleToggleReviewAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isReviewed: !a.isReviewed } : a))
    );
  };

  // Is current page inside the care-worker workspace?
  const isCareWorkerWorkspace = [
    'page3_cw_dashboard',
    'page4_patients',
    'page5_add_patient',
    'page7_patient_profile',
    'page8_alert_centre',
    'page12_reports',
  ].includes(activePage);

  // Unreviewed alert counter for sidebar & navbar
  const unreviewedAlertCount = alerts.filter((a) => !a.isReviewed).length;

  const pageDirectory: { id: ActivePage; number: number; name: string; category: string }[] = [
    { id: 'page1_landing', number: 1, name: 'Role Selection / Landing', category: 'General' },
    { id: 'page2_cw_login', number: 2, name: 'Care Worker Login', category: 'Care Worker' },
    { id: 'page3_cw_dashboard', number: 3, name: 'Care Worker Dashboard', category: 'Care Worker' },
    { id: 'page4_patients', number: 4, name: 'Patient Management', category: 'Care Worker' },
    { id: 'page5_add_patient', number: 5, name: 'Add Patient (Wizard)', category: 'Care Worker' },
    { id: 'page6_patient_id', number: 6, name: 'Patient ID Generated', category: 'Care Worker' },
    { id: 'page7_patient_profile', number: 7, name: 'Individual Patient Profile', category: 'Care Worker' },
    { id: 'page8_alert_centre', number: 8, name: 'Alert / Notification Centre', category: 'Care Worker' },
    { id: 'page9_patient_login', number: 9, name: 'Patient Login', category: 'Patient' },
    { id: 'page10_patient_dashboard', number: 10, name: 'Patient Dashboard', category: 'Patient' },
    { id: 'page11_patient_history', number: 11, name: 'Patient Dose History', category: 'Patient' },
    { id: 'page12_reports', number: 12, name: 'Reports / Analytics', category: 'Care Worker' },
  ];

  return (
    <BackgroundOverlay>
      {/* Top Navbar */}
      <Navbar
        activePage={activePage}
        onNavigate={setActivePage}
        careWorker={careWorker}
        patientUser={currentPatientUser}
        unreviewedAlertsCount={unreviewedAlertCount}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 flex flex-col">
        {/* CARE WORKER WORKSPACE LAYOUT (With Sidebar) */}
        {isCareWorkerWorkspace ? (
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col md:flex-row gap-6">
            <Sidebar
              activePage={activePage}
              onNavigate={setActivePage}
              alertCount={unreviewedAlertCount}
              onLogout={() => setActivePage('page1_landing')}
            />

            <div className="flex-1 min-w-0">
              {activePage === 'page3_cw_dashboard' && (
                <Page3CareWorkerDashboard
                  careWorker={careWorker}
                  patients={patients}
                  alerts={alerts}
                  onNavigate={setActivePage}
                  onSelectPatient={handleSelectPatient}
                />
              )}

              {activePage === 'page4_patients' && (
                <Page4PatientManagement
                  patients={patients}
                  onSelectPatient={handleSelectPatient}
                  onAddNewPatient={() => setActivePage('page5_add_patient')}
                />
              )}

              {activePage === 'page5_add_patient' && (
                <Page5AddNewPatient
                  careWorker={careWorker}
                  existingPatientCount={patients.length}
                  onRegisterSuccess={handleRegisterSuccess}
                  onCancel={() => setActivePage('page4_patients')}
                />
              )}

              {activePage === 'page7_patient_profile' && (
                <Page7PatientProfile
                  patient={selectedPatient}
                  onBack={() => setActivePage('page4_patients')}
                  onNavigate={setActivePage}
                />
              )}

              {activePage === 'page8_alert_centre' && (
                <Page8AlertCentre
                  alerts={alerts}
                  patients={patients}
                  onNavigate={setActivePage}
                  onSelectPatientById={handleSelectPatientById}
                  onToggleReviewAlert={handleToggleReviewAlert}
                />
              )}

              {activePage === 'page12_reports' && (
                <Page12Reports
                  patients={patients}
                  careWorker={careWorker}
                  onNavigate={setActivePage}
                />
              )}
            </div>
          </div>
        ) : (
          /* STANDALONE LAYOUT (Landing, Logins, Patient Views, Success) */
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col justify-center">
            {activePage === 'page1_landing' && (
              <Page1Landing onNavigate={setActivePage} />
            )}

            {activePage === 'page2_cw_login' && (
              <Page2CareWorkerLogin
                onNavigate={setActivePage}
                onLoginSuccess={(cw) => setCareWorker(cw)}
              />
            )}

            {activePage === 'page6_patient_id' && (
              <Page6PatientIdGenerated
                patient={newlyRegisteredPatient || selectedPatient}
                onNavigate={setActivePage}
                onViewProfile={handleSelectPatient}
              />
            )}

            {activePage === 'page9_patient_login' && (
              <Page9PatientLogin
                patients={patients}
                onNavigate={setActivePage}
                onPatientLoginSuccess={(p) => setCurrentPatientUser(p)}
              />
            )}

            {activePage === 'page10_patient_dashboard' && (
              <Page10PatientDashboard
                patient={currentPatientUser}
                onNavigate={setActivePage}
                onTakeDoseAction={handleTakeDoseAction}
                onLogout={() => setActivePage('page1_landing')}
              />
            )}

            {activePage === 'page11_patient_history' && (
              <Page11PatientDoseHistory
                patient={currentPatientUser}
                onNavigate={setActivePage}
                onBack={() => setActivePage('page10_patient_dashboard')}
              />
            )}
          </div>
        )}
      </main>

      {/* Floating 12-Page Prototype Navigator Tool */}
      <aside 
        aria-label="Prototype 12-Page Navigator"
        className="fixed bottom-4 right-4 z-40"
      >
        <div className="relative">
          {showPageSwitcher && (
            <div className="absolute bottom-12 right-0 w-80 glass-panel rounded-2xl p-4 shadow-2xl border border-white/90 space-y-3 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-150 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Layers className="w-4 h-4 text-teal-600" />
                  <span>DoseSure 12-Page Navigator</span>
                </div>
                <button
                  onClick={() => setShowPageSwitcher(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-[11px] text-slate-500">
                Quickly switch between all 12 requested views:
              </p>

              <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                {pageDirectory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActivePage(item.id);
                      setShowPageSwitcher(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                      activePage === item.id
                        ? 'bg-teal-600 text-white font-bold'
                        : 'hover:bg-teal-50 text-slate-700'
                    }`}
                  >
                    <span className="truncate">
                      <strong>P{item.number}:</strong> {item.name}
                    </span>
                    <span className={`text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded ${
                      activePage === item.id
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setShowPageSwitcher(!showPageSwitcher)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold shadow-xl border border-white/20 backdrop-blur-md transition-all hover:scale-105"
          >
            <Layers className="w-4 h-4 text-teal-400" />
            <span>Switch Page ({pageDirectory.find(p => p.id === activePage)?.number || 1}/12)</span>
            {showPageSwitcher ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </aside>
    </BackgroundOverlay>
  );
}
