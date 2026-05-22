BEGIN;

-- NIVELES (10)
INSERT INTO "NIVELES" (nombre, descripcion, duracion_semanas, precio) VALUES
('A1', 'Nivel básico elemental', 12, 100.00),
('A2', 'Nivel básico elemental avanzado', 12, 120.00),
('B1', 'Nivel intermedio', 12, 140.00),
('B2', 'Nivel intermedio alto', 12, 160.00),
('C1', 'Nivel avanzado', 12, 180.00),
('C2', 'Nivel maestría', 12, 200.00),
('A1+', 'Nivel básico elemental consolidado', 12, 110.00),
('A2+', 'Nivel básico elemental avanzado consolidado', 12, 130.00),
('B1+', 'Nivel intermedio consolidado', 12, 150.00),
('B2+', 'Nivel intermedio alto consolidado', 12, 170.00)
ON CONFLICT (nombre) DO NOTHING;

-- PROFESORES (10)
INSERT INTO "PROFESORES" (nombre, email, telefono, especialidad) VALUES
('Profesor 1','prof1@speakup.edu','555-01001','A1'),
('Profesor 2','prof2@speakup.edu','555-01002','A2'),
('Profesor 3','prof3@speakup.edu','555-01003','B1'),
('Profesor 4','prof4@speakup.edu','555-01004','B2'),
('Profesor 5','prof5@speakup.edu','555-01005','C1'),
('Profesor 6','prof6@speakup.edu','555-01006','C2'),
('Profesor 7','prof7@speakup.edu','555-01007','B1'),
('Profesor 8','prof8@speakup.edu','555-01008','B2'),
('Profesor 9','prof9@speakup.edu','555-01009','A2'),
('Profesor 10','prof10@speakup.edu','555-01010','C1')
ON CONFLICT (email) DO NOTHING;

-- SALONES (10)
INSERT INTO "SALONES" (nombre, capacidad, equipado) VALUES
('Sala A',25,true),
('Sala B',20,true),
('Sala C',30,false),
('Sala D',15,true),
('Sala E',18,false),
('Sala F',22,true),
('Sala G',28,false),
('Sala H',16,true),
('Sala I',24,false),
('Sala J',20,true)
ON CONFLICT (nombre) DO NOTHING;

-- ESTUDIANTES (12)
INSERT INTO "ESTUDIANTES" (nombre, email, telefono, fecha_nacimiento) VALUES
('Estudiante 1','est1@mail.com','300-555-1001','1995-01-01'),
('Estudiante 2','est2@mail.com','300-555-1002','1996-02-02'),
('Estudiante 3','est3@mail.com','300-555-1003','1997-03-03'),
('Estudiante 4','est4@mail.com','300-555-1004','1998-04-04'),
('Estudiante 5','est5@mail.com','300-555-1005','1999-05-05'),
('Estudiante 6','est6@mail.com','300-555-1006','2000-06-06'),
('Estudiante 7','est7@mail.com','300-555-1007','1994-07-07'),
('Estudiante 8','est8@mail.com','300-555-1008','1993-08-08'),
('Estudiante 9','est9@mail.com','300-555-1009','1992-09-09'),
('Estudiante 10','est10@mail.com','300-555-1010','1991-10-10'),
('Estudiante 11','est11@mail.com','300-555-1011','1990-11-11'),
('Estudiante 12','est12@mail.com','300-555-1012','1989-12-12')
ON CONFLICT (email) DO NOTHING;

-- SESIONES (12) - assign nivel/profesor/salon by id
INSERT INTO "SESIONES" (nivel_id, profesor_id, salon_id, fecha, hora_inicio, duracion_min, cupos_disponibles) VALUES
(1,1,1,'2026-06-01','09:00:00',60,10),
(2,2,2,'2026-06-02','10:00:00',90,12),
(3,3,3,'2026-06-03','11:00:00',60,8),
(4,4,4,'2026-06-04','09:00:00',60,15),
(5,5,5,'2026-06-05','14:00:00',120,10),
(6,6,6,'2026-06-06','16:00:00',60,20),
(1,7,7,'2026-06-07','09:00:00',60,10),
(2,8,8,'2026-06-08','10:00:00',90,12),
(3,9,9,'2026-06-09','11:00:00',60,8),
(4,10,10,'2026-06-10','09:00:00',60,15),
(5,1,2,'2026-06-11','14:00:00',120,10),
(6,2,3,'2026-06-12','16:00:00',60,20)
;

-- INSCRIPCIONES (19 registros - relación N:M con estados variados, incluyendo 10 faltas)
INSERT INTO "INSCRIPCIONES" (estudiante_id, sesion_id, estado_asistencia) VALUES
(1, 1, 'ASISTIO'),
(2, 1, 'FALTO'),
(3, 2, 'PROGRAMADA'),
(4, 3, 'PROGRAMADA'),
(5, 4, 'ASISTIO'),
(6, 5, 'FALTO'),
(7, 6, 'PROGRAMADA'),
(8, 7, 'PROGRAMADA'),
(9, 8, 'ASISTIO'),
(10, 9, 'FALTO'),
(11, 10, 'ASISTIO'),
(12, 11, 'CANCELADA'),
-- Nuevas inscripciones con estado FALTO para alcanzar el mínimo de 10 multas
(1, 2, 'FALTO'),
(3, 3, 'FALTO'),
(4, 4, 'FALTO'),
(5, 5, 'FALTO'),
(7, 7, 'FALTO'),
(8, 8, 'FALTO'),
(9, 9, 'FALTO')
ON CONFLICT DO NOTHING;

-- MULTAS (10 registros para cumplir con la rúbrica)
INSERT INTO "MULTAS" (inscripcion_id, estudiante_id, monto, estado_pago) VALUES
((SELECT inscripcion_id FROM "INSCRIPCIONES" WHERE estudiante_id=2 AND sesion_id=1), 2, 10.00, 'PENDIENTE'),
((SELECT inscripcion_id FROM "INSCRIPCIONES" WHERE estudiante_id=6 AND sesion_id=5), 6, 10.00, 'PENDIENTE'),
((SELECT inscripcion_id FROM "INSCRIPCIONES" WHERE estudiante_id=10 AND sesion_id=9), 10, 10.00, 'PENDIENTE'),
((SELECT inscripcion_id FROM "INSCRIPCIONES" WHERE estudiante_id=1 AND sesion_id=2), 1, 10.00, 'PENDIENTE'),
((SELECT inscripcion_id FROM "INSCRIPCIONES" WHERE estudiante_id=3 AND sesion_id=3), 3, 10.00, 'PENDIENTE'),
((SELECT inscripcion_id FROM "INSCRIPCIONES" WHERE estudiante_id=4 AND sesion_id=4), 4, 10.00, 'PENDIENTE'),
((SELECT inscripcion_id FROM "INSCRIPCIONES" WHERE estudiante_id=5 AND sesion_id=5), 5, 10.00, 'PENDIENTE'),
((SELECT inscripcion_id FROM "INSCRIPCIONES" WHERE estudiante_id=7 AND sesion_id=7), 7, 10.00, 'PENDIENTE'),
((SELECT inscripcion_id FROM "INSCRIPCIONES" WHERE estudiante_id=8 AND sesion_id=8), 8, 10.00, 'PENDIENTE'),
((SELECT inscripcion_id FROM "INSCRIPCIONES" WHERE estudiante_id=9 AND sesion_id=9), 9, 10.00, 'PENDIENTE')
ON CONFLICT DO NOTHING;

-- Actualizar saldo de estudiantes
UPDATE "ESTUDIANTES" SET saldo_pendiente = 10.00 WHERE estudiante_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

COMMIT;
