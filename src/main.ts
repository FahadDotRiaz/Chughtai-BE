import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const PORT: number = parseInt(process.env.PORT, 10) || 5000;
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  // if (!configService.isProduction()) {
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Chughtai API')
      .setDescription('My Chughtai API')
      .addBearerAuth()
      .build(),
  );

  SwaggerModule.setup('api', app, document);
  // }
  await app.listen(PORT, () => {
    Logger.log(`Running server on port ${PORT}`);
  });
}
bootstrap();
