import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { createReference, getReferenceString } from '@medplum/core';
import { Patient } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react';
import React, { Suspense, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../../components/Button';
import InfoSection from '../../components/InfoSection';
import LinkToPreviousPage from '../../components/LinkToPreviousPage';
import MeasurementModal from '../../components/MeasurementModal';
import NoData from '../../components/NoData';
import getLocaleDate from '../../helpers/get-locale-date';
import renderValue from '../../helpers/get-render-value';

const LineChart = React.lazy(() => import('../../components/LineChart'));

interface LabMeasurementsMetaType {
  [key: string]: {
    id: string;
    code: string;
    title: string;
    description: string;
    chartDatasets: { label: string; backgroundColor: string; borderColor: string }[];
  };
}

interface ChartDataType {
  labels: (string | null | undefined)[];
  datasets: { label: string; data: (number | undefined)[]; backgroundColor: string; borderColor?: string }[];
}

const backgroundColor = 'rgba(29, 112, 214, 0.7)';
const borderColor = 'rgba(29, 112, 214, 1)';

export const labMeasurementsMeta: LabMeasurementsMetaType = {
  'troponina-t': {
    id: 'troponina-t',
    code: '67151-1',
    title: 'Troponina hs-cTnT',
    description:
      'Troponina T cardíaca de alta sensibilidad (hs-cTnT). Biomarcador de daño miocárdico utilizado en cardio-oncología para monitorear toxicidad cardiovascular por quimioterapia. Valores normales según laboratorio (habitualmente < 14 ng/L).',
    chartDatasets: [{ label: 'Troponina hs-cTnT (ng/L)', backgroundColor, borderColor }],
  },
  'troponina-i': {
    id: 'troponina-i',
    code: '89579-7',
    title: 'Troponina hs-cTnI',
    description:
      'Troponina I cardíaca de alta sensibilidad (hs-cTnI). Biomarcador de daño miocárdico utilizado en cardio-oncología para monitorear toxicidad cardiovascular por quimioterapia. Valores normales según laboratorio.',
    chartDatasets: [{ label: 'Troponina hs-cTnI (ng/L)', backgroundColor, borderColor }],
  },
  'nt-probnp': {
    id: 'nt-probnp',
    code: '33762-6',
    title: 'NT-proBNP',
    description:
      'Péptido natriurético tipo B N-terminal (NT-proBNP). Marcador de estrés miocárdico y disfunción ventricular. Utilizado para detectar cardiotoxicidad por quimioterapia. Valores normales < 125 pg/mL en menores de 75 años.',
    chartDatasets: [{ label: 'NT-proBNP (pg/mL)', backgroundColor, borderColor }],
  },
};

const LabMeasurement = (): JSX.Element | null => {
  const { measurementId } = useParams();
  const medplum = useMedplum();
  const patient = medplum.getProfile() as Patient;
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [chartData, setChartData] = useState<ChartDataType>();

  const meta = labMeasurementsMeta[measurementId as string];
  const { code, title, description, chartDatasets } = meta;
  const measurements = medplum.search('Observation', `code=${code}&patient=${getReferenceString(patient)}`).read();

  useEffect(() => {
    if (measurements.entry) {
      const labels = measurements.entry.map(({ resource }) =>
        resource?.effectiveDateTime ? getLocaleDate(resource.effectiveDateTime) : undefined
      );
      setChartData({
        labels,
        datasets: chartDatasets.map((item) => ({
          ...item,
          data: measurements.entry!.map(({ resource }) => resource?.valueQuantity?.value),
        })),
      });
    }
  }, [chartDatasets, measurements]);

  if (!measurementId) return null;

  return (
    <>
      <LinkToPreviousPage url="/lab-results" label="Laboratorio" />
      <div className="mt-5 flex flex-col items-start space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h1 className="text-3xl font-extrabold">{title}</h1>
        <Button marginsUtils="ml-0" label="Agregar Resultado" action={() => setIsModalOpen(true)} />
      </div>
      {chartData && (
        <Suspense fallback={null}>
          <LineChart chartData={chartData} />
        </Suspense>
      )}
      {description && (
        <div className="mb-10 overflow-hidden border bg-white p-4 sm:rounded-md">
          <div className="mb-3 flex items-center text-gray-600">
            <InformationCircleIcon className="mr-2 h-6 w-6 flex-shrink-0" />
            <h3 className="text-lg font-bold">¿Qué estamos midiendo?</h3>
          </div>
          <p className="text-base text-gray-600">{description}</p>
        </div>
      )}
      {measurements.entry?.length ? (
        <InfoSection
          title={
            <div className="flex justify-between">
              <p>Fecha</p>
              <p>Valor</p>
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
        <NoData title="Resultados de laboratorio" />
      )}
      <MeasurementModal
        subject={createReference(patient)}
        type={title}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default LabMeasurement;
