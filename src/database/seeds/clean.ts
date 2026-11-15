import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { EVENT_STORE, IEventStore } from '../interfaces/event-store.interface';

async function runClean() {
  const logger = new Logger('DatabaseClean');
  logger.log('🧹 Iniciando vaciado y limpieza de la base de datos...');

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const eventStore = app.get<IEventStore>(EVENT_STORE);
    await eventStore.clean();
    logger.log('✨ Base de datos limpiada exitosamente.');
  } catch (err: any) {
    logger.error(`❌ Error al limpiar la base de datos: ${err.message}`, err.stack);
    process.exitCode = 1;
  } finally {
    await app.close();
    process.exit(process.exitCode || 0);
  }
}

runClean();
