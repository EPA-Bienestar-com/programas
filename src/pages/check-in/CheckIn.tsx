import { CheckCircleIcon, ExclamationTriangleIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { createReference, getReferenceString } from '@medplum/core';
import { Communication, Observation, Patient, QuestionnaireResponse } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CHECKIN_QUESTIONNAIRE,
  CHECKIN_SYSTEM,
  CheckInAnswers,
  checkInQuestions,
  getOptionLabel,
  isAlarm,
} from './definitions';

// Observations derivadas por síntoma: código estándar cuando existe, LOCAL si no.
const symptomObservationCodes: { [linkId: string]: { system: string; code: string; display: string } } = {
  dyspnea: { system: 'http://snomed.info/sct', code: '267036007', display: 'Disnea' },
  edema: { system: 'http://snomed.info/sct', code: '267038008', display: 'Edema' },
  palpitations: { system: 'http://snomed.info/sct', code: '80313002', display: 'Palpitaciones' },
  'chest-pain': { system: 'http://snomed.info/sct', code: '29857009', display: 'Dolor torácico' },
  activity: { system: CHECKIN_SYSTEM, code: 'activity-limitation', display: 'Limitación en actividades habituales' },
};

type SubmitState = 'editing' | 'sending' | 'sent' | 'error';

export default function CheckIn(): JSX.Element {
  const medplum = useMedplum();
  const navigate = useNavigate();
  const patient = medplum.getProfile() as Patient;

  const [step, setStep] = useState<number>(0);
  const [answers, setAnswers] = useState<CheckInAnswers>({});
  const [comment, setComment] = useState<string>('');
  const [submitState, setSubmitState] = useState<SubmitState>('editing');
  const [alertSent, setAlertSent] = useState<boolean>(false);
  const [showAlarmScreen, setShowAlarmScreen] = useState<boolean>(false);

  const totalSteps = checkInQuestions.length + 1; // + pantalla de comentario
  const isCommentStep = step === checkInQuestions.length;
  const question = checkInQuestions[step];

  const selectAnswer = (code: string): void => {
    setAnswers({ ...answers, [question.linkId]: code });
    setStep(step + 1);
  };

  const buildResources = (): { response: QuestionnaireResponse; observations: Observation[] } => {
    const now = new Date().toISOString();
    const caregiver = answers.who === 'caregiver';
    const response: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      questionnaire: CHECKIN_QUESTIONNAIRE,
      status: 'completed',
      subject: createReference(patient),
      source: createReference(patient),
      authored: now,
      item: [
        ...checkInQuestions.map(({ linkId, text }) => ({
          linkId,
          text,
          answer: [
            {
              valueCoding: {
                system: CHECKIN_SYSTEM,
                code: answers[linkId],
                display: getOptionLabel(linkId, answers[linkId]),
              },
            },
          ],
        })),
        ...(comment
          ? [{ linkId: 'comment', text: 'Algo más que quieras contarnos', answer: [{ valueString: comment }] }]
          : []),
      ],
    };
    const observations = Object.entries(symptomObservationCodes).map(
      ([linkId, coding]): Observation => ({
        resourceType: 'Observation',
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'survey',
                display: 'Survey',
              },
            ],
          },
        ],
        code: { coding: [coding], text: coding.display },
        subject: createReference(patient),
        performer: [createReference(patient)],
        effectiveDateTime: now,
        valueCodeableConcept: {
          coding: [{ system: CHECKIN_SYSTEM, code: answers[linkId] }],
          text: getOptionLabel(linkId, answers[linkId]),
        },
        note: caregiver ? [{ text: 'Reportado por un familiar o cuidador.' }] : undefined,
      })
    );
    return { response, observations };
  };

  const submit = (): void => {
    setSubmitState('sending');
    const { response, observations } = buildResources();
    const alarm = isAlarm(answers);

    medplum
      .createResource(response)
      .then((savedResponse) => {
        // Las Observations derivadas y la alerta son best-effort: el registro canónico ya se guardó.
        observations.forEach((observation) => {
          medplum
            .createResource({ ...observation, derivedFrom: [{ reference: getReferenceString(savedResponse) }] })
            .catch((err) => console.error('No se pudo crear la Observation derivada', err));
        });
        if (alarm) {
          const communication: Communication = {
            resourceType: 'Communication',
            status: 'completed',
            priority: 'urgent',
            subject: createReference(patient),
            sender: createReference(patient),
            sent: new Date().toISOString(),
            category: [{ text: 'Alerta de check-in' }],
            payload: [
              {
                contentString: `Check-in con síntomas de alarma: ${['chest-pain', 'dyspnea']
                  .filter((linkId) => answers[linkId])
                  .map(
                    (linkId) =>
                      `${linkId === 'chest-pain' ? 'dolor de pecho' : 'falta de aire'}: ${getOptionLabel(
                        linkId,
                        answers[linkId]
                      )}`
                  )
                  .join(' · ')}${comment ? ` · Comentario: ${comment}` : ''}`,
              },
            ],
          };
          medplum
            .createResource(communication)
            .then(() => setAlertSent(true))
            .catch((err) => console.error('No se pudo enviar la alerta al equipo', err));
        }
        setSubmitState('sent');
        setShowAlarmScreen(alarm);
      })
      .catch((err) => {
        console.error(err);
        setSubmitState('error');
      });
  };

  if (submitState === 'sent' && showAlarmScreen) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 text-center">
        <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-red-600" />
        <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Prestá atención a lo que nos contaste</h1>
        <p className="mt-4 text-lg text-gray-700">
          El dolor de pecho actual o la falta de aire en reposo necesitan una consulta médica <strong>hoy</strong>. Esta
          aplicación no reemplaza a una guardia ni es un canal de urgencias.
        </p>
        <div className="mt-6 rounded-md border border-red-300 bg-red-50 p-4 text-left text-lg text-gray-900">
          <p className="flex items-center font-medium">
            <PhoneIcon className="mr-2 h-6 w-6 flex-shrink-0" /> Llamá al 107 (SAME) o acercate a la guardia más
            cercana.
          </p>
          <p className="mt-2">Si estás en el hospital, avisale ahora a tu equipo de salud.</p>
        </div>
        <p className="mt-6 text-base text-gray-600">
          {alertSent
            ? 'Tu check-in quedó registrado y le enviamos un aviso a tu equipo de Cardio-Oncología.'
            : 'Tu check-in quedó registrado. No pudimos confirmar el aviso automático a tu equipo: comunicate directamente con ellos.'}
        </p>
        <button
          type="button"
          onClick={() => setShowAlarmScreen(false)}
          className="mt-6 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700"
        >
          Entendido
        </button>
      </div>
    );
  }

  if (submitState === 'sent') {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 text-center">
        <CheckCircleIcon className="mx-auto h-16 w-16 text-emerald-600" />
        <h1 className="mt-4 text-3xl font-extrabold text-gray-900">¡Gracias por tu check-in!</h1>
        <p className="mt-4 text-lg text-gray-600">
          Fue enviado a tu equipo de Cardio-Oncología. Registrarlo cada semana los ayuda a detectar cambios a tiempo,
          incluso cuando te sentís bien.
        </p>
        <p className="mt-3 text-base text-gray-600">
          ¿Querés saber por qué te hacemos estas preguntas?{' '}
          <Link to="/info/sintomas" className="font-medium text-sky-700">
            Conocé los síntomas a los que prestar atención
          </Link>
        </p>
        <div className="mt-6 flex justify-center space-x-4">
          <Link
            to="/check-in/history"
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-5 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Ver mis check-ins
          </Link>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-5 py-3 text-base font-medium text-gray-700 shadow-sm hover:text-gray-500"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <div className="mb-6">
        <p className="mb-2 text-base text-gray-500">
          {isCommentStep ? 'Último paso' : `Pregunta ${step + 1} de ${checkInQuestions.length}`}
        </p>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {!isCommentStep ? (
        <>
          <h1 className="mb-6 text-2xl font-bold text-gray-900">{question.text}</h1>
          <div className="flex flex-col space-y-3">
            {question.options.map((option) => (
              <button
                key={option.code}
                type="button"
                onClick={() => selectAnswer(option.code)}
                className={`w-full rounded-md border px-4 py-4 text-left text-lg shadow-sm ${
                  answers[question.linkId] === option.code
                    ? 'border-blue-600 bg-blue-50 font-medium text-blue-900'
                    : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <h1 className="mb-6 text-2xl font-bold text-gray-900">¿Algo más que quieras contarnos? (opcional)</h1>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Por ejemplo: desde cuándo te sentís así, otros malestares, dudas para tu próxima consulta…"
            className="w-full rounded-md border-gray-300 text-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {submitState === 'error' && (
            <p className="mt-4 text-base text-red-700">
              No pudimos enviar tu check-in. Revisá tu conexión e intentá nuevamente. Si el problema sigue, contale a tu
              equipo en la próxima consulta.
            </p>
          )}
          <button
            type="button"
            onClick={submit}
            disabled={submitState === 'sending'}
            className="mt-6 w-full rounded-md border border-transparent bg-blue-600 px-6 py-4 text-lg font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {submitState === 'sending' ? 'Enviando…' : 'Enviar mi check-in'}
          </button>
        </>
      )}

      {step > 0 && submitState !== 'sending' && (
        <button type="button" onClick={() => setStep(step - 1)} className="mt-6 text-base text-sky-700">
          ← Volver a la pregunta anterior
        </button>
      )}
    </div>
  );
}
