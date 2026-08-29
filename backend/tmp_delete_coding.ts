import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Deleting existing coding problems...');
    await prisma.codingSubmission.deleteMany();
    await prisma.userSolvedProblem.deleteMany();
    await prisma.savedCodingProblem.deleteMany();
    await prisma.starterCodeTemplate.deleteMany();
    await prisma.codingProblemTestCase.deleteMany();
    await prisma.codingProblemExample.deleteMany();
    await prisma.codingProblemTag.deleteMany();
    // We need to delete hints if the old schema had them as a model now? 
    // No, the old schema had them as a string array.
    await prisma.codingProblem.deleteMany();
    console.log('Done.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
