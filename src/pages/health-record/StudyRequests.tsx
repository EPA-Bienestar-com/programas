import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { getReferenceString } from '@medplum/core';
import { Patient, ServiceRequest } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react';
import { useEffect, useState } from 'react';
import InfoSection from '../../components/InfoSection';
import Loader from '../../components/Loader';
import NoData from '../../components/NoData';
import PageTitle from '../../components/PageTitle';
import SectionUnavailable from '../../components/SectionUnavailable';
import getLocaleDate from '../../helpers/get-locale-date';

export const serviceRequestStatusLabels: { [key: string]: string } = {
  draft: 'Borrador',
  active: 'Pendiente de realizar',
  'on-hold': 'En espera',
  revoked: 'Anulado',
  completed: 'Realizado',
  'entered-in-error': 'Cargado por error',
  unknown: 'Desconocido',
};

export function getStudyName(serviceRequest: ServiceRequest): string {
  return (
    serviceRequest.code?.text ||
    serviceRequest.code?.coding?.[0]?.display ||
    serviceRequest.code?.coding?.[0]?.code ||
    'Estudio solicitado'
  );
}

function StudyRequestItem({ serviceRequest }: { serviceRequest: ServiceRequest }): JSX.Element {
  return (
    <li className="flex items-center justify-between px-4 py-4 sm:px-6">
      <div className="flex items-center space-x-4">
        <ClipboardDocumentListIcon className="hidden h-10 w-10 flex-shrink-0 text-gray-400 sm:block" />
        <div>
          <p className="text-lg font-medium text-gray-900">{getStudyName(serviceRequest)}</p>
          <p className="mt-1 text-sm text-gray-500">
            {serviceRequest.authoredOn && <>Solicitado el {getLocaleDate(serviceRequest.authoredOn)}</>}
            {serviceRequest.requester?.display && <> por {serviceRequest.requester.display}</>}
          </p>
          {serviceRequest.note?.[0]?.text && (
            <p className="mt-1 text-sm text-gray-500">{serviceRequest.note[0].text}</p>
          )}
        </div>
      </div>
      {serviceRequest.status && (
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            serviceRequest.status === 'completed'
              ? 'bg-emerald-100 text-emerald-800'
              : serviceRequest.status === 'revoked' || serviceRequest.status === 'entered-in-error'
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {serviceRequestStatusLabels[serviceRequest.status] || serviceRequest.status}
        </span>
      )}
    </li>
  );
}

export default function StudyRequests(): JSX.Element {
  const medplum = useMedplum();
  const patient = medplum.getProfile() as Patient;
  const [studyRequests, setStudyRequests] = useState<ServiceRequest[]>();
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    medplum
      .search('ServiceRequest', `patient=${getReferenceString(patient)}&_sort=-authored&_count=100`)
      .then((bundle) =>
        setStudyRequests(
          (bundle.entry || [])
            .map(({ resource }) => resource as ServiceRequest)
            .filter((resource) => resource && resource.status !== 'entered-in-error')
        )
      )
      .catch((err) => setError(err));
  }, [medplum, patient]);

  if (error) {
    return <SectionUnavailable title="Pedidos de Estudios" error={error} />;
  }
  if (!studyRequests) {
    return <Loader />;
  }

  const pending = studyRequests.filter(
    ({ status }) => status === 'active' || status === 'draft' || status === 'on-hold'
  );
  const resolved = studyRequests.filter(
    ({ status }) => status !== 'active' && status !== 'draft' && status !== 'on-hold'
  );

  return (
    <>
      <PageTitle title="Pedidos de Estudios" />
      <p className="mb-6 text-lg text-gray-600">
        Acá vas a encontrar los estudios que tu equipo de Cardio-Oncología te solicitó. Recordá concurrir con la orden y
        presentar los resultados en tu próxima consulta.
      </p>
      {studyRequests.length ? (
        <>
          <InfoSection title="Estudios pendientes">
            {pending.length ? (
              <ul role="list" className="divide-y divide-gray-200">
                {pending.map((serviceRequest) => (
                  <StudyRequestItem key={serviceRequest.id} serviceRequest={serviceRequest} />
                ))}
              </ul>
            ) : (
              <p className="px-4 py-5 text-lg text-gray-600 sm:px-6">No tenés estudios pendientes de realizar.</p>
            )}
          </InfoSection>
          {resolved.length > 0 && (
            <InfoSection title="Estudios realizados o anulados">
              <ul role="list" className="divide-y divide-gray-200">
                {resolved.map((serviceRequest) => (
                  <StudyRequestItem key={serviceRequest.id} serviceRequest={serviceRequest} />
                ))}
              </ul>
            </InfoSection>
          )}
        </>
      ) : (
        <NoData title="pedidos de estudios" />
      )}
    </>
  );
}
