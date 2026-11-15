import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EVENT_STORE } from './interfaces/event-store.interface';
import { InMemoryEventStoreProvider } from './providers/in-memory.provider';
import { RethinkDBEventStoreProvider } from './providers/rethinkdb.provider';

@Global()
@Module({
  providers: [
    InMemoryEventStoreProvider,
    RethinkDBEventStoreProvider,
    {
      provide: EVENT_STORE,
      useFactory: (
        configService: ConfigService,
        inMemoryProvider: InMemoryEventStoreProvider,
        rethinkDBProvider: RethinkDBEventStoreProvider,
      ) => {
        const driver = configService.get<string>('dataDriver', 'memory');
        if (driver === 'rethinkdb') {
          return rethinkDBProvider;
        }
        return inMemoryProvider;
      },
      inject: [ConfigService, InMemoryEventStoreProvider, RethinkDBEventStoreProvider],
    },
  ],
  exports: [EVENT_STORE],
})
export class DatabaseModule {}
