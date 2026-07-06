import { BoltIcon, CalendarDaysIcon, ClipboardDocumentListIcon, HeartIcon } from '@heroicons/react/24/outline';
import { getReferenceString } from '@medplum/core';
import { Appointment, Observation, Patient } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import getLocaleDate from '../helpers/get-locale-date';
import renderValue from '../helpers/get-render-value';
import { getPractitionerName } from '../pages/get-care/Appointments';

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

export default function PatientDashboard(): JSX.Element {
  const medplum = useMedplum();
  const patient = medplum.getProfile() as Patient;

  const [bloodPressure, setBloodPressure] = useState<Observation | null>(null);
  const [activity, setActivity] = useState<Observation | null>(null);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [pendingStudies, setPendingStudies] = useState<number | null>(null);

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
  }, [medplum, patient]);

  return (
    <div className="mt-10">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Mi Panel</h2>
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
      <div className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-4">
        <p className="text-lg text-gray-900">
          <span className="font-medium">¿Suspendiste o estás por suspender tu medicación?</span> Contanos por qué: es
          muy importante para tu equipo de Cardio-Oncología.{' '}
          <Link to="/health-record/medications" className="font-medium text-sky-700">
            Informar sobre mi medicación
          </Link>
        </p>
      </div>
    </div>
  );
}
