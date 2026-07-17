import {
  BoltIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { getReferenceString } from '@medplum/core';
import { Appointment, Observation, Patient, QuestionnaireResponse } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import getLocaleDate from '../helpers/get-locale-date';
import renderValue from '../helpers/get-render-value';
import { CHECKIN_QUESTIONNAIRE } from '../pages/check-in/definitions';
import { getPractitionerName } from '../pages/get-care/Appointments';

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

interface DashboardCardProps {
  icon: JSX.Element;
  title: string;
  href: string;
  linkLabel: string;
  children: JSX.Element;
}

function DashboardCard({ icon, title, href, linkLabel, children }: DashboardCardProps): JSX.Element {
  return (
    <div className="flex h-full flex-col justify-between rounded-md bg-white p-6 shadow">
      <div>
        <div className="mb-4 flex items-center space-x-3">
          <div className="rounded-full bg-blue-100 p-2 text-blue-600">{icon}</div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
        <div className="mb-4 text-base text-gray-600">{children}</div>
      </div>
      <Link to={href} className="text-base font-medium text-blue-600 hover:text-blue-800">
        {linkLabel} →
      </Link>
    </div>
  );
}

interface GoalRowProps {
  title: string;
  tip: string;
  value: string | JSX.Element | null;
  valueDate?: string;
  objective: string;
  outOfTarget?: boolean;
  href: string;
  linkLabel: string;
}

function GoalRow({ title, tip, value, valueDate, objective, outOfTarget, href, linkLabel }: GoalRowProps): JSX.Element {
  const borderColor = value === null ? 'border-gray-300' : outOfTarget ? 'border-amber-400' : 'border-emerald-400';
  return (
    <div
      className={`flex flex-col justify-between rounded-md border-l-4 ${borderColor} bg-white p-5 shadow sm:flex-row sm:items-center`}
    >
      <div className="sm:pr-6">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="mt-1 text-base text-gray-600">{tip}</p>
      </div>
      <div className="mt-3 flex-shrink-0 text-left sm:mt-0 sm:text-right">
        {value !== null ? (
          <div className="text-base text-gray-900">
            <span className="font-semibold">Tu valor: </span>
            <span className="font-semibold">{value}</span>
            {valueDate && <span className="text-sm text-gray-500"> ({getLocaleDate(valueDate)})</span>}
            <span className="text-gray-600"> · Objetivo: {objective}</span>
          </div>
        ) : (
          <p className="text-base text-gray-500">Sin registros todavía · Objetivo: {objective}</p>
        )}
        <Link to={href} className="text-base font-medium text-blue-600 hover:text-blue-800">
          {linkLabel} →
        </Link>
      </div>
    </div>
  );
}

export default function PatientDashboard(): JSX.Element {
  const medplum = useMedplum();
  const patient = medplum.getProfile() as Patient;

  const [bloodPressure, setBloodPressure] = useState<Observation | null>(null);
  const [activity, setActivity] = useState<Observation | null>(null);
  const [sleep, setSleep] = useState<Observation | null>(null);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [pendingStudies, setPendingStudies] = useState<number | null>(null);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);

  useEffect(() => {
    const patientRef = getReferenceString(patient);
    const today = new Date().toISOString().slice(0, 10);

    medplum
      .search('Observation', `code=85354-9&patient=${patientRef}&_sort=-date&_count=1`)
      .then((bundle) => setBloodPressure((bundle.entry?.[0]?.resource as Observation) || null))
      .catch(() => setBloodPressure(null));

    medplum
      .search('Observation', `code=101691-4&patient=${patientRef}&_sort=-date&_count=1`)
      .then((bundle) => setActivity((bundle.entry?.[0]?.resource as Observation) || null))
      .catch(() => setActivity(null));

    medplum
      .search('Observation', `code=93832-4&patient=${patientRef}&_sort=-date&_count=1`)
      .then((bundle) => setSleep((bundle.entry?.[0]?.resource as Observation) || null))
      .catch(() => setSleep(null));

    medplum
      .search('Appointment', `patient=${patientRef}&date=ge${today}&_sort=date&_count=20`)
      .then((bundle) => {
        const upcoming = (bundle.entry || [])
          .map(({ resource }) => resource as Appointment)
          .find(
            (appointment) =>
              appointment &&
              appointment.status !== 'cancelled' &&
              appointment.status !== 'entered-in-error' &&
              appointment.status !== 'noshow'
          );
        setNextAppointment(upcoming || null);
      })
      .catch(() => setNextAppointment(null));

    medplum
      .search('ServiceRequest', `patient=${patientRef}&status=active&_count=100`)
      .then((bundle) => setPendingStudies(bundle.entry?.length || 0))
      .catch(() => setPendingStudies(null));

    medplum
      .search('QuestionnaireResponse', `subject=${patientRef}&_sort=-authored&_count=20`)
      .then((bundle) => {
        const latest = (bundle.entry || [])
          .map(({ resource }) => resource as QuestionnaireResponse)
          .find((resource) => resource && resource.questionnaire === CHECKIN_QUESTIONNAIRE);
        setLastCheckIn(latest?.authored || null);
      })
      .catch(() => setLastCheckIn(null));
  }, [medplum, patient]);

  const checkInDoneThisWeek = !!lastCheckIn && Date.now() - new Date(lastCheckIn).getTime() < WEEK_IN_MS;

  const systolic = bloodPressure?.component?.[1]?.valueQuantity?.value;
  const diastolic = bloodPressure?.component?.[0]?.valueQuantity?.value;
  const bloodPressureOut = (systolic !== undefined && systolic >= 140) || (diastolic !== undefined && diastolic >= 90);

  const activityMinutes = activity?.valueQuantity?.value;
  const sleepHours = sleep?.valueQuantity?.value;

  return (
    <div className="mt-8">
      {checkInDoneThisWeek ? (
        <div className="flex flex-col items-start justify-between space-y-4 rounded-md border border-emerald-300 bg-emerald-50 p-6 shadow-sm sm:flex-row sm:items-center sm:space-y-0">
          <div className="flex items-center space-x-4">
            <CheckCircleIcon className="h-10 w-10 flex-shrink-0 text-emerald-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Check-in enviado el {getLocaleDate(lastCheckIn as string)}
              </h2>
              <p className="text-base text-gray-600">
                Tu equipo ya puede verlo. Si algo cambió, podés enviar otro cuando quieras.
              </p>
            </div>
          </div>
          <Link
            to="/check-in/history"
            className="inline-flex flex-shrink-0 items-center rounded-md border border-emerald-600 bg-white px-5 py-3 text-base font-medium text-emerald-700 shadow-sm hover:bg-emerald-100"
          >
            Ver mis check-ins
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-start justify-between space-y-4 rounded-md bg-blue-600 p-6 text-white shadow sm:flex-row sm:items-center sm:space-y-0">
          <div className="flex items-center space-x-4">
            <ChatBubbleLeftRightIcon className="h-10 w-10 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold">¿Cómo te sentiste esta semana?</h2>
              <p className="text-base text-blue-100">
                Tu check-in semanal ayuda a tu equipo a detectar cambios a tiempo. Te toma menos de 2 minutos.
              </p>
            </div>
          </div>
          <Link
            to="/check-in"
            className="inline-flex flex-shrink-0 items-center rounded-md bg-white px-5 py-3 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-50"
          >
            Hacer mi check-in
          </Link>
        </div>
      )}

      <h2 className="mt-10 mb-6 text-2xl font-bold text-gray-900">Tu semana</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          icon={<HeartIcon className="h-6 w-6" />}
          title="Mediciones"
          href="/health-record/vitals"
          linkLabel="Ver todas mis mediciones"
        >
          {bloodPressure ? (
            <div>
              <p className="mb-1 text-sm text-gray-500">Última presión arterial</p>
              <div className="text-xl font-semibold text-gray-900">{renderValue(bloodPressure)}</div>
              {bloodPressure.effectiveDateTime && (
                <p className="mt-1 text-sm text-gray-500">{getLocaleDate(bloodPressure.effectiveDateTime)}</p>
              )}
            </div>
          ) : (
            <p>Registrá tu presión arterial, peso, frecuencia cardíaca y más.</p>
          )}
        </DashboardCard>
        <DashboardCard
          icon={<CalendarDaysIcon className="h-6 w-6" />}
          title="Próximo Turno"
          href="/get-care/appointments"
          linkLabel="Ver mis turnos"
        >
          {nextAppointment ? (
            <div>
              <p className="text-xl font-semibold text-gray-900">
                {getLocaleDate(nextAppointment.start, true, true) || 'Fecha a confirmar'}
              </p>
              {getPractitionerName(nextAppointment) && (
                <p className="mt-1 text-sm text-gray-500">{getPractitionerName(nextAppointment)}</p>
              )}
            </div>
          ) : (
            <p>No tenés turnos programados. Solicitá uno desde Consultas.</p>
          )}
        </DashboardCard>
        <DashboardCard
          icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
          title="Pedidos de Estudios"
          href="/health-record/study-requests"
          linkLabel="Ver mis pedidos"
        >
          {pendingStudies !== null && pendingStudies > 0 ? (
            <div>
              <p className="text-xl font-semibold text-gray-900">
                {pendingStudies} {pendingStudies === 1 ? 'estudio pendiente' : 'estudios pendientes'}
              </p>
              <p className="mt-1 text-sm text-gray-500">Recordá concurrir con la orden.</p>
            </div>
          ) : (
            <p>Consultá los estudios que tu equipo te solicitó.</p>
          )}
        </DashboardCard>
        <DashboardCard
          icon={<BoltIcon className="h-6 w-6" />}
          title="Actividad Física"
          href="/health-record/vitals/activity-duration"
          linkLabel="Registrar actividad"
        >
          {activity ? (
            <div>
              <p className="mb-1 text-sm text-gray-500">Última actividad registrada</p>
              <div className="text-xl font-semibold text-gray-900">{renderValue(activity)}</div>
              {activity.effectiveDateTime && (
                <p className="mt-1 text-sm text-gray-500">{getLocaleDate(activity.effectiveDateTime)}</p>
              )}
            </div>
          ) : (
            <p>Registrá tus minutos de actividad física diaria. Se recomiendan más de 30 minutos por día.</p>
          )}
        </DashboardCard>
      </div>

      <h2 className="mt-10 mb-2 text-2xl font-bold text-gray-900">Lo que cuida tu corazón</h2>
      <p className="mb-6 text-base text-gray-500">
        Estos objetivos son una guía general saludable. Tus metas personales las define tu equipo médico.
      </p>
      <div className="space-y-4">
        <GoalRow
          title="Presión arterial"
          tip="Movete todos los días, bajá la sal y, si te la indicaron, tomá tu medicación a horario."
          value={bloodPressure ? renderValue(bloodPressure) : null}
          valueDate={bloodPressure?.effectiveDateTime}
          objective="menos de 140 / 90"
          outOfTarget={bloodPressureOut}
          href="/health-record/vitals/blood-pressure"
          linkLabel="Cargar presión de hoy"
        />
        <GoalRow
          title="Actividad física"
          tip="Caminar también cuenta. Empezá de a poco y sumá minutos cada semana, según cómo te sientas."
          value={activityMinutes !== undefined ? `${activityMinutes} minutos` : null}
          valueDate={activity?.effectiveDateTime}
          objective="30 minutos o más por día"
          outOfTarget={activityMinutes !== undefined && activityMinutes < 30}
          href="/health-record/vitals/activity-duration"
          linkLabel="Registrar actividad"
        />
        <GoalRow
          title="Sueño"
          tip="Dormir bien ayuda a tu corazón a recuperarse. Tratá de mantener horarios regulares."
          value={sleepHours !== undefined ? `${sleepHours} horas` : null}
          valueDate={sleep?.effectiveDateTime}
          objective="entre 7 y 8 horas"
          outOfTarget={sleepHours !== undefined && sleepHours < 7}
          href="/health-record/vitals/sleep-duration"
          linkLabel="Registrar sueño"
        />
      </div>

      <div className="mt-10 rounded-md border border-amber-300 bg-amber-50 p-4">
        <p className="text-lg text-gray-900">
          <span className="font-medium">¿Suspendiste o estás por suspender tu medicación?</span> Contanos por qué: es
          muy importante para tu equipo de Cardio-Oncología.{' '}
          <Link to="/health-record/medications" className="font-medium text-sky-700">
            Informar sobre mi medicación
          </Link>
        </p>
      </div>

      <div className="mt-10 flex flex-col items-center justify-center space-y-4 rounded-md bg-blue-900 p-6 text-center sm:flex-row sm:space-y-0 sm:space-x-6">
        <p className="text-lg font-medium text-white">¿Tenés una duda? Tu equipo de salud está para ayudarte.</p>
        <Link
          to="/messages"
          className="inline-flex flex-shrink-0 items-center rounded-md bg-white px-6 py-3 text-base font-medium text-blue-900 shadow-sm hover:bg-blue-50"
        >
          Escribir a mi equipo
        </Link>
      </div>
    </div>
  );
}
