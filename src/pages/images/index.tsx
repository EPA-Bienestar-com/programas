import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';

const ImageResults = lazy(() => import('./ImageResults'));
const EchoMeasurement = lazy(() => import('./EchoMeasurement'));

export const sideMenu = {
  title: 'Imágenes',
  menu: [
    {
      name: 'Ecocardiograma',
      href: '/images',
      subMenu: [
        { name: 'Ecocardiograma Basal', href: '/images/echo-basal' },
      ],
    },
  ],
};

export default function ImagesModule(): JSX.Element {
  return (
    <PageLayout sideMenu={sideMenu}>
      <Routes>
        <Route index element={<ImageResults />} />
        <Route path="echo-basal" element={<EchoMeasurement />} />
      </Routes>
    </PageLayout>
  );
}
