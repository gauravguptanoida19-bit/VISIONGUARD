import { socketService } from './socketService';
import { StorageRepository } from '../repositories/storage';
import { CameraTelemetry, DetectedObject, Incident } from '@visionguard/shared';

export class DemoService {
  private static instance: DemoService;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private step: number = 0;

  // Internal state for moving objects
  private p27Position = { x: 0.22, y: 0.45 };
  private p31Position = { x: 0.65, y: 0.5 };
  private vehiclePosition = { x: 0.3, y: 0.6 };

  public static getInstance(): DemoService {
    if (!DemoService.instance) {
      DemoService.instance = new DemoService();
    }
    return DemoService.instance;
  }

  public isDemoRunning(): boolean {
    return this.isRunning;
  }

  public startDemo(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.step = 0;
    console.log('🚀 VisionGuard Live Demo Mode ACTIVATED');

    this.intervalId = setInterval(() => {
      this.tick();
    }, 2000);
  }

  public stopDemo(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('⏹️ VisionGuard Live Demo Mode STOPPED');
  }

  private async tick(): Promise<void> {
    this.step++;

    // 1. Simulate object motion
    // Person #27 walks gradually into the restricted zone of CAM-04:
    // Zone is { x: 0.2 to 0.85, y: 0.25 to 0.85 }
    this.p27Position.x += 0.02 * (Math.sin(this.step * 0.4) > 0 ? 1 : -0.5);
    this.p27Position.y += 0.015 * (Math.cos(this.step * 0.3) > 0 ? 1 : -0.5);

    // Keep within bounds
    this.p27Position.x = Math.max(0.15, Math.min(0.8, this.p27Position.x));
    this.p27Position.y = Math.max(0.2, Math.min(0.85, this.p27Position.y));

    // Secondary person #31
    this.p31Position.x += 0.01 * Math.sin(this.step * 0.5);
    this.p31Position.y += 0.01 * Math.cos(this.step * 0.5);

    const isInsideRestrictedZone =
      this.p27Position.x >= 0.25 &&
      this.p27Position.x <= 0.8 &&
      this.p27Position.y >= 0.25 &&
      this.p27Position.y <= 0.85;

    // 2. Emit CAM-04 Telemetry
    const cam4Telemetry: CameraTelemetry = {
      cameraId: 'CAM-04',
      timestamp: new Date().toISOString(),
      fps: 29 + Math.floor(Math.random() * 3),
      objectsCount: 2,
      detections: [
        {
          id: `det-p27-${this.step}`,
          trackId: 27,
          class: 'person',
          confidence: 0.94 + (Math.random() * 0.04 - 0.02),
          bbox: [
            parseFloat(this.p27Position.x.toFixed(3)),
            parseFloat(this.p27Position.y.toFixed(3)),
            parseFloat((this.p27Position.x + 0.15).toFixed(3)),
            parseFloat((this.p27Position.y + 0.35).toFixed(3)),
          ],
          firstSeen: new Date(Date.now() - 47000).toISOString(),
          lastSeen: new Date().toISOString(),
          duration: 47 + this.step * 2,
          currentZoneId: isInsideRestrictedZone ? 'zone-cam4-restricted' : undefined,
        },
        {
          id: `det-p31-${this.step}`,
          trackId: 31,
          class: 'person',
          confidence: 0.89,
          bbox: [
            parseFloat(this.p31Position.x.toFixed(3)),
            parseFloat(this.p31Position.y.toFixed(3)),
            parseFloat((this.p31Position.x + 0.14).toFixed(3)),
            parseFloat((this.p31Position.y + 0.32).toFixed(3)),
          ],
          firstSeen: new Date(Date.now() - 30000).toISOString(),
          lastSeen: new Date().toISOString(),
          duration: 30 + this.step * 2,
        },
      ],
      anomaliesDetected: isInsideRestrictedZone ? ['restricted_zone_entry'] : [],
    };

    socketService.emitCameraTelemetry(cam4Telemetry);

    // 3. Emit CAM-01 and CAM-02 background telemetry
    const cam1Telemetry: CameraTelemetry = {
      cameraId: 'CAM-01',
      timestamp: new Date().toISOString(),
      fps: 28,
      objectsCount: 12 + Math.floor(Math.random() * 4),
      detections: [
        {
          id: `det-cam1-${this.step}`,
          trackId: 101,
          class: 'car',
          confidence: 0.96,
          bbox: [0.2, 0.5, 0.45, 0.85],
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          duration: 10,
        },
      ],
      anomaliesDetected: [],
    };
    socketService.emitCameraTelemetry(cam1Telemetry);

    // 4. Trigger alert on step 4 if not triggered yet
    if (this.step === 4) {
      await this.triggerLiveIncidentAlert();
    }
  }

  public async triggerLiveIncidentAlert(): Promise<Incident> {
    const existing = await StorageRepository.getIncidentById('inc-vg-1842');
    if (existing) {
      // Refresh timestamp and emit live
      existing.timestamp = new Date().toISOString();
      socketService.emitIncidentAlert(existing);
      return existing;
    }

    // Otherwise create dynamically
    const incident: Incident = {
      id: `inc-vg-${Date.now().toString().slice(-4)}`,
      incidentNumber: `VG-${Math.floor(1800 + Math.random() * 200)}`,
      cameraId: 'CAM-04',
      cameraName: 'Server Room Vault',
      location: 'Sub-Level 2 - Data Center',
      type: 'restricted_zone_entry',
      severity: 'HIGH',
      status: 'new',
      timestamp: new Date().toISOString(),
      duration: 52,
      description: 'Person #27 breached the designated restricted High Density Server Rack perimeter during off-duty hours.',
      detectedObjects: [
        {
          id: 'det-p27-live',
          trackId: 27,
          class: 'person',
          confidence: 0.95,
          bbox: [0.32, 0.4, 0.48, 0.85],
          firstSeen: new Date(Date.now() - 52000).toISOString(),
          lastSeen: new Date().toISOString(),
          duration: 52,
          currentZoneId: 'zone-cam4-restricted',
        },
      ],
      evidenceFrames: [
        {
          id: 'ev-live-1',
          timestamp: new Date().toISOString(),
          imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
          label: 'Infraction Point (T=0s)',
          objects: [],
        },
      ],
    };

    await StorageRepository.createIncident(incident);
    socketService.emitIncidentAlert(incident);
    return incident;
  }
}

export const demoService = DemoService.getInstance();
