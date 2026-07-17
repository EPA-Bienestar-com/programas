import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { getReferenceString } from '@medplum/core';
import { Patient, QuestionnaireResponse } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import InfoSection from '../../components/InfoSection';
import Loader from '../../components/Loader';
import PageTitle from '../../components/PageTitle';
import SectionUnavailable from '../../components/SectionUnavailable';
import getLocaleDate from '../../helpers/get-locale-date';
import { CHECKIN_QUESTIONNAIRE, isSymptomAnswer } from './definitions';

interface CheckInSummary {
  id: string;
  authored?: string;
  caregiver: boolean;
  symptoms: string[];
  comment?: string;
}

function summarize(response: QuestionnaireResponse): CheckInSummary {
  const symptoms: string[] = [];
  let caregiver = false;
  let comment: string | undefined;
  (response.item || []).forEach((item) => {
    const coding = item.answer?.[0]?.valueCoding;
    if (item.linkId === 'who') {
      caregiver = coding?.code === 'caregiver';
    } else if (item.linkId === 'comment') {
      comment = item.answer?.[0]?.valueString;
    } else if (item.linkId && coding?.code && isSymptomAnswer(item.linkId, coding.code) && coding.display) {
      symptoms.push(coding.display);
    }
  });
  return { id: response.id as string, authored: response.authored, caregiver, symptoms, comment };
}

export default function CheckInHistory(): JSX.Element {
  const medplum = useMedplum();
  const patient = medplum.getProfile() as Patient;
  const [checkIns, setCheckIns] = useState<CheckInSummary[]>();
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    medplum
      .search('QuestionnaireResponse', `subject=${getReferenceString(patient)}&_sort=-authored&_count=50`)
      .then((bundle) =>
        setCheckIns(
          (bundle.entry || [])
            .map(({ resource }) => resource as QuestionnaireResponse)
            .filter((resource) => resource && resource.questionnaire === CHECKIN_QUESTIONNAIRE)
            .map(summarize)
        )
      )
      .catch((err) => setError(err));
  }, [medplum, patient]);

  if (error) {
    return <SectionUnavailable title="Mis Check-ins" error={error} />;
  }
  if (!checkIns) {
    return <Loader />;
  }

  return (
    <>
      <PageTitle title="Mis Check-ins" />
      <p className="mb-6 text-lg text-gray-600">
        Cada check-in que enviás queda disponible para tu equipo de Cardio-Oncología y les permite seguir tu evolución
        entre consultas.
      </p>
      {checkIns.length ? (
        <InfoSection
          title={`${checkIns.length} check-in${checkIns.length === 1 ? '' : 's'} enviado${
            checkIns.length === 1 ? '' : 's'
          }`}
        >
          <ul role="list" className="divide-y divide-gray-200">
            {checkIns.map((checkIn) => (
              <li key={checkIn.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-medium text-gray-900">{getLocaleDate(checkIn.authored) || 'Sin fecha'}</p>
                  <span className="flex items-center text-sm font-medium text-emerald-700">
                    <CheckCircleIcon className="mr-1 h-5 w-5" /> Enviado a tu equipo
                  </span>
                </div>
                {checkIn.caregiver && (
                  <p className="mt-1 text-sm text-gray-500">Completado por un familiar o cuidador</p>
                )}
                {checkIn.symptoms.length ? (
                  <p className="mt-2 text-base text-amber-700">{checkIn.symptoms.join(' · ')}</p>
                ) : (
                  <p className="mt-2 text-base text-emerald-700">Sin síntomas reportados</p>
                )}
                {checkIn.comment && <p className="mt-1 text-base text-gray-600">“{checkIn.comment}”</p>}
              </li>
            ))}
          </ul>
        </InfoSection>
      ) : (
        <InfoSection title="Todavía no enviaste ningún check-in">
          <div className="px-4 py-8 text-center sm:px-6">
            <p className="mb-4 text-lg text-gray-600">Te toma menos de 2 minutos y ayuda mucho a tu equipo de salud.</p>
            <Link
              to="/check-in"
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700"
            >
              Hacer mi primer check-in
            </Link>
          </div>
        </InfoSection>
      )}
    </>
  );
}
