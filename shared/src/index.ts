// ============================================================
// VISIONGUARD SHARED CONTRACTS & DATA MODELS
// ============================================================

export type UserRole = 'admin' | 'analyst' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type CameraStatus = 'online' | 'offline' | 'degraded';

export interface ZoneCoordinates {
  x: number; // 0 to 1 normalized
  y: number; // 0 to 1 normalized
}

export type ZoneType = 'restricted' | 'loitering' | 'monitored' | 'entry_exit';

export interface CameraZone {
  id: string;
  cameraId: string;
  name: string;
  type: ZoneType;
  polygon: ZoneCoordinates[];
  activeHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "06:00"
  };
  severity: Severity;
  color?: string;
  dwellTimeThresholdSeconds?: number;
}

export interface Camera {
  id: string;
  name: string;
  location: string;
  streamUrl: string;
  thumbnailUrl?: string;
  status: CameraStatus;
  fps: number;
  resolution: string;
  zones: CameraZone[];
  activeObjectsCount: number;
  lastHeartbeat: string;
  createdAt: string;
}

export interface BoundingBox {
  x1: number; // normalized 0..1 or pixel
  y1: number;
  x2: number;
  y2: number;
}

export interface DetectedObject {
  id: string;
  trackId: number;
  class: string; // 'person' | 'car' | 'bus' | 'truck' | 'bicycle' | 'motorcycle' | 'backpack' | 'suitcase'
  confidence: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
  firstSeen: string;
  lastSeen: string;
  duration: number; // seconds
  currentZoneId?: string;
  velocity?: [number, number];
  isStationary?: boolean;
}

export type AnomalyType =
  | 'restricted_zone_entry'
  | 'loitering'
  | 'abandoned_object'
  | 'unusual_crowd'
  | 'after_hours_movement'
  | 'wrong_direction'
  | 'rapid_movement'
  | 'unusual_zone';

export type IncidentStatus = 'new' | 'investigating' | 'resolved' | 'false_positive';

export interface EvidenceFrame {
  id: string;
  timestamp: string;
  imageUrl: string;
  label: string;
  objects: DetectedObject[];
}

export interface AIAnalysisReport {
  summary: string;
  whatHappened: string;
  whyFlagged: string;
  relevantObjects: string[];
  timeline: { time: string; event: string }[];
  possibleExplanation: string;
  recommendedSteps: string[];
  confidence: number;
  generatedAt: string;
  modelUsed: string;
}

export interface Incident {
  id: string;
  incidentNumber: string; // e.g. "VG-1842"
  cameraId: string;
  cameraName: string;
  location: string;
  type: AnomalyType;
  severity: Severity;
  status: IncidentStatus;
  timestamp: string;
  duration: number; // seconds
  detectedObjects: DetectedObject[];
  evidenceFrames: EvidenceFrame[];
  description: string;
  aiAnalysis?: AIAnalysisReport;
  assignedTo?: string;
  resolvedAt?: string;
  analystNotes?: string[];
}

export interface LiveNotification {
  id: string;
  incidentId?: string;
  cameraId: string;
  cameraName: string;
  title: string;
  message: string;
  severity: Severity;
  timestamp: string;
  read: boolean;
}

export interface CameraTelemetry {
  cameraId: string;
  timestamp: string;
  fps: number;
  objectsCount: number;
  detections: DetectedObject[];
  anomaliesDetected: AnomalyType[];
}

export interface AnalyticsData {
  activeCameras: number;
  totalCameras: number;
  peopleDetectedNow: number;
  activeIncidentsCount: number;
  highRiskAlertsCount: number;
  incidentsOverTime: { date: string; total: number; highRisk: number }[];
  threatDistribution: { severity: Severity; count: number }[];
  cameraActivity: {
    cameraId: string;
    name: string;
    location: string;
    detections: number;
    incidents: number;
    uptime: number;
  }[];
  anomalyTypeBreakdown: { type: string; label: string; count: number }[];
  recentIncidents: Incident[];
  averageResponseTimeMinutes: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}

// Socket IO Event Contracts
export interface ServerToClientEvents {
  'camera:telemetry': (telemetry: CameraTelemetry) => void;
  'incident:alert': (incident: Incident) => void;
  'notification:new': (notification: LiveNotification) => void;
  'camera:status_change': (data: { cameraId: string; status: CameraStatus }) => void;
  'demo:tick': (data: { step: number; message: string; data?: any }) => void;
}

export interface ClientToServerEvents {
  'camera:subscribe': (cameraId: string) => void;
  'camera:unsubscribe': (cameraId: string) => void;
  'demo:trigger': (scenario: string) => void;
}
