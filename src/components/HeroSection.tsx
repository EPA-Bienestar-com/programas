import { Popover, Transition } from '@headlessui/react';
import {
  BookmarkSquareIcon,
  CalendarIcon,
  ChartBarIcon,
  CursorArrowRaysIcon,
  Bars3Icon,
  PhoneIcon,
  PlayIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  LifebuoyIcon,
  Squares2X2Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import { ReactComponent as Logo } from '../img/logo.svg';
import WorkingEnvironmentImage from '../img/landingPage/habitos-saludables-para-tu-vida-diaria.jpg';

const features = [
  {
    name: 'Analytics',
    href: 'https://www.epa-bienestar.com.ar/analytics.html',
    description: 'Get a better understanding of where your traffic is coming from.',
    icon: ChartBarIcon,
  },
  {
    name: 'Engagement',
    href: 'https://www.epa-bienestar.com.ar/engagement.html',
    description: 'Speak directly to your customers in a more meaningful way.',
    icon: CursorArrowRaysIcon,
  },
  { name: 'Privacy', href: '#', description: "Your customers' data will be safe and secure.", icon: ShieldCheckIcon },
  {
    name: 'Integraciones',
    href: 'https://www.epa-bienestar.com.ar/integraciones.html',
    description: "Connect with third-party tools that you're already using.",
    icon: Squares2X2Icon,
  },
  {
    name: 'Automatización',
    href: '#',
    description: 'Build strategic funnels that will drive your customers to convert',
    icon: ArrowPathIcon,
  },
];
const callsToAction = [
  { name: 'Watch Demo', href: '#', icon: PlayIcon },
  { name: 'Contacto', href: '#', icon: PhoneIcon },
];
const resources = [
  {
    name: 'Ayuda',
    description: 'Get all of your questions answered in our forums or contact support.',
    href: 'https://ia.epa-bienestar.com.ar',
    icon: LifebuoyIcon,
  },
  {
    name: 'Guías',
    description: 'Learn how to maximize our platform to get the most out of it.',
    href: 'https://www.paho.org/es/hearts-americas/hearts-americas-paquete-tecnico',
    icon: BookmarkSquareIcon,
  },
  {
    name: 'Eventos',
    description: 'See what meet-ups and other events we might be planning near you.',
    href: 'https://plataforma.miscaminatas.com/eventos/',
    icon: CalendarIcon,
  },
  { name: 'Privacidad', description: 'Nos tomamos muy en serio su privacidad.', href: 'https://www.epa-bienestar.com.ar/politica_de_privacidad.html', icon: ShieldCheckIcon },
];
const recentPosts = [
  { id: 1, name: 'Rincón del Hipertenso', href: 'https://www.rincondelhipertenso.com.ar/' },
  { id: 2, name: 'Experiencias Personales Agiles', href: 'https://www.epa-bienestar.com.ar' },
  { id: 3, name: 'Conoce y Controla 2024', href: 'https://www.youtube.com/watch?v=5Hq-XSLmARE' },
];

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(' ');
}

export function HeroSection(): JSX.Element {
  return (
    <div className="relative bg-gradient-radial from-blue-50">
      <Popover className="relative bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between space-x-6 py-6 lg:space-x-10">
            <div className="flex justify-start">
              <a href="#">
                <span className="sr-only">Workflow</span>
                <Logo className="h-8 w-auto lg:h-10" />
              </a>
            </div>
            <div className="-my-2 -mr-2 md:hidden">
              <Popover.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                <span className="sr-only">Open menu</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </Popover.Button>
            </div>
            <Popover.Group as="nav" className="hidden space-x-4 md:flex lg:space-x-10">
              <Popover className="relative">
                {({ open }) => (
                  <>
                    <Popover.Button
                      className={classNames(
                        open ? 'text-gray-900' : 'text-gray-500',
                        'group inline-flex items-center rounded-md bg-white text-base font-normal hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                      )}
                    >
                      <span>Servicios</span>
                      <ChevronDownIcon
                        className={classNames(
                          open ? 'text-gray-600' : 'text-gray-400',
                          'ml-2 h-5 w-5 group-hover:text-gray-500'
                        )}
                        aria-hidden="true"
                      />
                    </Popover.Button>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel className="absolute z-20 -ml-4 mt-3 w-screen max-w-md transform px-2 sm:px-0 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2">
                        <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                          <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
                            {features.map((item) => (
                              <a
                                key={item.name}
                                href={item.href}
                                className="-m-3 flex items-start rounded-lg p-3 hover:bg-gray-50"
                              >
                                <item.icon className="h-6 w-6 flex-shrink-0 text-blue-600" aria-hidden="true" />
                                <div className="ml-4">
                                  <p className="text-base font-medium text-gray-900">{item.name}</p>
                                  <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                                </div>
                              </a>
                            ))}
                          </div>
                          <div className="space-y-6 bg-gray-50 px-5 py-5 sm:flex sm:space-y-0 sm:space-x-10 sm:px-8">
                            {callsToAction.map((item) => (
                              <div key={item.name} className="flow-root">
                                <a
                                  href={item.href}
                                  className="-m-3 flex items-center rounded-md p-3 text-base font-medium text-gray-900 hover:bg-gray-100"
                                >
                                  <item.icon className="h-6 w-6 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                  <span className="ml-3">{item.name}</span>
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
              <a href="https://seguimiento.epa-bienestar.com.ar/" className="text-base font-normal text-gray-500 hover:text-gray-900">Seguimiento</a>
              <a href="https://profesionales.epa-bienestar.com.ar/" className="text-base font-normal text-gray-500 hover:text-gray-900">Profesionales</a>
              <a href="https://chat.epa-bienestar.com.ar/" className="text-base font-normal text-gray-500 hover:text-gray-900">Chat</a>
              <a href="https://cobertura.epa-bienestar.com.ar/" className="text-base font-normal text-gray-500 hover:text-gray-900">Cobertura</a>
              <a href="https://tareas.epa-bienestar.com.ar/" className="text-base font-normal text-gray-500 hover:text-gray-900">Tareas</a>
              <Popover className="relative">
                {({ open }) => (
                  <>
                    <Popover.Button
                      className={classNames(
                        open ? 'text-gray-900' : 'text-gray-500',
                        'group inline-flex items-center rounded-md bg-white text-base font-normal hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                      )}
                    >
                      <span>Más</span>
                      <ChevronDownIcon
                        className={classNames(
                          open ? 'text-gray-600' : 'text-gray-400',
                          'ml-2 h-5 w-5 group-hover:text-gray-500'
                        )}
                        aria-hidden="true"
                      />
                    </Popover.Button>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel className="absolute left-1/2 z-20 mt-3 w-screen max-w-md -translate-x-1/2 transform px-2 sm:px-0">
                        <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                          <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
                            {resources.map((item) => (
                              <a
                                key={item.name}
                                href={item.href}
                                className="-m-3 flex items-start rounded-lg p-3 hover:bg-gray-50"
                              >
                                <item.icon className="h-6 w-6 flex-shrink-0 text-blue-600" aria-hidden="true" />
                                <div className="ml-4">
                                  <p className="text-base font-medium text-gray-900">{item.name}</p>
                                  <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                                </div>
                              </a>
                            ))}
                          </div>
                          <div className="bg-gray-50 px-5 py-5 sm:px-8 sm:py-8">
                            <div>
                              <h3 className="text-sm font-medium uppercase tracking-wide text-gray-500">
                                Post recientes
                              </h3>
                              <ul role="list" className="mt-4 space-y-4">
                                {recentPosts.map((item) => (
                                  <li key={item.id} className="truncate text-base">
                                    <a href={item.href} className="font-medium text-gray-900 hover:text-gray-700">
                                      {item.name}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="mt-5 text-sm">
                              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                {' '}
                                Ver todos los posts <span aria-hidden="true">&rarr;</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
            </Popover.Group>
            <div className="hidden items-center justify-end md:flex">
              <Link to="/signin" className="whitespace-nowrap text-base font-normal text-gray-500 hover:text-gray-900">
                Ingresar!
              </Link>
              <Button label="Crear Cuenta!" url="/register" />
            </div>
          </div>
        </div>

        <Transition
          as={Fragment}
          enter="duration-200 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="duration-100 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Popover.Panel
            focus
            className="absolute inset-x-0 top-0 z-20 origin-top-right transform p-2 transition md:hidden"
          >
            <div className="divide-y-2 divide-gray-50 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="px-5 pt-5 pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Logo className="h-8 w-auto" />
                  </div>
                  <div className="-mr-2">
                    <Popover.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                      <span className="sr-only">Cerrar</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </Popover.Button>
                  </div>
                </div>
                <div className="mt-6">
                  <nav className="grid gap-y-8">
                    {features.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="-m-3 flex items-center rounded-md p-3 hover:bg-gray-50"
                      >
                        <item.icon className="h-6 w-6 flex-shrink-0 text-blue-600" aria-hidden="true" />
                        <span className="ml-3 text-base font-medium text-gray-900">{item.name}</span>
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
              <div className="space-y-6 py-6 px-5">
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <a href="#" className="text-base font-normal text-gray-900 hover:text-gray-700">
                    Pricing
                  </a>

                  <a href="#" className="text-base font-normal text-gray-900 hover:text-gray-700">
                    Docs
                  </a>
                  {resources.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="text-base font-normal text-gray-900 hover:text-gray-700"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div>
                  <p className="mt-6 text-center text-base font-normal text-gray-500">
                    Ya tiene una cuenta?
                    <Link to="/signin" className="ml-6 text-blue-600 hover:text-blue-500">
                      Ingresar!
                    </Link>
                  <Link
                    to="/register"
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-normal text-white shadow-sm hover:bg-blue-700"
                  >
                    Crear una cuenta nueva!
                  </Link>

                  </p>
                </div>
              </div>
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>
      <img
        className="block h-40 w-full object-cover md:hidden"
        src={WorkingEnvironmentImage}
        alt="Working Environment"
      />
      <main className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex w-full flex-col items-center pt-8 pb-8 text-left sm:items-start sm:pb-36 md:py-36">
          <div className="flex flex-col items-center sm:items-start">
            <h1 className="text-center text-3xl font-medium tracking-wider text-gray-900 sm:text-left sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
              <p>Programas</p>
              <p className="text-blue-600">Prevención de la Salud</p>
            </h1>
            <p className="mt-6 w-full max-w-xs text-lg font-normal text-neutral-600 sm:max-w-none md:max-w-sm lg:max-w-lg lg:text-xl">
              "Sumate al Plan Bienestar 100 días ❤️"{' '}
            </p>
	    <div className="mt-8 sm:flex sm:justify-center md:mt-20 lg:justify-start">
              <div className="rounded-md shadow">
                <a href="/signin" className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 py-4 px-20 text-lg font-normal text-white hover:bg-blue-700">Ingresar!</a>
              </div>
            </div>
          </div>
          <img
            className="z-10 hidden md:absolute md:top-52 md:right-3 md:inline md:h-80 md:w-80 md:rounded-full md:object-cover lg:right-6 lg:top-48 lg:h-96 lg:w-96 xl:top-36 xl:right-16 xl:h-128 xl:w-128"
            src={WorkingEnvironmentImage}
            alt="Working Environment"
          />
        </div>
      </main>
    </div>
  );
}
