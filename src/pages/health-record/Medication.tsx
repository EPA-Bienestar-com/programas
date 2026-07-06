import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMedplum } from '@medplum/react';
import { MedicationRequest } from '@medplum/fhirtypes';
import getTimingRepeat from '../../helpers/get-timing-repeat';
import getLocaleDate from '../../helpers/get-locale-date';
import LinkToPreviousPage from '../../components/LinkToPreviousPage';
import PageTitle from '../../components/PageTitle';
import InfoSection from '../../components/InfoSection';
import TwoColumnsList, { TwoColumnsListItemProps } from '../../components/TwoColumnsList';
import NoData from '../../components/NoData';

export default function Medication(): JSX.Element {
  const medplum = useMedplum();
  const { medicationId = '' } = useParams();
  const [medicationValues, setMedicationValues] = useState<TwoColumnsListItemProps[]>([]);

  const resource: MedicationRequest = medplum.readResource('MedicationRequest', medicationId).read();

  useEffect(() => {
    const medication = [];

    if (resource.dosageInstruction) {
      medication.push({
        label: 'Indicación',
        body: (
          <div className="flex flex-col">
            <p className="text-lg text-gray-600">{getTimingRepeat(resource.dosageInstruction[0].timing?.repeat)}</p>
            {resource.dosageInstruction[0].text && (
              <p className="text-lg text-gray-600">{resource.dosageInstruction[0].text}</p>
            )}
          </div>
        ),
      });
    }
    if (resource.authoredOn) {
      medication.push({
        label: 'Última prescripción',
        body: (
          <p className="text-lg text-gray-600">
            {getLocaleDate(resource.authoredOn)} por {resource.requester?.display}
          </p>
        ),
      });
    }
    if (resource.status) {
      medication.push({
        label: 'Estado',
        body: <p className="text-lg capitalize text-gray-600">{resource.status}</p>,
      });
    }

    setMedicationValues(medication);
  }, [resource]);

  return (
    <>
      {resource ? (
        <>
          <LinkToPreviousPage url="/health-record/medications" label="Toda la Medicación" />
          {resource.medicationCodeableConcept?.text && <PageTitle title={resource.medicationCodeableConcept?.text} />}
          <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-4">
            <p className="text-lg text-gray-900">
              ¿Suspendiste o estás por suspender esta medicación?{' '}
              <Link to={`/health-record/medications/${medicationId}/suspension`} className="font-medium text-sky-700">
                Contanos por qué
              </Link>
            </p>
          </div>
          <p className="mb-6 text-lg text-gray-600">Para reponer esta medicación, contactá a tu farmacia.</p>
          <p className="mb-6 text-lg text-gray-600">
            ¿No te quedan reposiciones disponibles en tu farmacia?{' '}
            <Link to={`/health-record/medications/${medicationId}/prescription-renewal`} className="text-sky-700">
              Renová tu receta
            </Link>
          </p>
          <InfoSection title="Detalles">
            <TwoColumnsList items={medicationValues} />
          </InfoSection>
        </>
      ) : (
        <NoData title="results" />
      )}
    </>
  );
}
