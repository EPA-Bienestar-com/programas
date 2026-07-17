# AccessPolicy del paciente — Programas

Política de acceso completa para el rol paciente de Programas. Cubre todas las
funciones actuales del front: vitales, check-in semanal, Mis Datos, suspensión de
medicación, Mis Turnos, Pedidos de Estudios, laboratorio/imágenes, mensajería y
renovación de recetas.

## Cómo aplicarla

1. Entrar a la app de administración de Medplum de `api.epa-bienestar.com.ar` con
   un usuario admin del proyecto.
2. Ir a **AccessPolicy** y abrir la política que hoy tienen asignados los pacientes
   (la referencia está en el `ProjectMembership` de cualquier paciente, campo
   `accessPolicy`).
3. **Comparar y completar** el arreglo `resource` con las entradas de abajo — no
   reemplazar a ciegas: si ya existen entradas (Patient, Observation,
   Communication…), conservarlas y agregar solo las que falten. El cambio aplica a
   todos los pacientes de inmediato, sin tocar cada membership.
4. Verificar que la política esté configurada como **default patient access
   policy** del proyecto, para que los registros nuevos la reciban.

## Política completa

```json
{
  "resourceType": "AccessPolicy",
  "name": "Patient Access Policy - Programas",
  "compartment": { "reference": "%patient" },
  "resource": [
    { "resourceType": "Patient", "compartment": { "reference": "%patient" } },
    { "resourceType": "Observation", "compartment": { "reference": "%patient" } },
    { "resourceType": "QuestionnaireResponse", "compartment": { "reference": "%patient" } },
    { "resourceType": "Communication", "compartment": { "reference": "%patient" } },
    { "resourceType": "MedicationRequest", "compartment": { "reference": "%patient" } },
    { "resourceType": "MedicationStatement", "compartment": { "reference": "%patient" } },
    { "resourceType": "ServiceRequest", "compartment": { "reference": "%patient" }, "readonly": true },
    { "resourceType": "Appointment", "compartment": { "reference": "%patient" } },
    { "resourceType": "Coverage", "compartment": { "reference": "%patient" } },
    { "resourceType": "DiagnosticReport", "compartment": { "reference": "%patient" }, "readonly": true },
    { "resourceType": "CarePlan", "compartment": { "reference": "%patient" }, "readonly": true },
    { "resourceType": "Condition", "compartment": { "reference": "%patient" }, "readonly": true },
    { "resourceType": "DocumentReference", "compartment": { "reference": "%patient" } },
    { "resourceType": "Media", "compartment": { "reference": "%patient" } },
    { "resourceType": "Binary" },
    { "resourceType": "Schedule", "readonly": true },
    { "resourceType": "Slot" },
    { "resourceType": "Practitioner", "readonly": true }
  ]
}
```

## Por qué cada entrada

| Entrada | Función del front | Permiso |
|---|---|---|
| `Patient` | Perfil y contacto de emergencia (Mis Datos) | lectura y actualización del propio registro |
| `Observation` | Vitales, síntomas del check-in, acceso a medicación (SDOH) | crear y leer |
| `QuestionnaireResponse` | Check-in semanal e historial | crear y leer |
| `Communication` | Mensajería con el equipo y alerta urgente del check-in | crear y leer |
| `MedicationRequest` | Lista de medicación y solicitud de renovación (crea un borrador) | crear y leer |
| `MedicationStatement` | Informe de suspensión de medicación con motivo | crear y leer |
| `ServiceRequest` | Pedidos de Estudios | **solo lectura** (los pedidos los genera Cardio-Onco) |
| `Appointment` | Mis Turnos y reserva desde el Scheduler | crear y leer |
| `Coverage` | Cobertura de salud (Mis Datos) | crear, leer y actualizar |
| `DiagnosticReport` | Laboratorio e Imágenes | **solo lectura** |
| `CarePlan` | Planes | **solo lectura** |
| `Condition` | Diagnósticos visibles al paciente | **solo lectura** |
| `DocumentReference` / `Media` / `Binary` | Foto de perfil hoy; foto de resultados de laboratorio a futuro | crear y leer |
| `Schedule` / `Slot` / `Practitioner` | Agenda de turnos y nombres de profesionales (no pertenecen al compartimento del paciente) | Schedule y Practitioner solo lectura; Slot con escritura para reservar |

Notas de seguridad:

- `compartment: %patient` restringe todo al propio paciente: nunca ve ni toca
  datos de otros.
- Las entradas `readonly: true` son deliberadas: el paciente no puede crear ni
  modificar pedidos de estudios, informes, planes ni diagnósticos.
- Todo lo autorreportado por el front viaja con `performer`/`source = Patient`,
  de modo que los motores de scores (`RiskAssessment.basis`) puedan distinguir
  dato clínico verificado de dato del paciente.
- Si el servidor es una versión reciente de Medplum y prefieren el estilo
  `criteria`, cada entrada equivale a
  `"criteria": "<Recurso>?subject=%patient.id"` (o `patient=%patient.id` según
  el parámetro del recurso); el efecto es el mismo.
