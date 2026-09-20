import React, { useState } from 'react';
import { 
  User, 
  Pill, 
  Cpu, 
  Bell, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle,
  Building,
  Calendar,
  Phone,
  Shield,
  Clock,
  Sparkles
} from 'lucide-react';
import { Patient, ActivePage, CareWorker } from '../types';
import { generateNextPatientId } from '../utils/helpers';

interface Page5AddNewPatientProps {
  careWorker: CareWorker;
  existingPatientCount: number;
  onRegisterSuccess: (newPatient: Patient) => void;
  onCancel: () => void;
}

export const Page5AddNewPatient: React.FC<Page5AddNewPatientProps> = ({
  careWorker,
  existingPatientCount,
  onRegisterSuccess,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [validationError, setValidationError] = useState('');

  // Step 1: Personal Details
  const [fullName, setFullName] = useState('Deepak Sharma');
  const [age, setAge] = useState<number>(38);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dateOfBirth, setDateOfBirth] = useState('1988-04-16');
  const [phoneNumber, setPhoneNumber] = useState('+91 98761 12345');
  const [address, setAddress] = useState('H-42, Vikas Puri, West Delhi');
  const [emergencyContactName, setEmergencyContactName] = useState('Sunita Sharma (Wife)');
  const [emergencyContactNumber, setEmergencyContactNumber] = useState('+91 98761 12346');

  // Step 2: Treatment Details
  const [treatment, setTreatment] = useState('Pulmonary Tuberculosis (Category 1 - 2HREZ/4HR)');
  const [treatmentStartDate, setTreatmentStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedTreatmentEndDate, setExpectedTreatmentEndDate] = useState('2027-03-16');
  const [medicationName, setMedicationName] = useState('4-FDC (Rifampicin + Isoniazid + Pyrazinamide + Ethambutol)');
  const [dosesPerDay, setDosesPerDay] = useState<number>(2);
  const [prescribedTimes, setPrescribedTimes] = useState<string>('08:00 AM, 08:00 PM');
  const [allowedDoseWindowMinutes, setAllowedDoseWindowMinutes] = useState<number>(60);
  const [doctorName, setDoctorName] = useState(careWorker.name);
  const [treatmentCentre, setTreatmentCentre] = useState(careWorker.centre);

  // Step 3: Device Assignment
  const nextPillboxNum = String(10 + existingCountSafe(existingPatientCount)).padStart(2, '0');
  const [pillboxId, setPillboxId] = useState(`DSBOX-${nextPillboxNum}`);
  const [compartments, setCompartments] = useState<number>(14);
  const [esp32Status, setEsp32Status] = useState<'Online' | 'Offline' | 'Testing'>('Online');
  const [lastSync, setLastSync] = useState('Just now (Testing Signal OK)');
  const [verificationMethod, setVerificationMethod] = useState<'Smart Pillbox Access' | 'Camera-Assisted Verification' | 'Both'>('Both');

  // Step 4: Caregiver / Notification Details
  const [caregiverName, setCaregiverName] = useState('Sunita Sharma');
  const [caregiverRelationship, setCaregiverRelationship] = useState('Spouse');
  const [whatsAppNumber, setWhatsAppNumber] = useState('+91 98761 12346');
  const [prefTaken, setPrefTaken] = useState(true);
  const [prefLate, setPrefLate] = useState(true);
  const [prefMissed, setPrefMissed] = useState(true);
  const [prefFailed, setPrefFailed] = useState(true);
  const [prefOffline, setPrefOffline] = useState(true);
  const [consentGiven, setConsentGiven] = useState(true);

  function existingCountSafe(count: number) {
    return Math.max(1, count);
  }

  const validateStep = (step: number): boolean => {
    setValidationError('');
    if (step === 1) {
      if (!fullName.trim() || !age || !dateOfBirth || !address.trim() || !emergencyContactName.trim() || !emergencyContactNumber.trim()) {
        setValidationError('Please complete all required personal details before continuing.');
        return false;
      }
    }
    if (step === 2) {
      if (!treatment.trim() || !medicationName.trim() || !treatmentStartDate || !expectedTreatmentEndDate || !doctorName.trim()) {
        setValidationError('Please complete all treatment details.');
        return false;
      }
    }
    if (step === 3) {
      if (!pillboxId.trim()) {
        setValidationError('Please enter or assign a Smart Pillbox ID.');
        return false;
      }
    }
    if (step === 4) {
      if (!caregiverName.trim() || !whatsAppNumber.trim()) {
        setValidationError('Caregiver name and WhatsApp number are required for automated adherence safety alerts.');
        return false;
      }
      if (!consentGiven) {
        setValidationError('Consent for caregiver notifications and adherence data handling is required.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(5, prev + 1) as 1 | 2 | 3 | 4 | 5);
    }
  };

  const handleBack = () => {
    setValidationError('');
    setCurrentStep((prev) => Math.max(1, prev - 1) as 1 | 2 | 3 | 4 | 5);
  };

  const handleFinalSubmit = () => {
    const generatedId = generateNextPatientId(existingPatientCount);
    const timesArray = prescribedTimes.split(',').map((t) => t.trim());

    const newPatient: Patient = {
      id: generatedId,
      authPin: '1234',
      fullName,
      age: Number(age),
      gender,
      dateOfBirth,
      phoneNumber,
      address,
      emergencyContactName,
      emergencyContactNumber,
      treatment,
      treatmentStartDate,
      expectedTreatmentEndDate,
      medicationName,
      dosesPerDay: Number(dosesPerDay),
      prescribedTimes: timesArray.length > 0 ? timesArray : ['08:00 AM', '08:00 PM'],
      allowedDoseWindowMinutes: Number(allowedDoseWindowMinutes),
      doctorName,
      treatmentCentre,
      pillboxId,
      compartments: Number(compartments),
      esp32Status,
      lastSync,
      verificationMethod,
      deviceStatusDetails: {
        deviceId: pillboxId,
        esp32Status: 'Online',
        cameraStatus: verificationMethod === 'Smart Pillbox Access' ? 'Disabled' : 'Active',
        internetStatus: 'Connected (WiFi)',
        lastSync: 'Device paired just now',
        batteryPercentage: 98,
        firmwareVersion: 'v2.4.1-esp32-cv',
        compartmentCount: Number(compartments),
      },
      caregiverName,
      caregiverRelationship,
      whatsAppNumber,
      notificationPreferences: {
        doseTaken: prefTaken,
        doseLate: prefLate,
        doseMissed: prefMissed,
        verificationFailed: prefFailed,
        deviceOffline: prefOffline,
      },
      consentGiven,
      assignedCareWorker: careWorker.name,
      careWorkerId: careWorker.id,
      adherencePercentage: 100,
      currentStreakDays: 1,
      status: 'On Track',
      todayDoses: [
        {
          slot: 'Morning',
          scheduledTime: timesArray[0] || '08:00 AM',
          timingStatus: 'PENDING',
          verificationEvidence: 'UNVERIFIED',
        },
        {
          slot: 'Evening',
          scheduledTime: timesArray[1] || '08:00 PM',
          timingStatus: 'PENDING',
          verificationEvidence: 'UNVERIFIED',
        },
      ],
      history: [],
    };

    onRegisterSuccess(newPatient);
  };

  const steps = [
    { num: 1, label: 'Personal Details', icon: User },
    { num: 2, label: 'Treatment Details', icon: Pill },
    { num: 3, label: 'Device Assignment', icon: Cpu },
    { num: 4, label: 'Caregiver & Alerts', icon: Bell },
    { num: 5, label: 'Review & Register', icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Top Header Card */}
      <div className="glass-panel p-6 rounded-3xl border border-white/80 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Registration Wizard
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-semibold">Step {currentStep} of 5</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Register New DOTS Patient
          </h1>
          <p className="text-xs text-slate-600">
            Assign smart pillbox & configure verified adherence monitoring
          </p>
        </div>

        <button
          onClick={onCancel}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white/70 hover:bg-white border border-slate-200 transition-colors"
        >
          Cancel Registration
        </button>
      </div>

      {/* Step Indicator Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/70 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between min-w-[580px]">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <React.Fragment key={step.num}>
                <div 
                  onClick={() => {
                    if (step.num < currentStep) setCurrentStep(step.num as any);
                  }}
                  className={`flex items-center gap-2 cursor-pointer transition-all ${
                    isCurrent 
                      ? 'text-teal-700 font-bold' 
                      : isCompleted 
                      ? 'text-emerald-700 font-medium' 
                      : 'text-slate-400'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                    isCurrent
                      ? 'bg-teal-600 text-white shadow-teal-700/20 ring-2 ring-teal-200'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className="text-xs tracking-tight whitespace-nowrap">{step.label}</span>
                </div>

                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    currentStep > step.num ? 'bg-emerald-400' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-4 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Step Form Container */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xl">
        
        {/* ================= STEP 1: PERSONAL DETAILS ================= */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="pb-3 border-b border-slate-200/70">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-teal-600" /> Step 1: Personal Details
              </h3>
              <p className="text-xs text-slate-500">
                Primary patient demographic and emergency contact records
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl glass-input focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age *</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full p-2.5 text-xs rounded-xl glass-input focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full p-2.5 text-xs rounded-xl glass-input focus:outline-none bg-white font-medium"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl glass-input focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98112 34567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl glass-input focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="House / Street / City / PIN"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl glass-input focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunita Sharma (Wife)"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl glass-input focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 00000"
                  value={emergencyContactNumber}
                  onChange={(e) => setEmergencyContactNumber(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl glass-input focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: TREATMENT DETAILS ================= */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="pb-3 border-b border-slate-200/70">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-600" /> Step 2: Treatment Details
              </h3>
              <p className="text-xs text-slate-500">
                Default configured for TB DOTS therapy; adaptable for other chronic regimens
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Treatment / Disease *</label>
                <input
                  type="text"
                  required
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl glass-input focus:outline-none font-semibold text-teal-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Treatment Start Date *</label>
                <input
                  type="date"
                  required
                  value={treatmentStartDate}
                  onChange={(e) => setTreatmentStartDate(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl glass-input focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expected Treatment End Date *</label>
                <input
                  type="date"
                  required
                  value={expectedTreatmentEndDate}
                  onChange={(e) => setExpectedTreatmentEndDate(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl glass-input focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Medication Name & Formulation *</label>
                <input
                  type="text"
                  required
                  value={medicationName}
                  onChange={(e) => setMedicationName(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl glass-input focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Number of Doses per Day *</label>
                <select
                  value={dosesPerDay}
                  onChange={(e) => setDosesPerDay(Number(e.target.value))}
                  className="w-full p-2.5 text-xs rounded-xl glass-input focus:outline-none bg-white font-semibold"
                >
                  <option value={1}>1 Dose / Day</option>
                  <option value={2}>2 Doses / Day (Morning & Evening)</option>
                  <option value={3}>3 Doses / Day</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Prescribed Dose Times *</label>
                <input
                  type="text"
                  placeholder="e.g. 08:00 AM, 08:00 PM"
                  value={prescribedTimes}
                  onChange={(e) => setPrescribedTimes(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl glass-input focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Allowed Dose Window (Minutes) *</label>
                <input
                  type="number"
                  min="15"
                  max="180"
                  value={allowedDoseWindowMinutes}
                  onChange={(e) => setAllowedDoseWindowMinutes(Number(e.target.value))}
                  className="w-full p-2.5 text-xs rounded-xl glass-input focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Dose taken within ±{allowedDoseWindowMinutes} min is ON TIME; past window is LATE.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doctor / Medical Officer *</label>
                <input
                  type="text"
                  required
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl glass-input focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Treatment Centre *</label>
                <input
                  type="text"
                  required
                  value={treatmentCentre}
                  onChange={(e) => setTreatmentCentre(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl glass-input focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: DEVICE ASSIGNMENT ================= */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="pb-3 border-b border-slate-200/70">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-teal-600" /> Step 3: Smart Device Assignment
              </h3>
              <p className="text-xs text-slate-500">
                Pair the patient with an ESP32-enabled smart pillbox & computer-vision sensor
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Smart Pillbox ID *</label>
                <input
                  type="text"
                  required
                  value={pillboxId}
                  onChange={(e) => setPillboxId(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl glass-input focus:outline-none font-mono font-bold text-teal-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Number of Compartments *</label>
                <select
                  value={compartments}
                  onChange={(e) => setCompartments(Number(e.target.value))}
                  className="w-full p-2.5 text-xs rounded-xl glass-input focus:outline-none bg-white font-semibold"
                >
                  <option value={7}>7 Compartments (1 Week Single-Dose)</option>
                  <option value={14}>14 Compartments (1 Week AM/PM or 2-Week Single)</option>
                  <option value={28}>28 Compartments (Monthly)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ESP32 Device Status</label>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>{esp32Status} (Heartbeat Acknowledged via MQTT)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Last Synchronization</label>
                <input
                  type="text"
                  readOnly
                  value={lastSync}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-100 text-slate-600 border border-slate-200 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Verification Method Protocol *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['Smart Pillbox Access', 'Camera-Assisted Verification', 'Both'] as const).map((method) => (
                    <label
                      key={method}
                      onClick={() => setVerificationMethod(method)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        verificationMethod === method
                          ? 'border-teal-600 bg-teal-50/80 shadow-xs'
                          : 'border-slate-200 bg-white/70 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-slate-900">{method}</span>
                        <input
                          type="radio"
                          name="verificationMethod"
                          checked={verificationMethod === method}
                          onChange={() => setVerificationMethod(method)}
                          className="accent-teal-600"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {method === 'Smart Pillbox Access' && 'Records compartment open/close switch triggers only.'}
                        {method === 'Camera-Assisted Verification' && 'Computer vision tracks face & ingestion motion sequence.'}
                        {method === 'Both' && 'Dual verification: Physical box access + Vision ingestion consistency.'}
                      </p>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: CAREGIVER & NOTIFICATIONS ================= */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="pb-3 border-b border-slate-200/70">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-teal-600" /> Step 4: Caregiver & Notification Details
              </h3>
              <p className="text-xs text-slate-500">
                Configure real-time WhatsApp adherence alerts for immediate intervention
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Caregiver Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunita Sharma"
                  value={caregiverName}
                  onChange={(e) => setCaregiverName(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl glass-input focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Relationship to Patient *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spouse / Parent / Daughter"
                  value={caregiverRelationship}
                  onChange={(e) => setCaregiverRelationship(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl glass-input focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Caregiver WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210 (Country code included)"
                  value={whatsAppNumber}
                  onChange={(e) => setWhatsAppNumber(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl glass-input focus:outline-none font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Automated alerts will be dispatched via DoseSure WhatsApp Gateway.
                </span>
              </div>

              {/* Checkboxes */}
              <div className="sm:col-span-2 space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Notification Preference Triggers:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-white/70 border border-slate-200 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefTaken}
                      onChange={(e) => setPrefTaken(e.target.checked)}
                      className="accent-teal-600 rounded"
                    />
                    <span>Dose Taken (Confirmation)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-white/70 border border-slate-200 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefLate}
                      onChange={(e) => setPrefLate(e.target.checked)}
                      className="accent-teal-600 rounded"
                    />
                    <span>Dose Late (Window Exceeded)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-white/70 border border-slate-200 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefMissed}
                      onChange={(e) => setPrefMissed(e.target.checked)}
                      className="accent-teal-600 rounded"
                    />
                    <span>Dose Missed (High Priority)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-white/70 border border-slate-200 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefFailed}
                      onChange={(e) => setPrefFailed(e.target.checked)}
                      className="accent-teal-600 rounded"
                    />
                    <span>Verification Failed (Optical/Sensor)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-white/70 border border-slate-200 text-xs font-medium cursor-pointer sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={prefOffline}
                      onChange={(e) => setPrefOffline(e.target.checked)}
                      className="accent-teal-600 rounded"
                    />
                    <span>Device Offline / Low Battery Warning</span>
                  </label>
                </div>
              </div>

              {/* Consent check */}
              <div className="sm:col-span-2 pt-3 border-t border-slate-200/70">
                <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-teal-50/70 border border-teal-200 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="accent-teal-600 mt-0.5 rounded"
                  />
                  <div className="text-xs text-slate-700 leading-relaxed">
                    <strong className="text-teal-900 block mb-0.5">
                      Patient & Caregiver Adherence Data Consent *
                    </strong>
                    I confirm that the patient and caregiver have provided voluntary, informed consent for receiving automated medication reminders, WhatsApp alerts, and for handling adherence telemetry in accordance with NTEP clinical guidelines.
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 5: REVIEW & REGISTER ================= */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="pb-3 border-b border-slate-200/70">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Step 5: Review Patient Registration
              </h3>
              <p className="text-xs text-slate-500">
                Review all clinical and hardware parameters prior to generating authoritative Patient ID
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Personal Summary */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="font-bold text-slate-900">Personal Details</span>
                  <button onClick={() => setCurrentStep(1)} className="text-teal-700 font-bold hover:underline text-[11px]">Edit</button>
                </div>
                <div><span className="text-slate-500">Full Name:</span> <strong className="text-slate-800">{fullName}</strong></div>
                <div><span className="text-slate-500">Age & Gender:</span> <span className="text-slate-800 font-medium">{age} yrs, {gender} (DOB: {dateOfBirth})</span></div>
                <div><span className="text-slate-500">Phone:</span> <span className="text-slate-800 font-medium">{phoneNumber || 'Not provided'}</span></div>
                <div><span className="text-slate-500">Address:</span> <span className="text-slate-800 font-medium">{address}</span></div>
                <div><span className="text-slate-500">Emergency:</span> <span className="text-slate-800 font-medium">{emergencyContactName} ({emergencyContactNumber})</span></div>
              </div>

              {/* Treatment Summary */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="font-bold text-slate-900">Treatment Plan</span>
                  <button onClick={() => setCurrentStep(2)} className="text-teal-700 font-bold hover:underline text-[11px]">Edit</button>
                </div>
                <div><span className="text-slate-500">Regimen:</span> <strong className="text-teal-900">{treatment}</strong></div>
                <div><span className="text-slate-500">Medication:</span> <span className="text-slate-800 font-medium">{medicationName}</span></div>
                <div><span className="text-slate-500">Schedule:</span> <span className="text-slate-800 font-medium">{dosesPerDay} doses/day ({prescribedTimes})</span></div>
                <div><span className="text-slate-500">Duration:</span> <span className="text-slate-800 font-medium">{treatmentStartDate} to {expectedTreatmentEndDate}</span></div>
                <div><span className="text-slate-500">Supervising Doctor:</span> <span className="text-slate-800 font-medium">{doctorName}</span></div>
              </div>

              {/* Device Summary */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="font-bold text-slate-900">Hardware & Telemetry</span>
                  <button onClick={() => setCurrentStep(3)} className="text-teal-700 font-bold hover:underline text-[11px]">Edit</button>
                </div>
                <div><span className="text-slate-500">Assigned Pillbox:</span> <strong className="font-mono text-teal-800">{pillboxId}</strong> ({compartments} compartments)</div>
                <div><span className="text-slate-500">Verification Protocol:</span> <span className="text-slate-800 font-semibold">{verificationMethod}</span></div>
                <div><span className="text-slate-500">ESP32 Status:</span> <span className="text-emerald-700 font-bold">Online / Ready</span></div>
              </div>

              {/* Caregiver Summary */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="font-bold text-slate-900">Caregiver Notifications</span>
                  <button onClick={() => setCurrentStep(4)} className="text-teal-700 font-bold hover:underline text-[11px]">Edit</button>
                </div>
                <div><span className="text-slate-500">Caregiver:</span> <strong className="text-slate-800">{caregiverName} ({caregiverRelationship})</strong></div>
                <div><span className="text-slate-500">WhatsApp Alert Number:</span> <span className="font-mono font-bold text-emerald-700">{whatsAppNumber}</span></div>
                <div><span className="text-slate-500">Consent Verified:</span> <span className="text-emerald-700 font-bold">Yes, Informed Consent Recorded</span></div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs">
              <strong className="block mb-1">Authoritative Patient ID Generation</strong>
              Upon submission, DoseSure generates a unique cryptographic patient ID (e.g. <code>DS-TB-XXXX</code>) linked to pillbox <code>{pillboxId}</code>. This ID connects the care-worker dashboard with the patient adherence portal.
            </div>
          </div>
        )}

        {/* Navigation & Submit Buttons Row */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200/70">
          {currentStep > 1 ? (
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-700/20 transition-all hover:scale-102"
            >
              <span>Continue to Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-register-patient-submit"
              onClick={handleFinalSubmit}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-extrabold text-xs shadow-lg shadow-teal-700/25 transition-all hover:scale-102"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Register Patient & Generate ID</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
