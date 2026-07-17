export const CHECKIN_SYSTEM = 'https://api.epa-bienestar.com.ar/fhir/CodeSystem/patient-checkin';
export const CHECKIN_QUESTIONNAIRE = 'https://api.epa-bienestar.com.ar/fhir/Questionnaire/checkin-cardio-onco';

export interface CheckInOption {
  code: string;
  label: string;
}

export interface CheckInQuestion {
  linkId: string;
  text: string;
  options: CheckInOption[];
}

// Preguntas en lenguaje cotidiano; el mapeo clínico (disnea/NYHA-like, edemas,
// palpitaciones, dolor torácico, tolerancia a la actividad) vive en los códigos.
export const checkInQuestions: CheckInQuestion[] = [
  {
    linkId: 'who',
    text: '¿Quién está completando este check-in?',
    options: [
      { code: 'patient', label: 'Yo (el/la paciente)' },
      { code: 'caregiver', label: 'Un familiar o cuidador' },
    ],
  },
  {
    linkId: 'dyspnea',
    text: 'Esta semana, ¿te faltó el aire?',
    options: [
      { code: 'none', label: 'No' },
      { code: 'exertion', label: 'Solo con esfuerzos grandes' },
      { code: 'walking', label: 'Al caminar o hacer tareas de la casa' },
      { code: 'rest', label: 'Incluso en reposo' },
    ],
  },
  {
    linkId: 'edema',
    text: '¿Se te hincharon los tobillos o las piernas?',
    options: [
      { code: 'no', label: 'No' },
      { code: 'yes', label: 'Sí' },
    ],
  },
  {
    linkId: 'palpitations',
    text: '¿Sentiste palpitaciones (latidos fuertes o irregulares)?',
    options: [
      { code: 'no', label: 'No' },
      { code: 'yes', label: 'Sí' },
    ],
  },
  {
    linkId: 'chest-pain',
    text: '¿Tuviste dolor o presión en el pecho?',
    options: [
      { code: 'no', label: 'No' },
      { code: 'past', label: 'Sí, pero ya pasó' },
      { code: 'now', label: 'Sí, lo tengo ahora' },
    ],
  },
  {
    linkId: 'activity',
    text: '¿Pudiste hacer tus actividades de siempre?',
    options: [
      { code: 'yes', label: 'Sí, sin problemas' },
      { code: 'some', label: 'Con algo de dificultad' },
      { code: 'no', label: 'No pude' },
    ],
  },
];

export type CheckInAnswers = { [linkId: string]: string };

// Síntomas de alarma que disparan la red de seguridad.
export const isAlarm = (answers: CheckInAnswers): boolean =>
  answers['chest-pain'] === 'now' || answers.dyspnea === 'rest';

// Respuesta "todo bien" por pregunta; cualquier otra se resalta como síntoma.
const okAnswers: { [linkId: string]: string } = {
  dyspnea: 'none',
  edema: 'no',
  palpitations: 'no',
  'chest-pain': 'no',
  activity: 'yes',
};

export const isSymptomAnswer = (linkId: string, code: string): boolean =>
  linkId in okAnswers && code !== okAnswers[linkId];

export const getOptionLabel = (linkId: string, code: string): string =>
  checkInQuestions.find((q) => q.linkId === linkId)?.options.find((o) => o.code === code)?.label || code;
