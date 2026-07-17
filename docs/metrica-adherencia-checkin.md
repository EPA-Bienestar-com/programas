# Métrica de adherencia al Check-in semanal

## Definición

**Métrica principal: porcentaje de pacientes que siguen cargando a las 8 semanas.**

Un paciente se considera **adherente a la semana 8** si envió al menos un check-in
(QuestionnaireResponse del cuestionario `checkin-cardio-onco`) durante la semana 7 u 8
contadas desde su **primer** check-in. Se mide sobre la cohorte de pacientes que
enviaron al menos un check-in (no sobre el padrón total: la activación inicial es
otra métrica).

```
adherencia_8s = pacientes con ≥1 check-in en semanas 7-8  /  pacientes con ≥1 check-in alguna vez
```

**Criterio de decisión acordado:** si la adherencia a 8 semanas es **menor al 30%**,
la respuesta correcta es **simplificar el check-in** (menos preguntas, menos fricción),
no agregar funciones.

## Métricas secundarias

| Métrica | Para qué sirve |
|---|---|
| Activación: % de pacientes con ≥1 check-in a los 14 días del alta en la app | Mide onboarding, no producto |
| Check-ins por paciente por mes (mediana) | Frecuencia real vs. esperada (4/mes) |
| % de check-ins completados por cuidador (`who = caregiver`) | Valida el modo cuidador |
| % de check-ins con síntomas de alarma y tiempo hasta respuesta del equipo | Mide la red de seguridad — si el equipo no responde, hay que rediseñar el circuito, no la app |
| % de check-ins vistos por el equipo antes de la siguiente consulta | El circuito de feedback: si el profesional no los mira, el sistema muere solo |

## Cómo calcularla (FHIR)

Todos los check-ins son `QuestionnaireResponse` con
`questionnaire = https://api.epa-bienestar.com.ar/fhir/Questionnaire/checkin-cardio-onco`.

Consulta base (lado profesional/admin, requiere permisos de proyecto):

```
GET /fhir/R4/QuestionnaireResponse?_count=1000&_sort=authored
    &authored=ge{inicio-cohorte}
```

Pseudocódigo del cálculo:

1. Agrupar QuestionnaireResponses por `subject` (paciente), filtrando por el canonical del cuestionario.
2. Para cada paciente: `t0 = authored` del primer check-in.
3. Adherente si existe un check-in con `authored` en `[t0 + 42 días, t0 + 56 días]`.
4. Reportar cociente y tamaño de cohorte, junto con la mediana de check-ins/mes.

Recomendación de implementación: un Bot de Medplum con cron semanal que materialice
el resultado como `Observation` (categoría `survey`, código LOCAL
`checkin-adherence-8w`) a nivel proyecto, para graficarlo sin recalcular.

## Recursos que crea el lado paciente (nuevos en este PR)

| Acción del paciente | Recurso creado | Claves |
|---|---|---|
| Check-in semanal | `QuestionnaireResponse` | canonical `checkin-cardio-onco`, `source = Patient` |
| Síntomas derivados del check-in | `Observation` (categoría `survey`) | SNOMED 267036007 disnea, 267038008 edema, 80313002 palpitaciones, 29857009 dolor torácico + LOCAL `activity-limitation`; `performer = Patient`, `derivedFrom = QuestionnaireResponse` |
| Síntoma de alarma (dolor de pecho actual / disnea en reposo) | `Communication` | `priority = urgent`, categoría "Alerta de check-in", `sender = Patient` |
| Contacto de emergencia | update de `Patient.contact` | — |
| Cobertura | `Coverage` | `beneficiary = Patient`, `type.text`, `payor.display` |
| Acceso a medicación | `Observation` (categoría `social-history`) | LOCAL `sdoh|medication-access`, `performer = Patient` |

Sistema de códigos local: `https://api.epa-bienestar.com.ar/fhir/CodeSystem/patient-checkin`
y `.../CodeSystem/sdoh`, siguiendo la convención del mapeo de cardiotoxicidad
(códigos LOCAL solo donde no existe universal, dentro de estructura FHIR estándar).
`performer/source = Patient` en todo lo autorreportado, para que el motor de scores
distinga dato verificado de dato del paciente (`RiskAssessment.basis`).

## AccessPolicy del paciente — recursos a habilitar

Para que estas funciones operen, la política de acceso del paciente en
`api.epa-bienestar.com.ar` debe permitir, siempre restringido a su propio compartimento:

| Recurso | Permiso | Función que lo usa |
|---|---|---|
| `QuestionnaireResponse` | crear y leer | Check-in y su historial |
| `Observation` | crear y leer (ya habilitado para vitales) | Síntomas derivados, SDOH |
| `Communication` | crear | Alerta de check-in |
| `Patient` (propio) | leer y actualizar | Contacto de emergencia |
| `Coverage` | crear, leer y actualizar | Cobertura |
| `MedicationStatement` | crear y leer | Suspensión de medicación (PR anterior) |
| `ServiceRequest` | leer | Pedidos de Estudios (PR anterior) |
| `Appointment` | leer | Mis Turnos (PR anterior) |

Sin estos permisos las pantallas degradan con el mensaje "acceso pendiente de
habilitación" (no quedan en blanco), pero el circuito no aporta datos.

## Compromiso del lado profesional (condición de éxito)

La alerta urgente (`Communication` con `priority = urgent`) **necesita un circuito
humano definido**: quién la ve, en cuánto tiempo, y qué hace. Hasta que ese circuito
exista, la app le dice al paciente con síntomas de alarma que llame al 107 o vaya a
guardia — la alerta es un complemento, nunca el canal principal. Definir con el
equipo de Marie Curie el SLA de revisión antes de comunicar esta función a pacientes.
