import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  Incident,
  LiveNotification,
  CameraTelemetry,
} from '@visionguard/shared';

export class SocketService {
  private static instance: SocketService;
  private io: SocketIOServer<ClientToServerEvents, ServerToClientEvents> | null = null;

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public init(httpServer: HTTPServer, allowedOrigins: string[]): void {
    this.io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
      },
    });

    this.io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
      console.log(`🔌 Client connected to VisionGuard Socket.IO: ${socket.id}`);

      socket.on('camera:subscribe', (cameraId: string) => {
        socket.join(`camera:${cameraId}`);
        console.log(`📷 Socket ${socket.id} subscribed to camera:${cameraId}`);
      });

      socket.on('camera:unsubscribe', (cameraId: string) => {
        socket.leave(`camera:${cameraId}`);
        console.log(`📷 Socket ${socket.id} unsubscribed from camera:${cameraId}`);
      });

      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
      });
    });
  }

  public emitIncidentAlert(incident: Incident): void {
    if (!this.io) return;
    this.io.emit('incident:alert', incident);

    // Also emit as a notification
    const notification: LiveNotification = {
      id: `notif-${Date.now()}`,
      incidentId: incident.id,
      cameraId: incident.cameraId,
      cameraName: incident.cameraName,
      title: `${incident.severity} SEVERITY ALERT`,
      message: `${incident.type.replace(/_/g, ' ').toUpperCase()}: ${incident.description}`,
      severity: incident.severity,
      timestamp: new Date().toISOString(),
      read: false,
    };
    this.io.emit('notification:new', notification);
  }

  public emitNotification(notification: LiveNotification): void {
    if (!this.io) return;
    this.io.emit('notification:new', notification);
  }

  public emitCameraTelemetry(telemetry: CameraTelemetry): void {
    if (!this.io) return;
    // Broadcast to camera specific room and to global dashboard
    this.io.to(`camera:${telemetry.cameraId}`).emit('camera:telemetry', telemetry);
    this.io.emit('camera:telemetry', telemetry);
  }

  public emitDemoTick(data: { step: number; message: string; data?: any }): void {
    if (!this.io) return;
    this.io.emit('demo:tick', data);
  }

  public getIO() {
    return this.io;
  }
}

export const socketService = SocketService.getInstance();
