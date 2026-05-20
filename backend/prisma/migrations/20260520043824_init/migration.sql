-- CreateEnum
CREATE TYPE "EstadoAsistencia" AS ENUM ('PROGRAMADA', 'ASISTIO', 'FALTO', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'PAGADA');

-- CreateTable
CREATE TABLE "NIVELES" (
    "nivel_id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "duracion_semanas" INTEGER NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "NIVELES_pkey" PRIMARY KEY ("nivel_id")
);

-- CreateTable
CREATE TABLE "PROFESORES" (
    "profesor_id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "telefono" VARCHAR(20),
    "especialidad" VARCHAR(100),

    CONSTRAINT "PROFESORES_pkey" PRIMARY KEY ("profesor_id")
);

-- CreateTable
CREATE TABLE "SALONES" (
    "salon_id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "equipado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SALONES_pkey" PRIMARY KEY ("salon_id")
);

-- CreateTable
CREATE TABLE "SESIONES" (
    "sesion_id" SERIAL NOT NULL,
    "nivel_id" INTEGER NOT NULL,
    "profesor_id" INTEGER NOT NULL,
    "salon_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "hora_inicio" TIME NOT NULL,
    "duracion_min" INTEGER NOT NULL,
    "cupos_disponibles" INTEGER NOT NULL,

    CONSTRAINT "SESIONES_pkey" PRIMARY KEY ("sesion_id")
);

-- CreateTable
CREATE TABLE "ESTUDIANTES" (
    "estudiante_id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "telefono" VARCHAR(20),
    "fecha_nacimiento" DATE NOT NULL,
    "fecha_registro" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "saldo_pendiente" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "ESTUDIANTES_pkey" PRIMARY KEY ("estudiante_id")
);

-- CreateTable
CREATE TABLE "INSCRIPCIONES" (
    "inscripcion_id" SERIAL NOT NULL,
    "estudiante_id" INTEGER NOT NULL,
    "sesion_id" INTEGER NOT NULL,
    "fecha_inscripcion" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado_asistencia" "EstadoAsistencia" NOT NULL DEFAULT 'PROGRAMADA',

    CONSTRAINT "INSCRIPCIONES_pkey" PRIMARY KEY ("inscripcion_id")
);

-- CreateTable
CREATE TABLE "MULTAS" (
    "multa_id" SERIAL NOT NULL,
    "inscripcion_id" INTEGER NOT NULL,
    "estudiante_id" INTEGER NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "fecha_generacion" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado_pago" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',

    CONSTRAINT "MULTAS_pkey" PRIMARY KEY ("multa_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NIVELES_nombre_key" ON "NIVELES"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "PROFESORES_email_key" ON "PROFESORES"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SALONES_nombre_key" ON "SALONES"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ESTUDIANTES_email_key" ON "ESTUDIANTES"("email");

-- AddForeignKey
ALTER TABLE "SESIONES" ADD CONSTRAINT "SESIONES_nivel_id_fkey" FOREIGN KEY ("nivel_id") REFERENCES "NIVELES"("nivel_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SESIONES" ADD CONSTRAINT "SESIONES_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "PROFESORES"("profesor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SESIONES" ADD CONSTRAINT "SESIONES_salon_id_fkey" FOREIGN KEY ("salon_id") REFERENCES "SALONES"("salon_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "INSCRIPCIONES" ADD CONSTRAINT "INSCRIPCIONES_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "ESTUDIANTES"("estudiante_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "INSCRIPCIONES" ADD CONSTRAINT "INSCRIPCIONES_sesion_id_fkey" FOREIGN KEY ("sesion_id") REFERENCES "SESIONES"("sesion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MULTAS" ADD CONSTRAINT "MULTAS_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "INSCRIPCIONES"("inscripcion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MULTAS" ADD CONSTRAINT "MULTAS_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "ESTUDIANTES"("estudiante_id") ON DELETE RESTRICT ON UPDATE CASCADE;
