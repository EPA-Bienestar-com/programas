interface OperationOutcomeLike {
  resourceType?: string;
  id?: string;
  issue?: { code?: string }[];
}

// Medplum rechaza con el OperationOutcome crudo (id 'forbidden') cuando el servidor
// devuelve 403 porque la AccessPolicy del usuario no cubre el recurso consultado.
const isForbiddenError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const candidate = ('outcome' in error ? (error as { outcome?: unknown }).outcome : error) as OperationOutcomeLike;
  return (
    !!candidate &&
    candidate.resourceType === 'OperationOutcome' &&
    (candidate.id === 'forbidden' || candidate.issue?.[0]?.code === 'forbidden')
  );
};

export default isForbiddenError;
