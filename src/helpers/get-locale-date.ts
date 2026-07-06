const getLocaleDate = (stringDate?: string, isHoursDisplayed = false, isMinutesDisplayed = false): string | null => {
  if (!stringDate) return null;
  const date = new Date(stringDate);

  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: isHoursDisplayed ? '2-digit' : undefined,
    minute: isMinutesDisplayed ? '2-digit' : undefined,
  });
};

export default getLocaleDate;
