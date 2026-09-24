import React, { useState, useEffect, useCallback } from 'react';
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

// 12 Functional Pages (Converted to JSX)
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

import { Home } from 'lucide-react';

// Route slug mapping for standard web browser URL history & Chrome Back/Forward arrow navigation
const ROUTE_MAP = {
  page1_landing: 'landing',
  page2_cw_login: 'care-worker-login',
  page3_cw_dashboard: 'dashboard',
  page4_patients: 'patients',
  page5_add_patient: 'add-patient',
  page6_patient_id: 'patient-id',
  page7_patient_profile: 'patient-profile',
  page8_alert_centre: 'alerts',
  page9_patient_login: 'patient-login',
  page10_patient_dashboard: 'patient-dashboard',
  page11_patient_history: 'patient-history',
  page12_reports: 'reports',
};

const REVERSE_ROUTE_MAP = Object.fromEntries(
  Object.entries(ROUTE_MAP).map(([pageId, slug]) => [slug, pageId])
);

function getPageFromHash(hash) {
  const clean = (hash || '').replace(/^#\/?/, '').trim();
  if (!clean) return 'page1_landing';
  if (ROUTE_MAP[clean]) return clean;
  if (REVERSE_ROUTE_MAP[clean]) return REVERSE_ROUTE_MAP[clean];
  return 'page1_landing';
}

function getHashFromPage(pageId) {
  return ROUTE_MAP[pageId] || pageId || 'landing';
}

export default function App() {
  const [activePage, setActivePageState] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      return getPageFromHash(window.location.hash);
    }
    return 'page1_landing';
  });

  const [patients, setPatients] = useState(() => getInitialPatients());
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [careWorker, setCareWorker] = useState(CURRENT_CARE_WORKER);
  const [selectedPatient, setSelectedPatient] = useState(() => getInitialPatients()[0]);
  const [currentPatientUser, setCurrentPatientUser] = useState(() => getInitialPatients()[0]);
  const [newlyRegisteredPatient, setNewlyRegisteredPatient] = useState(null);

  // Navigate to a new page and record it in browser history for Chrome Back/Forward arrows
  const navigateToPage = useCallback((newPage, replace = false) => {
    setActivePageState(newPage);
    const slug = getHashFromPage(newPage);
    if (typeof window !== 'undefined') {
      const currentClean = (window.location.hash || '').replace(/^#\/?/, '');
      if (currentClean !== slug) {
        if (replace) {
          window.history.replaceState({ page: newPage }, '', `#${slug}`);
        } else {
          window.history.pushState({ page: newPage }, '', `#${slug}`);
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const setActivePage = navigateToPage;

  // Listen to Chrome Back & Forward browser arrow navigation (popstate & hashchange)
  useEffect(() => {
    const handlePopState = (event) => {
      const targetPage = event.state?.page || getPageFromHash(window.location.hash);
      setActivePageState(targetPage);
    };

    const handleHashChange = () => {
      const targetPage = getPageFromHash(window.location.hash);
      setActivePageState(targetPage);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);

    // Synchronize initial URL hash if empty
    if (typeof window !== 'undefined') {
      const initialSlug = getHashFromPage(activePage);
      if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#/') {
        window.history.replaceState({ page: activePage }, '', `#${initialSlug}`);
      }
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [activePage]);

  // Sync patients changes to persistence helper
  useEffect(() => {
    savePatients(patients);
  }, [patients]);

  // Handle Care Worker selecting a patient to view full profile
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setActivePage('page7_patient_profile');
  };

  const handleSelectPatientById = (patientId) => {
    const found = patients.find((p) => p.id === patientId);
    if (found) {
      setSelectedPatient(found);
      setActivePage('page7_patient_profile');
    }
  };

  // Handle successful registration in Page 5
  const handleRegisterSuccess = (newPatient) => {
    const updated = [newPatient, ...patients];
    setPatients(updated);
    setNewlyRegisteredPatient(newPatient);
    setSelectedPatient(newPatient);
    setActivePage('page6_patient_id');
  };

  // Handle Patient taking dose simulation on Page 10
  const handleTakeDoseAction = (patientId, slot, verificationResult) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;

        const isVerified = verificationResult ? verificationResult.verified : true;
        const evidenceStatus = isVerified ? 'INGESTION_CONSISTENT' : 'UNVERIFIED';
        const timingStatus = isVerified ? 'ON_TIME' : 'MISSED';
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

        const newRecord = {
          id: `rec-${Date.now()}`,
          date: todayDate,
          scheduledTime: slot === 'Morning' ? '08:00 AM' : '08:00 PM',
          eventTime: nowTime,
          doseSlot: slot,
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

        const updatedPatient = {
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
  const handleToggleReviewAlert = (alertId) => {
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

      {/* Return to Initial Page Floating Button */}
      {activePage !== 'page1_landing' && (
        <aside 
          aria-label="Return to Initial Page"
          className="fixed bottom-5 right-5 z-40"
        >
          <button
            id="return-to-initial-page-btn"
            onClick={() => setActivePage('page1_landing')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/90 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold shadow-xl border border-white/20 backdrop-blur-md transition-all hover:scale-105 cursor-pointer group"
            title="Return to Initial Page / Role Selection"
          >
            <Home className="w-4 h-4 text-teal-400 group-hover:text-white transition-colors" />
            <span>Initial Page</span>
          </button>
        </aside>
      )}
    </BackgroundOverlay>
  );
}
