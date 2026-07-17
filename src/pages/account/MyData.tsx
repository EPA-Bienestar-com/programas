import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { createReference, getReferenceString } from '@medplum/core';
import { Coverage, Observation, Patient } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import InfoSection from '../../components/InfoSection';
import PageTitle from '../../components/PageTitle';
import getLocaleDate from '../../helpers/get-locale-date';
import isForbiddenError from '../../helpers/is-forbidden-error';

export const SDOH_SYSTEM = 'https://api.epa-bienestar.com.ar/fhir/CodeSystem/sdoh';

const coverageTypes = ['Hospital Público', 'Obra Social', 'PAMI', 'Prepaga', 'Otra'];

const medicationAccessOptions = [
  { code: 'no-difficulty', label: 'La consigo sin problemas' },
  { code: 'some-difficulty', label: 'La consigo, pero con dificultad (costo, faltantes, trámites)' },
  { code: 'cannot-afford', label: 'No estoy pudiendo conseguirla' },
];

interface BlockStatus {
  saved?: boolean;
  error?: string;
}

function statusMessage(status: BlockStatus): JSX.Element | null {
  if (status.error) {
    return <p className="mt-3 text-base text-red-700">{status.error}</p>;
  }
  if (status.saved) {
    return (
      <p className="mt-3 flex items-center text-base text-emerald-700">
        <CheckCircleIcon className="mr-1 h-5 w-5" /> Guardado. Tu equipo de salud ya puede verlo.
      </p>
    );
  }
  return null;
}

function errorMessageFor(err: unknown): string {
  return isForbiddenError(err)
    ? 'Tu usuario todavía no tiene habilitado guardar este dato. Avisale a tu equipo de salud.'
    : 'No pudimos guardar el dato. Revisá tu conexión e intentá nuevamente.';
}

export default function MyData(): JSX.Element {
  const medplum = useMedplum();
  const profile = medplum.getProfile() as Patient;
  const patient: Patient = medplum.readResource('Patient', profile.id as string).read();

  const [contactName, setContactName] = useState<string>(patient.contact?.[0]?.name?.text || '');
  const [contactPhone, setContactPhone] = useState<string>(patient.contact?.[0]?.telecom?.[0]?.value || '');
  const [contactRelationship, setContactRelationship] = useState<string>(
    patient.contact?.[0]?.relationship?.[0]?.text || ''
  );
  const [contactStatus, setContactStatus] = useState<BlockStatus>({});

  const [coverage, setCoverage] = useState<Coverage>();
  const [coverageType, setCoverageType] = useState<string>('');
  const [coverageName, setCoverageName] = useState<string>('');
  const [coverageStatus, setCoverageStatus] = useState<BlockStatus>({});

  const [medicationAccess, setMedicationAccess] = useState<string>('');
  const [lastMedicationAccess, setLastMedicationAccess] = useState<Observation>();
  const [medicationAccessStatus, setMedicationAccessStatus] = useState<BlockStatus>({});

  useEffect(() => {
    medplum
      .search('Coverage', `beneficiary=${getReferenceString(patient)}&_count=1`)
      .then((bundle) => {
        const resource = bundle.entry?.[0]?.resource as Coverage | undefined;
        if (resource) {
          setCoverage(resource);
          setCoverageType(resource.type?.text || '');
          setCoverageName(resource.payor?.[0]?.display || '');
        }
      })
      .catch(() => undefined);

    medplum
      .search(
        'Observation',
        `code=${SDOH_SYSTEM}|medication-access&patient=${getReferenceString(patient)}&_sort=-date&_count=1`
      )
      .then((bundle) => {
        const resource = bundle.entry?.[0]?.resource as Observation | undefined;
        if (resource) {
          setLastMedicationAccess(resource);
          setMedicationAccess(resource.valueCodeableConcept?.coding?.[0]?.code || '');
        }
      })
      .catch(() => undefined);
  }, [medplum, patient]);

  const saveEmergencyContact = (): void => {
    setContactStatus({});
    medplum
      .updateResource({
        ...patient,
        contact: [
          {
            name: { text: contactName },
            telecom: contactPhone ? [{ system: 'phone', value: contactPhone }] : undefined,
            relationship: contactRelationship ? [{ text: contactRelationship }] : undefined,
          },
        ],
      })
      .then(() => setContactStatus({ saved: true }))
      .catch((err) => setContactStatus({ error: errorMessageFor(err) }));
  };

  const saveCoverage = (): void => {
    setCoverageStatus({});
    const resource: Coverage = {
      ...(coverage || { resourceType: 'Coverage', status: 'active', beneficiary: createReference(patient) }),
      type: { text: coverageType },
      payor: [{ display: coverageName || coverageType }],
    };
    const request = coverage ? medplum.updateResource(resource) : medplum.createResource(resource);
    request
      .then((saved) => {
        setCoverage(saved as Coverage);
        setCoverageStatus({ saved: true });
      })
      .catch((err) => setCoverageStatus({ error: errorMessageFor(err) }));
  };

  const saveMedicationAccess = (): void => {
    if (!medicationAccess) {
      return;
    }
    setMedicationAccessStatus({});
    const selected = medicationAccessOptions.find(({ code }) => code === medicationAccess);
    medplum
      .createResource<Observation>({
        resourceType: 'Observation',
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'social-history',
                display: 'Social History',
              },
            ],
          },
        ],
        code: {
          coding: [{ system: SDOH_SYSTEM, code: 'medication-access', display: 'Acceso a la medicación' }],
          text: '¿Estás pudiendo conseguir tu medicación?',
        },
        subject: createReference(patient),
        performer: [createReference(patient)],
        effectiveDateTime: new Date().toISOString(),
        valueCodeableConcept: {
          coding: [{ system: SDOH_SYSTEM, code: medicationAccess }],
          text: selected?.label,
        },
      })
      .then((saved) => {
        setLastMedicationAccess(saved);
        setMedicationAccessStatus({ saved: true });
      })
      .catch((err) => setMedicationAccessStatus({ error: errorMessageFor(err) }));
  };

  const inputClassName =
    'w-full rounded-md border-gray-300 text-lg shadow-sm focus:border-blue-500 focus:ring-blue-500';
  const saveButtonClassName =
    'inline-flex items-center rounded-md border border-transparent bg-blue-600 px-5 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50';

  return (
    <>
      <PageTitle title="Mis Datos" />
      <p className="mb-6 text-lg text-gray-600">
        Estos datos ayudan a tu equipo de Cardio-Oncología a cuidarte mejor y a comunicarse con vos. Tu teléfono y
        dirección se editan desde{' '}
        <Link to="/account/profile" className="text-sky-700">
          Perfil
        </Link>
        .
      </p>

      <InfoSection title="Contacto de emergencia">
        <div className="space-y-4 p-4 sm:p-6">
          <p className="text-base text-gray-600">
            ¿A quién llamamos si no podemos comunicarnos con vos o ante una urgencia?
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-base text-gray-700">Nombre y apellido</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label className="mb-1 block text-base text-gray-700">Teléfono</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label className="mb-1 block text-base text-gray-700">Vínculo (hija, pareja, amigo…)</label>
              <input
                type="text"
                value={contactRelationship}
                onChange={(e) => setContactRelationship(e.target.value)}
                className={inputClassName}
              />
            </div>
          </div>
          <button type="button" onClick={saveEmergencyContact} disabled={!contactName} className={saveButtonClassName}>
            Guardar contacto
          </button>
          {statusMessage(contactStatus)}
        </div>
      </InfoSection>

      <InfoSection title="Cobertura de salud">
        <div className="space-y-4 p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-base text-gray-700">Tipo de cobertura</label>
              <select value={coverageType} onChange={(e) => setCoverageType(e.target.value)} className={inputClassName}>
                <option value="">Elegí una opción…</option>
                {coverageTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-base text-gray-700">Nombre (si corresponde)</label>
              <input
                type="text"
                value={coverageName}
                onChange={(e) => setCoverageName(e.target.value)}
                placeholder="Por ejemplo: OSECAC, Swiss Medical…"
                className={inputClassName}
              />
            </div>
          </div>
          <button type="button" onClick={saveCoverage} disabled={!coverageType} className={saveButtonClassName}>
            Guardar cobertura
          </button>
          {statusMessage(coverageStatus)}
        </div>
      </InfoSection>

      <InfoSection title="¿Estás pudiendo conseguir tu medicación?">
        <div className="space-y-4 p-4 sm:p-6">
          <p className="text-base text-gray-600">
            Tu respuesta es confidencial y ayuda a tu equipo a buscar alternativas si te cuesta acceder al tratamiento.
          </p>
          <div className="flex flex-col space-y-3">
            {medicationAccessOptions.map((option) => (
              <label key={option.code} className="flex cursor-pointer items-center space-x-3">
                <input
                  type="radio"
                  name="medication-access"
                  value={option.code}
                  checked={medicationAccess === option.code}
                  onChange={() => setMedicationAccess(option.code)}
                  className="h-5 w-5 border-gray-400 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-lg text-gray-900">{option.label}</span>
              </label>
            ))}
          </div>
          {lastMedicationAccess?.effectiveDateTime && (
            <p className="text-sm text-gray-500">
              Última respuesta: {getLocaleDate(lastMedicationAccess.effectiveDateTime)}
            </p>
          )}
          <button
            type="button"
            onClick={saveMedicationAccess}
            disabled={!medicationAccess}
            className={saveButtonClassName}
          >
            Guardar respuesta
          </button>
          {statusMessage(medicationAccessStatus)}
          {medicationAccessStatus.saved && medicationAccess !== 'no-difficulty' && (
            <p className="text-base text-gray-700">
              Si estás por suspender o suspendiste alguna medicación por este motivo,{' '}
              <Link to="/health-record/medications" className="font-medium text-sky-700">
                contanos cuál acá
              </Link>
              .
            </p>
          )}
        </div>
      </InfoSection>
    </>
  );
}
