const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const testsCount = await prisma.practiceTest.count();
  const categoriesCount = await prisma.category.count();
  const questionsCount = await prisma.question.count();
  
  console.log(`Tests count: ${testsCount}`);
  console.log(`Categories count: ${categoriesCount}`);
  console.log(`Questions count: ${questionsCount}`);
  
  if (questionsCount > 0) {
    const sample = await prisma.question.findFirst({
        include: { test: true }
    });
    console.log('Sample Question Sample:', JSON.stringify(sample, null, 2));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
