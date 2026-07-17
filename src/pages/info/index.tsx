import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import { infoArticles } from './articles';

const InfoHome = lazy(() => import('./InfoHome'));
const Article = lazy(() => import('./Article'));

export const sideMenu = {
  title: 'Información',
  menu: [
    {
      name: 'Para pacientes',
      href: '/info',
      subMenu: infoArticles.map(({ title, id }) => ({
        name: title,
        href: `/info/${id}`,
      })),
    },
  ],
};

export default function InfoModule(): JSX.Element {
  return (
    <PageLayout sideMenu={sideMenu}>
      <Routes>
        <Route index element={<InfoHome />} />
        <Route path=":articleId" element={<Article />} />
      </Routes>
    </PageLayout>
  );
}
