# TRABAJO FINAL: Sistema de Gestión para Academia de Clases de Inglés

**Modelos de Datos 2026-1**

- **Base de Datos:** `english_academy_db`
- **Motor:** PostgreSQL 16

---

## 1. Descripción del Caso

### 1.1 Contexto y Justificación

La Academia de Inglés **"Speak Up"** ofrece clases presenciales grupales e individuales para estudiantes de todos los niveles. Actualmente maneja sus inscripciones y asistencias de forma manual en hojas de cálculo, lo que genera:
- Pérdida de información
- Cobros no registrados
- Dificultad para analizar el rendimiento de profesores y estudiantes

El presente sistema de base de datos centraliza la gestión de **profesores, niveles, salones, sesiones, inscripciones y pagos**. Automatiza además el cobro de una **multa de $10 USD** cada vez que un estudiante inscrito falta a una sesión sin cancelar con anticipación.

### 1.2 Alcance del Sistema

El sistema cubre los siguientes módulos:

- ✓ Gestión de Profesores y Niveles de inglés (A1–C2)
- ✓ Gestión de Salones con capacidad máxima
- ✓ Programación de Sesiones de clase (fecha, hora, duración, cupos)
- ✓ Inscripción de Estudiantes a Sesiones (relación N:M)
- ✓ Registro de Asistencia y generación automática de Multas por inasistencia ($10)

---

## 2. Normalización — Tabla INSCRIPCIONES

A continuación se muestra el proceso de normalización desde una forma no normalizada (**0FN**) hasta la **Tercera Forma Normal (3FN)** para la entidad principal: la reserva de un estudiante a una sesión de clase.

### 2.1 Forma No Normalizada (0FN)

**Estructura original (todo en una sola tabla plana):**

| reserva_id | estudiante_datos | sesion_datos | estado_asistencia |
|---|---|---|---|
| 1 | Juan Pérez \| juan@mail.com \| 1995-03-10 | Lunes 09:00 \| Sala A \| Prof. Gómez \| B1 | Asistió |
| 2 | María López \| mari@mail.com \| 1998-07-22 | Miércoles 11:00 \| Sala B \| Prof. Torres \| A2 | Faltó |

**Problemas:** Grupos de repetición (datos de estudiante y sesión incrustados como cadenas), sin claves claras.

### 2.2 Primera Forma Normal (1FN)

Se eliminan grupos de repetición, todos los valores son atómicos y se define una **clave primaria compuesta (estudiante_id + sesion_id)**:

| est_id | est_nombre | est_email | est_nac | ses_id | ses_fecha | ses_salon | estado |
|---|---|---|---|---|---|---|---|
| 1 | Juan Pérez | juan@m.co | 1995-03-10 | 10 | 2026-01-12 | Sala A | Asistió |
| 2 | María López | mari@m.co | 1998-07-22 | 11 | 2026-01-14 | Sala B | Faltó |

### 2.3 Segunda Forma Normal (2FN)

La clave primaria es compuesta: **(estudiante_id, sesion_id)**. Los atributos del estudiante (nombre, email, fecha_nac) dependen solo de `estudiante_id`, y los de la sesión (fecha, salón) dependen solo de `sesion_id`. Se eliminan esas dependencias parciales extrayendo las tablas ESTUDIANTES y SESIONES:

- **Tabla ESTUDIANTES:** `(estudiante_id PK, nombre, email, fecha_nac)`
- **Tabla SESIONES:** `(sesion_id PK, fecha, hora_inicio, salon_id, ...)`
- **Tabla INSCRIPCIONES:** `(estudiante_id FK, sesion_id FK, estado_asistencia)`

### 2.4 Tercera Forma Normal (3FN)

Se verifica que no existan dependencias transitivas dentro de INSCRIPCIONES. El único atributo no clave es `estado_asistencia`, el cual depende directamente de `(estudiante_id, sesion_id)` y no de otro atributo no clave. La tabla ya está en 3FN.

Adicionalmente, en la tabla SESIONES el atributo `nivel_nombre` dependía de `nivel_id` (dependencia transitiva `sesion→nivel_id→nivel_nombre`). Se resuelve extrayendo la tabla:
- **Tabla NIVELES:** `(nivel_id PK, nombre, descripcion)`

---

## 3. Diccionario de Datos

### 3.1 Tabla: PROFESORES

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| profesor_id | SERIAL | PK, NOT NULL | Identificador único autoincremental del profesor |
| nombre | VARCHAR(80) | NOT NULL | Nombre completo del profesor |
| email | VARCHAR(120) | NOT NULL, UNIQUE | Correo electrónico institucional (único) |
| telefono | VARCHAR(20) | NULL | Número de contacto del profesor |
| especialidad | VARCHAR(50) | NOT NULL, CHECK IN(...) | Nivel máximo que puede enseñar (A1–C2) |
| fecha_contrato | DATE | NOT NULL, DEFAULT CURRENT_DATE | Fecha de vinculación a la academia |

### 3.2 Tabla: NIVELES

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| nivel_id | SERIAL | PK, NOT NULL | Identificador único del nivel |
| nombre | VARCHAR(10) | NOT NULL, UNIQUE | Código del nivel MCER (A1, A2, B1, B2, C1, C2) |
| descripcion | TEXT | NULL | Descripción de las competencias del nivel |
| duracion_semanas | INTEGER | NOT NULL, CHECK > 0 | Duración del nivel en semanas |
| precio | NUMERIC(8,2) | NOT NULL, CHECK >= 0 | Precio de matrícula del nivel en USD |

### 3.3 Tabla: SALONES

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| salon_id | SERIAL | PK, NOT NULL | Identificador único del salón |
| nombre | VARCHAR(50) | NOT NULL, UNIQUE | Nombre o código del salón (ej. Sala A) |
| capacidad | INTEGER | NOT NULL, CHECK > 0 | Número máximo de estudiantes por sesión |
| equipado | BOOLEAN | NOT NULL, DEFAULT TRUE | Indica si dispone de proyector/TV/audio |

### 3.4 Tabla: ESTUDIANTES

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| estudiante_id | SERIAL | PK, NOT NULL | Identificador único autoincremental |
| nombre | VARCHAR(100) | NOT NULL | Nombre completo del estudiante |
| email | VARCHAR(120) | NOT NULL, UNIQUE | Correo electrónico del estudiante (único) |
| telefono | VARCHAR(20) | NULL | Número de contacto |
| fecha_nacimiento | DATE | NOT NULL | Fecha de nacimiento del estudiante |
| fecha_registro | DATE | NOT NULL, DEFAULT CURRENT_DATE | Fecha de inscripción en la academia |
| saldo_pendiente | NUMERIC(10,2) | NOT NULL, DEFAULT 0, CHECK >= 0 | Suma de multas no pagadas en USD |

### 3.5 Tabla: SESIONES

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| sesion_id | SERIAL | PK, NOT NULL | Identificador único de la sesión |
| nivel_id | INTEGER | FK → NIVELES, NOT NULL | Nivel de inglés al que pertenece la sesión |
| profesor_id | INTEGER | FK → PROFESORES, NOT NULL | Profesor asignado a la sesión |
| salon_id | INTEGER | FK → SALONES, NOT NULL | Salón donde se dicta la sesión |
| fecha | DATE | NOT NULL | Fecha en que se realiza la sesión |
| hora_inicio | TIME | NOT NULL | Hora de inicio de la sesión |
| duracion_min | INTEGER | NOT NULL, CHECK > 0 | Duración en minutos (ej. 60, 90) |
| cupos_disponibles | INTEGER | NOT NULL, CHECK >= 0 | Cupos restantes para inscripción |

### 3.6 Tabla: INSCRIPCIONES (N:M)

Tabla intermedia que resuelve la relación **Muchos a Muchos** entre ESTUDIANTES y SESIONES.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| inscripcion_id | SERIAL | PK, NOT NULL | Identificador único del registro |
| estudiante_id | INTEGER | FK → ESTUDIANTES, NOT NULL | Estudiante inscrito en la sesión |
| sesion_id | INTEGER | FK → SESIONES, NOT NULL | Sesión a la que asiste el estudiante |
| fecha_inscripcion | DATE | NOT NULL, DEFAULT CURRENT_DATE | Fecha en que se realizó la inscripción |
| estado_asistencia | VARCHAR(20) | NOT NULL, DEFAULT 'Programada', CHECK IN(...) | Estado: Programada, Asistió, Faltó, Cancelada |

### 3.7 Tabla: MULTAS

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| multa_id | SERIAL | PK, NOT NULL | Identificador único de la multa |
| inscripcion_id | INTEGER | FK → INSCRIPCIONES, NOT NULL | Inscripción que originó la multa |
| estudiante_id | INTEGER | FK → ESTUDIANTES, NOT NULL | Estudiante sancionado (desnorm. para rapidez) |
| monto | NUMERIC(8,2) | NOT NULL, DEFAULT 10.00, CHECK > 0 | Monto de la multa en USD |
| fecha_generacion | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha y hora en que se generó la multa |
| estado_pago | VARCHAR(20) | NOT NULL, DEFAULT 'Pendiente', CHECK IN(...) | Estado: Pendiente, Pagada |

---

## 4. Lógica Avanzada

### 4.1 Trigger: Generación Automática de Multa

**Nombre:** `trg_multa_por_inasistencia`

**Disparo:** AFTER UPDATE en la tabla INSCRIPCIONES sobre la columna `estado_asistencia`.

**Condición:** Si el nuevo valor es **'Faltó'**, inserta automáticamente un registro en MULTAS con monto **$10** y actualiza el campo `saldo_pendiente` del estudiante correspondiente.

**Justificación:** Garantiza que ninguna falta quede sin multa asociada, eliminando la posibilidad de error humano en el proceso de cobranza.

### 4.2 Procedimiento Almacenado: Inscribir Estudiante

**Nombre:** `inscribir_estudiante(p_estudiante_id, p_sesion_id)`

**Lógica:** Verifica que existan cupos disponibles (`cupos_disponibles > 0`) en la sesión. Si hay cupo, inserta el registro en INSCRIPCIONES y decrementa `cupos_disponibles` en SESIONES. Si no hay cupo, lanza un error descriptivo.

**Justificación:** Encapsula la lógica de negocio crítica (control de cupos) en un único punto del sistema, asegurando integridad independientemente del cliente que realice la operación.

---

## 5. Resumen del Modelo Relacional

Las tablas y sus relaciones se describen a continuación (→ indica FK):

| Tabla | Relaciones clave |
|---|---|
| **NIVELES** | Sin FK saliente. Referenciada por SESIONES(nivel_id) |
| **SALONES** | Sin FK saliente. Referenciada por SESIONES(salon_id) |
| **PROFESORES** | Sin FK saliente. Referenciada por SESIONES(profesor_id) |
| **SESIONES** | nivel_id → NIVELES \| profesor_id → PROFESORES \| salon_id → SALONES |
| **ESTUDIANTES** | Sin FK saliente. Referenciada por INSCRIPCIONES y MULTAS |
| **INSCRIPCIONES (N:M)** | estudiante_id → ESTUDIANTES \| sesion_id → SESIONES (PK compuesta alternativa UNIQUE) |
| **MULTAS** | inscripcion_id → INSCRIPCIONES \| estudiante_id → ESTUDIANTES |

---

## 🚀 Guía de Ejecución

Este proyecto está completamente dockerizado para facilitar su despliegue y desarrollo.

### 6.1 Requisitos Previos
- Docker y Docker Compose instalados.
- Node.js v22+ (opcional, para desarrollo local sin Docker).

### 6.2 Ejecución con Docker (Recomendado)

Para levantar toda la infraestructura (Base de Datos, API, Frontend y Prisma Studio):

```bash
# Construir y levantar los contenedores
docker compose up --build -d

# Detener los servicios
docker compose down
```

**Servicios Disponibles:**
- **Frontend (UI):** [http://localhost](http://localhost)
- **Backend (API):** [http://localhost:3000/api](http://localhost:3000/api)
- **Prisma Studio (Explorador DB):** [http://localhost:5555](http://localhost:5555)

### 6.3 Configuración de Base de Datos (Primera vez)

Si los contenedores están corriendo, puedes inicializar la base de datos y cargar los datos de prueba (seed):

```bash
# Ejecutar migraciones
docker exec -it speakup_api npx prisma migrate dev --name init

# Cargar triggers y procedimientos SQL (opcional si ya están en migrations)
docker exec -it speakup_api npx prisma db execute --file ./prisma/extra_constraints_and_triggers.sql

# Cargar datos de prueba
docker exec -it speakup_api node prisma/seed.js
```

### 6.4 Desarrollo Local (Sin Docker)

Si prefieres ejecutar los servicios de forma independiente:

**Backend:**
```bash
cd backend
npm install
# Configura el .env con tu DATABASE_URL
npx prisma migrate dev
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 📄 Archivos del Proyecto

El script SQL completo **(DDL + DML + consultas + trigger + SP)** se entrega como archivo separado:
- `english_academy.sql`

---

**Autores:** Marjaisabel Zuluaga Quintero - Juan Diego Gómez Guzmán - Valentina Sierra Ospina