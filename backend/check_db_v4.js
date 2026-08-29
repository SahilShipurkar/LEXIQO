const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tests = await prisma.practiceTest.findMany({
    include: { _count: { select: { questions: true } } }
  });
  
  console.log('--- Practice Tests ---');
  tests.forEach(t => {
      console.log(`ID: ${t.id} | Title: ${t.title} | Questions: ${t._count.questions}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
