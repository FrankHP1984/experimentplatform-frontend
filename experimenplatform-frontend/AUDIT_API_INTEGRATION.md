# 🔍 AUDITORÍA: Integración Frontend-Backend

**Fecha:** 16 Abril 2026  
**Objetivo:** Mapear componentes React con APIs disponibles del backend

---

## 📊 RESUMEN EJECUTIVO

### Estado General:
- **Total componentes:** 12
- **Completamente implementados (UI):** 4 (33%)
- **Conectados a APIs reales:** 0 (0%)
- **Pendientes de implementar:** 8 (67%)

---

## 🎯 COMPONENTES IMPLEMENTADOS (UI Completa)

### ✅ 1. Dashboard (Researcher)
**Archivo:** `src/pages/researcher/Dashboard.jsx`  
**Estado UI:** ✅ Implementado  
**Estado API:** ❌ Usa datos mock

#### APIs Backend Disponibles:
- ✅ `GET /api/experiments/my` - Obtener experimentos del investigador
- ✅ `GET /api/experiments/{id}/participants` - Obtener participantes
- ✅ `GET /api/experiments/{id}/responses` - Obtener respuestas

#### Funciones API Frontend Existentes:
- ✅ `src/api/experiments.js` - `fetchMyExperiments()`
- ✅ `src/api/enrollments.js` - `fetchExperimentParticipants()`
- ✅ `src/api/responses.js` - `fetchExperimentResponses()`

#### Acción Requerida:
🔧 **CONECTAR** - Reemplazar mock data con llamadas API reales
- Líneas a modificar: ~50-80 (useEffect inicial)
- Complejidad: BAJA

---

### ✅ 2. ExperimentWizard (Researcher)
**Archivo:** `src/pages/researcher/ExperimentWizard.jsx`  
**Estado UI:** ✅ Implementado  
**Estado API:** ⚠️ Parcialmente conectado

#### APIs Backend Disponibles:
- ✅ `POST /api/experiments` - Crear experimento
- ✅ `POST /api/experiments/{id}/groups` - Crear grupos
- ✅ `POST /api/experiments/{id}/phases` - Crear fases
- ✅ `POST /api/questions/phases/{phaseId}` - Crear preguntas

#### Funciones API Frontend Existentes:
- ✅ `src/api/experiments.js` - `createExperiment()`
- ✅ `src/api/groups.js` - `createGroup()`
- ✅ `src/api/phases.js` - `createPhase()`
- ✅ `src/api/questions.js` - `createQuestion()`

#### Acción Requerida:
🔧 **VERIFICAR Y COMPLETAR** - Ya tiene algunas llamadas API, verificar que todas funcionen
- Líneas a revisar: ~400-500 (handleSubmit)
- Complejidad: MEDIA

---

### ✅ 3. ParticipantDetail (Researcher)
**Archivo:** `src/pages/researcher/ParticipantDetail.jsx`  
**Estado UI:** ✅ Implementado  
**Estado API:** ❌ Usa datos mock

#### APIs Backend Disponibles:
- ✅ `GET /api/participants/{id}` - Obtener participante
- ✅ `GET /api/enrollments/participants/{participantId}` - Obtener inscripciones
- ✅ `GET /api/questions/enrollments/{enrollmentId}/responses` - Obtener respuestas
- ❌ `PUT /api/participants/{id}/group` - **NO EXISTE** (cambiar grupo)
- ❌ `POST /api/participants/{id}/reminder` - **NO EXISTE** (enviar recordatorio)
- ✅ `PUT /api/enrollments/{id}/status` - Cambiar estado inscripción (puede usarse para dar de baja)

#### Funciones API Frontend:
- ❌ **FALTAN** - No existen funciones en `src/api/participants.js`

#### Acción Requerida:
🔧 **CREAR APIs + CONECTAR**
1. Crear `src/api/participants.js` con funciones necesarias
2. Implementar endpoints faltantes en backend (cambiar grupo, recordatorio)
3. Conectar componente con APIs
- Complejidad: ALTA

---

### ✅ 4. ProfileResearcher
**Archivo:** `src/pages/researcher/ProfileResearcher.jsx`  
**Estado UI:** ✅ Implementado  
**Estado API:** ❌ Usa datos mock

#### APIs Backend Disponibles:
- ✅ `GET /api/users/me` - Obtener perfil usuario
- ❌ `PUT /api/users/me` - **NO EXISTE** (actualizar perfil)

#### Funciones API Frontend Existentes:
- ✅ `src/api/users.js` - `fetchMe()`
- ⚠️ `src/api/users.js` - `updateMe()` existe pero endpoint NO

#### Acción Requerida:
🔧 **CREAR ENDPOINT + CONECTAR**
1. Crear `PUT /api/users/me` en backend
2. Conectar formulario con API
- Complejidad: MEDIA

---

## 📝 COMPONENTES PENDIENTES DE IMPLEMENTAR

### ❌ 5. ExperimentDetail (Researcher)
**Archivo:** `src/pages/researcher/ExperimentDetail.jsx`  
**Estado:** ⚠️ Parcialmente implementado

#### APIs Backend Disponibles:
- ✅ `GET /api/experiments/{id}` - Detalle experimento
- ✅ `GET /api/experiments/{id}/participants` - Participantes
- ✅ `GET /api/experiments/{id}/phases` - Fases
- ✅ `GET /api/experiments/{id}/groups` - Grupos
- ✅ `PUT /api/experiments/{id}` - Actualizar experimento
- ✅ `POST /api/experiments/{id}/finish` - Finalizar experimento
- ✅ `DELETE /api/experiments/{id}` - Eliminar experimento

#### Acción Requerida:
🔨 **COMPLETAR IMPLEMENTACIÓN** - Tiene estructura pero falta UI completa
- Complejidad: ALTA

---

### ❌ 6. ResponsesAnalytics (Researcher)
**Archivo:** `src/pages/researcher/ResponsesAnalytics.jsx`  
**Estado:** ⚠️ Parcialmente implementado

#### APIs Backend Disponibles:
- ✅ `GET /api/experiments/{id}/responses` - Todas las respuestas
- ✅ `GET /api/questions/{questionId}/responses` - Respuestas por pregunta

#### Acción Requerida:
🔨 **COMPLETAR IMPLEMENTACIÓN** - Tiene estructura pero falta gráficos y filtros
- Complejidad: ALTA

---

### ❌ 7. Onboarding (Researcher)
**Archivo:** `src/pages/researcher/Onboarding.jsx`  
**Estado:** ⚠️ Parcialmente implementado

#### APIs Backend Disponibles:
- ✅ `POST /api/users/sync` - Sincronizar usuario
- ⚠️ Posiblemente necesite crear perfil investigador

#### Acción Requerida:
🔨 **COMPLETAR IMPLEMENTACIÓN** - Wizard de onboarding
- Complejidad: MEDIA

---

### ❌ 8. DashboardParticipant
**Archivo:** `src/pages/participant/DashboardParticipant.jsx`  
**Estado:** 🔴 Placeholder

#### APIs Backend Disponibles:
- ✅ `GET /api/enrollments/me` - Mis inscripciones
- ✅ `GET /api/questions/enrollments/{enrollmentId}/responses` - Mis respuestas

#### Acción Requerida:
🔨 **IMPLEMENTAR DESDE CERO**
- Complejidad: MEDIA

---

### ❌ 9. Questionnaire (Participant)
**Archivo:** `src/pages/participant/Questionnaire.jsx`  
**Estado:** 🔴 Placeholder

#### APIs Backend Disponibles:
- ✅ `GET /api/questions/phases/{phaseId}` - Obtener preguntas de fase
- ✅ `POST /api/questions/enrollments/{enrollmentId}/responses` - Enviar respuesta
- ✅ `GET /api/questions/enrollments/{enrollmentId}/phases/{phaseId}/responses` - Ver respuestas previas

#### Acción Requerida:
🔨 **IMPLEMENTAR DESDE CERO**
- Complejidad: ALTA (múltiples tipos de preguntas)

---

### ❌ 10. ProfileParticipant
**Archivo:** `src/pages/participant/ProfileParticipant.jsx`  
**Estado:** 🔴 Placeholder

#### APIs Backend Disponibles:
- ✅ `GET /api/participants/me` - Mi perfil participante
- ✅ `PUT /api/participants/{id}` - Actualizar perfil

#### Acción Requerida:
🔨 **IMPLEMENTAR DESDE CERO**
- Complejidad: BAJA

---

### ❌ 11. ParticipantInvite (Public)
**Archivo:** `src/pages/public/ParticipantInvite.jsx`  
**Estado:** 🔴 Placeholder

#### APIs Backend Disponibles:
- ✅ `GET /api/invitations/{token}` - Obtener invitación
- ✅ `POST /api/invitations/{token}/accept` - Aceptar invitación
- ✅ `POST /api/invitations/{token}/decline` - Rechazar invitación

#### Acción Requerida:
🔨 **IMPLEMENTAR DESDE CERO**
- Complejidad: MEDIA

---

### ❌ 12. NotFound (Error)
**Archivo:** `src/pages/errors/NotFound.jsx`  
**Estado:** 🔴 Placeholder

#### APIs Backend:
- N/A (página estática)

#### Acción Requerida:
🔨 **IMPLEMENTAR DESDE CERO**
- Complejidad: MUY BAJA

---

## 🔧 ENDPOINTS FALTANTES EN BACKEND

### Críticos (necesarios para componentes implementados):
1. ❌ `PUT /api/users/me` - Actualizar perfil investigador
2. ❌ `PUT /api/participants/{id}/group` - Cambiar grupo de participante
3. ❌ `POST /api/participants/{id}/reminder` - Enviar recordatorio

### Opcionales (mejoras futuras):
4. ❌ `GET /api/participants/{id}/activity` - Actividad reciente del participante
5. ❌ `GET /api/experiments/{id}/analytics` - Analytics agregados del experimento

---

## 📋 PLAN DE ACCIÓN RECOMENDADO

### FASE 1: Conectar lo ya implementado (Prioridad ALTA) ⚡
**Tiempo estimado:** 2-3 horas

1. **Dashboard** - Conectar con APIs reales
   - Modificar `Dashboard.jsx` líneas 50-80
   - Usar `fetchMyExperiments()`, `fetchExperimentParticipants()`

2. **ProfileResearcher** - Crear endpoint + conectar
   - Backend: Crear `PUT /api/users/me` en `UserController.java`
   - Frontend: Conectar formulario con `updateMe()`

3. **ExperimentWizard** - Verificar conexiones existentes
   - Revisar que todas las llamadas API funcionen
   - Probar flujo completo de creación

---

### FASE 2: Completar endpoints críticos (Prioridad ALTA) 🔧
**Tiempo estimado:** 3-4 horas

1. **Backend - ParticipantController:**
   - Agregar `PUT /api/participants/{id}/group`
   - Agregar `POST /api/participants/{id}/reminder`

2. **Frontend - participants.js:**
   - Crear archivo `src/api/participants.js`
   - Implementar funciones necesarias

3. **ParticipantDetail** - Conectar con APIs
   - Reemplazar mock data
   - Conectar modales con endpoints reales

---

### FASE 3: Implementar componentes pendientes (Prioridad MEDIA) 🚀
**Tiempo estimado:** 8-12 horas

**Orden sugerido:**
1. **NotFound** (30 min) - Más fácil
2. **ProfileParticipant** (2h) - Similar a ProfileResearcher
3. **ParticipantInvite** (3h) - Flujo crítico
4. **DashboardParticipant** (3h) - Similar a Dashboard researcher
5. **Questionnaire** (4h) - Más complejo (múltiples tipos)

---

### FASE 4: Completar parcialmente implementados (Prioridad BAJA) 📊
**Tiempo estimado:** 6-8 horas

1. **ExperimentDetail** - Completar UI y funcionalidad
2. **ResponsesAnalytics** - Implementar gráficos y filtros
3. **Onboarding** - Completar wizard

---

## 📈 MÉTRICAS DE PROGRESO

### Cobertura API:
- **Endpoints disponibles:** ~40
- **Endpoints utilizados:** ~10 (25%)
- **Endpoints faltantes críticos:** 3

### Cobertura Componentes:
- **UI implementada:** 4/12 (33%)
- **Conectados a API:** 0/12 (0%)
- **Funcionales end-to-end:** 0/12 (0%)

### Estimación Total:
- **Horas para conectar existentes:** 2-3h
- **Horas para crear endpoints:** 3-4h
- **Horas para implementar pendientes:** 14-20h
- **TOTAL:** 19-27 horas de trabajo

---

## 🎯 PRÓXIMO PASO INMEDIATO

**Recomendación:** Empezar con FASE 1 - Conectar Dashboard

```javascript
// src/pages/researcher/Dashboard.jsx
// Línea ~50 - Reemplazar:
const mockExperiments = [...]

// Por:
useEffect(() => {
  const loadData = async () => {
    try {
      const data = await fetchMyExperiments()
      setExperiments(data.content)
    } catch (error) {
      console.error('Error loading experiments:', error)
    }
  }
  loadData()
}, [])
```

---

**Documento generado automáticamente**  
**Última actualización:** 16 Abril 2026, 19:13 UTC+2
