import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { r, Connection } from 'rethinkdb-ts';
import {
  ALL_BODY_PART_IDS,
  BodyPartId,
  BODY_PARTS_METADATA,
  NOMINAL_COLOR,
} from '../../common/constants/body-parts.constants';
import {
  Astronaut,
  BaseDomainEvent,
  BodyPartState,
  Mission,
} from '../../common/interfaces/domain.types';
import { IEventStore } from '../interfaces/event-store.interface';
import {
  INITIAL_SEED_DATA,
  SeedData,
} from '../seeds/initial-seed.data';

@Injectable()
export class RethinkDBEventStoreProvider
  implements IEventStore, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RethinkDBEventStoreProvider.name);
  private connection: Connection | null = null;
  private isConnected = false;

  private readonly host: string;
  private readonly port: number;
  private readonly dbName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.host = this.configService.get<string>('rethinkdb.host', 'localhost');
    this.port = this.configService.get<number>('rethinkdb.port', 28015);
    this.dbName = this.configService.get<string>('rethinkdb.db', 'spaceapps');
  }

  async onModuleInit(): Promise<void> {
    const driver = this.configService.get<string>('dataDriver', 'memory');
    if (driver !== 'rethinkdb') {
      this.logger.debug('Driver en memoria activo. RethinkDB provider en espera.');
      return;
    }

    try {
      this.logger.log(
        `Intentando conectar a RethinkDB en ${this.host}:${this.port}/${this.dbName}...`,
      );
      this.connection = await r.connect({
        host: this.host,
        port: this.port,
        db: this.dbName,
      });
      this.isConnected = true;
      this.logger.log('✅ Conexión establecida con RethinkDB.');

      await this.initializeDatabaseAndTables();
    } catch (err: any) {
      this.logger.warn(
        `⚠️ No se pudo conectar a RethinkDB (${err.message}). Si estás desarrollando localmente sin Docker, usa DATA_DRIVER=memory.`,
      );
      this.isConnected = false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.isConnected = false;
      this.logger.log('Conexión con RethinkDB cerrada limpiamente.');
    }
  }

  private ensureConnection(): void {
    if (!this.isConnected || !this.connection) {
      throw new Error(
        'RethinkDB no está conectado. Verifica que el contenedor Docker esté corriendo (pnpm run docker:db:up) o cambia DATA_DRIVER=memory.',
      );
    }
  }

  private async initializeDatabaseAndTables(): Promise<void> {
    if (!this.connection) return;

    // 1. Asegurar base de datos
    try {
      const dbs: string[] = (await r.dbList().run(this.connection)) || [];
      if (!dbs.includes(this.dbName)) {
        await r.dbCreate(this.dbName).run(this.connection);
        this.logger.log(`Base de datos '${this.dbName}' creada.`);
      }
    } catch (e: any) {
      if (!e.message?.includes('already exists')) {
        this.logger.warn(`Nota al verificar DB: ${e.message}`);
      }
    }

    // 2. Asegurar tablas requeridas
    const requiredTables = ['events', 'body_projections', 'missions', 'astronauts'];
    try {
      const tables: string[] =
        (await r.db(this.dbName).tableList().run(this.connection)) || [];

      for (const table of requiredTables) {
        if (!tables.includes(table)) {
          await r.db(this.dbName).tableCreate(table).run(this.connection);
          this.logger.log(`Tabla '${table}' creada en RethinkDB.`);
        }
      }
    } catch (e: any) {
      if (!e.message?.includes('already exists')) {
        this.logger.warn(`Nota al verificar tablas: ${e.message}`);
      }
    }
  }

  async appendEvent(event: BaseDomainEvent): Promise<void> {
    this.ensureConnection();
    await r.table('events').insert(event).run(this.connection!);

    this.logger.debug(
      `[EventStore:RethinkDB] Evento guardado: ${event.type} para ${event.astronautId}`,
    );

    this.eventEmitter.emit(`event.${event.type}`, event);
    this.eventEmitter.emit('domain.event', event);
  }

  async getEventsByAstronaut(astronautId: string): Promise<BaseDomainEvent[]> {
    this.ensureConnection();
    const result = await r
      .table('events')
      .filter({ astronautId })
      .orderBy(r.asc('timestamp'))
      .run(this.connection!);
    return (result as unknown as BaseDomainEvent[]) || [];
  }

  async getEventsByPart(astronautId: string, partId: BodyPartId): Promise<BaseDomainEvent[]> {
    this.ensureConnection();
    const result = await r
      .table('events')
      .filter((doc: any) =>
        doc('astronautId').eq(astronautId).and(doc('payload')('partId').eq(partId)),
      )
      .orderBy(r.asc('timestamp'))
      .run(this.connection!);
    return (result as unknown as BaseDomainEvent[]) || [];
  }

  async getBodyProjection(astronautId: string): Promise<Record<BodyPartId, BodyPartState>> {
    this.ensureConnection();
    const record: any = await r
      .table('body_projections')
      .get(astronautId)
      .run(this.connection!);

    if (record && record.projection) {
      return record.projection as Record<BodyPartId, BodyPartState>;
    }

    const defaultProjection = this.createDefaultBodyProjection();
    await r
      .table('body_projections')
      .insert({ id: astronautId, projection: defaultProjection }, { conflict: 'replace' })
      .run(this.connection!);

    return defaultProjection;
  }

  async updateBodyPartProjection(astronautId: string, state: BodyPartState): Promise<void> {
    this.ensureConnection();
    const current = await this.getBodyProjection(astronautId);
    current[state.partId] = {
      ...state,
      lastEvaluatedAt: new Date().toISOString(),
    };

    await r
      .table('body_projections')
      .insert({ id: astronautId, projection: current }, { conflict: 'replace' })
      .run(this.connection!);

    this.eventEmitter.emit('body_part.updated', {
      astronautId,
      partState: current[state.partId],
    });
  }

  async getMissions(): Promise<Mission[]> {
    this.ensureConnection();
    const result = await r.table('missions').run(this.connection!);
    return (result as unknown as Mission[]) || [];
  }

  async getMissionById(id: string): Promise<Mission | null> {
    this.ensureConnection();
    const result = await r.table('missions').get(id).run(this.connection!);
    return (result as unknown as Mission) || null;
  }

  async getAstronauts(): Promise<Astronaut[]> {
    this.ensureConnection();
    const result = await r.table('astronauts').run(this.connection!);
    return (result as unknown as Mission[]) as unknown as Astronaut[];
  }

  async getAstronautById(id: string): Promise<Astronaut | null> {
    this.ensureConnection();
    const result = await r.table('astronauts').get(id).run(this.connection!);
    return (result as unknown as Astronaut) || null;
  }

  async getAstronautsByMission(missionId: string): Promise<Astronaut[]> {
    this.ensureConnection();
    const result = await r
      .table('astronauts')
      .filter({ missionId })
      .run(this.connection!);
    return (result as unknown as Astronaut[]) || [];
  }

  async clean(): Promise<void> {
    this.ensureConnection();
    const tables = ['events', 'body_projections', 'missions', 'astronauts'];
    for (const table of tables) {
      await r.table(table).delete().run(this.connection!);
    }
    this.logger.log('🧹 [EventStore:RethinkDB] Tablas vaciadas.');
  }

  async seed(data: SeedData = INITIAL_SEED_DATA): Promise<void> {
    this.ensureConnection();
    await this.clean();

    if (data.missions.length > 0) {
      await r.table('missions').insert(data.missions).run(this.connection!);
    }
    if (data.astronauts.length > 0) {
      await r.table('astronauts').insert(data.astronauts).run(this.connection!);
    }
    for (const [astronautId, projection] of Object.entries(data.bodyProjections)) {
      await r
        .table('body_projections')
        .insert({ id: astronautId, projection }, { conflict: 'replace' })
        .run(this.connection!);
    }
    if (data.events.length > 0) {
      await r.table('events').insert(data.events).run(this.connection!);
    }

    this.logger.log(
      `✅ [EventStore:RethinkDB] Datos semilla cargados con éxito (${data.missions.length} misiones, ${data.astronauts.length} astronautas, ${data.events.length} eventos).`,
    );
  }

  private createDefaultBodyProjection(): Record<BodyPartId, BodyPartState> {
    const projection = {} as Record<BodyPartId, BodyPartState>;
    const now = new Date().toISOString();

    for (const partId of ALL_BODY_PART_IDS) {
      const meta = BODY_PARTS_METADATA[partId];
      projection[partId] = {
        partId,
        region: meta.region,
        healthStatus: 'NOMINAL',
        displayColor: NOMINAL_COLOR,
        primaryCondition: 'Nominal',
        painLevel: 0,
        lastVitals: {
          tissuePerfusionIndex: 1.0,
          localTempC: 36.6,
        },
        activeAlert: false,
        lastEvaluatedAt: now,
      };
    }

    return projection;
  }
}
