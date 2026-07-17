import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';

const CheckIn = lazy(() => import('./CheckIn'));
const CheckInHistory = lazy(() => import('./CheckInHistory'));

export const sideMenu = {
  title: 'Check-in',
  menu: [
    { name: 'Nuevo Check-in', href: '/check-in' },
    { name: 'Mis Check-ins', href: '/check-in/history' },
  ],
};

export default function CheckInModule(): JSX.Element {
  return (
    <PageLayout sideMenu={sideMenu}>
      <Routes>
        <Route index element={<CheckIn />} />
        <Route path="history" element={<CheckInHistory />} />
      </Routes>
    </PageLayout>
  );
}
