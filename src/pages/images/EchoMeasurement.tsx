import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { createReference, getReferenceString } from '@medplum/core';
import { Patient } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react';
import React, { Suspense, useEffect, useState } from 'react';
import Button from '../../components/Button';
import InfoSection from '../../components/InfoSection';
import MeasurementModal from '../../components/MeasurementModal';
import NoData from '../../components/NoData';
import getLocaleDate from '../../helpers/get-locale-date';
import renderValue from '../../helpers/get-render-value';

const LineChart = React.lazy(() => import('../../components/LineChart'));

interface ChartDataType {
  labels: (string | null | undefined)[];
  datasets: { label: string; data: (number | undefined)[]; backgroundColor: string; borderColor?: string }[];
}

const ECHO_LOINC = '8806-2';
const ECHO_TITLE = 'Ecocardiograma Basal (FEVI)';
const ECHO_DESCRIPTION =
  'Fracción de eyección del ventrículo izquierdo (FEVI) medida por ecocardiograma basal antes de iniciar quimioterapia (LOINC 8806-2). Permite monitorear la función cardíaca durante el tratamiento oncológico. Valores normales ≥ 53%.';

export default function EchoMeasurement(): JSX.Element {
  const medplum = useMedplum();
  const patient = medplum.getProfile() as Patient;
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [chartData, setChartData] = useState<ChartDataType>();

  const measurements = medplum
    .search('Observation', `code=${ECHO_LOINC}&patient=${getReferenceString(patient)}`)
    .read();

  useEffect(() => {
    if (measurements.entry) {
      const labels = measurements.entry.map(({ resource }) =>
        resource?.effectiveDateTime ? getLocaleDate(resource.effectiveDateTime) : undefined
      );
      setChartData({
        labels,
        datasets: [
          {
            label: 'FEVI (%)',
            data: measurements.entry.map(({ resource }) => resource?.valueQuantity?.value),
            backgroundColor: 'rgba(29, 112, 214, 0.7)',
            borderColor: 'rgba(29, 112, 214, 1)',
          },
        ],
      });
    }
  }, [measurements]);

  return (
    <>
      <div className="mt-5 flex flex-col items-start space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h1 className="text-3xl font-extrabold">{ECHO_TITLE}</h1>
        <Button marginsUtils="ml-0" label="Agregar Resultado" action={() => setIsModalOpen(true)} />
      </div>
      {chartData && (
        <Suspense fallback={null}>
          <LineChart chartData={chartData} />
        </Suspense>
      )}
      <div className="mb-10 overflow-hidden border bg-white p-4 sm:rounded-md">
        <div className="mb-3 flex items-center text-gray-600">
          <InformationCircleIcon className="mr-2 h-6 w-6 flex-shrink-0" />
          <h3 className="text-lg font-bold">¿Qué estamos midiendo?</h3>
        </div>
        <p className="text-base text-gray-600">{ECHO_DESCRIPTION}</p>
      </div>
      {measurements.entry?.length ? (
        <InfoSection
          title={
            <div className="flex justify-between">
              <p>Fecha</p>
              <p>FEVI</p>
            </div>
          }
        >
          <div className="px-4 pt-4 pb-2">
            {[...measurements.entry].reverse().map(({ resource }) => {
              if (!resource) return null;
              const time = getLocaleDate(resource.effectiveDateTime, true);
              return (
                <div className="mb-2 flex justify-between" key={resource.id}>
                  {time && <p>{time}</p>}
                  {renderValue(resource)}
                </div>
              );
            })}
          </div>
        </InfoSection>
      ) : (
        <NoData title="Ecocardiograma basal" />
      )}
      <MeasurementModal
        subject={createReference(patient)}
        type={ECHO_TITLE}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
