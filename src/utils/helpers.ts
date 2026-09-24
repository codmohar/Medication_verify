import { TimingStatus, VerificationEvidence, AlertSeverity, AlertType, Patient } from '../types';

export function generateNextPatientId(existingCount: number): string {
  const number = 1026 + existingCount;
  return `DS-TB-${number}`;
}

export function getTimingStatusConfig(status: TimingStatus) {
  switch (status) {
    case 'ON_TIME':
      return {
        label: 'ON TIME',
        bg: 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30',
        dot: 'bg-emerald-500',
        border: 'border-emerald-500',
        text: 'text-emerald-700',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        description: 'Dose taken within prescribed protocol window',
      };
    case 'LATE':
      return {
        label: 'LATE',
        bg: 'bg-amber-500/15 text-amber-800 border-amber-500/30',
        dot: 'bg-amber-500',
        border: 'border-amber-500',
        text: 'text-amber-700',
        badge: 'bg-amber-100 text-amber-800 border-amber-300',
        description: 'Dose taken beyond prescribed window',
      };
    case 'MISSED':
      return {
        label: 'MISSED',
        bg: 'bg-rose-500/15 text-rose-800 border-rose-500/30',
        dot: 'bg-rose-500',
        border: 'border-rose-500',
        text: 'text-rose-700',
        badge: 'bg-rose-100 text-rose-800 border-rose-300',
        description: 'No pillbox access recorded during schedule',
      };
    case 'PENDING':
    default:
      return {
        label: 'PENDING',
        bg: 'bg-sky-500/15 text-sky-800 border-sky-500/30',
        dot: 'bg-sky-500',
        border: 'border-sky-500',
        text: 'text-sky-700',
        badge: 'bg-sky-100 text-sky-800 border-sky-300',
        description: 'Scheduled dose upcoming or awaiting telemetry sync',
      };
  }
}

export function getVerificationEvidenceConfig(evidence: VerificationEvidence) {
  switch (evidence) {
    case 'INGESTION_CONSISTENT':
      return {
        label: 'INGESTION-CONSISTENT',
        patientFriendly: 'Dose verification completed',
        bg: 'bg-teal-500/15 text-teal-800 border-teal-500/30',
        iconColor: 'text-teal-600',
        description: 'ESP32 compartment access + camera computer-vision facial ingestion sequence detected.',
      };
    case 'ACCESS_VERIFIED':
      return {
        label: 'ACCESS VERIFIED',
        patientFriendly: 'Smart pillbox access recorded',
        bg: 'bg-blue-500/15 text-blue-800 border-blue-500/30',
        iconColor: 'text-blue-600',
        description: 'ESP32 sensor confirmed pillbox compartment open/close. Optical video unverified or not equipped.',
      };
    case 'RETRY_REQUIRED':
      return {
        label: 'RETRY REQUIRED',
        patientFriendly: 'Verification retry needed',
        bg: 'bg-amber-500/15 text-amber-800 border-amber-500/30',
        iconColor: 'text-amber-600',
        description: 'Movement obscured by angle or poor lighting; pillbox opened but camera sequence inconclusive.',
      };
    case 'UNVERIFIED':
    default:
      return {
        label: 'UNVERIFIED',
        patientFriendly: 'Not yet verified',
        bg: 'bg-slate-500/15 text-slate-700 border-slate-500/30',
        iconColor: 'text-slate-500',
        description: 'No telemetry or computer-vision sequence received for this slot.',
      };
  }
}

export function getAlertSeverityConfig(severity: AlertSeverity) {
  switch (severity) {
    case 'CRITICAL':
      return {
        badge: 'bg-rose-100 text-rose-800 border-rose-300',
        border: 'border-l-rose-500',
        cardBg: 'bg-rose-50/60',
      };
    case 'WARNING':
      return {
        badge: 'bg-amber-100 text-amber-800 border-amber-300',
        border: 'border-l-amber-500',
        cardBg: 'bg-amber-50/60',
      };
    case 'INFO':
    default:
      return {
        badge: 'bg-sky-100 text-sky-800 border-sky-300',
        border: 'border-l-sky-500',
        cardBg: 'bg-sky-50/60',
      };
  }
}

export function getAlertTypeConfig(type: AlertType) {
  switch (type) {
    case 'MISSED_DOSE':
      return { label: 'MISSED DOSE', icon: 'AlertCircle', color: 'text-rose-600' };
    case 'LATE_DOSE':
      return { label: 'LATE DOSE', icon: 'Clock', color: 'text-amber-600' };
    case 'VERIFICATION_FAILED':
      return { label: 'VERIFICATION FAILED', icon: 'CameraOff', color: 'text-amber-700' };
    case 'DEVICE_OFFLINE':
      return { label: 'DEVICE OFFLINE', icon: 'WifiOff', color: 'text-rose-700' };
    case 'SYNC_PENDING':
      return { label: 'SYNC PENDING', icon: 'RefreshCw', color: 'text-sky-600' };
  }
}

export function generateWhatsAppMessage(patientName: string, patientId: string, alertType: string, time: string): string {
  return encodeURIComponent(
    `*DoseSure Automated Care Alert*\n` +
    `Hello,\n` +
    `This is an adherence notification regarding patient *${patientName}* (ID: ${patientId}).\n` +
    `Alert Event: *${alertType}* at ${time}.\n` +
    `Please ensure the patient has taken their prescribed TB medication dose or contact your assigned DOTS field worker.\n` +
    `DoseSure – Right Dose. Right Time. Verified.`
  );
}

export function formatTimeRemaining(): string {
  // Return realistic remaining time to next 08:00 PM dose
  const now = new Date();
  const target = new Date();
  target.setHours(20, 0, 0, 0); // 8:00 PM
  
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) {
    return '01h 45m';
  }
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
}

export function parseTimeToHourMinute(timeStr?: string, defaultHour: number = 8, defaultMinute: number = 0): { hour: number; minute: number } {
  if (!timeStr) return { hour: defaultHour, minute: defaultMinute };
  const cleaned = timeStr.trim().toUpperCase();
  const isPM = cleaned.includes('PM');
  const isAM = cleaned.includes('AM');
  const match = cleaned.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    if (isPM && hour < 12) hour += 12;
    if (isAM && hour === 12) hour = 0;
    return { hour, minute };
  }
  return { hour: defaultHour, minute: defaultMinute };
}

export function generatePatientESP32Code(
  patient: Patient,
  customConfig?: {
    ssid?: string;
    password?: string;
    dose1Hour?: number;
    dose1Minute?: number;
    dose2Hour?: number;
    dose2Minute?: number;
    doseWindowMinutes?: number;
    ldr1Threshold?: number;
    ldr2Threshold?: number;
  }
): string {
  const morningDose = patient.todayDoses?.find(d => d.slot === 'Morning')?.scheduledTime || patient.prescribedTimes?.[0] || '08:00 AM';
  const eveningDose = patient.todayDoses?.find(d => d.slot === 'Evening')?.scheduledTime || patient.prescribedTimes?.[1] || '08:00 PM';
  
  const parsed1 = parseTimeToHourMinute(morningDose, 8, 0);
  const parsed2 = parseTimeToHourMinute(eveningDose, 20, 0);

  const dose1Hour = customConfig?.dose1Hour ?? parsed1.hour;
  const dose1Minute = customConfig?.dose1Minute ?? parsed1.minute;
  const dose2Hour = customConfig?.dose2Hour ?? parsed2.hour;
  const dose2Minute = customConfig?.dose2Minute ?? parsed2.minute;

  const ssid = customConfig?.ssid ?? 'Galaxy A22 5G';
  const password = customConfig?.password ?? 'mohar466';
  const doseWindow = customConfig?.doseWindowMinutes ?? (patient.allowedDoseWindowMinutes || 30);
  const ldr1Thresh = customConfig?.ldr1Threshold ?? 1000;
  const ldr2Thresh = customConfig?.ldr2Threshold ?? 1000;

  return `// =====================================================
//              DOSESURE SMART PILLBOX FIRMWARE
// =====================================================
// Patient Name : ${patient.fullName}
// Patient ID   : ${patient.id}
// Pillbox ID   : ${patient.pillboxId || 'DSBOX-01'}
// Medication   : ${patient.medicationName || '4-FDC TB Treatment'}
// Schedule     : Compartment 1 (Morning): ${String(dose1Hour).padStart(2, '0')}:${String(dose1Minute).padStart(2, '0')}
//                Compartment 2 (Evening): ${String(dose2Hour).padStart(2, '0')}:${String(dose2Minute).padStart(2, '0')}
// Window       : ${doseWindow} Minutes
// =====================================================

#include <WiFi.h>
#include <time.h>

// =====================================================
//              DOSESURE HARDWARE CONFIG
// =====================================================

// LDR 1 - Compartment 1
const int LDR_1_PIN = 34;

// LDR 2 - Compartment 2
const int LDR_2_PIN = 35;

// LED 1 - indicates Compartment 1
const int LED_1_PIN = 25;

// LED 2 - indicates Compartment 2
const int LED_2_PIN = 26;

// Buzzer
const int BUZZER_PIN = 27;


// =====================================================
//                    WI-FI CONFIG
// =====================================================

const char* ssid = "${ssid}";
const char* password = "${password}";


// =====================================================
//                    TIME CONFIG
// =====================================================

// India = UTC + 5:30
const long gmtOffset_sec = 19800;

// India does not use daylight saving time
const int daylightOffset_sec = 0;


// =====================================================
//                MEDICINE SCHEDULE
// =====================================================

// -----------------------------------------------------
// COMPARTMENT 1
// Example: ${String(dose1Hour).padStart(2, '0')}:${String(dose1Minute).padStart(2, '0')}
// -----------------------------------------------------

const int DOSE_1_HOUR = ${dose1Hour};
const int DOSE_1_MINUTE = ${dose1Minute};


// -----------------------------------------------------
// COMPARTMENT 2
// Example: ${String(dose2Hour).padStart(2, '0')}:${String(dose2Minute).padStart(2, '0')}
// -----------------------------------------------------

const int DOSE_2_HOUR = ${dose2Hour};
const int DOSE_2_MINUTE = ${dose2Minute};


// =====================================================
//                  DOSE TIME WINDOW
// =====================================================

// Patient has ${doseWindow} minutes to open the compartment

const int DOSE_WINDOW_MINUTES = ${doseWindow};


// =====================================================
//                    LDR CONFIG
// =====================================================

// Current assumption:
//
// DARK  -> LDR value <= threshold
// LIGHT -> LDR value > threshold
//
// You MUST calibrate these values using Serial Monitor.

const int LDR_1_THRESHOLD = ${ldr1Thresh};
const int LDR_2_THRESHOLD = ${ldr2Thresh};


// =====================================================
//                    SYSTEM STATUS
// =====================================================

bool timeSynced = false;


// =====================================================
//                COMPARTMENT 1 STATUS
// =====================================================

bool dose1Active = false;
bool dose1Taken = false;
bool dose1Missed = false;

// Becomes true only after the compartment is confirmed dark
bool dose1Armed = false;

int dose1Day = -1;


// =====================================================
//                COMPARTMENT 2 STATUS
// =====================================================

bool dose2Active = false;
bool dose2Taken = false;
bool dose2Missed = false;

// Becomes true only after the compartment is confirmed dark
bool dose2Armed = false;

int dose2Day = -1;


// =====================================================
//                NTP TIME SYNC FUNCTION
// =====================================================

void syncTimeFromNTP() {

  Serial.println();
  Serial.println("==========================================");
  Serial.println("          CONNECTING TO WI-FI");
  Serial.println("==========================================");

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  Serial.print("Connecting to: ");
  Serial.println(ssid);

  int attempts = 0;

  // Try Wi-Fi for approximately 15 seconds
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {

    delay(500);
    Serial.print(".");

    attempts++;
  }


  // ===================================================
  // Wi-Fi connected
  // ===================================================

  if (WiFi.status() == WL_CONNECTED) {

    Serial.println();
    Serial.println();
    Serial.println("Wi-Fi Connected!");

    Serial.print("ESP32 IP Address: ");
    Serial.println(WiFi.localIP());


    // Configure NTP
    configTime(
      gmtOffset_sec,
      daylightOffset_sec,
      "pool.ntp.org",
      "time.nist.gov"
    );


    Serial.println();
    Serial.print("Synchronizing time with NTP");

    struct tm timeinfo;

    int ntpAttempts = 0;

    // Wait maximum ~15 seconds for NTP
    while (!getLocalTime(&timeinfo) && ntpAttempts < 30) {

      Serial.print(".");
      delay(500);

      ntpAttempts++;
    }


    // =================================================
    // NTP successful
    // =================================================

    if (getLocalTime(&timeinfo)) {

      timeSynced = true;

      Serial.println();
      Serial.println();
      Serial.println("Time synchronized successfully!");

      Serial.println(
        &timeinfo,
        "Current Time: %Y-%m-%d %H:%M:%S"
      );
    }


    // =================================================
    // NTP failed
    // =================================================

    else {

      Serial.println();
      Serial.println();
      Serial.println("NTP synchronization FAILED.");
    }
  }


  // ===================================================
  // Wi-Fi connection failed
  // ===================================================

  else {

    Serial.println();
    Serial.println();
    Serial.println("Wi-Fi connection FAILED.");

    Serial.println(
      "Continuing without network synchronization."
    );
  }


  // ===================================================
  // Turn Wi-Fi OFF
  // ===================================================

  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);

  Serial.println();
  Serial.println("Wi-Fi turned OFF.");

  if (timeSynced) {

    Serial.println(
      "ESP32 clock will now continue running offline."
    );
  }

  else {

    Serial.println(
      "WARNING: Correct time was not obtained."
    );
  }

  Serial.println();
}


// =====================================================
//                  UPDATE BUZZER
// =====================================================

void updateBuzzer() {

  // Buzzer remains ON if at least one compartment
  // is currently waiting for the patient.

  if (dose1Active || dose2Active) {

    digitalWrite(BUZZER_PIN, HIGH);
  }

  else {

    digitalWrite(BUZZER_PIN, LOW);
  }
}


// =====================================================
//              START COMPARTMENT 1 DOSE
// =====================================================

void startDose1(int ldrValue) {

  dose1Active = true;
  dose1Taken = false;
  dose1Missed = false;


  // The compartment should normally be dark
  // before the patient opens it.

  if (ldrValue <= LDR_1_THRESHOLD) {

    dose1Armed = true;

    Serial.println(
      "Dose 1 LDR: DARK - READY FOR OPENING"
    );
  }

  else {

    dose1Armed = false;

    Serial.println(
      "Dose 1 LDR: LIGHT - WAITING FOR DARK STATE"
    );
  }


  // Turn ON LED 1
  digitalWrite(LED_1_PIN, HIGH);

  // Turn ON buzzer
  updateBuzzer();


  Serial.println();
  Serial.println("******************************************");
  Serial.println("       DOSE 1 TIME REACHED");
  Serial.println("       OPEN COMPARTMENT 1");
  Serial.println("       LED 1 = ON");
  Serial.println("       BUZZER = ON");
  Serial.println("       30 MINUTE WINDOW STARTED");
  Serial.println("******************************************");
  Serial.println();
}


// =====================================================
//              START COMPARTMENT 2 DOSE
// =====================================================

void startDose2(int ldrValue) {

  dose2Active = true;
  dose2Taken = false;
  dose2Missed = false;


  // Compartment should normally be dark
  // before opening.

  if (ldrValue <= LDR_2_THRESHOLD) {

    dose2Armed = true;

    Serial.println(
      "Dose 2 LDR: DARK - READY FOR OPENING"
    );
  }

  else {

    dose2Armed = false;

    Serial.println(
      "Dose 2 LDR: LIGHT - WAITING FOR DARK STATE"
    );
  }


  // Turn ON LED 2
  digitalWrite(LED_2_PIN, HIGH);

  // Turn ON buzzer
  updateBuzzer();


  Serial.println();
  Serial.println("******************************************");
  Serial.println("       DOSE 2 TIME REACHED");
  Serial.println("       OPEN COMPARTMENT 2");
  Serial.println("       LED 2 = ON");
  Serial.println("       BUZZER = ON");
  Serial.println("       30 MINUTE WINDOW STARTED");
  Serial.println("******************************************");
  Serial.println();
}


// =====================================================
//              CHECK COMPARTMENT 1
// =====================================================

void checkDose1(
  int ldrValue,
  struct tm &timeinfo
) {

  int currentMinutes =
    timeinfo.tm_hour * 60 +
    timeinfo.tm_min;

  int scheduledMinutes =
    DOSE_1_HOUR * 60 +
    DOSE_1_MINUTE;

  int endMinutes =
    scheduledMinutes +
    DOSE_WINDOW_MINUTES;


  // ===================================================
  // NEW DAY
  // ===================================================

  if (dose1Day != timeinfo.tm_yday) {

    dose1Day = timeinfo.tm_yday;

    dose1Active = false;
    dose1Taken = false;
    dose1Missed = false;
    dose1Armed = false;

    digitalWrite(LED_1_PIN, LOW);
  }


  // ===================================================
  // START DOSE
  // ===================================================

  if (
    !dose1Taken &&
    !dose1Missed &&
    !dose1Active &&
    currentMinutes >= scheduledMinutes &&
    currentMinutes < endMinutes
  ) {

    startDose1(ldrValue);
  }


  // ===================================================
  // CHECK LDR WHILE DOSE IS ACTIVE
  // ===================================================

  if (dose1Active) {

    // -------------------------------------------------
    // First make sure compartment is dark
    // -------------------------------------------------

    if (!dose1Armed) {

      if (ldrValue <= LDR_1_THRESHOLD) {

        dose1Armed = true;

        Serial.println(
          "Dose 1 LDR: DARK - READY FOR OPENING"
        );
      }
    }


    // -------------------------------------------------
    // Now detect outside light
    // -------------------------------------------------

    if (
      dose1Armed &&
      ldrValue > LDR_1_THRESHOLD
    ) {

      // Compartment opening detected

      dose1Taken = true;
      dose1Active = false;


      // Turn OFF LED 1
      digitalWrite(LED_1_PIN, LOW);

      // Update buzzer.
      // If Dose 2 is also active, buzzer stays ON.
      updateBuzzer();


      Serial.println();
      Serial.println("******************************************");
      Serial.println("       DOSE 1 TAKEN");
      Serial.println("       LIGHT DETECTED");
      Serial.println("       COMPARTMENT 1 OPENED");
      Serial.println("       LED 1 = OFF");
      Serial.println("******************************************");
      Serial.println();
    }
  }


  // ===================================================
  // 30 MINUTES EXPIRED
  // ===================================================

  if (
    !dose1Taken &&
    !dose1Missed &&
    currentMinutes >= endMinutes
  ) {

    dose1Active = false;
    dose1Missed = true;


    // Turn OFF LED
    digitalWrite(LED_1_PIN, LOW);

    // Update buzzer
    updateBuzzer();


    Serial.println();
    Serial.println("******************************************");
    Serial.println("       DOSE 1 MISSED");
    Serial.println("       30 MINUTE WINDOW EXPIRED");
    Serial.println("       LED 1 = OFF");
    Serial.println("******************************************");
    Serial.println();
  }
}


// =====================================================
//              CHECK COMPARTMENT 2
// =====================================================

void checkDose2(
  int ldrValue,
  struct tm &timeinfo
) {

  int currentMinutes =
    timeinfo.tm_hour * 60 +
    timeinfo.tm_min;

  int scheduledMinutes =
    DOSE_2_HOUR * 60 +
    DOSE_2_MINUTE;

  int endMinutes =
    scheduledMinutes +
    DOSE_WINDOW_MINUTES;


  // ===================================================
  // NEW DAY
  // ===================================================

  if (dose2Day != timeinfo.tm_yday) {

    dose2Day = timeinfo.tm_yday;

    dose2Active = false;
    dose2Taken = false;
    dose2Missed = false;
    dose2Armed = false;

    digitalWrite(LED_2_PIN, LOW);
  }


  // ===================================================
  // START DOSE
  // ===================================================

  if (
    !dose2Taken &&
    !dose2Missed &&
    !dose2Active &&
    currentMinutes >= scheduledMinutes &&
    currentMinutes < endMinutes
  ) {

    startDose2(ldrValue);
  }


  // ===================================================
  // CHECK LDR WHILE DOSE IS ACTIVE
  // ===================================================

  if (dose2Active) {

    // -------------------------------------------------
    // First make sure compartment is dark
    // -------------------------------------------------

    if (!dose2Armed) {

      if (ldrValue <= LDR_2_THRESHOLD) {

        dose2Armed = true;

        Serial.println(
          "Dose 2 LDR: DARK - READY FOR OPENING"
        );
      }
    }


    // -------------------------------------------------
    // Detect outside light
    // -------------------------------------------------

    if (
      dose2Armed &&
      ldrValue > LDR_2_THRESHOLD
    ) {

      // Compartment opening detected

      dose2Taken = true;
      dose2Active = false;


      // Turn OFF LED 2
      digitalWrite(LED_2_PIN, LOW);

      // Update buzzer
      // If Dose 1 is also active, buzzer stays ON.
      updateBuzzer();


      Serial.println();
      Serial.println("******************************************");
      Serial.println("       DOSE 2 TAKEN");
      Serial.println("       LIGHT DETECTED");
      Serial.println("       COMPARTMENT 2 OPENED");
      Serial.println("       LED 2 = OFF");
      Serial.println("******************************************");
      Serial.println();
    }
  }


  // ===================================================
  // 30 MINUTES EXPIRED
  // ===================================================

  if (
    !dose2Taken &&
    !dose2Missed &&
    currentMinutes >= endMinutes
  ) {

    dose2Active = false;
    dose2Missed = true;


    // Turn OFF LED
    digitalWrite(LED_2_PIN, LOW);

    // Update buzzer
    updateBuzzer();


    Serial.println();
    Serial.println("******************************************");
    Serial.println("       DOSE 2 MISSED");
    Serial.println("       30 MINUTE WINDOW EXPIRED");
    Serial.println("       LED 2 = OFF");
    Serial.println("******************************************");
    Serial.println();
  }
}


// =====================================================
//                        SETUP
// =====================================================

void setup() {

  Serial.begin(115200);

  delay(1000);


  Serial.println();
  Serial.println("==========================================");
  Serial.println("           DOSESURE PILLBOX");
  Serial.println("==========================================");
  Serial.println();


  // ===================================================
  // Configure LDR pins
  // ===================================================

  pinMode(LDR_1_PIN, INPUT);
  pinMode(LDR_2_PIN, INPUT);


  // ===================================================
  // Configure LED pins
  // ===================================================

  pinMode(LED_1_PIN, OUTPUT);
  pinMode(LED_2_PIN, OUTPUT);

  digitalWrite(LED_1_PIN, LOW);
  digitalWrite(LED_2_PIN, LOW);


  // ===================================================
  // Configure buzzer
  // ===================================================

  pinMode(BUZZER_PIN, OUTPUT);

  digitalWrite(BUZZER_PIN, LOW);


  // ===================================================
  // Synchronize clock
  // ===================================================

  syncTimeFromNTP();


  Serial.println();
  Serial.println("==========================================");
  Serial.println("       STARTING SENSOR MONITORING");
  Serial.println("==========================================");
  Serial.println();
}


// =====================================================
//                         LOOP
// =====================================================

void loop() {

  // ===================================================
  // READ LDR 1
  // ===================================================

  int ldr1Value = analogRead(LDR_1_PIN);


  // ===================================================
  // READ LDR 2
  // ===================================================

  int ldr2Value = analogRead(LDR_2_PIN);


  // ===================================================
  // READ CURRENT TIME
  // ===================================================

  struct tm timeinfo;

  bool clockAvailable =
    getLocalTime(&timeinfo, 10);


  // ===================================================
  // PROCESS DOSES
  // ===================================================

  if (clockAvailable && timeSynced) {

    checkDose1(
      ldr1Value,
      timeinfo
    );

    checkDose2(
      ldr2Value,
      timeinfo
    );

    // Make sure buzzer represents current state
    updateBuzzer();
  }


  // ===================================================
  // DISPLAY SENSOR VALUES
  // ===================================================

  Serial.println("------------------------------------------");

  Serial.print("LDR 1      : ");
  Serial.println(ldr1Value);

  Serial.print("LDR 2      : ");
  Serial.println(ldr2Value);


  // ===================================================
  // DISPLAY CLOCK
  // ===================================================

  if (clockAvailable && timeSynced) {

    Serial.println(
      &timeinfo,
      "Time       : %Y-%m-%d %H:%M:%S"
    );
  }

  else {

    Serial.println(
      "Time       : Clock not synchronized"
    );
  }


  // ===================================================
  // DISPLAY DOSE 1 STATUS
  // ===================================================

  Serial.print("Dose 1     : ");

  if (dose1Taken) {

    Serial.println("TAKEN");
  }

  else if (dose1Active) {

    Serial.println("ACTIVE - OPEN BOX 1");
  }

  else if (dose1Missed) {

    Serial.println("MISSED");
  }

  else {

    Serial.println("WAITING");
  }


  // ===================================================
  // DISPLAY DOSE 2 STATUS
  // ===================================================

  Serial.print("Dose 2     : ");

  if (dose2Taken) {

    Serial.println("TAKEN");
  }

  else if (dose2Active) {

    Serial.println("ACTIVE - OPEN BOX 2");
  }

  else if (dose2Missed) {

    Serial.println("MISSED");
  }

  else {

    Serial.println("WAITING");
  }


  // ===================================================
  // DISPLAY BUZZER STATUS
  // ===================================================

  Serial.print("Buzzer     : ");

  if (dose1Active || dose2Active) {

    Serial.println("ON");
  }

  else {

    Serial.println("OFF");
  }


  Serial.println("------------------------------------------");
  Serial.println();


  // Read approximately every 500 ms
  delay(500);
}
`;
}
