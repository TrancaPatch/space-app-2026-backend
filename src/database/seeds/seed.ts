import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { EVENT_STORE, IEventStore } from '../interfaces/event-store.interface';
import { INITIAL_SEED_DATA } from './initial-seed.data';

async function runSeed() {
  const logger = new Logger('DatabaseSeed');
  logger.log('🌱 Iniciando proceso de carga de datos semilla (Seed)...');

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const eventStore = app.get<IEventStore>(EVENT_STORE);
    await eventStore.seed(INITIAL_SEED_DATA);
    logger.log('✨ Proceso de seed completado exitosamente.');
  } catch (err: any) {
    logger.error(`❌ Error al ejecutar el seed: ${err.message}`, err.stack);
    process.exitCode = 1;
  } finally {
    await app.close();
    process.exit(process.exitCode || 0);
  }
}

runSeed();
