import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedPerformance() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('No user found to seed performance data.');
    return;
  }

  console.log(`Seeding performance data for user: ${user.name || user.email}`);

  const today = new Date();
  today.setHours(0,0,0,0);

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    await prisma.performanceMetric.upsert({
      where: { userId_date: { userId: user.id, date } },
      update: {},
      create: {
        userId: user.id,
        date,
        testsCompleted: Math.floor(Math.random() * 5) + 2,
        totalScore: Math.floor(Math.random() * 300) + 100,
        avgAccuracy: Math.floor(Math.random() * 30) + 65,
        totalTimeMinute: Math.floor(Math.random() * 120) + 30
      }
    });
  }
  console.log('Performance data seeded.');
}

seedPerformance().catch(console.error).finally(() => prisma.$disconnect());
