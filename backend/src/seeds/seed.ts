
import { PrismaClient } from '@prisma/client';
import { diQuestions } from './seed-di';
import { dsaQuestions } from './seed-dsa';
import { logicalQuestions } from './seed-logical';
import { quantitativeQuestions } from './seed-quantitative';
import { verbalQuestions } from './seed-verbal';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seeding of questions...');

    // Clear existing questions to avoid duplicates
    await prisma.quantitativeQuestion.deleteMany({});
    await prisma.logicalQuestion.deleteMany({});
    await prisma.verbalQuestion.deleteMany({});
    await prisma.dIQuestion.deleteMany({});
    await prisma.dSAQuestion.deleteMany({});
    console.log('Deleted existing questions.');

    await prisma.quantitativeQuestion.createMany({ data: quantitativeQuestions });
    console.log('✅ Quantitative questions seeded.');

    await prisma.logicalQuestion.createMany({ data: logicalQuestions });
    console.log('✅ Logical questions seeded.');

    await prisma.verbalQuestion.createMany({ data: verbalQuestions });
    console.log('✅ Verbal questions seeded.');

    await prisma.dIQuestion.createMany({ data: diQuestions });
    console.log('✅ DI questions seeded.');

    await prisma.dSAQuestion.createMany({ data: dsaQuestions });
    console.log('✅ DSA questions seeded.');

    console.log('🚀 Seeding finished successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
