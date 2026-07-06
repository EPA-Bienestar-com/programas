import { useMedplumProfile } from '@medplum/react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { GiftIcon } from '@heroicons/react/24/outline';
import Button from '../components/Button';
import Carousel from '../components/Carousel';
import PatientDashboard from '../components/PatientDashboard';
import { formatHumanName } from '@medplum/core';
import { ReactComponent as TaskIcon } from '../img/homePage/task-icon.svg';
import { Patient, Practitioner } from '@medplum/fhirtypes';

const carouselItems = [
  {
    img: <TaskIcon />,
    title: 'Prevención HTA ENT',
    description:
      'Las Enfermedades Cardiovasculares, Diabetes Tipo II, algunos tipos de cáncer y EPOC. Se pueden prevenir controlando sus factores de riesgo',
    url: '/get-care',
    label: 'Factores de Riesgo',
  },
  {
    img: <TaskIcon />,
    title: 'Mediciones',
    description:
      'Registrá tu presión arterial, peso, frecuencia cardíaca, sueño y actividad física para que tu equipo de salud pueda seguir tu evolución',
    url: '/health-record/vitals',
    label: 'Ingresar mediciones',
  },
  {
    img: <TaskIcon />,
    title: 'Tu Medicación',
    description:
      '¿Suspendiste o estás por suspender alguna medicación? Contanos por qué: es muy importante para tu equipo de Cardio-Oncología',
    url: '/health-record/medications',
    label: 'Informar sobre mi medicación',
  },
  {
    img: <TaskIcon />,
    title: 'Verificar Email',
    description:
      'Queremos ofrecer un servicio simple y muy efectivo. Es por eso que nos preocupa comunicarnos satisfactoriamente con nuestros usuarios',
    url: '/account',
    label: 'Enviar mail de verificación',
  },
];

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
      <div className="bg-hero-background bg-cover bg-left-top">
        <section className="mx-auto max-w-7xl px-6 shadow-2xl sm:px-4 md:shadow-none lg:px-8">
          <div className="py-20">
            <div className="flex flex-col items-start md:w-128 lg:w-156">
              <p className="text-1xl max-w-xs sm:text-2xl md:max-w-none md:text-3xl lg:text-4xl">
                Hola <span className="text-blue-600">{profileName}</span>
              </p>
              <Button
                url="/health-record/vitals/blood-pressure"
                label="Ingresar nuevos datos de Salud"
                marginsUtils="m-0 mt-8"
                paddingUtils="px-10 py-4"
                fontUtils="medium"
              />
            </div>
          </div>
        </section>
      </div>
      <div className="flex w-full justify-center bg-blue-900 py-4 px-2 sm:px-4 lg:px-8">
        <div className="flex flex-col items-center space-y-4 font-medium text-white md:flex-row md:space-y-0 md:space-x-6">
          <GiftIcon className="h-10 w-10 stroke-1 text-white" />
          <p>¿Cómo te va?</p>
          <Button
            label="Enviar Mensaje"
            url="/messages"
            marginsUtils="m-0"
            paddingUtils="px-10 py-4"
            fontUtils="medium"
          />
        </div>
      </div>
      <div className="w-full bg-gray-50">
        <section className="mx-auto max-w-7xl px-2 pb-10 sm:px-4 md:pt-6 md:pb-20 lg:px-8">
          <Carousel items={carouselItems} />
          <PatientDashboard />
        </section>
      </div>
      <Footer />
    </div>
  );
}
