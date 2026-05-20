const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not defined');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting comprehensive seed...');

  // Limpiar datos previos en orden inverso de dependencia
  await prisma.multa.deleteMany({});
  await prisma.inscripcion.deleteMany({});
  await prisma.sesion.deleteMany({});
  await prisma.estudiante.deleteMany({});
  await prisma.salon.deleteMany({});
  await prisma.profesor.deleteMany({});
  await prisma.nivel.deleteMany({});

  // Niveles
  const nivelesNames = ['A1','A2','B1','B2','C1','C2'];
  const niveles = [];
  for (const n of nivelesNames) {
    const nivel = await prisma.nivel.create({
      data: { nombre: n, descripcion: `${n} level`, duracion_semanas: 12, precio: 100 }
    });
    niveles.push(nivel);
  }

  // Profesores
  const profs = [];
  for (let i = 1; i <= 10; i++) {
    const p = await prisma.profesor.create({
      data: {
        nombre: `Profesor ${i}`,
        email: `prof${i}@speakup.edu`,
        telefono: `555-010${i.toString().padStart(2, '0')}`,
        especialidad: nivelesNames[i % 6]
      }
    });
    profs.push(p);
  }

  // Salones
  const salons = [];
  for (let i = 1; i <= 10; i++) {
    const s = await prisma.salon.create({
      data: {
        nombre: `Sala ${String.fromCharCode(64 + i)}`,
        capacidad: 20 + i,
        equipado: i % 2 === 0
      }
    });
    salons.push(s);
  }

  // Estudiantes
  const students = [];
  for (let i = 1; i <= 12; i++) {
    const st = await prisma.estudiante.create({
      data: {
        nombre: `Estudiante ${i}`,
        email: `est${i}@mail.com`,
        telefono: `300-555-${1000 + i}`,
        fecha_nacimiento: new Date(1995, 0, i)
      }
    });
    students.push(st);
  }

  // Sesiones
  const sessions = [];
  for (let i = 0; i < 10; i++) {
    const ses = await prisma.sesion.create({
      data: {
        nivel_id: niveles[i % 6].nivel_id,
        profesor_id: profs[i % 10].profesor_id,
        salon_id: salons[i % 10].salon_id,
        fecha: new Date(2026, 5, 20 + i),
        hora_inicio: new Date(2026, 5, 20 + i, 9, 0, 0),
        duracion_min: 60,
        cupos_disponibles: 10
      }
    });
    sessions.push(ses);
  }

  // Inscripciones
  for (let i = 0; i < 5; i++) {
    const ins = await prisma.inscripcion.create({
      data: {
        estudiante_id: students[i].estudiante_id,
        sesion_id: sessions[i].sesion_id,
        estado_asistencia: i === 0 ? 'FALTO' : 'PROGRAMADA'
      }
    });

    // Si faltó, crear una multa manualmente (aunque haya un trigger, esto asegura que el endpoint de multas tenga algo)
    if (i === 0) {
      await prisma.multa.create({
        data: {
          inscripcion_id: ins.inscripcion_id,
          estudiante_id: ins.estudiante_id,
          monto: 10,
          estado_pago: 'PENDIENTE'
        }
      });
      await prisma.estudiante.update({
        where: { estudiante_id: ins.estudiante_id },
        data: { saldo_pendiente: { increment: 10 } }
      });
    }
  }

  console.log('Seed completed successfully');
}

main()
  .catch(e => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
