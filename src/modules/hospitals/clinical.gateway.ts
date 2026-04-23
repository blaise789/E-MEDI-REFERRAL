import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'clinical',
})
export class ClinicalGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ClinicalGateway');

  afterInit(server: Server) {
    this.logger.log('Clinical WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    const token = client.handshake.auth?.token;
    this.logger.log(`Connection attempt from client: ${client.id}`);
    
    if (token) {
      this.logger.debug(`Token provided for client ${client.id}`);
    }
    
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // ──────────────────────────────── Inbound Event Handlers ────────────────────────────────

  @SubscribeMessage('UPDATE_BED_CAPACITY')
  handleBedUpdate(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    this.logger.log(`Received manual bed update via socket from ${client.id}`);
    // Proxy the update to all other connected clients
    this.broadcastCapacityUpdate(data.hospitalId, data);
  }

  @SubscribeMessage('UPDATE_SPECIALIST_STATUS')
  handleSpecialistUpdate(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    this.logger.log(`Received specialist update via socket from ${client.id}`);
    this.broadcastSpecialistUpdate(data.hospitalId, data);
  }

  // ──────────────────────────────── Broadcast Methods ────────────────────────────────

  /**
   * Broadcast real-time capacity updates to all connected clinicians.
   */
  broadcastCapacityUpdate(hospitalId: string, payload: any) {
    this.server.emit('CAPACITY_UPDATED', {
      hospitalId,
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast specialist availability changes.
   */
  broadcastSpecialistUpdate(hospitalId: string, payload: any) {
    this.server.emit('SPECIALIST_UPDATED', {
      hospitalId,
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast new referral alerts.
   */
  broadcastNewReferral(hospitalId: string, referral: any) {
    this.server.emit('NEW_REFERRAL', {
      hospitalId,
      referral,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast a notification to a specific user.
   */
  broadcastNotification(recipientId: string, payload: any) {
    this.server.emit('NOTIFICATION_CREATED', {
      recipientId,
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }
}
