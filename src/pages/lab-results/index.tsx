import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import { labMeasurementsMeta } from './LabMeasurement';

const LabResults = lazy(() => import('./LabResults'));
const LabMeasurement = lazy(() => import('./LabMeasurement'));

export const sideMenu = {
  title: 'Laboratorio',
  menu: [
    {
      name: 'Análisis',
      href: '/lab-results',
      subMenu: Object.values(labMeasurementsMeta).map(({ title, id }) => ({
        name: title,
        href: `/lab-results/${id}`,
      })),
    },
  ],
};

export default function LabResultsModule(): JSX.Element {
  return (
    <PageLayout sideMenu={sideMenu}>
      <Routes>
        <Route index element={<LabResults />} />
        <Route path=":measurementId" element={<LabMeasurement />} />
      </Routes>
    </PageLayout>
  );
}
