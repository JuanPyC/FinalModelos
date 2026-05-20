require('dotenv/config');
const prisma = require('../src/utils/db').default;
const { EstadoAsistencia, EstadoPago } = require('../generated');

async function main() {
  // Niveles (6)
  const niveles = ['A1','A2','B1','B2','C1','C2'];
  for (const n of niveles) {
    await prisma.nivel.upsert({
      where: { nombre: n },
      update: {},
      create: { nombre: n, descripcion: `${n} level`, duracion_semanas: 12, precio: 100 }
    });
  }

  // Profesores (10)
  const profs = [];
  for (let i = 1; i <= 10; i++) {
    const p = await prisma.profesor.create({
      data: {
        nombre: `Profesor ${i}`,
        email: `prof${i}@speakup.edu`,
        telefono: `555-010${i.toString().padStart(2, '0')}`,
        especialidad: niveles[i % 6]
      }
    });
    profs.push(p);
  }

  // Salones (10)
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

  // Estudiantes (12)
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

  // Sesiones (12) - distribute across niveles/profesores/salones
  const sessions = [];
  for (let i = 1; i <= 12; i++) {
    const nivel = await prisma.nivel.findUnique({ where: { nombre: niveles[i % 6] } });
    const prof = profs[i % profs.length];
    const salon = salons[i % salons.length];
    const ses = await prisma.sesion.create({
      data: {
        nivel_id: nivel.nivel_id,
        profesor_id: prof.profesor_id,
        salon_id: salon.salon_id,
        fecha: new Date(2026, 4, i + 1),
        hora_inicio: '09:00:00',
        duracion_min: 60,
        cupos_disponibles: 10
      }
    });
    sessions.push(ses);
  }

  // Inscripciones (at least 10)
  const inscripciones = [];
  for (let i = 0; i < 10; i++) {
    const estudiante = students[i % students.length];
    const sesion = sessions[i % sessions.length];
    const estado = i % 4 === 0 ? EstadoAsistencia.FALTO : (i % 4 === 1 ? EstadoAsistencia.ASISTIO : EstadoAsistencia.PROGRAMADA);
    const ins = await prisma.inscripcion.create({
      data: {
        estudiante_id: estudiante.estudiante_id,
        sesion_id: sesion.sesion_id,
        estado_asistencia: estado
      }
    });
    inscripciones.push(ins);
  }

  // Multas (create for some 'Faltó')
  for (const ins of inscripciones.filter(i => i.estado_asistencia === EstadoAsistencia.FALTO)) {
    await prisma.multa.create({
      data: {
        inscripcion_id: ins.inscripcion_id,
        estudiante_id: ins.estudiante_id,
        monto: 10,
        estado_pago: EstadoPago.PENDIENTE
      }
    });
    // update saldo_pendiente
    await prisma.estudiante.update({
      where: { estudiante_id: ins.estudiante_id },
      data: { saldo_pendiente: { increment: 10 } }
    });
  }

  console.log('Seed completed');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
