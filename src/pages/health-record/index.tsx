import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import { measurementsMeta } from './Measurement';

const Vitals = lazy(() => import('./Vitals'));
const Measurement = lazy(() => import('./Measurement'));
const Medications = lazy(() => import('./Medications'));
const Medication = lazy(() => import('./Medication'));
const MedicationSuspension = lazy(() => import('./MedicationSuspension'));
const PrescriptionRenewal = lazy(() => import('./PrescriptionRenewal'));
const StudyRequests = lazy(() => import('./StudyRequests'));

export const sideMenu = {
  title: 'Registros de Salud',
  menu: [
    {
      name: 'Vitales',
      href: '/health-record/vitals',
      subMenu: Object.values(measurementsMeta).map(({ title, id }) => ({
        name: title,
        href: `/health-record/vitals/${id}`,
      })),
    },
    { name: 'Medicación', href: '/health-record/medications' },
    { name: 'Pedidos de Estudios', href: '/health-record/study-requests' },
  ],
};

export default function HealthRecord(): JSX.Element {
  return (
    <PageLayout sideMenu={sideMenu}>
      <Routes>
        <Route index element={<Navigate replace to={sideMenu.menu[0].href} />} />
        <Route path="vitals" element={<Vitals />} />
        <Route path="vitals/:measurementId" element={<Measurement />} />
        <Route path="medications" element={<Medications />} />
        <Route path="medications/:medicationId" element={<Medication />} />
        <Route path="medications/:medicationId/suspension" element={<MedicationSuspension />} />
        <Route path="medications/:medicationId/prescription-renewal" element={<PrescriptionRenewal />} />
        <Route path="study-requests" element={<StudyRequests />} />
      </Routes>
    </PageLayout>
  );
}
