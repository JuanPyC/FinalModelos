/*
================================================================================
TRABAJO FINAL — MODELO DE DATOS PARA ACADEMIA DE INGLÉS "SPEAK UP"
================================================================================
Motor: PostgreSQL 16
Base de Datos: english_academy_db
Autores: Marjaisabel Zuluaga Quintero, Juan Diego Gómez Guzmán
Fecha: 2026-05-20

DESCRIPCIÓN:
Sistema de gestión para Academia de Inglés que automatiza:
- Inscripción de estudiantes a sesiones de clase
- Control de asistencia y generación automática de multas ($10 USD por falta)
- Gestión de profesores, niveles (A1–C2 MCER), salones y sesiones
- Cálculo automático de saldo pendiente del estudiante

NORMALIZACIÓN: 7 tablas en 3FN con relación N:M (INSCRIPCIONES)
================================================================================
*/

-- ============================================================================
-- 1. CREATE DATABASE AND SET UP
-- ============================================================================
DROP DATABASE IF EXISTS english_academy_db;
CREATE DATABASE english_academy_db
  ENCODING 'UTF8'
  LC_COLLATE 'C'
  LC_CTYPE 'C'
  TEMPLATE template0;

\c english_academy_db;

-- ============================================================================
-- 2. DDL: CREATE ENUMS AND TABLES (3FN NORMALIZED)
-- ============================================================================

-- Enum: Estado de Asistencia (Programada, Asistió, Faltó, Cancelada)
CREATE TYPE estado_asistencia_enum AS ENUM ('Programada', 'Asistió', 'Faltó', 'Cancelada');

-- Enum: Estado de Pago (Pendiente, Pagada)
CREATE TYPE estado_pago_enum AS ENUM ('Pendiente', 'Pagada');

-- ============================================================================
-- Table: NIVELES (Base - No FK saliente)
-- Descripción: Niveles MCER de inglés (A1-C2) con duración y precio
-- ============================================================================
CREATE TABLE NIVELES (
  nivel_id SERIAL PRIMARY KEY,
  nombre VARCHAR(10) NOT NULL UNIQUE, -- A1, A2, B1, B2, C1, C2
  descripcion TEXT,
  duracion_semanas INTEGER NOT NULL CHECK (duracion_semanas > 0),
  precio NUMERIC(8,2) NOT NULL CHECK (precio >= 0),
  CONSTRAINT niveles_nombre_check CHECK (nombre IN ('A1','A2','B1','B2','C1','C2'))
);

-- ============================================================================
-- Table: SALONES (Base - No FK saliente)
-- Descripción: Salones físicos con capacidad y equipo disponible
-- ============================================================================
CREATE TABLE SALONES (
  salon_id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE, -- Ej. Sala A, Sala B
  capacidad INTEGER NOT NULL CHECK (capacidad > 0),
  equipado BOOLEAN NOT NULL DEFAULT TRUE, -- Proyector, TV, audio disponible
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Table: PROFESORES (Base - No FK saliente)
-- Descripción: Profesores de inglés con especialidad en nivel máximo
-- ============================================================================
CREATE TABLE PROFESORES (
  profesor_id SERIAL PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  telefono VARCHAR(20),
  especialidad VARCHAR(10) NOT NULL CHECK (especialidad IN ('A1','A2','B1','B2','C1','C2')),
  fecha_contrato DATE NOT NULL DEFAULT CURRENT_DATE,
  activo BOOLEAN DEFAULT TRUE
);

-- ============================================================================
-- Table: SESIONES (Dependencia 1:N de NIVELES, PROFESORES, SALONES)
-- Descripción: Sesiones de clase programadas (relación de 3 FKs)
-- ============================================================================
CREATE TABLE SESIONES (
  sesion_id SERIAL PRIMARY KEY,
  nivel_id INTEGER NOT NULL REFERENCES NIVELES(nivel_id),
  profesor_id INTEGER NOT NULL REFERENCES PROFESORES(profesor_id),
  salon_id INTEGER NOT NULL REFERENCES SALONES(salon_id),
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  duracion_min INTEGER NOT NULL CHECK (duracion_min > 0),
  cupos_disponibles INTEGER NOT NULL CHECK (cupos_disponibles >= 0),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Table: ESTUDIANTES (Base - No FK saliente, referenciada por INSCRIPCIONES y MULTAS)
-- Descripción: Estudiantes registrados en la academia con saldo de multas
-- ============================================================================
CREATE TABLE ESTUDIANTES (
  estudiante_id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  telefono VARCHAR(20),
  fecha_nacimiento DATE NOT NULL,
  fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE,
  saldo_pendiente NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (saldo_pendiente >= 0)
);

-- ============================================================================
-- Table: INSCRIPCIONES (N:M entre ESTUDIANTES y SESIONES)
-- Descripción: Relación muchos-a-muchos con atributo estado_asistencia
-- Normalización: 2FN → 3FN (tabla intermedia)
-- ============================================================================
CREATE TABLE INSCRIPCIONES (
  inscripcion_id SERIAL PRIMARY KEY,
  estudiante_id INTEGER NOT NULL REFERENCES ESTUDIANTES(estudiante_id),
  sesion_id INTEGER NOT NULL REFERENCES SESIONES(sesion_id),
  fecha_inscripcion DATE NOT NULL DEFAULT CURRENT_DATE,
  estado_asistencia estado_asistencia_enum NOT NULL DEFAULT 'Programada',
  CONSTRAINT insc_unique_student_session UNIQUE (estudiante_id, sesion_id)
);

-- ============================================================================
-- Table: MULTAS (Denormalización intencional: estudiante_id para rapidez)
-- Descripción: Multas generadas automáticamente por faltas
-- Referencia: inscripcion_id y estudiante_id (para auditoría rápida)
-- ============================================================================
CREATE TABLE MULTAS (
  multa_id SERIAL PRIMARY KEY,
  inscripcion_id INTEGER NOT NULL REFERENCES INSCRIPCIONES(inscripcion_id),
  estudiante_id INTEGER NOT NULL REFERENCES ESTUDIANTES(estudiante_id),
  monto NUMERIC(8,2) NOT NULL DEFAULT 10.00 CHECK (monto > 0),
  fecha_generacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado_pago estado_pago_enum NOT NULL DEFAULT 'Pendiente'
);

-- ============================================================================
-- 3. DML: INSERT DATA (≥10 PER MAIN TABLE)
-- ============================================================================

-- NIVELES (6 registros - todos los niveles MCER)
INSERT INTO NIVELES (nombre, descripcion, duracion_semanas, precio) VALUES
('A1', 'Nivel básico elemental', 12, 100.00),
('A2', 'Nivel básico elemental avanzado', 12, 120.00),
('B1', 'Nivel intermedio', 12, 140.00),
('B2', 'Nivel intermedio alto', 12, 160.00),
('C1', 'Nivel avanzado', 12, 180.00),
('C2', 'Nivel maestría', 12, 200.00);

-- SALONES (10 registros)
INSERT INTO SALONES (nombre, capacidad, equipado) VALUES
('Sala A', 25, TRUE),
('Sala B', 20, TRUE),
('Sala C', 30, FALSE),
('Sala D', 15, TRUE),
('Sala E', 18, FALSE),
('Sala F', 22, TRUE),
('Sala G', 28, FALSE),
('Sala H', 16, TRUE),
('Sala I', 24, FALSE),
('Sala J', 20, TRUE);

-- PROFESORES (10 registros)
INSERT INTO PROFESORES (nombre, email, telefono, especialidad) VALUES
('Dr. John Smith', 'john.smith@speakup.edu', '555-0101', 'C1'),
('Maria García López', 'maria.garcia@speakup.edu', '555-0102', 'B2'),
('Robert Johnson', 'robert.j@speakup.edu', '555-0103', 'A1'),
('Sophia Müller', 'sophia.muller@speakup.edu', '555-0104', 'B1'),
('Carlos Rodríguez', 'carlos.r@speakup.edu', '555-0105', 'C2'),
('Emma Thompson', 'emma.t@speakup.edu', '555-0106', 'A2'),
('Miguel Fernández', 'miguel.f@speakup.edu', '555-0107', 'B2'),
('Lisa Anderson', 'lisa.a@speakup.edu', '555-0108', 'B1'),
('Paulo Silva', 'paulo.s@speakup.edu', '555-0109', 'A1'),
('Catherine White', 'catherine.w@speakup.edu', '555-0110', 'C1');

-- SESIONES (12 registros - distribuidas por nivel/profesor/salon)
INSERT INTO SESIONES (nivel_id, profesor_id, salon_id, fecha, hora_inicio, duracion_min, cupos_disponibles) VALUES
(1, 3, 1, '2026-06-01', '09:00', 60, 10),
(2, 6, 2, '2026-06-02', '10:00', 90, 12),
(3, 4, 3, '2026-06-03', '11:00', 60, 8),
(4, 2, 4, '2026-06-04', '09:00', 60, 15),
(5, 1, 5, '2026-06-05', '14:00', 120, 10),
(6, 5, 6, '2026-06-06', '16:00', 60, 20),
(1, 8, 7, '2026-06-07', '09:00', 60, 10),
(2, 7, 8, '2026-06-08', '10:00', 90, 12),
(3, 9, 9, '2026-06-09', '11:00', 60, 8),
(4, 10, 10, '2026-06-10', '09:00', 60, 15),
(5, 1, 2, '2026-06-11', '14:00', 120, 10),
(6, 2, 3, '2026-06-12', '16:00', 60, 20);

-- ESTUDIANTES (12 registros)
INSERT INTO ESTUDIANTES (nombre, email, telefono, fecha_nacimiento) VALUES
('Juan Pérez González', 'juan.perez@mail.com', '300-555-1001', '1995-01-15'),
('María López Martínez', 'maria.lopez@mail.com', '300-555-1002', '1996-02-20'),
('Carlos Rodríguez Silva', 'carlos.silva@mail.com', '300-555-1003', '1997-03-25'),
('Ana García Fernández', 'ana.garcia@mail.com', '300-555-1004', '1998-04-30'),
('David Martínez López', 'david.martinez@mail.com', '300-555-1005', '1999-05-10'),
('Laura González Ruiz', 'laura.gonzalez@mail.com', '300-555-1006', '2000-06-18'),
('Fernando Jiménez Arias', 'fernando.jimenez@mail.com', '300-555-1007', '1994-07-22'),
('Claudia Ramírez Torres', 'claudia.ramirez@mail.com', '300-555-1008', '1993-08-08'),
('Roberto Sánchez Díaz', 'roberto.sanchez@mail.com', '300-555-1009', '1992-09-14'),
('Valentina Morales Cruz', 'valentina.morales@mail.com', '300-555-1010', '1991-10-20'),
('Miguel Ángel Vargas', 'miguel.vargas@mail.com', '300-555-1011', '1990-11-05'),
('Isabelle Durand Gómez', 'isabelle.durand@mail.com', '300-555-1012', '1989-12-12');

-- INSCRIPCIONES (10+ registros - relación N:M con estados variados)
INSERT INTO INSCRIPCIONES (estudiante_id, sesion_id, estado_asistencia) VALUES
(1, 1, 'Asistió'),
(2, 1, 'Faltó'),
(3, 2, 'Programada'),
(4, 3, 'Programada'),
(5, 4, 'Asistió'),
(6, 5, 'Faltó'),
(7, 6, 'Programada'),
(8, 7, 'Programada'),
(9, 8, 'Asistió'),
(10, 9, 'Faltó'),
(11, 10, 'Asistió'),
(12, 11, 'Cancelada');

-- MULTAS (Iniciales - algunas ya generadas por faltas anteriores)
INSERT INTO MULTAS (inscripcion_id, estudiante_id, monto, estado_pago) VALUES
(2, 2, 10.00, 'Pendiente'),
(6, 6, 10.00, 'Pendiente'),
(10, 10, 10.00, 'Pendiente');

-- Update saldo_pendiente for students with multas
UPDATE ESTUDIANTES SET saldo_pendiente = 10.00 WHERE estudiante_id IN (2, 6, 10);

-- ============================================================================
-- 4. DML: BASIC QUERIES (at least 5 - SELECT, WHERE, ORDER BY, LIMIT, LIKE)
-- ============================================================================

-- Q1: Listar todos los profesores ordenados por apellido (LIKE pattern)
SELECT profesor_id, nombre, email, especialidad 
FROM PROFESORES 
WHERE nombre LIKE '%García%' OR nombre LIKE '%Rodríguez%'
ORDER BY nombre;

-- Q2: Obtener sesiones de nivel B1 o superior con cupos disponibles
SELECT s.sesion_id, n.nombre AS nivel, p.nombre AS profesor, s.fecha, s.hora_inicio, s.cupos_disponibles
FROM SESIONES s
JOIN NIVELES n ON s.nivel_id = n.nivel_id
JOIN PROFESORES p ON s.profesor_id = p.profesor_id
WHERE n.nivel_id >= 3 -- B1 or higher
ORDER BY s.fecha
LIMIT 5;

-- Q3: Estudiantes registrados entre ciertas fechas (BETWEEN)
SELECT estudiante_id, nombre, email, fecha_registro
FROM ESTUDIANTES
WHERE fecha_registro BETWEEN '2020-01-01' AND '2026-12-31'
ORDER BY fecha_registro DESC;

-- Q4: Salones con capacidad dentro de rango (WHERE with AND)
SELECT salon_id, nombre, capacidad, equipado
FROM SALONES
WHERE capacidad BETWEEN 15 AND 25 AND equipado = TRUE
ORDER BY capacidad;

-- Q5: Inscripciones canceladas o faltadas (WHERE IN)
SELECT i.inscripcion_id, e.nombre AS estudiante, s.fecha, i.estado_asistencia
FROM INSCRIPCIONES i
JOIN ESTUDIANTES e ON i.estudiante_id = e.estudiante_id
JOIN SESIONES s ON i.sesion_id = s.sesion_id
WHERE i.estado_asistencia IN ('Cancelada', 'Faltó')
ORDER BY s.fecha DESC;

-- ============================================================================
-- 5. AGGREGATE QUERIES (at least 3 - COUNT, SUM, GROUP BY, HAVING)
-- ============================================================================

-- Q6: Cantidad de inscripciones por nivel de curso (GROUP BY)
SELECT n.nombre AS nivel, COUNT(i.inscripcion_id) AS total_inscripciones
FROM NIVELES n
LEFT JOIN SESIONES s ON n.nivel_id = s.nivel_id
LEFT JOIN INSCRIPCIONES i ON s.sesion_id = i.sesion_id
GROUP BY n.nivel_id, n.nombre
ORDER BY n.nivel_id;

-- Q7: Profesores con más sesiones enseñadas (GROUP BY, HAVING)
SELECT p.profesor_id, p.nombre, COUNT(s.sesion_id) AS num_sesiones
FROM PROFESORES p
LEFT JOIN SESIONES s ON p.profesor_id = s.profesor_id
GROUP BY p.profesor_id, p.nombre
HAVING COUNT(s.sesion_id) >= 1
ORDER BY num_sesiones DESC;

-- Q8: Ingresos totales y promedio por nivel (SUM, AVG, GROUP BY)
SELECT n.nombre AS nivel, 
       COUNT(DISTINCT s.sesion_id) AS num_sesiones,
       SUM(n.precio) AS ingresos_totales,
       AVG(n.precio) AS precio_promedio
FROM NIVELES n
LEFT JOIN SESIONES s ON n.nivel_id = s.nivel_id
GROUP BY n.nivel_id, n.nombre, n.precio
ORDER BY ingresos_totales DESC NULLS LAST;

-- ============================================================================
-- 6. JOIN QUERIES (at least 3 - INNER JOIN, LEFT JOIN with 2+ tables)
-- ============================================================================

-- Q9: Estudiantes inscriptos con profesores y niveles (INNER JOINs - 4 tablas)
SELECT e.nombre AS estudiante, 
       n.nombre AS nivel,
       p.nombre AS profesor,
       s.fecha,
       i.estado_asistencia
FROM INSCRIPCIONES i
INNER JOIN ESTUDIANTES e ON i.estudiante_id = e.estudiante_id
INNER JOIN SESIONES s ON i.sesion_id = s.sesion_id
INNER JOIN NIVELES n ON s.nivel_id = n.nivel_id
INNER JOIN PROFESORES p ON s.profesor_id = p.profesor_id
ORDER BY s.fecha DESC;

-- Q10: Estudiantes con sus multas pendientes (LEFT JOIN - multas may be NULL)
SELECT e.estudiante_id,
       e.nombre,
       e.email,
       COUNT(m.multa_id) AS num_multas,
       SUM(m.monto) AS total_multas_pendientes,
       e.saldo_pendiente
FROM ESTUDIANTES e
LEFT JOIN MULTAS m ON e.estudiante_id = m.estudiante_id AND m.estado_pago = 'Pendiente'
GROUP BY e.estudiante_id, e.nombre, e.email, e.saldo_pendiente
ORDER BY total_multas_pendientes DESC NULLS LAST;

-- Q11: Sesiones disponibles con salón y profesor asignado (INNER JOINs)
SELECT s.sesion_id,
       sal.nombre AS salon,
       p.nombre AS profesor,
       n.nombre AS nivel,
       s.fecha,
       s.hora_inicio,
       s.cupos_disponibles,
       sal.capacidad
FROM SESIONES s
INNER JOIN SALONES sal ON s.salon_id = sal.salon_id
INNER JOIN PROFESORES p ON s.profesor_id = p.profesor_id
INNER JOIN NIVELES n ON s.nivel_id = n.nivel_id
WHERE s.cupos_disponibles > 0
ORDER BY s.fecha;

-- ============================================================================
-- 7. SET OPERATIONS (UNION, INTERSECT, EXCEPT)
-- ============================================================================

-- Q12: UNION - Nombres de todos los actores (profesores + estudiantes)
SELECT p.nombre AS nombre, 'Profesor' AS rol, p.email
FROM PROFESORES p
WHERE p.activo = TRUE
UNION
SELECT e.nombre AS nombre, 'Estudiante' AS rol, e.email
FROM ESTUDIANTES e
ORDER BY nombre;

-- Q13: EXCEPT - Profesores sin sesiones asignadas
SELECT p.profesor_id, p.nombre
FROM PROFESORES p
EXCEPT
SELECT DISTINCT p.profesor_id, p.nombre
FROM PROFESORES p
INNER JOIN SESIONES s ON p.profesor_id = s.profesor_id
ORDER BY nombre;

-- Q14: INTERSECT - Salones usados por profesores con especialidad en niveles avanzados
SELECT sal.salon_id, sal.nombre
FROM SALONES sal
INNER JOIN SESIONES s ON sal.salon_id = s.salon_id
INNER JOIN PROFESORES p ON s.profesor_id = p.profesor_id
WHERE p.especialidad IN ('B2', 'C1', 'C2')
INTERSECT
SELECT sal.salon_id, sal.nombre
FROM SALONES sal
WHERE sal.capacidad >= 20
ORDER BY nombre;

-- ============================================================================
-- 8. ADVANCED LOGIC QUERIES
-- ============================================================================

-- Q15: Reporte de estudiantes y su historial de asistencia
SELECT e.nombre,
       COUNT(i.inscripcion_id) AS total_sesiones,
       SUM(CASE WHEN i.estado_asistencia = 'Asistió' THEN 1 ELSE 0 END) AS asistencias,
       SUM(CASE WHEN i.estado_asistencia = 'Faltó' THEN 1 ELSE 0 END) AS faltas,
       ROUND(100.0 * SUM(CASE WHEN i.estado_asistencia = 'Asistió' THEN 1 ELSE 0 END) / 
             NULLIF(COUNT(i.inscripcion_id), 0), 2) AS porcentaje_asistencia,
       e.saldo_pendiente
FROM ESTUDIANTES e
LEFT JOIN INSCRIPCIONES i ON e.estudiante_id = i.estudiante_id
GROUP BY e.estudiante_id, e.nombre, e.saldo_pendiente
ORDER BY porcentaje_asistencia DESC;

-- ============================================================================
-- 9. CREATE STORED PROCEDURE: inscribir_estudiante
-- ============================================================================
/*
JUSTIFICACIÓN DEL PROCEDIMIENTO ALMACENADO:
- Encapsula la lógica crítica de control de cupos en un único punto
- Garantiza atomicidad: verifica cupos, inserta inscripción, decrementa cupos en transacción
- Evita race conditions con FOR UPDATE lock
- Permite reutilización desde cualquier cliente (web, mobile, CLI)
- Si no hay cupo, lanza excepción descriptiva y revierte transacción
*/

CREATE OR REPLACE FUNCTION inscribir_estudiante(
  p_estudiante_id INTEGER,
  p_sesion_id INTEGER
)
RETURNS TABLE(inscripcion_id INTEGER, mensaje TEXT) AS $$
DECLARE
  v_cupos INTEGER;
  v_insc_id INTEGER;
BEGIN
  -- Lock session row to prevent race conditions
  SELECT cupos_disponibles INTO v_cupos 
  FROM SESIONES 
  WHERE sesion_id = p_sesion_id 
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sesión % no encontrada', p_sesion_id;
  END IF;
  
  IF v_cupos <= 0 THEN
    RAISE EXCEPTION 'Sin cupos disponibles en sesión %', p_sesion_id;
  END IF;

  -- Insert inscription record
  INSERT INTO INSCRIPCIONES (estudiante_id, sesion_id, estado_asistencia)
  VALUES (p_estudiante_id, p_sesion_id, 'Programada')
  RETURNING INSCRIPCIONES.inscripcion_id INTO v_insc_id;

  -- Decrement available slots
  UPDATE SESIONES SET cupos_disponibles = cupos_disponibles - 1 
  WHERE sesion_id = p_sesion_id;

  RETURN QUERY SELECT v_insc_id, 'Inscripción exitosa'::TEXT;
EXCEPTION
  WHEN unique_violation THEN
    RETURN QUERY SELECT NULL::INTEGER, 'El estudiante ya está inscrito en esta sesión'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 10. CREATE TRIGGER: trg_multa_por_inasistencia
-- ============================================================================
/*
JUSTIFICACIÓN DEL TRIGGER:
- Automatiza generación de multas por inasistencia ($10)
- Se dispara AFTER UPDATE de estado_asistencia a 'Faltó'
- Garantiza que ninguna falta quede sin multa asociada
- Evita inconsistencias y errores humanos
- Actualiza saldo_pendiente del estudiante atomáticamente
- Impide duplicados verificando si multa ya existe
*/

CREATE OR REPLACE FUNCTION trg_multa_por_inasistencia_fn()
RETURNS trigger AS $$
DECLARE
  v_exists INTEGER;
BEGIN
  -- Only process UPDATE operations
  IF TG_OP = 'UPDATE' THEN
    -- Check if estado_asistencia changed TO 'Faltó'
    IF NEW.estado_asistencia = 'Faltó' AND 
       (OLD.estado_asistencia IS DISTINCT FROM 'Faltó') THEN
      
      -- Prevent duplicate multas for same inscription
      SELECT 1 INTO v_exists 
      FROM MULTAS 
      WHERE inscripcion_id = NEW.inscripcion_id 
      LIMIT 1;
      
      IF NOT FOUND THEN
        -- Create fine record
        INSERT INTO MULTAS (inscripcion_id, estudiante_id, monto, estado_pago)
        VALUES (NEW.inscripcion_id, NEW.estudiante_id, 10.00, 'Pendiente');
        
        -- Update student pending balance
        UPDATE ESTUDIANTES 
        SET saldo_pendiente = saldo_pendiente + 10.00 
        WHERE estudiante_id = NEW.estudiante_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on INSCRIPCIONES
DROP TRIGGER IF EXISTS trg_multa_por_inasistencia ON INSCRIPCIONES;
CREATE TRIGGER trg_multa_por_inasistencia
  AFTER UPDATE OF estado_asistencia ON INSCRIPCIONES
  FOR EACH ROW
  EXECUTE FUNCTION trg_multa_por_inasistencia_fn();

-- ============================================================================
-- 11. TESTING THE TRIGGER (demonstrative)
-- ============================================================================

-- Test case: Mark an enrollment as absent and verify automatic fine generation
-- (Uncomment to test in live environment)
/*
-- Before: Check initial multas count
SELECT COUNT(*) AS multas_antes FROM MULTAS;

-- Update inscription to 'Faltó'
UPDATE INSCRIPCIONES 
SET estado_asistencia = 'Faltó' 
WHERE inscripcion_id = 4;

-- After: Verify multa was created
SELECT COUNT(*) AS multas_despues FROM MULTAS;

-- Verify saldo_pendiente increased
SELECT estudiante_id, saldo_pendiente FROM ESTUDIANTES WHERE estudiante_id = 4;

-- View new multa
SELECT * FROM MULTAS WHERE inscripcion_id = 4;
*/

-- ============================================================================
-- 12. INDEXES FOR PERFORMANCE (optional but recommended)
-- ============================================================================

CREATE INDEX idx_inscripciones_estudiante_id ON INSCRIPCIONES(estudiante_id);
CREATE INDEX idx_inscripciones_sesion_id ON INSCRIPCIONES(sesion_id);
CREATE INDEX idx_multas_estudiante_id ON MULTAS(estudiante_id);
CREATE INDEX idx_multas_estado_pago ON MULTAS(estado_pago);
CREATE INDEX idx_sesiones_nivel_id ON SESIONES(nivel_id);
CREATE INDEX idx_sesiones_profesor_id ON SESIONES(profesor_id);
CREATE INDEX idx_sesiones_salon_id ON SESIONES(salon_id);

-- ============================================================================
-- FINAL VERIFICATION QUERIES
-- ============================================================================

-- View database summary
SELECT 
  (SELECT COUNT(*) FROM NIVELES) AS total_niveles,
  (SELECT COUNT(*) FROM PROFESORES) AS total_profesores,
  (SELECT COUNT(*) FROM SALONES) AS total_salones,
  (SELECT COUNT(*) FROM ESTUDIANTES) AS total_estudiantes,
  (SELECT COUNT(*) FROM SESIONES) AS total_sesiones,
  (SELECT COUNT(*) FROM INSCRIPCIONES) AS total_inscripciones,
  (SELECT COUNT(*) FROM MULTAS) AS total_multas;

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
/*
COMPLETENESS CHECKLIST:
✓ DDL (0.7 pts):
  - CREATE DATABASE
  - 7 tables with correct data types
  - PK, FK, NOT NULL, UNIQUE, CHECK, DEFAULT constraints
  - Correct dependency order

✓ DML (0.8 pts):
  - Inserts for all tables (≥10 per main table)
  - 5+ basic queries with SELECT, WHERE, ORDER BY, LIMIT, LIKE, BETWEEN

✓ Aggregations (0.3 pts):
  - 3+ queries with COUNT, SUM, AVG, GROUP BY, HAVING

✓ JOINs (0.4 pts):
  - 3+ queries with INNER JOIN, LEFT JOIN

✓ Set Operations (0.2 pts):
  - 1+ queries with UNION, EXCEPT, INTERSECT

✓ Trigger (0.2 pts):
  - trg_multa_por_inasistencia with justification

✓ Stored Procedure (0.2 pts):
  - inscribir_estudiante with justification

TOTAL: 2.5 pts possible
*/
