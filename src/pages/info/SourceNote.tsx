import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { GUIDE_PDF_PATH } from './articles';

export default function SourceNote(): JSX.Element {
  return (
    <div className="mt-8 rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
      <p>
        Adaptado de «Guías de práctica clínica ESC sobre cardio-oncología: Información para pacientes» — Sociedad
        Europea de Cardiología (ESC), Sociedad Española de Cardiología (SEC) y Fundación Española del Corazón. Este
        material es informativo y no reemplaza las indicaciones de tu equipo de salud.
      </p>
      <a
        href={GUIDE_PDF_PATH}
        download
        className="mt-2 inline-flex items-center font-medium text-sky-700 hover:text-sky-900"
      >
        <ArrowDownTrayIcon className="mr-1 h-5 w-5" /> Descargar la guía original (PDF)
      </a>
    </div>
  );
}
