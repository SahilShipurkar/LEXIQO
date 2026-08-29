import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('Testing CodingService.getProblems equivalent logic...');
    const problems = await prisma.codingProblem.findMany({
        where: { isPublished: true },
        include: { tags: true }
    });
    console.log(`Found ${problems.length} problems via Prisma query`);
    console.log(JSON.stringify(problems.slice(0, 1), null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
