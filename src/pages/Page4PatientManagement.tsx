import React from 'react';
import { Patient, ActivePage } from '../types';
import { PatientTable } from '../components/PatientTable';

interface Page4PatientManagementProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onAddNewPatient: () => void;
}

export const Page4PatientManagement: React.FC<Page4PatientManagementProps> = ({
  patients,
  onSelectPatient,
  onAddNewPatient,
}) => {
  return (
    <div className="space-y-6">
      <PatientTable
        patients={patients}
        onSelectPatient={onSelectPatient}
        onAddNewPatient={onAddNewPatient}
      />
    </div>
  );
};
