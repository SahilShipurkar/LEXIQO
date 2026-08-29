import { Module } from '@nestjs/common';
import { CodingController } from './coding.controller';
import { CodingService } from './coding.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CodeExecutionService } from './code-execution.service';

@Module({
    imports: [PrismaModule],
    controllers: [CodingController],
    providers: [CodingService, CodeExecutionService],
})
export class CodingModule { }
