import React from 'react';

const navigation = [
  { name: 'GCBA Salud', href: 'https://buenosaires.gob.ar/salud/unidad-de-promocion-de-la-salud-y-control-de-enfermedades-cronicas-no-transmisibles' },
  { name: 'Programa', href: 'https://www.epa-bienestar.com/prevencion.html' },
  { name: 'Documento', href: 'https://buenosaires.gob.ar/sites/default/files/media/document/2018/11/23/186a804e001ae6ef9a638a8889c56d161b005f48.pdf' },
  { name: 'TeleConsulta', href: 'https://calendar.app.google/JWYcJXgaS7xTE8QS7' },
];

export function Footer(): JSX.Element {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav
          className="flex w-full flex-col items-center justify-between space-y-4 border-b border-neutral-200 py-10 md:flex-row md:space-y-0"
          aria-label="Footer"
        >
          {navigation.map((item) => (
            <a key={item.name} href={item.href} className="text-lg text-neutral-500 hover:text-neutral-900">
              {item.name}
            </a>
          ))}
        </nav>
        <p className="py-12 text-center text-sm text-neutral-900">&copy; 2024 EPA Bienestar IA. Derechos Reservados.</p>
      </div>
    </footer>
  );
}
