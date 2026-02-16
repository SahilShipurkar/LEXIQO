import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuestionsService {
    constructor(private prisma: PrismaService) { }

    async generateTest() {
        return {
            quant: await this.getRandomQuestions('quantitative_question', 15),
            logical: await this.getRandomQuestions('logical_question', 15),
            verbal: await this.getRandomQuestions('verbal_question', 15),
            di: await this.getRandomQuestions('di_question', 15),
            dsa: await this.getRandomQuestions('dsa_question', 15),
        };
    }

    private async getRandomQuestions(tableName: string, count: number) {
        // Use raw query for random selection which is efficient and simple for Postgres
        // Note: Table names are trusted here as they are hardcoded in the method above.
        const questions = await this.prisma.$queryRawUnsafe<any[]>(
            `SELECT * FROM "${tableName}" ORDER BY RANDOM() LIMIT ${count}`
        );

        if (questions.length < count) {
            // Log warning in dev, but maybe just return what we have to not break the app if seed is partial
            console.warn(`Not enough questions in ${tableName}. Needed ${count}, found ${questions.length}.`);
        }
        return questions;
    }
}
