import { getReferenceString } from '@medplum/core';
import { Patient } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react';
import GridCell from '../../components/GridCell';
import GridSection from '../../components/GridSection';
import NoData from '../../components/NoData';
import PageTitle from '../../components/PageTitle';
import getLocaleDate from '../../helpers/get-locale-date';
import renderValue from '../../helpers/get-render-value';

const headers = ['Estudio', 'Valor', 'Fecha'];

export default function ImageResults(): JSX.Element {
  const medplum = useMedplum();
  const patient = medplum.getProfile() as Patient;
  const bundle = medplum
    .search('Observation', `patient=${getReferenceString(patient)}&category=imaging`)
    .read();

  return (
    <>
      <PageTitle title="Imágenes" />
      {bundle.entry?.length ? (
        <GridSection array={headers}>
          <ul role="list" className="divide-y divide-gray-200 border-b-2 border-solid border-gray-200">
            {bundle.entry.map(({ resource }) => (
              <li key={resource?.id}>
                {resource && resource?.code?.coding && resource?.meta?.lastUpdated && (
                  <div className="flex items-center py-4">
                    <div className="flex min-w-0 flex-1 items-center">
                      <div className="grid min-w-0 flex-1 grid-cols-3">
                        <GridCell item={resource?.code?.coding[0].display} color="yellow" />
                        <GridCell item={renderValue(resource)} color="gray" />
                        <GridCell item={getLocaleDate(resource?.meta?.lastUpdated)} color="gray" />
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </GridSection>
      ) : (
        <NoData title="estudios de imágenes" />
      )}
    </>
  );
}
