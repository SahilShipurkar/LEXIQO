import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Enable DTO validation (recommended)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('Aptitude API')
    .setDescription('API documentation for Aptitude backend')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT-auth',
    )
    .build();

    app.enableCors({
    origin: [
      'https://lexiqo.netlify.app',
      'http://localhost:5173',
    ],
    credentials: true,
  });


  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
