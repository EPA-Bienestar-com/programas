import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { getReferenceString } from '@medplum/core';
import { Appointment, Patient } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react';
import InfoSection from '../../components/InfoSection';
import NoData from '../../components/NoData';
import PageTitle from '../../components/PageTitle';
import getLocaleDate from '../../helpers/get-locale-date';

export const appointmentStatusLabels: { [key: string]: string } = {
  proposed: 'Propuesto',
  pending: 'Pendiente',
  booked: 'Confirmado',
  arrived: 'Presente',
  fulfilled: 'Realizado',
  cancelled: 'Cancelado',
  noshow: 'Ausente',
  'entered-in-error': 'Cargado por error',
  'checked-in': 'Registrado',
  waitlist: 'Lista de espera',
};

export function getPractitionerName(appointment: Appointment): string | undefined {
  return appointment.participant?.find(({ actor }) => actor?.reference?.startsWith('Practitioner/'))?.actor?.display;
}

function AppointmentItem({ appointment }: { appointment: Appointment }): JSX.Element {
  return (
    <li className="flex items-center justify-between px-4 py-4 sm:px-6">
      <div className="flex items-center space-x-4">
        <CalendarDaysIcon className="hidden h-10 w-10 flex-shrink-0 text-gray-400 sm:block" />
        <div>
          <p className="text-lg font-medium text-gray-900">
            {getLocaleDate(appointment.start, true, true) || 'Fecha a confirmar'}
          </p>
          {getPractitionerName(appointment) && (
            <p className="mt-1 text-sm text-gray-500">{getPractitionerName(appointment)}</p>
          )}
          {appointment.description && <p className="mt-1 text-sm text-gray-500">{appointment.description}</p>}
        </div>
      </div>
      {appointment.status && (
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            appointment.status === 'booked' || appointment.status === 'fulfilled'
              ? 'bg-emerald-100 text-emerald-800'
              : appointment.status === 'cancelled' || appointment.status === 'noshow'
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {appointmentStatusLabels[appointment.status] || appointment.status}
        </span>
      )}
    </li>
  );
}

export default function Appointments(): JSX.Element {
  const medplum = useMedplum();
  const patient = medplum.getProfile() as Patient;
  const bundle = medplum.search('Appointment', `patient=${getReferenceString(patient)}&_sort=date&_count=100`).read();

  const appointments = (bundle.entry || [])
    .map(({ resource }) => resource as Appointment)
    .filter((resource) => resource && resource.status !== 'entered-in-error');

  const now = new Date().toISOString();
  const upcoming = appointments.filter(({ start, status }) => (!start || start >= now) && status !== 'cancelled');
  const past = appointments.filter(({ start, status }) => (start && start < now) || status === 'cancelled').reverse();

  return (
    <>
      <PageTitle title="Mis Turnos" />
      {appointments.length ? (
        <>
          <InfoSection title="Próximos turnos">
            {upcoming.length ? (
              <ul role="list" className="divide-y divide-gray-200">
                {upcoming.map((appointment) => (
                  <AppointmentItem key={appointment.id} appointment={appointment} />
                ))}
              </ul>
            ) : (
              <p className="px-4 py-5 text-lg text-gray-600 sm:px-6">
                No tenés turnos programados. Podés solicitar uno desde la sección Consultas.
              </p>
            )}
          </InfoSection>
          {past.length > 0 && (
            <InfoSection title="Turnos anteriores">
              <ul role="list" className="divide-y divide-gray-200">
                {past.map((appointment) => (
                  <AppointmentItem key={appointment.id} appointment={appointment} />
                ))}
              </ul>
            </InfoSection>
          )}
        </>
      ) : (
        <NoData title="turnos" />
      )}
    </>
  );
}
