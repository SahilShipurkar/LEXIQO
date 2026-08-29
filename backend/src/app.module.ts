import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { QuestionsModule } from './questions/questions.module';
import { TestsModule } from './tests/tests.module';
import { ResultsModule } from './results/results.module';
import { FirebaseModule } from './firebase/firebase.module';
import { PrismaModule } from './prisma/prisma.module';
import { PerformanceModule } from './performance/performance.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { GoalsModule } from './goals/goals.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CodingModule } from './coding/coding.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    QuestionsModule,
    TestsModule,
    ResultsModule,
    PerformanceModule,
    LeaderboardModule,
    GoalsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    CodingModule,
    // FirebaseModule, // Temporarily disabled due to key parsing issues
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
