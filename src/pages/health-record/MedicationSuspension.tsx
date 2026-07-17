import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { createReference } from '@medplum/core';
import { MedicationRequest, MedicationStatement, Patient } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import InfoSection from '../../components/InfoSection';
import LinkToPreviousPage from '../../components/LinkToPreviousPage';
import PageTitle from '../../components/PageTitle';

const suspensionOptions = [
  { value: 'stopped', label: 'Sí, ya la suspendí' },
  { value: 'on-hold', label: 'Estoy por suspenderla / la suspendí temporalmente' },
  { value: 'active', label: 'No, la sigo tomando' },
] as const;

const suspensionReasons = [
  'Efectos adversos o malestar',
  'Costo o dificultad para conseguirla',
  'Indicación de un profesional',
  'Sentí mejoría y creí que ya no era necesaria',
  'Olvidos frecuentes',
  'Otro motivo',
];

type SuspensionStatus = typeof suspensionOptions[number]['value'];

export default function MedicationSuspension(): JSX.Element {
  const medplum = useMedplum();
  const patient = medplum.getProfile() as Patient;
  const { medicationId = '' } = useParams();
  const resource: MedicationRequest = medplum.readResource('MedicationRequest', medicationId).read();

  const [status, setStatus] = useState<SuspensionStatus | ''>('');
  const [reason, setReason] = useState<string>('');
  const [detail, setDetail] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const isSuspension = status === 'stopped' || status === 'on-hold';
  const canSubmit = status !== '' && (!isSuspension || reason !== '');

  const handleSubmit = (): void => {
    if (!canSubmit || !status) {
      return;
    }
    const medicationStatement: MedicationStatement = {
      resourceType: 'MedicationStatement',
      status,
      medicationCodeableConcept: resource.medicationCodeableConcept,
      subject: createReference(patient),
      informationSource: createReference(patient),
      dateAsserted: new Date().toISOString(),
      derivedFrom: [{ reference: `MedicationRequest/${medicationId}` }],
    };
    if (isSuspension) {
      medicationStatement.statusReason = [{ text: reason }];
    }
    const noteText = isSuspension
      ? `El paciente informa que ${
          status === 'stopped' ? 'suspendió' : 'está suspendiendo temporalmente'
        } la medicación. Motivo: ${reason}.${detail ? ` Detalle: ${detail}` : ''}`
      : `El paciente confirma que continúa tomando la medicación.${detail ? ` Detalle: ${detail}` : ''}`;
    medicationStatement.note = [{ time: new Date().toISOString(), text: noteText }];

    medplum
      .createResource(medicationStatement)
      .then(() => {
        setIsSubmitted(true);
        setError('');
      })
      .catch((err) => {
        console.error(err);
        setError('No pudimos registrar tu respuesta. Por favor, intentá nuevamente o contactá a tu equipo de salud.');
      });
  };

  if (isSubmitted) {
    return (
      <div className="bg-white px-4 py-5 sm:rounded-lg sm:px-6">
        <div className="flex flex-col items-center space-y-4 py-10 text-center">
          <CheckCircleIcon className="h-16 w-16 text-emerald-600" />
          <h1 className="text-3xl font-extrabold">¡Gracias por avisarnos!</h1>
          <p className="max-w-xl text-lg text-gray-600">
            Registramos tu respuesta sobre {resource.medicationCodeableConcept?.text || 'tu medicación'}. Tu equipo de
            Cardio-Oncología va a revisarla y se va a comunicar con vos si es necesario ajustar el tratamiento.
          </p>
          <Link to="/health-record/medications" className="text-lg text-sky-700">
            Volver a Medicación
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white px-4 py-5 sm:rounded-lg sm:px-6">
      <LinkToPreviousPage url={`/health-record/medications/${medicationId}`} label="Volver a la medicación" />
      <PageTitle title="¿Suspendiste tu medicación?" />
      {resource.medicationCodeableConcept?.text && (
        <p className="mb-6 text-xl font-medium text-gray-900">{resource.medicationCodeableConcept.text}</p>
      )}
      <p className="mb-6 text-lg text-gray-600">
        Es muy importante que tu equipo de salud sepa si suspendiste o estás por suspender esta medicación, y por qué.
        No suspendas tu tratamiento sin consultar con tu equipo de Cardio-Oncología.{' '}
        <Link to="/info/problema-cardiaco-previo" className="font-medium text-sky-700">
          Leé por qué acá
        </Link>
      </p>
      <InfoSection title="¿Suspendiste o estás por suspender esta medicación?">
        <div className="flex flex-col space-y-3 p-4 sm:p-6">
          {suspensionOptions.map((option) => (
            <label key={option.value} className="flex cursor-pointer items-center space-x-3">
              <input
                type="radio"
                name="suspension-status"
                value={option.value}
                checked={status === option.value}
                onChange={() => setStatus(option.value)}
                className="h-5 w-5 border-gray-400 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-lg text-gray-900">{option.label}</span>
            </label>
          ))}
        </div>
      </InfoSection>
      {isSuspension && (
        <InfoSection title="¿Por qué?">
          <div className="flex flex-col space-y-3 p-4 sm:p-6">
            {suspensionReasons.map((item) => (
              <label key={item} className="flex cursor-pointer items-center space-x-3">
                <input
                  type="radio"
                  name="suspension-reason"
                  value={item}
                  checked={reason === item}
                  onChange={() => setReason(item)}
                  className="h-5 w-5 border-gray-400 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-lg text-gray-900">{item}</span>
              </label>
            ))}
          </div>
        </InfoSection>
      )}
      {status !== '' && (
        <InfoSection title="Contanos más (opcional)">
          <div className="p-4 sm:p-6">
            <textarea
              rows={3}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Por ejemplo: qué molestias sentiste, desde cuándo, si consultaste con alguien…"
              className="w-full rounded-md border-gray-300 text-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </InfoSection>
      )}
      {error && <p className="mb-4 text-lg text-red-700">{error}</p>}
      <div className="flex justify-end">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          Enviar respuesta
        </button>
      </div>
    </div>
  );
}
