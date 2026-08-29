import { PrismaClient, Difficulty, TestStatus } from '@prisma/client';
import { diQuestions } from './seed-di';
import { dsaQuestions } from './seed-dsa';
import { logicalQuestions } from './seed-logical';
import { quantitativeQuestions } from './seed-quantitative';
import { verbalQuestions } from './seed-verbal';
import { seedCoding } from './seed-coding';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting revamped seeding...');

    // 1. Clear existing data
    // Order matters because of FK constraints
    await prisma.userGoal.deleteMany({});
    await prisma.userResponse.deleteMany({});
    await prisma.testSession.deleteMany({});
    await prisma.question.deleteMany({});
    await prisma.practiceTest.deleteMany({});
    await prisma.category.deleteMany({});

    // Clear coding problems
    // Check if these models exist before deleting (to avoid errors if schema not synced)
    try {
        await (prisma as any).codingSubmission.deleteMany({});
        await (prisma as any).userSolvedProblem.deleteMany({});
        await (prisma as any).savedCodingProblem.deleteMany({});
        await (prisma as any).codingProblem.deleteMany({});
    } catch (e) {
        console.warn('Note: Coding problem tables not cleared (may not exist yet)');
    }

    console.log('Cleared existing data.');

    // 2. Create Categories
    const categories = [
        { name: 'Quantitative', description: 'Mathematical and numerical reasoning' },
        { name: 'Logical Reasoning', description: 'Patterns, sequences and logical deductions' },
        { name: 'Verbal Ability', description: 'English grammar, vocabulary and comprehension' },
        { name: 'Data Interpretation', description: 'Analyzing charts, tables and graphs' },
        { name: 'Data Structures & Algorithms', description: 'Core computer science concepts' }
    ];

    const createdCategories: any[] = [];
    for (const cat of categories) {
        const c = await prisma.category.create({ data: cat });
        createdCategories.push(c);
        console.log(`Created Category: ${c.name}`);
    }

    const catMap: Record<string, string> = {
        'Quantitative': createdCategories.find(c => c.name === 'Quantitative')?.id || '',
        'Logical Reasoning': createdCategories.find(c => c.name === 'Logical Reasoning')?.id || '',
        'Verbal Ability': createdCategories.find(c => c.name === 'Verbal Ability')?.id || '',
        'Data Interpretation': createdCategories.find(c => c.name === 'Data Interpretation')?.id || '',
        'Data Structures & Algorithms': createdCategories.find(c => c.name === 'Data Structures & Algorithms')?.id || '',
    };

    // 3. Create a Demo Practice Test for each category
    const tests = [
        { title: 'Quant Basics', categoryName: 'Quantitative', difficulty: Difficulty.BEGINNER, duration: 30, questions: quantitativeQuestions.slice(0, 15) },
        { title: 'Logical Reasoning Pro', categoryName: 'Logical Reasoning', difficulty: Difficulty.INTERMEDIATE, duration: 45, questions: logicalQuestions.slice(0, 15) },
        { title: 'Verbal Excellence', categoryName: 'Verbal Ability', difficulty: Difficulty.ADVANCED, duration: 20, questions: verbalQuestions.slice(0, 15) },
        { title: 'DI Mastery', categoryName: 'Data Interpretation', difficulty: Difficulty.INTERMEDIATE, duration: 40, questions: diQuestions.slice(0, 10) },
        { title: 'DSA Fundamentals', categoryName: 'Data Structures & Algorithms', difficulty: Difficulty.BEGINNER, duration: 60, questions: dsaQuestions.slice(0, 15) },
    ];

    const testMap: Record<string, string> = {};
    for (const t of tests) {
        const testRecord = await prisma.practiceTest.create({
            data: {
                title: t.title,
                categoryId: catMap[t.categoryName] || '',
                difficulty: t.difficulty,
                duration: t.duration,
                totalQuestions: t.questions.length,
                status: TestStatus.ACTIVE,
                tags: [t.categoryName, t.difficulty.toLowerCase()]
            }
        });
        testMap[t.title] = testRecord.id;
        console.log(`Created Practice Test: ${testRecord.title}`);
    }

    // 4. Seed question pool and link to tests
    console.log('Seeding question pool...');

    // Helper to seed pool and tests
    const seedPool = async (questionsData: any[], categoryName: string, testId: string | null = null, count: number = 20) => {
        const poolQuestions = questionsData.slice(0, count);
        for (const q of poolQuestions) {
            await createQuestion(q, testId, catMap[categoryName] || '');
        }
    };

    // Seed questions for the created tests
    await seedPool(quantitativeQuestions, 'Quantitative', testMap['Quant Basics'], 15);
    await seedPool(logicalQuestions, 'Logical Reasoning', testMap['Logical Reasoning Pro'], 15);
    await seedPool(verbalQuestions, 'Verbal Ability', testMap['Verbal Excellence'], 15);
    await seedPool(diQuestions, 'Data Interpretation', testMap['DI Mastery'], 10); // Note: DI test only has 10 questions
    await seedPool(dsaQuestions, 'Data Structures & Algorithms', testMap['DSA Fundamentals'], 15);

    // 5. Seed remaining questions as "Category Pool" (not assigned to specific tests)
    console.log('Seeding remaining question pool...');
    await seedPool(quantitativeQuestions.slice(15), 'Quantitative', null, 5);
    await seedPool(logicalQuestions.slice(15), 'Logical Reasoning', null, 5);
    await seedPool(verbalQuestions.slice(15), 'Verbal Ability', null, 5);
    await seedPool(diQuestions.slice(10), 'Data Interpretation', null, 5);
    await seedPool(dsaQuestions.slice(15), 'Data Structures & Algorithms', null, 5);

    // Seed coding problems
    await seedCoding(prisma);

    console.log('🚀 Seeding finished successfully.');
}

async function createQuestion(legacyQ: any, testId: string | null = null, categoryId: string | null = null) {
    const options = [
        { id: 'A', text: legacyQ.optionA },
        { id: 'B', text: legacyQ.optionB },
        { id: 'C', text: legacyQ.optionC },
        { id: 'D', text: legacyQ.optionD },
    ];

    let correctId = 'A';
    if (legacyQ.correctAnswer === legacyQ.optionB) correctId = 'B';
    else if (legacyQ.correctAnswer === legacyQ.optionC) correctId = 'C';
    else if (legacyQ.correctAnswer === legacyQ.optionD) correctId = 'D';

    let difficulty: Difficulty = Difficulty.BEGINNER;
    if (legacyQ.difficulty?.toLowerCase() === 'medium') difficulty = Difficulty.INTERMEDIATE;
    else if (legacyQ.difficulty?.toLowerCase() === 'hard') difficulty = Difficulty.ADVANCED;

    try {
        await prisma.question.create({
            data: {
                content: legacyQ.question,
                options: options as any,
                correctAnswer: correctId,
                difficulty: difficulty,
                testId: testId,
            }
        });
    } catch (err) {
        // Skip duplicates or errors
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
