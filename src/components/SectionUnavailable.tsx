import { ExclamationTriangleIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import InfoSection from './InfoSection';
import PageTitle from './PageTitle';
import isForbiddenError from '../helpers/is-forbidden-error';

interface SectionUnavailableProps {
  title: string;
  error: unknown;
}

export default function SectionUnavailable({ title, error }: SectionUnavailableProps): JSX.Element {
  const forbidden = isForbiddenError(error);
  return (
    <>
      <PageTitle title={title} />
      <InfoSection title={forbidden ? 'Acceso pendiente de habilitación' : 'Sección no disponible'}>
        <div className="flex flex-col items-center space-y-3 px-4 py-10 text-center sm:px-6">
          {forbidden ? (
            <LockClosedIcon className="h-10 w-10 text-amber-500" />
          ) : (
            <ExclamationTriangleIcon className="h-10 w-10 text-amber-500" />
          )}
          <p className="max-w-lg text-lg text-gray-600">
            {forbidden
              ? 'Tu usuario todavía no tiene habilitado el acceso a esta información. Tu equipo de salud debe actualizar los permisos para que puedas verla.'
              : 'No pudimos cargar la información en este momento. Por favor, intentá nuevamente en unos minutos.'}
          </p>
        </div>
      </InfoSection>
    </>
  );
}
