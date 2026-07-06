import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';

const GetCare = lazy(() => import('./GetCare'));
const Appointments = lazy(() => import('./Appointments'));

export const sideMenu = {
  title: 'Consultas',
  menu: [
    { name: 'Solicitar Turno', href: '/get-care' },
    { name: 'Mis Turnos', href: '/get-care/appointments' },
  ],
};

export default function GetCareModule(): JSX.Element {
  return (
    <PageLayout sideMenu={sideMenu}>
      <Routes>
        <Route path="/" element={<GetCare />} />
        <Route path="appointments" element={<Appointments />} />
      </Routes>
    </PageLayout>
  );
}
