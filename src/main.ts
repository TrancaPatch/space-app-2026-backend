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
    .setTitle('TrancaPatch - API Médica y Telemetría Espacial 3D')
    .setDescription(
      'Servidor de telemetría biomédica, proyecciones multidimensionales para los 5 sistemas anatómicos (cuerpo holográfico, esqueleto, cardiovascular, nervioso y órganos internos), base de datos de eventos en RethinkDB y streaming WebSocket en tiempo real.',
    )
    .setVersion('1.0.0')
    .addTag('health', 'Verificación de estado del servidor')
    .addTag('missions', 'Misión Trancapatch y tripulantes')
    .addTag('astronauts', 'Perfiles biomédicos de tripulantes (Ariel Y., Manuel J., Ignacio Y.)')
    .addTag(
      'anatomical-systems',
      'Proyecciones y sincronización 3D de los 5 sistemas anatómicos (body, skeleton, cardiovascular, nervous, organs)',
    )
    .addTag('body-parts', 'Retrocompatibilidad: 49 partes del cuerpo holográfico')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  // 5. Iniciar escucha
  await app.listen(port);

  logger.log(`🚀 Servidor ejecutándose en: http://localhost:${port}/api`);
  logger.log(`📚 Documentación Swagger en: http://localhost:${port}/docs`);
}

bootstrap();
