import { ExclamationTriangleIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { Component, ErrorInfo, ReactNode } from 'react';
import isForbiddenError from '../helpers/is-forbidden-error';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: unknown;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      const forbidden = isForbiddenError(this.state.error);
      return (
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          {forbidden ? (
            <LockClosedIcon className="mx-auto h-12 w-12 text-amber-500" />
          ) : (
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-amber-500" />
          )}
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            {forbidden ? 'Acceso pendiente de habilitación' : 'No pudimos cargar esta sección'}
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            {forbidden
              ? 'Tu usuario todavía no tiene habilitado el acceso a esta información. Tu equipo de salud debe actualizar los permisos para que puedas verla.'
              : 'Ocurrió un error inesperado. Por favor, intentá nuevamente en unos minutos.'}
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700"
            >
              Reintentar
            </button>
            <a
              href="/"
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:text-gray-500"
            >
              Ir al inicio
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
