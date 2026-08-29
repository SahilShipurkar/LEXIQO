import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tests = await prisma.practiceTest.findMany({
    include: { category: true }
  });
  console.log('--- Practice Tests in DB ---');
  console.log(JSON.stringify(tests, null, 2));
  
  const categories = await prisma.category.findMany();
  console.log('--- Categories in DB ---');
  console.log(JSON.stringify(categories, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
