BEGIN;

-- 1) Add CHECK constraints
ALTER TABLE "NIVELES" ADD CONSTRAINT niveles_duracion_positive CHECK (duracion_semanas > 0);
ALTER TABLE "NIVELES" ADD CONSTRAINT niveles_precio_nonnegative CHECK (precio >= 0);

ALTER TABLE "SALONES" ADD CONSTRAINT salones_capacidad_positive CHECK (capacidad > 0);

ALTER TABLE "SESIONES" ADD CONSTRAINT sesiones_duracion_positive CHECK (duracion_min > 0);
ALTER TABLE "SESIONES" ADD CONSTRAINT sesiones_cupos_nonnegative CHECK (cupos_disponibles >= 0);

ALTER TABLE "ESTUDIANTES" ADD CONSTRAINT estudiantes_saldo_nonnegative CHECK (saldo_pendiente >= 0);

ALTER TABLE "MULTAS" ADD CONSTRAINT multas_monto_positive CHECK (monto > 0);

-- Profesor especialidad must be one of MCER values
ALTER TABLE "PROFESORES" ADD CONSTRAINT profesores_especialidad_mcer CHECK (especialidad IN ('A1','A2','B1','B2','C1','C2'));

-- 2) Create stored procedure to inscribe a student (atomically)
CREATE OR REPLACE FUNCTION inscribir_estudiante(p_estudiante_id INTEGER, p_sesion_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_cupos INTEGER;
  v_insc_id INTEGER;
BEGIN
  -- Lock the session row to avoid race conditions
  SELECT cupos_disponibles INTO v_cupos FROM "SESIONES" WHERE sesion_id = p_sesion_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sesión % no encontrada', p_sesion_id;
  END IF;
  IF v_cupos <= 0 THEN
    RAISE EXCEPTION 'Sin cupos disponibles en la sesión %', p_sesion_id;
  END IF;

  INSERT INTO "INSCRIPCIONES" (estudiante_id, sesion_id) VALUES (p_estudiante_id, p_sesion_id) RETURNING inscripcion_id INTO v_insc_id;

  UPDATE "SESIONES" SET cupos_disponibles = cupos_disponibles - 1 WHERE sesion_id = p_sesion_id;

  RETURN v_insc_id;
END;
$$ LANGUAGE plpgsql;

-- 3) Create trigger function for automatic fine generation on absence
CREATE OR REPLACE FUNCTION trg_multa_por_inasistencia_fn()
RETURNS trigger AS $$
DECLARE
  v_exists INTEGER;
BEGIN
  -- Only act on UPDATE where estado_asistencia becomes 'FALTO'
  IF TG_OP = 'UPDATE' THEN
    IF NEW.estado_asistencia = 'FALTO' AND (OLD.estado_asistencia IS DISTINCT FROM 'FALTO') THEN
      -- Ensure not to duplicate multas for same inscripcion
      SELECT 1 INTO v_exists FROM "MULTAS" WHERE inscripcion_id = NEW.inscripcion_id LIMIT 1;
      IF NOT FOUND THEN
        INSERT INTO "MULTAS" (inscripcion_id, estudiante_id, monto, estado_pago) VALUES (NEW.inscripcion_id, NEW.estudiante_id, 10.00, 'PENDIENTE');
        UPDATE "ESTUDIANTES" SET saldo_pendiente = saldo_pendiente + 10.00 WHERE estudiante_id = NEW.estudiante_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) Attach trigger to INSCRIPCIONES AFTER UPDATE
DROP TRIGGER IF EXISTS trg_multa_por_inasistencia ON "INSCRIPCIONES";
CREATE TRIGGER trg_multa_por_inasistencia
AFTER UPDATE OF estado_asistencia ON "INSCRIPCIONES"
FOR EACH ROW
EXECUTE FUNCTION trg_multa_por_inasistencia_fn();

COMMIT;
