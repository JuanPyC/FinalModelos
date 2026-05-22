import prisma from '../utils/db';

// Helper to make fetch calls to the running API
async function apiPatch(url: string, body: any) {
  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return {
    status: response.status,
    data: (await response.json()) as any,
  };
}

async function apiPost(url: string, body: any) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return {
    status: response.status,
    data: (await response.json()) as any,
  };
}

// Visual output helpers
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function pass(name: string) {
  console.log(`${colors.green}✓ PASS:${colors.reset} ${name}`);
}

function fail(name: string, err: any) {
  console.error(`${colors.red}✗ FAIL:${colors.reset} ${name}`);
  console.error(err);
  throw err;
}

async function runTests() {
  console.log(`\n${colors.bold}${colors.cyan}================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}         INICIANDO SUITE DE PRUEBAS UNITARIAS Y DE INTEGRACIÓN${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}\n`);

  // Setup test environment (create dummy data)
  console.log(`${colors.yellow}► Limpiando registros de prueba previos si existen...${colors.reset}`);
  await prisma.multa.deleteMany({
    where: { estudiante: { email: { in: ['student.a@test.com', 'student.b@test.com', 'student.c@test.com'] } } }
  });
  await prisma.inscripcion.deleteMany({
    where: { estudiante: { email: { in: ['student.a@test.com', 'student.b@test.com', 'student.c@test.com'] } } }
  });
  await prisma.estudiante.deleteMany({
    where: { email: { in: ['student.a@test.com', 'student.b@test.com', 'student.c@test.com'] } }
  });
  await prisma.sesion.deleteMany({
    where: { profesor: { email: 'prof.test@speakup.edu' } }
  });
  await prisma.profesor.deleteMany({
    where: { email: 'prof.test@speakup.edu' }
  });
  await prisma.salon.deleteMany({
    where: { nombre: 'Salon Test X' }
  });
  await prisma.nivel.deleteMany({
    where: { nombre: 'T-A1' }
  });

  console.log(`${colors.yellow}► Configurando datos temporales de prueba...${colors.reset}`);
  
  const testLevel = await prisma.nivel.create({
    data: {
      nombre: 'T-A1',
      descripcion: 'Nivel temporal para pruebas',
      duracion_semanas: 4,
      precio: 100.00
    }
  });

  const testSalon = await prisma.salon.create({
    data: {
      nombre: 'Salon Test X',
      capacidad: 10,
      equipado: true
    }
  });

  const testProfesor = await prisma.profesor.create({
    data: {
      nombre: 'Profesor de Pruebas',
      email: 'prof.test@speakup.edu',
      especialidad: 'C1'
    }
  });

  // Create a session with exactly 1 available slot
  const testSession = await prisma.sesion.create({
    data: {
      nivel_id: testLevel.nivel_id,
      profesor_id: testProfesor.profesor_id,
      salon_id: testSalon.salon_id,
      fecha: new Date('2026-06-20'),
      hora_inicio: new Date('1970-01-01T09:00:00Z'),
      duracion_min: 60,
      cupos_disponibles: 5
    }
  });

  // Create three dummy students
  const studentA = await prisma.estudiante.create({
    data: {
      nombre: 'Test Estudiante A',
      email: 'student.a@test.com',
      fecha_nacimiento: new Date('2000-01-01'),
      saldo_pendiente: 0.00
    }
  });

  const studentB = await prisma.estudiante.create({
    data: {
      nombre: 'Test Estudiante B',
      email: 'student.b@test.com',
      fecha_nacimiento: new Date('2000-01-01'),
      saldo_pendiente: 0.00
    }
  });

  const studentC = await prisma.estudiante.create({
    data: {
      nombre: 'Test Estudiante C',
      email: 'student.c@test.com',
      fecha_nacimiento: new Date('2000-01-01'),
      saldo_pendiente: 0.00
    }
  });

  console.log(`${colors.green}✓ Datos temporales creados con éxito.${colors.reset}\n`);

  // ============================================================================
  // TEST 1: Stored Procedure "inscribir_estudiante"
  // ============================================================================
  try {
    console.log(`${colors.yellow}► EJECUTANDO PRUEBA 1: Procedimiento Almacenado "inscribir_estudiante"...${colors.reset}`);

    // Inscribe student A
    const resA = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM inscribir_estudiante($1, $2)`,
      studentA.estudiante_id,
      testSession.sesion_id
    );
    console.log('Resultado de inscribir_estudiante:', JSON.stringify(resA));

    const inscripcionIdA = resA[0]?.inscripcion_id ?? resA[0]?.inscribir_estudiante;
    if (!inscripcionIdA) {
      throw new Error(`El procedimiento no devolvió un ID de inscripción válido. Resultado: ${JSON.stringify(resA)}`);
    }

    // Verify slots decreased to 4
    const updatedSession1 = await prisma.sesion.findUnique({
      where: { sesion_id: testSession.sesion_id }
    });

    if (updatedSession1?.cupos_disponibles !== 4) {
      throw new Error(`Los cupos disponibles debieron bajar a 4, pero están en: ${updatedSession1?.cupos_disponibles}`);
    }
    pass('Inscripción exitosa del primer estudiante y reducción atómica de cupos');

    // Attempt to enroll student A again (unique constraint violation check)
    try {
      const resDup = await prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM inscribir_estudiante($1, $2)`,
        studentA.estudiante_id,
        testSession.sesion_id
      );
      console.log('Resultado de inscribir_estudiante duplicada:', JSON.stringify(resDup));
      const dupId = resDup[0]?.inscripcion_id ?? resDup[0]?.inscribir_estudiante;
      
      if (dupId !== null && dupId !== undefined) {
        throw new Error(`Se esperaba inscripcion_id = null por duplicidad, pero devolvió: ${dupId}`);
      }
      pass('Control de duplicados atómico (Unique student-session constraint)');
    } catch (e: any) {
      fail('Control de duplicados atómico', e);
    }

    // Attempt to enroll student B (session runs out of slots check)
    try {
      // Temporarily set cupos to 0 to simulate session being full
      await prisma.sesion.update({
        where: { sesion_id: testSession.sesion_id },
        data: { cupos_disponibles: 0 }
      });

      await prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM inscribir_estudiante($1, $2)`,
        studentB.estudiante_id,
        testSession.sesion_id
      );
      throw new Error('Se debió arrojar un error de PL/pgSQL por falta de cupos');
    } catch (e: any) {
      if (e.message && e.message.includes('Sin cupos disponibles')) {
        pass('Control de cupos atómico (Arroja excepción "Sin cupos disponibles")');
      } else {
        fail('Control de cupos atómico', e);
      }
    }
  } catch (err) {
    fail('Prueba 1: Stored Procedure falló', err);
  }

  // ============================================================================
  // TEST 2: Database Trigger "trg_multa_por_inasistencia"
  // ============================================================================
  let inscripcionCId: number;
  try {
    console.log(`\n${colors.yellow}► EJECUTANDO PRUEBA 2: Trigger de Base de Datos para Multas...${colors.reset}`);

    // Clean slot temporarily to enroll student C
    await prisma.sesion.update({
      where: { sesion_id: testSession.sesion_id },
      data: { cupos_disponibles: 1 }
    });

    // Enroll student C
    const resC = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM inscribir_estudiante($1, $2)`,
      studentC.estudiante_id,
      testSession.sesion_id
    );
    inscripcionCId = resC[0]?.inscripcion_id ?? resC[0]?.inscribir_estudiante;

    // Check initial student state
    const stdCInit = await prisma.estudiante.findUnique({
      where: { estudiante_id: studentC.estudiante_id }
    });
    if (Number(stdCInit?.saldo_pendiente) !== 0) {
      throw new Error('El saldo inicial del estudiante C debió ser 0.00');
    }

    // Update attendance state to 'FALTO' (Uppercase)
    await prisma.inscripcion.update({
      where: { inscripcion_id: inscripcionCId },
      data: { estado_asistencia: 'FALTO' }
    });

    // Query multa (should have been created automatically by PostgreSQL trigger)
    const multa = await prisma.multa.findFirst({
      where: { inscripcion_id: inscripcionCId }
    });

    if (!multa) {
      throw new Error('El trigger debió generar automáticamente un registro de multa');
    }

    if (Number(multa.monto) !== 10.00 || multa.estado_pago !== 'PENDIENTE') {
      throw new Error(`La multa debió generarse por $10.00 PENDIENTE. Datos: $${multa.monto} (${multa.estado_pago})`);
    }
    pass('Generación automática de multa de $10.00 por trigger en inasistencia');

    // Query student balance (should have automatically increased by $10.00)
    const stdCAfter = await prisma.estudiante.findUnique({
      where: { estudiante_id: studentC.estudiante_id }
    });

    if (Number(stdCAfter?.saldo_pendiente) !== 10.00) {
      throw new Error(`El saldo del estudiante debió subir a 10.00, pero está en: ${stdCAfter?.saldo_pendiente}`);
    }
    pass('Actualización automática de saldo_pendiente del estudiante por trigger');

    // Check duplicate prevention
    // Update enrollment status to another thing and then back to FALTO, trigger should verify and not duplicate if already exists
    // (Our trigger uses SELECT 1 FROM MULTAS WHERE inscripcion_id = NEW.inscripcion_id LIMIT 1 to prevent duplicates)
    await prisma.inscripcion.update({
      where: { inscripcion_id: inscripcionCId },
      data: { estado_asistencia: 'PROGRAMADA' }
    });
    
    // Note: Reversion of balance and multa is tested in REST api since the backend controller handles it,
    // let's update it back to FALTO to check if duplicate is prevented.
    await prisma.inscripcion.update({
      where: { inscripcion_id: inscripcionCId },
      data: { estado_asistencia: 'FALTO' }
    });

    const multasCount = await prisma.multa.count({
      where: { inscripcion_id: inscripcionCId }
    });

    if (multasCount > 1) {
      throw new Error(`Se duplicaron las multas! Hay ${multasCount} multas creadas para la misma inasistencia.`);
    }
    pass('Prevención automática de duplicados de multa para la misma inscripción');
  } catch (err) {
    fail('Prueba 2: Trigger de Base de Datos falló', err);
  }

  // ============================================================================
  // TEST 3: REST API Casing Normalization & Active Reversion (E2E Integration)
  // ============================================================================
  try {
    console.log(`\n${colors.yellow}► EJECUTANDO PRUEBA 3: API REST - Normalización de Mayúsculas/Minúsculas y Reversión Activa...${colors.reset}`);

    const apiBaseUrl = 'http://localhost:3000/api';

    // 1. Verify case-insensitivity support for "Faltó" (marked accented and mixed-case)
    console.log('Enviando PATCH con estado_asistencia = "Faltó" (con acento y minúsculas)...');
    
    // First, let's reset inscription to PROGRAMADA
    await prisma.inscripcion.update({
      where: { inscripcion_id: inscripcionCId! },
      data: { estado_asistencia: 'PROGRAMADA' }
    });
    // Remove existing multa and restore student C balance to 0 for clean test
    await prisma.multa.deleteMany({ where: { inscripcion_id: inscripcionCId! } });
    await prisma.estudiante.update({
      where: { estudiante_id: studentC.estudiante_id },
      data: { saldo_pendiente: 0.00 }
    });

    const patchRes1 = await apiPatch(`${apiBaseUrl}/inscripciones/${inscripcionCId!}`, {
      estado_asistencia: 'Faltó',
    });

    if (patchRes1.status !== 200 || !patchRes1.data.success) {
      throw new Error(`PATCH falló: ${JSON.stringify(patchRes1.data)}`);
    }

    const updatedInsc1 = patchRes1.data.data;
    if (updatedInsc1.estado_asistencia !== 'FALTO') {
      throw new Error(`Se esperaba que se normalizara a "FALTO", pero devolvió: "${updatedInsc1.estado_asistencia}"`);
    }
    pass('Normalización de caso mixto y acento ("Faltó" -> "FALTO") exitosa a nivel API');

    // Verify multa was automatically created and student balance is 10.00
    const finalStudentAbsent = await prisma.estudiante.findUnique({
      where: { estudiante_id: studentC.estudiante_id }
    });
    if (Number(finalStudentAbsent?.saldo_pendiente) !== 10.00) {
      throw new Error(`Se esperaba saldo_pendiente = 10.00 por la inasistencia. Encontrado: ${finalStudentAbsent?.saldo_pendiente}`);
    }
    pass('Sincronización del saldo por API tras multa generada');

    // 2. Verify active reversion when changing state from "Faltó" to "Asistió"
    console.log('Enviando PATCH con estado_asistencia = "Asistió" (para revertir la multa)...');
    const patchRes2 = await apiPatch(`${apiBaseUrl}/inscripciones/${inscripcionCId!}`, {
      estado_asistencia: 'Asistió',
    });

    if (patchRes2.status !== 200 || !patchRes2.data.success) {
      throw new Error(`PATCH falló en reversión: ${JSON.stringify(patchRes2.data)}`);
    }

    const updatedInsc2 = patchRes2.data.data;
    if (updatedInsc2.estado_asistencia !== 'ASISTIO') {
      throw new Error(`Se esperaba que se normalizara a "ASISTIO", pero devolvió: "${updatedInsc2.estado_asistencia}"`);
    }

    // Verify multa was removed and student balance went back to 0.00
    const finalStudentAttended = await prisma.estudiante.findUnique({
      where: { estudiante_id: studentC.estudiante_id }
    });
    const finalMultasCount = await prisma.multa.count({
      where: { inscripcion_id: inscripcionCId! }
    });

    if (finalMultasCount !== 0) {
      throw new Error(`La multa debió ser eliminada tras corregir la asistencia. Multas encontradas: ${finalMultasCount}`);
    }

    if (Number(finalStudentAttended?.saldo_pendiente) !== 0.00) {
      throw new Error(`El saldo del estudiante debió ser revertido a 0.00. Encontrado: ${finalStudentAttended?.saldo_pendiente}`);
    }
    pass('Reversión activa de multa y restauración de saldo_pendiente ("FALTO" -> "ASISTIO") exitosa');

    // 3. Verify duplicate registration returns 409 Conflict
    console.log('Enviando POST /inscripciones duplicado para verificar respuesta 409...');
    await prisma.sesion.update({
      where: { sesion_id: testSession.sesion_id },
      data: { cupos_disponibles: 1 }
    });

    const postDupRes = await apiPost(`${apiBaseUrl}/inscripciones`, {
      estudiante_id: studentA.estudiante_id,
      sesion_id: testSession.sesion_id,
    });

    if (postDupRes.status !== 409) {
      throw new Error(`Se esperaba código de respuesta HTTP 409 para inscripción duplicada, pero se obtuvo: ${postDupRes.status}`);
    }

    if (postDupRes.data.success !== false || !postDupRes.data.error.includes('ya está inscrito')) {
      throw new Error(`Se esperaba success=false y error conteniendo "ya está inscrito", pero se obtuvo: ${JSON.stringify(postDupRes.data)}`);
    }
    pass('Respuesta elegante 409 Conflict y mensaje claro en inscripciones duplicadas');
  } catch (err) {
    fail('Prueba 3: Integración E2E API REST falló', err);
  }

  // ============================================================================
  // Cleanup Test Data (Sanitation)
  // ============================================================================
  console.log(`\n${colors.yellow}► Limpiando base de datos y eliminando registros temporales...${colors.reset}`);
  
  // Delete all test data by reference
  await prisma.multa.deleteMany({
    where: { estudiante_id: { in: [studentA.estudiante_id, studentB.estudiante_id, studentC.estudiante_id] } }
  });

  await prisma.inscripcion.deleteMany({
    where: { estudiante_id: { in: [studentA.estudiante_id, studentB.estudiante_id, studentC.estudiante_id] } }
  });

  await prisma.estudiante.deleteMany({
    where: { estudiante_id: { in: [studentA.estudiante_id, studentB.estudiante_id, studentC.estudiante_id] } }
  });

  await prisma.sesion.deleteMany({
    where: { sesion_id: testSession.sesion_id }
  });

  await prisma.nivel.deleteMany({
    where: { nivel_id: testLevel.nivel_id }
  });

  await prisma.profesor.deleteMany({
    where: { profesor_id: testProfesor.profesor_id }
  });

  await prisma.salon.deleteMany({
    where: { salon_id: testSalon.salon_id }
  });

  console.log(`${colors.green}✓ Base de datos sanitizada e impecable.${colors.reset}\n`);

  console.log(`${colors.bold}${colors.green}================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.green}        TODAS LAS PRUEBAS UNITARIAS SE COMPLETARON CON ÉXITO${colors.reset}`);
  console.log(`${colors.bold}${colors.green}================================================================${colors.reset}\n`);
}

runTests()
  .catch((err) => {
    console.error(`${colors.bold}${colors.red}✗ LA SUITE DE PRUEBAS DETECTÓ ERRORES CRÍTICOS:${colors.reset}`, err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
