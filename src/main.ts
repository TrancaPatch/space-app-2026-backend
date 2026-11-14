import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 3000);

  // 1. Habilitar CORS para el frontend (Vite en puerto 5173 u otros clientes)
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 2. Prefijo global para todos los endpoints REST: /api
  app.setGlobalPrefix('api');

  // 3. Validación automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // 4. Configuración de Documentación OpenAPI / Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SpaceAppsPOC - API Médica y Telemetría Espacial 3D')
    .setDescription(
      'Servidor de telemetría biomédica, historial clínico de las 49 partes anatómicas, simulación orbital y asistente IA para astronautas.',
    )
    .setVersion('1.0.0')
    .addTag('health', 'Verificación de estado del servidor')
    .addTag('missions', 'Misiones espaciales y tripulación')
    .addTag('astronauts', 'Perfiles y biometría de tripulantes')
    .addTag('body-parts', 'Monitoreo e historial de las 49 partes anatómicas')
    .addTag('simulator', 'Simulación de anomalías biomédicas')
    .addTag('gemini', 'Asistente IA de medicina espacial')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  // 5. Iniciar escucha
  await app.listen(port);

  logger.log(`🚀 Servidor ejecutándose en: http://localhost:${port}/api`);
  logger.log(`📚 Documentación Swagger en: http://localhost:${port}/docs`);
}

bootstrap();
