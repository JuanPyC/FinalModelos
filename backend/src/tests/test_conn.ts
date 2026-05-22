import prisma from '../utils/db';

async function main() {
  console.log('Intentando conectar con la base de datos a través del cliente configurado...');
  const niveles = await prisma.nivel.findMany();
  console.log(`Conexión exitosa. Encontrados ${niveles.length} niveles.`);
  for (const n of niveles) {
    console.log(`- Nivel: ${n.nombre}, Precio: ${n.precio}`);
  }
}

main()
  .catch((err) => {
    console.error('Error de conexión:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
