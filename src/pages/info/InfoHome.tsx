import { BookOpenIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import PageTitle from '../../components/PageTitle';
import { infoArticles } from './articles';
import SourceNote from './SourceNote';

export default function InfoHome(): JSX.Element {
  return (
    <>
      <PageTitle title="Información para vos" />
      <p className="mb-8 text-lg text-gray-600">
        Esta sección resume, en lenguaje simple, la guía para pacientes de la Sociedad Europea de Cardiología sobre
        cardio-oncología: cómo algunos tratamientos contra el cáncer pueden afectar el corazón, qué hace tu equipo para
        cuidarte y qué podés hacer vos. Está pensada para vos, tu familia y quienes te acompañan.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {infoArticles.map((article) => (
          <Link
            key={article.id}
            to={`/info/${article.id}`}
            className="flex h-full flex-col justify-between rounded-md bg-white p-6 shadow hover:shadow-md"
          >
            <div>
              <div className="mb-3 flex items-center space-x-3">
                <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                  <BookOpenIcon className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">{article.title}</h2>
              </div>
              <p className="mb-4 text-base text-gray-600">{article.teaser}</p>
            </div>
            <p className="flex items-center text-sm text-gray-500">
              <ClockIcon className="mr-1 h-4 w-4" /> Lectura de {article.readingMinutes} minutos
            </p>
          </Link>
        ))}
      </div>
      <SourceNote />
    </>
  );
}
