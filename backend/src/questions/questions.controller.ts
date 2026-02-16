import { Controller, Get, UseGuards } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Questions')
@Controller('questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
    constructor(private readonly questionsService: QuestionsService) { }

    @Public()
    @Get('generate')
    @ApiOperation({ summary: 'Generate a new random test set' })
    generate() {
        return this.questionsService.generateTest();
    }
}
