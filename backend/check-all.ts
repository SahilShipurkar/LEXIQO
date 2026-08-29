import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users`);
    if (users.length > 0) {
        console.log(`First user: ${users[0].username || users[0].email} (ID: ${users[0].id})`);
    }

    const problems = await prisma.codingProblem.findMany();
    console.log(`Found ${problems.length} coding problems`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
