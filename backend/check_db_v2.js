const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const testsCount = await prisma.practiceTest.count();
  console.log(`Tests count: ${testsCount}`);
  
  const categoriesCount = await prisma.category.count();
  console.log(`Categories count: ${categoriesCount}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
