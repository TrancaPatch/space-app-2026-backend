import { Logger, OnModuleDestroy } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { randomUUID } from 'crypto';
import { Server, Socket } from 'socket.io';
import {
  AnatomicalPartState,
  BodyPartState,
  BodyPartStatusChangedEvent,
  GeminiDiagnosisGeneratedEvent,
} from '../../common/interfaces/domain.types';
import { AnatomicalSystem } from '../../common/constants/anatomical-systems.constants';

@WebSocketGateway({
  namespace: '/telemetry',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class TelemetryGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TelemetryGateway.name);
  private readonly activeAstronautRooms = new Set<string>();
  private telemetryStreamTimer: NodeJS.Timeout | null = null;

  afterInit(server: Server) {
    this.logger.log('🛰️ TelemetryGateway inicializado en namespace /telemetry');
    this.startPeriodicTelemetryStream();
  }

  handleConnection(client: Socket) {
    this.logger.log(`[WebSocket] Cliente conectado: ${client.id} (Transport: ${client.conn.transport.name})`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`[WebSocket] Cliente desconectado: ${client.id}`);
  }

  onModuleDestroy() {
    if (this.telemetryStreamTimer) {
      clearInterval(this.telemetryStreamTimer);
      this.telemetryStreamTimer = null;
    }
  }

  // ============================================================================
  // EVENTOS CLIENTE -> SERVIDOR
  // ============================================================================

  /**
   * Suscribe el socket a la sala del astronauta seleccionado (ej. room_astro_ripley)
   */
  @SubscribeMessage('subscribe_astronaut')
  handleSubscribeAstronaut(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { astronautId: string },
  ) {
    const astronautId = data?.astronautId || 'astro_ripley';
    const room = `room_${astronautId}`;

    client.join(room);
    this.activeAstronautRooms.add(astronautId);

    this.logger.log(`[WebSocket] Socket ${client.id} unido a sala '${room}'`);

    client.emit('subscription_confirmed', {
      success: true,
      room,
      astronautId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Cancela la suscripción a la sala de telemetría de un astronauta
   */
  @SubscribeMessage('unsubscribe_astronaut')
  handleUnsubscribeAstronaut(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { astronautId: string },
  ) {
    const astronautId = data?.astronautId;
    if (astronautId) {
      const room = `room_${astronautId}`;
      client.leave(room);
      this.logger.log(`[WebSocket] Socket ${client.id} abandonó sala '${room}'`);
      client.emit('unsubscription_confirmed', { room, astronautId });
    }
  }

  /**
   * Notifica que el usuario ha seleccionado una parte en el visor 3D para enfocar telemetría
   */
  @SubscribeMessage('select_part')
  handleSelectPart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { astronautId: string; partId: string },
  ) {
    if (!data?.astronautId || !data?.partId) return;

    this.logger.debug(
      `[WebSocket] Parte seleccionada en 3D: ${data.partId} (Astronauta: ${data.astronautId})`,
    );

    client.emit('part_selected', {
      astronautId: data.astronautId,
      partId: data.partId,
      selectedAt: new Date().toISOString(),
    });
  }

  // ============================================================================
  // EVENTOS INTERNOS (EventEmitter2) -> SERVIDOR -> CLIENTE
  // ============================================================================

  /**
   * Escucha actualizaciones de proyección de cualquiera de los 5 sistemas y empuja el nuevo color al visor 3D
   */
  @OnEvent('system_part.updated')
  handleSystemPartUpdated(payload: {
    astronautId: string;
    system: AnatomicalSystem;
    partState: AnatomicalPartState;
  }) {
    if (!this.server) return;

    const room = `room_${payload.astronautId}`;
    const { system, partState } = payload;

    const eventPayload = {
      astronautId: payload.astronautId,
      system,
      partId: partState.partId,
      status: partState.healthStatus,
      displayColor: partState.displayColor,
      reason: partState.primaryCondition,
      painLevel: partState.painLevel,
      primaryCondition: partState.primaryCondition,
      activeAlert: partState.activeAlert,
      lastVitals: partState.lastVitals,
      timestamp: partState.lastEvaluatedAt,
    };

    // Emitir a la sala de este astronauta
    this.server.to(room).emit('part_updated', eventPayload);

    this.logger.debug(
      `[WebSocket Push:part_updated] -> ${room} [${system}]: ${partState.partId} (${partState.healthStatus} ${partState.displayColor})`,
    );

    // Si es estado crítico o advertencia, disparar evento de alerta
    if (partState.healthStatus === 'CRITICAL' || partState.healthStatus === 'WARNING') {
      this.server.to(room).emit('alert_triggered', {
        alertId: randomUUID(),
        system,
        severity: partState.healthStatus,
        affectedParts: [partState.partId],
        title: `Alerta médica en ${partState.partId} (${system}): ${partState.primaryCondition}`,
        description: `Estado alterado a ${partState.healthStatus} con color ${partState.displayColor}`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Escucha cuando el asistente Gemini genera un diagnóstico diferencial
   */
  @OnEvent('event.GEMINI_DIAGNOSIS_GENERATED')
  handleGeminiDiagnosis(event: GeminiDiagnosisGeneratedEvent) {
    if (!this.server) return;

    const room = `room_${event.astronautId}`;
    this.server.to(room).emit('ai_diagnosis_ready', {
      diagnosisId: event.eventId,
      astronautId: event.astronautId,
      affectedParts: event.payload.affectedParts,
      diagnosis: event.payload.diagnosis,
      gravityRiskFactor: event.payload.gravityRiskFactor,
      countermeasures: event.payload.countermeasures,
      urgencyLevel: event.payload.urgencyLevel,
      confidenceScore: event.payload.confidenceScore,
      timestamp: event.timestamp,
    });
  }

  // ============================================================================
  // STREAM PERIÓDICO DE TELEMETRÍA BIOMÉDICA EN VIVO (1.5 Hz)
  // ============================================================================

  /**
   * Genera oscilaciones biomédicas periódicas para que los paneles de telemetría
   * y gráficas del frontend tengan una sensación viva y orgánica en tiempo real.
   */
  private startPeriodicTelemetryStream() {
    this.telemetryStreamTimer = setInterval(() => {
      if (!this.server) return;

      // Si no hay salas registradas, emitir por defecto para Ripley
      const targetAstronauts =
        this.activeAstronautRooms.size > 0
          ? Array.from(this.activeAstronautRooms)
          : ['astro_ripley'];

      for (const astronautId of targetAstronauts) {
        const room = `room_${astronautId}`;

        // Simular fluctuaciones normales de latidos y respiración
        const hrJitter = Math.floor(Math.random() * 5) - 2; // -2 a +2 bpm
        const spo2Jitter = Math.random() > 0.8 ? -1 : 0;
        const tempJitter = (Math.random() * 0.2 - 0.1);

        const streamData = {
          astronautId,
          timestamp: new Date().toISOString(),
          vitals: {
            heartRateBpm: 70 + hrJitter,
            spo2Percent: Math.min(100, Math.max(95, 98 + spo2Jitter)),
            respiratoryRateBpm: 14 + (hrJitter > 0 ? 1 : 0),
            coreTemperatureC: parseFloat((36.7 + tempJitter).toFixed(1)),
            bloodPressure: '118/76',
            suitPressureKPa: 29.6,
            o2ConsumptionLMin: 0.42,
          },
        };

        this.server.to(room).emit('telemetry_stream', streamData);
      }
    }, 1500);
  }
}
