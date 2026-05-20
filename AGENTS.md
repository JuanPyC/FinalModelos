# AGENTS.md — Sistema de Gestión Academia de Inglés "Speak Up"

**Proyecto Final**: Modelos de Datos 2026-1  
**Autores**: Marjaisabel Zuluaga Quintero, Juan Diego Gómez Guzmán  
**Fecha**: 2026

---

## 📋 Resumen del Proyecto

Sistema fullstack para gestionar la Academia de Inglés **"Speak Up"**, automatizando:
- ✅ Inscripción de estudiantes a sesiones de clase
- ✅ Control de asistencia y generación automática de multas ($10 USD por falta)
- ✅ Gestión de profesores, niveles (A1–C2 MCER), salones y sesiones
- ✅ Cálculo automático de saldo pendiente del estudiante

**Contexto**: Reemplaza el sistema manual en hojas de cálculo por una BD centralizada.

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                 │
│  • Gestión de estudiantes, profesores, sesiones             │
│  • Consulta de multas y saldo pendiente                      │
│  • Dashboard administrativo                                  │
└─────────────────────────────────────────────────────────────┘
                              ↕
                         HTTP REST API
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Express + Prisma)                 │
│  • CRUD endpoints para cada entidad                          │
│  • Validación de lógica de negocio (cupos, multas)          │
│  • Integración con BD PostgreSQL                             │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│       DATABASE (PostgreSQL + Triggers + Procedimientos)      │
│  • 7 tablas relacionales (ver schema.prisma)                │
│  • Trigger: Multa automática por inasistencia               │
│  • SP: Inscripción con validación de cupos                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura del Proyecto

```
FinalModelos/
├── README.md              # Documentación completa (3FN, diccionario datos)
├── FINAL.md               # Rúbrica de evaluación del trabajo final
├── AGENTS.md              # Este archivo
├── backend/
│   ├── package.json       # Dependencies: Express 5.2 (sin rutas aún)
│   ├── prisma.config.ts   # Configuración de Prisma
│   ├── .env               # DATABASE_URL para PostgreSQL
│   └── prisma/
│       └── schema.prisma  # ⚠️ VACÍO - Por implementar con 7 tablas
└── frontend/
    ├── package.json       # React 19, Vite 8, TypeScript 6, ESLint
    ├── vite.config.ts     # Configuración de build
    ├── tsconfig.json      # Configuración de TypeScript
    └── src/
        ├── App.tsx        # ⚠️ Solo boilerplate - Por reemplazar
        ├── main.tsx       # Punto de entrada
        └── index.css      # Estilos globales
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|----------|
| **Frontend** | React | 19.2 | UI interactiva |
| | Vite | 8.0 | Build tool rápido |
| | TypeScript | 6.0 | Type safety |
| | ESLint | 10.3 | Linting |
| **Backend** | Express | 5.2 | Server HTTP |
| | Prisma | Latest | ORM + migrations |
| | PostgreSQL | 16 | Base de datos |
| **Devtools** | Node.js | 20+ | Runtime |
| | npm | Latest | Package manager |

---

## 🗄️ Modelo de Datos (3FN)

### Relación de Tablas

```
NIVELES (A1-C2)
  ↓ 1:N ↓
PROFESORES    SALONES
  ↓      ↘ 1:N ↙
    SESIONES (Tercera Forma Normal)
      ↓ 1:N ↓
INSCRIPCIONES (N:M entre Estudiantes ↔ Sesiones)
      ↑
  ESTUDIANTES ← 1:N ← MULTAS
```

### Tabla Principal: INSCRIPCIONES (Relación N:M)

**Normalización**: 0FN → 1FN → 2FN → 3FN (ver [README.md](README.md#2-normalización--tabla-inscripciones))

**Atributos**:
- `inscripcion_id` (PK)
- `estudiante_id` (FK → ESTUDIANTES)
- `sesion_id` (FK → SESIONES)
- `fecha_inscripcion` (DEFAULT CURRENT_DATE)
- `estado_asistencia` (DEFAULT 'Programada': Programada | Asistió | Faltó | Cancelada)

### Diccionario de Datos Completo

Consultar [README.md § 3 Diccionario de Datos](README.md#3-diccionario-de-datos)

---

## ⚙️ Lógica Avanzada (Triggers + Procedimientos)

### 1. Trigger: Multa Automática por Inasistencia

**Nombre**: `trg_multa_por_inasistencia`

**Evento**: AFTER UPDATE on INSCRIPCIONES (columna `estado_asistencia`)

**Lógica**:
```
Si estado_asistencia = 'Faltó' ENTONCES
  ├─ INSERT en MULTAS (monto=$10, estado_pago='Pendiente')
  └─ UPDATE ESTUDIANTES.saldo_pendiente += $10
```

**Justificación**: Garantiza que ninguna falta genere inconsistencia en cobranza. Elimina riesgo de error humano.

**Archivo SQL**: [README.md § 4.1](README.md#41-trigger-generación-automática-de-multa)

### 2. Procedimiento Almacenado: Inscribir Estudiante

**Nombre**: `inscribir_estudiante(p_estudiante_id, p_sesion_id)`

**Lógica**:
```
VERIFICAR cupos_disponibles > 0 en SESIONES
  SI ✓ ENTONCES
    ├─ INSERT en INSCRIPCIONES
    └─ UPDATE SESIONES.cupos_disponibles -= 1
  SI ✗ ENTONCES
    └─ RAISE ERROR 'Sin cupos disponibles'
```

**Justificación**: Centraliza lógica crítica de negocio. Integridad garantizada desde cualquier cliente (web, mobile, CLI).

**Archivo SQL**: [README.md § 4.2](README.md#42-procedimiento-almacenado-inscribir-estudiante)

---

## 🚀 Guía de Desarrollo

### 1️⃣ Configurar Base de Datos

```bash
cd backend

# Verificar .env (PostgreSQL URL)
cat .env

# Implementar schema Prisma con 7 tablas (ver README.md)
# Editar prisma/schema.prisma
# Incluir modelos: Profesor, Nivel, Salon, Estudiante, Sesion, Inscripcion, Multa

# Crear migración
npx prisma migrate dev --name init

# Generar Prisma Client
npx prisma generate

# Rellenar BD con datos de prueba (mínimo 10 por tabla)
# Editar prisma/seed.ts o ejecutar INSERT manuales
```

### 2️⃣ Implementar Backend (Express)

```bash
cd backend

# Instalar dependencias faltantes
npm install prisma dotenv cors

# Crear estructura de carpetas
mkdir -p src/{routes,controllers,middleware}

# Implementar:
# ✅ src/server.ts - Express setup
# ✅ src/routes/* - CRUD endpoints
# ✅ src/controllers/* - Lógica de negocio
# ✅ Validación de cupos y multas
```

**Endpoints por implementar**:
- `POST /api/profesores` - Crear profesor
- `POST /api/estudiantes` - Crear estudiante
- `POST /api/sesiones` - Crear sesión
- `POST /api/inscripciones` - Inscribir estudiante (usar SP)
- `GET /api/estudiantes/:id/multas` - Consultar multas pendientes
- `PATCH /api/inscripciones/:id` - Marcar asistencia/falta (dispara trigger)

### 3️⃣ Implementar Frontend (React + Vite)

```bash
cd frontend

npm run dev    # Iniciar servidor dev
npm run build  # Build para producción
npm run lint   # Ejecutar ESLint
```

**Componentes por crear**:
- `<StudentForm />` - Formulario de registro
- `<SessionList />` - Listado de sesiones disponibles
- `<InscriptionForm />` - Inscripción a sesión
- `<AttendanceTracker />` - Marcar asistencia/falta
- `<FinesPanel />` - Visualizar multas pendientes
- `<AdminDashboard />` - Panel administrativo

---

## 📝 Requisitos de Evaluación

Según [FINAL.md](FINAL.md):

| Criterio | Puntos | Estado |
|----------|--------|--------|
| **DDL** (CREATE DB, tables, constraints) | 0.7 | ⏳ Por implementar |
| **DML** (INSERT, SELECT básicos) | 0.8 | ⏳ Por implementar |
| **JOINs** (mínimo 3 consultas) | 0.4 | ⏳ Por implementar |
| **Operaciones de conjuntos** (UNION/EXCEPT) | 0.2 | ⏳ Por implementar |
| **Trigger** (trg_multa_por_inasistencia) | 0.2 | ⏳ Por implementar |
| **Procedimiento almacenado** (inscribir_estudiante) | 0.2 | ⏳ Por implementar |
| **TOTAL** | **2.5 puntos** | - |

---

## 🔍 Convenciones del Proyecto

### Nomenclatura de Base de Datos
- **Tablas**: SNAKE_CASE, singular (ESTUDIANTE, SESION, MULTA)
- **Columnas**: snake_case (fecha_inscripcion, saldo_pendiente)
- **PK**: `{tabla}_id`
- **FK**: `{tabla_referenciada}_id`
- **Checks**: Valores específicos (estado_asistencia IN ('Programada', 'Asistió', 'Faltó', 'Cancelada'))

### Convenciones TypeScript (Frontend + Backend)
- Componentes React: `PascalCase` (StudentForm.tsx, SessionList.tsx)
- Funciones/variables: `camelCase` (fetchStudents, handleSubmit)
- Interfaces: Prefix `I` (IStudent, ISession, IMulta)
- Archivos: kebab-case (student-form.tsx, session-list.tsx)

### Estructura Backend
```
src/
├── server.ts           # Entry point
├── routes/
│   ├── students.ts
│   ├── professors.ts
│   ├── sessions.ts
│   ├── inscriptions.ts
│   └── fines.ts
├── controllers/        # Lógica de negocio
├── middleware/         # Auth, validación
└── utils/             # Helpers
```

---

## 📚 Referencias Clave

1. **Diseño BD 3FN**: [README.md § 2](README.md#2-normalización--tabla-inscripciones)
2. **Diccionario de Datos**: [README.md § 3](README.md#3-diccionario-de-datos)
3. **Lógica Avanzada**: [README.md § 4](README.md#4-lógica-avanzada)
4. **Rúbrica de Evaluación**: [FINAL.md](FINAL.md)

---

## 🤖 Instrucciones para Agentes de IA

Cuando trabajes en este proyecto:

1. **Antes de modificar BD**: Revisa [README.md § 2-3](README.md#2-normalización--tabla-inscripciones) para entender la normalización 3FN
2. **Al implementar Prisma**: Refleja exactamente la estructura de tablas documentadas (no simplificar ni cambiar nombres)
3. **Al crear endpoints**: Incluye validaciones según lógica de negocio (ej: validar cupos antes de inscribir)
4. **Al diseñar componentes React**: Sigue estructura en `src/` (componentes en carpetas con index.tsx)
5. **SQL requerido**: El proyecto debe incluir:
   - ✅ Mínimo 5 consultas básicas (SELECT, WHERE, ORDER BY, LIMIT)
   - ✅ Mínimo 3 con agregación (COUNT, SUM, GROUP BY)
   - ✅ Mínimo 3 con JOINs (INNER, LEFT)
   - ✅ Mínimo 1 con operaciones de conjuntos (UNION, INTERSECT)
   - ✅ 1 Trigger + 1 Procedimiento Almacenado (investigados)

---

## ✅ Checklist de Implementación

**Backend**:
- [ ] Implementar schema.prisma con 7 tablas
- [ ] Crear migración inicial
- [ ] Generar Prisma Client
- [ ] Seed con datos de prueba (≥10 por tabla)
- [ ] Implementar CRUD endpoints
- [ ] Crear trigger SQL
- [ ] Crear procedimiento almacenado

**Frontend**:
- [ ] Crear componentes principales
- [ ] Integrar con API backend
- [ ] Implementar forms de inscripción
- [ ] Visualizar multas pendientes
- [ ] Dashboard administrativo

**Documentación**:
- [ ] SQL script completo (DDL + DML + consultas + trigger + SP)
- [ ] Justificación de trigger y procedimiento
- [ ] README con instrucciones de ejecución

---

**Última actualización**: Junio 2026  
**Estado del proyecto**: En desarrollo inicial (scaffolding completo, lógica por implementar)
