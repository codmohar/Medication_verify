import React from 'react';
import { PatientTable } from '../components/PatientTable';

export const Page4PatientManagement = ({
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
