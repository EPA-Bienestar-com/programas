import { formatHumanName } from '@medplum/core';
import { Patient, Practitioner } from '@medplum/fhirtypes';
import { useMedplumProfile } from '@medplum/react';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import PatientDashboard from '../components/PatientDashboard';

export function HomePage(): JSX.Element {
  const profile = useMedplumProfile() as Patient | Practitioner;
  const profileName = profile.name ? formatHumanName(profile.name[0]) : '';

  return (
    <div>
      <Header />
      <div className="flex justify-center bg-blue-100 py-4 px-6 text-sm text-neutral-600">
        <span>
          Teleconsulta:{' '}
          <a href="https://calendar.app.google/JWYcJXgaS7xTE8QS7" className="font-medium text-blue-600">
            Solicitar turno on line!
          </a>
        </span>
      </div>
      <div className="w-full bg-gray-50">
        <section className="mx-auto max-w-7xl px-4 pt-10 pb-12 sm:px-6 md:pb-20 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Hola <span className="text-blue-600">{profileName}</span>
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Tu espacio para seguir tu salud, junto a tu equipo de Cardio-Oncología.
          </p>
          <PatientDashboard />
        </section>
      </div>
      <Footer />
    </div>
  );
}
