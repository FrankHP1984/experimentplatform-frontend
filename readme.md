# Documento de Especificación Inicial

## Plataforma de Diseño y Gestión de Experimentos con Participantes

---

# 1. Descripción general del proyecto

El proyecto consiste en el desarrollo de una **aplicación web para diseñar, configurar y gestionar experimentos con participantes humanos**, permitiendo definir:

* Diseños experimentales estructurados
* Grupos de participantes
* Fases del experimento
* Cuestionarios o registros de datos
* Recogida de respuestas por parte de los participantes

El sistema permitirá que **investigadores diseñen estudios y recojan datos estructurados** de participantes a lo largo del tiempo.

La plataforma no realizará análisis clínicos ni estadísticos complejos, centrándose en la **gestión metodológica y recogida de datos**.

---

# 2. Objetivos funcionales

El sistema debe permitir:

1. Crear y gestionar **experimentos**.
2. Definir **diseños experimentales** (pretest–postest, entre sujetos, longitudinal).
3. Crear **grupos de participantes** dentro de un experimento.
4. Definir **fases temporales del experimento**.
5. Definir **preguntas o formularios de recogida de datos**.
6. Permitir que los **participantes respondan cuestionarios**.
7. Permitir a los investigadores **consultar los datos recogidos**.

---

# 3. Tipos de usuario

## Investigador

Puede:

* Crear experimentos
* Definir fases y grupos
* Crear cuestionarios
* Invitar participantes
* Consultar respuestas

## Participante

Puede:

* Acceder a experimentos en los que participa
* Completar cuestionarios
* Registrar datos solicitados

## Administrador (opcional)

Puede:

* Gestionar usuarios
* Supervisar el sistema

---

# 4. Arquitectura tecnológica

## Backend

Tecnología principal:

* Java
* Spring Boot
* Spring Data JPA
* Spring Security
* JWT para autenticación
* PostgreSQL como base de datos

Arquitectura:

* REST API
* Arquitectura MVC

Capas del backend:

Controller → Service → Repository → Database

---

## Frontend

Tecnología prevista:

* React
* TypeScript
* Consumo de API REST

El frontend incluirá:

* Panel de investigador
* Panel de participante
* Formularios dinámicos

---

# 5. Modelo de datos inicial

Las entidades principales del sistema son:

---

## User

Representa a cualquier usuario del sistema.

Campos:

* id
* email
* password
* role (RESEARCHER / PARTICIPANT / ADMIN)
* createdAt

---

## Experiment

Representa un estudio o experimento.

Campos:

* id
* title
* description
* designType
* startDate
* endDate
* status
* owner (User)

Relaciones:

* Un experimento tiene múltiples fases
* Un experimento tiene múltiples grupos
* Un experimento tiene múltiples participantes

---

## Group

Representa un grupo dentro de un experimento.

Ejemplo:

* grupo control
* grupo experimental

Campos:

* id
* name
* description
* experimentId

---

## Phase

Representa una fase temporal del experimento.

Ejemplo:

* Pretest
* Intervención
* Postest

Campos:

* id
* name
* phaseOrder
* startDate
* endDate
* experimentId

---

## Question

Representa una pregunta o elemento de recogida de datos.

Campos:

* id
* text
* type (TEXT, NUMBER, SCALE, MULTIPLE_CHOICE, BOOLEAN)
* required
* orderIndex
* phaseId

---

## Participant

Representa la participación de un usuario en un experimento.

Campos:

* id
* userId
* experimentId
* groupId
* status
* joinedAt

---

## Response

Representa una respuesta de un participante a una pregunta.

Campos:

* id
* participantId
* questionId
* value
* createdAt

---

# 6. Relaciones principales

Relaciones simplificadas:

User
│
├── Experiment (owner)
│
Experiment
├── Group
├── Phase
├── Participant

Phase
└── Question

Participant
└── Response

Question
└── Response

---

# 7. Endpoints principales de la API (primera versión)

## Autenticación

POST /auth/register
POST /auth/login

---

## Experimentos

GET /experiments
POST /experiments
GET /experiments/{id}
PUT /experiments/{id}
DELETE /experiments/{id}

---

## Grupos

POST /experiments/{id}/groups

---

## Fases

POST /experiments/{id}/phases

---

## Preguntas

POST /phases/{id}/questions

---

## Participantes

POST /experiments/{id}/participants
GET /experiments/{id}/participants

---

## Respuestas

POST /responses
GET /experiments/{id}/responses

---

# 8. Seguridad

El sistema utilizará:

* **JWT (JSON Web Token)** para autenticación
* **Spring Security**
* Control de acceso basado en roles (RBAC)

Roles:

* RESEARCHER
* PARTICIPANT
* ADMIN

---

# 9. Estructura inicial del proyecto

Estructura recomendada del backend:

com.example.experimentplatform

packages:

controller
service
repository
model
dto
security
config

---

# 10. Alcance del primer prototipo

La primera versión del sistema deberá incluir:

* Gestión de usuarios
* Autenticación JWT
* Creación de experimentos
* Definición de grupos
* Definición de fases
* Creación de preguntas
* Registro de participantes
* Envío de respuestas

No incluye aún:

* Análisis estadístico
* Visualización avanzada
* Integración con dispositivos externos

---

# 11. Objetivo de esta primera generación de código

Generar la **estructura inicial de backend en Spring Boot** que incluya:

* Entidades JPA
* Repositories
* Services
* Controllers
* DTOs básicos
* Configuración de seguridad JWT
* Conexión con PostgreSQL
* API REST funcional

# 12. Principios arquitectónicos y patrones de diseño

El desarrollo del backend seguirá una arquitectura modular basada en buenas prácticas ampliamente utilizadas en aplicaciones empresariales con Spring Boot.

El objetivo es mantener una **separación clara de responsabilidades**, facilitar la **escalabilidad del sistema** y permitir la **evolución futura del proyecto** sin generar acoplamientos innecesarios.

---

## 12.1 Arquitectura por capas

El sistema seguirá una arquitectura clásica por capas:

Controller → Service → Repository → Database

Cada capa tendrá responsabilidades claramente definidas.

### Controller

Responsabilidades:

* Exponer endpoints REST.
* Recibir y validar las peticiones HTTP.
* Convertir datos de entrada en objetos de dominio o DTOs.
* Delegar la lógica de negocio a los servicios.

Los controllers **no deben contener lógica de negocio compleja**.

---

### Service

Responsabilidades:

* Implementar la lógica de negocio del sistema.
* Coordinar operaciones entre repositorios.
* Aplicar validaciones de dominio.
* Gestionar transacciones.

Los servicios representan la **capa central del dominio de la aplicación**.

---

### Repository

Responsabilidades:

* Acceso a la base de datos.
* Persistencia de entidades.
* Consultas a través de Spring Data JPA.

Los repositories deben contener **solo lógica de acceso a datos**, sin lógica de negocio.

---

## 12.2 Uso de DTO (Data Transfer Objects)

El sistema utilizará **DTOs** para separar el modelo interno de persistencia del modelo expuesto a la API.

Esto permite:

* Evitar exponer directamente las entidades JPA.
* Controlar qué información se envía al frontend.
* Facilitar la evolución de la API sin afectar al modelo de datos.

Tipos principales de DTO:

* DTO de salida (Response DTO)
* DTO de entrada (Request DTO)

---

## 12.3 Principio de responsabilidad única (SRP)

Cada clase debe tener **una única responsabilidad bien definida**.

Ejemplos:

* Las entidades representan datos.
* Los repositories gestionan persistencia.
* Los services gestionan lógica de negocio.
* Los controllers gestionan comunicación HTTP.

Este principio facilita el mantenimiento del sistema.

---

## 12.4 Patrón Repository

Se utilizará el patrón Repository mediante **Spring Data JPA**, lo que permite abstraer el acceso a datos y trabajar con entidades de dominio en lugar de consultas SQL directas.

Cada entidad persistente tendrá su correspondiente repository.

Ejemplo conceptual:

User → UserRepository
Experiment → ExperimentRepository
Participant → ParticipantRepository

---

## 12.5 Patrón Service Layer

Se utilizará una **capa de servicios** que encapsule la lógica de negocio.

Este patrón evita que los controllers accedan directamente a los repositories y permite centralizar reglas de negocio.

Ejemplo:

ExperimentController
→ ExperimentService
→ ExperimentRepository

---

## 12.6 Agregados de dominio (aproximación ligera)

Se considerará **Experiment como agregado principal del dominio**.

Esto implica que entidades relacionadas como:

* Phase
* Group
* Question

están conceptualmente subordinadas a un experimento.

Muchas operaciones sobre estas entidades se gestionarán a través de **ExperimentService** para mantener coherencia del dominio.

---

## 12.7 Uso de enumeraciones para estados y tipos

Se utilizarán enumeraciones (enum) para representar estados y tipos dentro del dominio.

Ejemplos:

ExperimentStatus

* DRAFT
* ACTIVE
* FINISHED

UserRole

* RESEARCHER
* PARTICIPANT
* ADMIN

QuestionType

* TEXT
* NUMBER
* SCALE
* MULTIPLE_CHOICE
* BOOLEAN

Esto mejora la seguridad del tipo y la claridad del código.

---

## 12.8 Seguridad y control de acceso

La seguridad del sistema se implementará mediante:

* Spring Security
* JWT (JSON Web Tokens)
* Control de acceso basado en roles (RBAC)

Las rutas del sistema estarán protegidas según el rol del usuario.

Ejemplo:

Investigadores

* Crear experimentos
* Configurar fases y preguntas
* Consultar resultados

Participantes

* Acceder a experimentos asignados
* Responder cuestionarios

---

## 12.9 Preparación para escalabilidad

Aunque el sistema inicial se implementará como un **monolito modular**, la arquitectura se diseñará de forma que permita futuras ampliaciones, como:

* nuevos tipos de experimentos
* nuevos tipos de cuestionarios
* integración con APIs externas
* módulos de análisis de datos

Esto se logrará mediante una correcta separación de capas y un diseño modular del dominio.
