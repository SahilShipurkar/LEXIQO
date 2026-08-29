const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  const sessions = await prisma.testSession.findMany({
    include: { test: true }
  });
  console.log('Total Sessions:', sessions.length);
  sessions.forEach(s => {
    console.log(`Session ID: ${s.id}, UserID: ${s.userId}, Status: ${s.status}, Title: ${s.test?.title}, StartTime: ${s.startTime}`);
  });

  const metrics = await prisma.performanceMetric.findMany();
  console.log('Total Metrics:', metrics.length);

  const users = await prisma.user.findMany();
  console.log('Total Users:', users.length);
  users.forEach(u => console.log(`User ID: ${u.id}, Name: ${u.name}`));

  process.exit(0);
}

checkData();
