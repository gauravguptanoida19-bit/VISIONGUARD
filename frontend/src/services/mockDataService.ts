import {
  Camera,
  Incident,
  AnalyticsData,
  LiveNotification,
  User,
  UserRole,
  CameraZone,
  AIAnalysisReport,
  CameraTelemetry,
} from '@visionguard/shared';

// Initial Seed Users
const DEFAULT_USERS: User[] = [
  {
    id: 'user-admin-01',
    name: 'Vikramaditya Sharma',
    email: 'admin@visionguard.ai',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'user-analyst-01',
    name: 'Ananya Deshmukh',
    email: 'analyst@visionguard.ai',
    role: 'analyst',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-02-14T09:30:00.000Z',
  },
  {
    id: 'user-viewer-01',
    name: 'Rohan Verma',
    email: 'viewer@visionguard.ai',
    role: 'viewer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-03-01T11:15:00.000Z',
  },
];

// Initial Seed Cameras
const DEFAULT_CAMERAS: Camera[] = [
  {
    id: 'CAM-01',
    name: 'Main Gate Checkpoint',
    location: 'Main Gate - North Entrance',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80',
    status: 'online',
    fps: 28,
    resolution: '1920x1080',
    activeObjectsCount: 14,
    lastHeartbeat: new Date().toISOString(),
    createdAt: '2026-01-15T00:00:00.000Z',
    zones: [
      {
        id: 'zone-cam1-1',
        cameraId: 'CAM-01',
        name: 'Gate Vehicle Barrier',
        type: 'restricted',
        polygon: [
          { x: 0.25, y: 0.4 },
          { x: 0.75, y: 0.4 },
          { x: 0.85, y: 0.85 },
          { x: 0.15, y: 0.85 },
        ],
        activeHours: { enabled: true, start: '22:00', end: '06:00' },
        severity: 'HIGH',
        color: '#EF4444',
      },
    ],
  },
  {
    id: 'CAM-02',
    name: 'Parking Area Bay 2',
    location: 'Parking - Sector C',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80',
    status: 'online',
    fps: 30,
    resolution: '1920x1080',
    activeObjectsCount: 22,
    lastHeartbeat: new Date().toISOString(),
    createdAt: '2026-01-15T00:00:00.000Z',
    zones: [
      {
        id: 'zone-cam2-1',
        cameraId: 'CAM-02',
        name: 'VIP Parking & Fire Lane',
        type: 'loitering',
        polygon: [
          { x: 0.1, y: 0.3 },
          { x: 0.5, y: 0.3 },
          { x: 0.55, y: 0.75 },
          { x: 0.05, y: 0.75 },
        ],
        activeHours: { enabled: false, start: '00:00', end: '23:59' },
        severity: 'MEDIUM',
        dwellTimeThresholdSeconds: 30,
        color: '#F59E0B',
      },
    ],
  },
  {
    id: 'CAM-03',
    name: 'Building A Lobby Access',
    location: 'Building A - Ground Floor',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80',
    status: 'online',
    fps: 25,
    resolution: '1920x1080',
    activeObjectsCount: 8,
    lastHeartbeat: new Date().toISOString(),
    createdAt: '2026-01-16T00:00:00.000Z',
    zones: [
      {
        id: 'zone-cam3-1',
        cameraId: 'CAM-03',
        name: 'Turnstile Air-Lock',
        type: 'restricted',
        polygon: [
          { x: 0.3, y: 0.2 },
          { x: 0.7, y: 0.2 },
          { x: 0.75, y: 0.8 },
          { x: 0.25, y: 0.8 },
        ],
        activeHours: { enabled: true, start: '20:00', end: '06:00' },
        severity: 'HIGH',
        color: '#EF4444',
      },
    ],
  },
  {
    id: 'CAM-04',
    name: 'Server Room Vault',
    location: 'Sub-Level 2 - Data Center',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
    status: 'online',
    fps: 30,
    resolution: '3840x2160',
    activeObjectsCount: 2,
    lastHeartbeat: new Date().toISOString(),
    createdAt: '2026-01-16T00:00:00.000Z',
    zones: [
      {
        id: 'zone-cam4-restricted',
        cameraId: 'CAM-04',
        name: 'High Density Server Rack Perimeter',
        type: 'restricted',
        polygon: [
          { x: 0.2, y: 0.25 },
          { x: 0.8, y: 0.25 },
          { x: 0.85, y: 0.85 },
          { x: 0.15, y: 0.85 },
        ],
        activeHours: { enabled: true, start: '00:00', end: '23:59' },
        severity: 'HIGH',
        color: '#EF4444',
      },
    ],
  },
  {
    id: 'CAM-05',
    name: 'Building B Executive Corridor',
    location: 'Building B - Level 4',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
    status: 'online',
    fps: 24,
    resolution: '1920x1080',
    activeObjectsCount: 5,
    lastHeartbeat: new Date().toISOString(),
    createdAt: '2026-01-18T00:00:00.000Z',
    zones: [],
  },
  {
    id: 'CAM-06',
    name: 'Library Courtyard',
    location: 'Academic Quad - Central',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&auto=format&fit=crop&q=80',
    status: 'online',
    fps: 29,
    resolution: '1920x1080',
    activeObjectsCount: 19,
    lastHeartbeat: new Date().toISOString(),
    createdAt: '2026-01-20T00:00:00.000Z',
    zones: [],
  },
  {
    id: 'CAM-07',
    name: 'Hostel Block East Perimeter',
    location: 'Residential Sector 1',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop&q=80',
    status: 'online',
    fps: 26,
    resolution: '1920x1080',
    activeObjectsCount: 6,
    lastHeartbeat: new Date().toISOString(),
    createdAt: '2026-01-22T00:00:00.000Z',
    zones: [],
  },
  {
    id: 'CAM-08',
    name: 'Back Gate & Loading Dock',
    location: 'Logistics Facility - Rear',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
    status: 'degraded',
    fps: 15,
    resolution: '1280x720',
    activeObjectsCount: 4,
    lastHeartbeat: new Date(Date.now() - 300000).toISOString(),
    createdAt: '2026-01-25T00:00:00.000Z',
    zones: [],
  },
];

// Initial Seed Incidents
const DEFAULT_INCIDENTS: Incident[] = [
  {
    id: 'inc-vg-1842',
    incidentNumber: 'VG-1842',
    cameraId: 'CAM-04',
    cameraName: 'Server Room Vault',
    location: 'Sub-Level 2 - Data Center',
    type: 'restricted_zone_entry',
    severity: 'HIGH',
    status: 'investigating',
    timestamp: '2026-09-20T02:14:31.000Z',
    duration: 47,
    description: 'Person #27 breached the designated restricted High Density Server Rack perimeter during off-duty hours.',
    detectedObjects: [
      {
        id: 'det-p27',
        trackId: 27,
        class: 'person',
        confidence: 0.94,
        bbox: [0.35, 0.42, 0.52, 0.88],
        firstSeen: '2026-09-20T02:14:31.000Z',
        lastSeen: '2026-09-20T02:15:18.000Z',
        duration: 47,
        currentZoneId: 'zone-cam4-restricted',
      },
    ],
    evidenceFrames: [
      {
        id: 'ev-frame-1',
        timestamp: '2026-09-20T02:14:31.000Z',
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
        label: 'Initial Boundary Infraction (T=0s)',
        objects: [
          {
            id: 'det-p27-1',
            trackId: 27,
            class: 'person',
            confidence: 0.94,
            bbox: [0.22, 0.38, 0.38, 0.82],
            firstSeen: '2026-09-20T02:14:31.000Z',
            lastSeen: '2026-09-20T02:14:31.000Z',
            duration: 1,
          },
        ],
      },
      {
        id: 'ev-frame-2',
        timestamp: '2026-09-20T02:14:52.000Z',
        imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
        label: 'Interior Rack Inspection (T=21s)',
        objects: [
          {
            id: 'det-p27-2',
            trackId: 27,
            class: 'person',
            confidence: 0.96,
            bbox: [0.45, 0.35, 0.62, 0.86],
            firstSeen: '2026-09-20T02:14:31.000Z',
            lastSeen: '2026-09-20T02:14:52.000Z',
            duration: 21,
          },
        ],
      },
      {
        id: 'ev-frame-3',
        timestamp: '2026-09-20T02:15:18.000Z',
        imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
        label: 'Egress Towards Vault Corridor (T=47s)',
        objects: [
          {
            id: 'det-p27-3',
            trackId: 27,
            class: 'person',
            confidence: 0.92,
            bbox: [0.72, 0.4, 0.88, 0.89],
            firstSeen: '2026-09-20T02:14:31.000Z',
            lastSeen: '2026-09-20T02:15:18.000Z',
            duration: 47,
          },
        ],
      },
    ],
    aiAnalysis: {
      summary: 'High-confidence perimeter breach detected in secure server vault by unidentified personnel.',
      whatHappened: 'Individual Person #27 traversed the physical perimeter markers of Server Rack Bay 4 at 02:14:31 UTC without badge synchronization telemetry.',
      whyFlagged: 'Server Room Vault is classified as Zero-Tolerance Tier-1 Critical infrastructure with active 24/7 prohibited unauthorized zone rules.',
      relevantObjects: ['Person #27', 'High Density Server Rack Perimeter'],
      timeline: [
        { time: '02:14:31', event: 'Perimeter coordinate crossing registered at (X: 0.22, Y: 0.38)' },
        { time: '02:14:45', event: 'Subject paused adjacent to optical cross-connect terminal' },
        { time: '02:15:02', event: 'Rapid head movement observed toward ceiling sensor node' },
        { time: '02:15:18', event: 'Subject exited camera FOV towards secondary emergency egress' },
      ],
      possibleExplanation: 'Likely unannounced contractor inspection or unauthorized physical penetration attempt; visual gait analysis does not indicate distress.',
      recommendedSteps: [
        'Dispatch on-duty security patrol immediately to Sub-Level 2 corridor.',
        'Cross-reference electronic door access log at reader SL2-DR-04.',
        'Review adjacent corridor feed CAM-05 for exit vector confirmation.',
      ],
      confidence: 0.95,
      generatedAt: '2026-09-20T02:15:20.000Z',
      modelUsed: 'gemini-3.8-flash',
    },
    analystNotes: [
      'Corridor footage cross-verified. Badge reader was bypassed. Escalated to Chief Security Officer.',
    ],
  },
  {
    id: 'inc-vg-1843',
    incidentNumber: 'VG-1843',
    cameraId: 'CAM-02',
    cameraName: 'Parking Area Bay 2',
    location: 'Parking - Sector C',
    type: 'loitering',
    severity: 'MEDIUM',
    status: 'new',
    timestamp: '2026-09-20T02:05:12.000Z',
    duration: 85,
    description: 'Person #31 observed lingering stationary in VIP fire lane for over 85 seconds.',
    detectedObjects: [
      {
        id: 'det-p31',
        trackId: 31,
        class: 'person',
        confidence: 0.89,
        bbox: [0.15, 0.45, 0.28, 0.85],
        firstSeen: '2026-09-20T02:03:47.000Z',
        lastSeen: '2026-09-20T02:05:12.000Z',
        duration: 85,
        currentZoneId: 'zone-cam2-1',
      },
    ],
    evidenceFrames: [
      {
        id: 'ev-frame-4',
        timestamp: '2026-09-20T02:05:12.000Z',
        imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80',
        label: 'Continuous Dwell Threshold Exceeded (>60s)',
        objects: [],
      },
    ],
    aiAnalysis: {
      summary: 'Loitering anomaly flagged: subject remained stationary in restricted vehicular egress pathway.',
      whatHappened: 'Individual Person #31 remained within VIP Parking & Fire Lane zone without vehicle movement for 85s.',
      whyFlagged: 'Exceeded maximum permitted dwell threshold of 30 seconds.',
      relevantObjects: ['Person #31'],
      timeline: [
        { time: '02:03:47', event: 'Subject entered parking bay' },
        { time: '02:04:17', event: 'Dwell timer passed 30s threshold' },
        { time: '02:05:12', event: 'Incident escalated to SOC queue' },
      ],
      possibleExplanation: 'Waiting for rideshare or rendezvous; no aggressive posture detected.',
      recommendedSteps: ['Dispatch parking marshal to verify badge or vehicle assignment.'],
      confidence: 0.88,
      generatedAt: '2026-09-20T02:05:15.000Z',
      modelUsed: 'gemini-3.8-flash',
    },
    analystNotes: [],
  },
  {
    id: 'inc-vg-1844',
    incidentNumber: 'VG-1844',
    cameraId: 'CAM-06',
    cameraName: 'Library Courtyard',
    location: 'Academic Quad - Central',
    type: 'abandoned_object',
    severity: 'HIGH',
    status: 'new',
    timestamp: '2026-09-20T01:45:00.000Z',
    duration: 310,
    description: 'Black backpack left unattended on stone bench with no associated owner detected within 10 meters for over 5 minutes.',
    detectedObjects: [
      {
        id: 'det-bg1',
        trackId: 104,
        class: 'backpack',
        confidence: 0.91,
        bbox: [0.52, 0.65, 0.61, 0.76],
        firstSeen: '2026-09-20T01:39:50.000Z',
        lastSeen: '2026-09-20T01:45:00.000Z',
        duration: 310,
        isStationary: true,
      },
    ],
    evidenceFrames: [
      {
        id: 'ev-frame-5',
        timestamp: '2026-09-20T01:45:00.000Z',
        imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop&q=80',
        label: 'Unattended Bag Detection (T=300s)',
        objects: [],
      },
    ],
    aiAnalysis: {
      summary: 'High-severity unattended package detected in public gathering area.',
      whatHappened: 'A backpack was deposited on bench at 01:39 UTC; depositing individual walked away northward.',
      whyFlagged: 'Stationary object threshold exceeded 180s in high-footfall zone.',
      relevantObjects: ['Backpack #104'],
      timeline: [
        { time: '01:39:50', event: 'Bag placed on bench by Person #89' },
        { time: '01:40:15', event: 'Person #89 departed camera view' },
        { time: '01:45:00', event: 'Unattended threshold exceeded 5 minutes' },
      ],
      possibleExplanation: 'Accidentally forgotten student luggage or deliberate security hazard.',
      recommendedSteps: [
        'Secure perimeter around courtyard bench.',
        'Trace origin vector of Person #89 using CAM-05 and CAM-03.',
      ],
      confidence: 0.93,
      generatedAt: '2026-09-20T01:45:05.000Z',
      modelUsed: 'gemini-3.8-flash',
    },
    analystNotes: [],
  },
];

const DEFAULT_NOTIFICATIONS: LiveNotification[] = [
  {
    id: 'notif-1',
    incidentId: 'inc-vg-1842',
    title: 'High Severity: Server Room Breach',
    message: 'Person #27 breached the Server Room Vault perimeter',
    severity: 'HIGH',
    timestamp: '2026-09-20T02:14:31.000Z',
    read: false,
    cameraId: 'CAM-04',
    cameraName: 'Server Room Vault',
  },
  {
    id: 'notif-2',
    incidentId: 'inc-vg-1843',
    title: 'Loitering Alert: Sector C',
    message: 'Person #31 loitering in VIP parking lane (>85s)',
    severity: 'MEDIUM',
    timestamp: '2026-09-20T02:05:12.000Z',
    read: false,
    cameraId: 'CAM-02',
    cameraName: 'Parking Area Bay 2',
  },
  {
    id: 'notif-3',
    incidentId: 'inc-vg-1844',
    title: 'Abandoned Object: Courtyard',
    message: 'Unattended backpack detected on courtyard bench (>5m)',
    severity: 'HIGH',
    timestamp: '2026-09-20T01:45:00.000Z',
    read: true,
    cameraId: 'CAM-06',
    cameraName: 'Library Courtyard',
  },
];

class MockDataService {
  private getStorage<T>(key: string, defaultValue: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return defaultValue;
      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  }

  private setStorage<T>(key: string, val: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn('LocalStorage write failed', e);
    }
  }

  public getUsers(): User[] {
    const custom = this.getStorage<User[]>('vg_registered_users', []);
    return [...DEFAULT_USERS, ...custom];
  }

  public getCameras(): Camera[] {
    return this.getStorage<Camera[]>('vg_cameras', DEFAULT_CAMERAS);
  }

  public getIncidents(): Incident[] {
    return this.getStorage<Incident[]>('vg_incidents', DEFAULT_INCIDENTS);
  }

  public getNotifications(): LiveNotification[] {
    return this.getStorage<LiveNotification[]>('vg_notifications', DEFAULT_NOTIFICATIONS);
  }

  public async handleRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const method = (options.method || 'GET').toUpperCase();
    const body = options.body ? JSON.parse(options.body as string) : {};

    // 1. AUTH ENDPOINTS
    if (url === '/auth/login' && method === 'POST') {
      const { email } = body;
      const users = this.getUsers();
      let matched = users.find((u) => u.email?.toLowerCase() === email?.toLowerCase());

      if (!matched) {
        // Automatically provision on demo login if user typed an ad-hoc operator email
        matched = {
          id: `user-${Date.now()}`,
          name: email.split('@')[0] || 'Operator',
          email,
          role: 'analyst',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          createdAt: new Date().toISOString(),
        };
        const currentCustom = this.getStorage<User[]>('vg_registered_users', []);
        this.setStorage('vg_registered_users', [...currentCustom, matched]);
      }

      const token = `vg-mock-jwt-${matched.id}-${Date.now()}`;
      return { success: true, token, user: matched } as unknown as T;
    }

    if (url === '/auth/register' && method === 'POST') {
      const { name, email, role } = body;
      const users = this.getUsers();
      const existing = users.find((u) => u.email?.toLowerCase() === email?.toLowerCase());

      const user: User = existing
        ? { ...existing, name: name || existing.name, role: (role as UserRole) || existing.role }
        : {
            id: `user-${Date.now()}`,
            name: name || 'Operator',
            email: email || `operator-${Date.now()}@visionguard.ai`,
            role: (role as UserRole) || 'analyst',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            createdAt: new Date().toISOString(),
          };

      const currentCustom = this.getStorage<User[]>('vg_registered_users', []);
      const updated = currentCustom.filter((u) => u.email?.toLowerCase() !== user.email.toLowerCase());
      this.setStorage('vg_registered_users', [...updated, user]);

      const token = `vg-mock-jwt-${user.id}-${Date.now()}`;
      return { success: true, token, user } as unknown as T;
    }

    if (url === '/auth/me' && method === 'GET') {
      const stored = this.getStorage<User | null>('vg_user', null);
      const user = stored || DEFAULT_USERS[1]; // Fallback to Ananya Deshmukh
      return { success: true, user } as unknown as T;
    }

    if (url === '/auth/users' && method === 'GET') {
      return { success: true, users: this.getUsers() } as unknown as T;
    }

    // 2. CAMERAS ENDPOINTS
    if (url === '/cameras' && method === 'GET') {
      return { success: true, cameras: this.getCameras() } as unknown as T;
    }

    if (url.startsWith('/cameras/') && !url.includes('/zones') && method === 'GET') {
      const id = url.split('/')[2];
      const camera = this.getCameras().find((c) => c.id === id) || this.getCameras()[0];
      return { success: true, camera } as unknown as T;
    }

    if (url.includes('/zones') && method === 'PUT') {
      const parts = url.split('/');
      const cameraId = parts[2];
      const { zones } = body;
      const cameras = this.getCameras().map((c) => (c.id === cameraId ? { ...c, zones } : c));
      this.setStorage('vg_cameras', cameras);
      const updated = cameras.find((c) => c.id === cameraId);
      return { success: true, camera: updated } as unknown as T;
    }

    // 3. INCIDENTS ENDPOINTS
    if (url.startsWith('/incidents') && method === 'GET' && !url.includes('/notes') && !url.includes('/status')) {
      const incidents = this.getIncidents();
      return { success: true, count: incidents.length, incidents } as unknown as T;
    }

    if (url.startsWith('/incidents/') && method === 'GET') {
      const id = url.split('/')[2];
      const incident = this.getIncidents().find((i) => i.id === id || i.incidentNumber === id) || this.getIncidents()[0];
      return { success: true, incident } as unknown as T;
    }

    if (url.includes('/status') && method === 'PUT') {
      const id = url.split('/')[2];
      const { status, note } = body;
      const incidents = this.getIncidents().map((inc) => {
        if (inc.id === id || inc.incidentNumber === id) {
          const notes = inc.analystNotes ? [...inc.analystNotes] : [];
          if (note) {
            notes.push(typeof note === 'string' ? note : JSON.stringify(note));
          }
          return { ...inc, status, analystNotes: notes };
        }
        return inc;
      });
      this.setStorage('vg_incidents', incidents);
      const updated = incidents.find((i) => i.id === id || i.incidentNumber === id);
      return { success: true, incident: updated } as unknown as T;
    }

    if (url.includes('/notes') && method === 'POST') {
      const id = url.split('/')[2];
      const { note } = body;
      const incidents = this.getIncidents().map((inc) => {
        if (inc.id === id || inc.incidentNumber === id) {
          const notes = inc.analystNotes ? [...inc.analystNotes] : [];
          if (note) {
            notes.push(typeof note === 'string' ? note : JSON.stringify(note));
          }
          return { ...inc, analystNotes: notes };
        }
        return inc;
      });
      this.setStorage('vg_incidents', incidents);
      const updated = incidents.find((i) => i.id === id || i.incidentNumber === id);
      return { success: true, incident: updated } as unknown as T;
    }

    if (url.includes('/analyze') && method === 'POST') {
      const report: AIAnalysisReport = {
        summary: 'Forensic evaluation confirmed: Restricted perimeter crossing detected by persistent tracker.',
        whatHappened: 'A tracked subject entered the restricted zone geometry during enforced rule hours.',
        whyFlagged: 'Zero-tolerance rule trigger configured on this camera sector.',
        relevantObjects: ['Person Tracker #27', 'Restricted Boundary'],
        timeline: [
          { time: '02:14:31', event: 'Perimeter coordinate violation logged' },
          { time: '02:14:48', event: 'Sensor telemetry corroborated presence' },
          { time: '02:15:18', event: 'Subject departed camera sector' },
        ],
        possibleExplanation: 'Unauthorized traversal or security breach requiring on-site confirmation.',
        recommendedSteps: [
          'Dispatch patrol marshal to target sector.',
          'Review entrance turnstile badge logs.',
          'Secure high-priority asset vault.',
        ],
        confidence: 0.96,
        generatedAt: new Date().toISOString(),
        modelUsed: 'gemini-3.8-flash',
      };
      return { success: true, aiAnalysis: report, incident: this.getIncidents()[0] } as unknown as T;
    }

    // 4. AI & SEARCH ENDPOINTS
    if (url === '/ai/search' && method === 'POST') {
      const { query } = body;
      const q = (query || '').toLowerCase();
      const results = this.getIncidents().filter(
        (i) =>
          i.description.toLowerCase().includes(q) ||
          i.cameraName.toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q) ||
          i.incidentNumber.toLowerCase().includes(q)
      );

      const sources = (results.length > 0 ? results : this.getIncidents()).slice(0, 3).map((r) => ({
        id: r.id,
        incidentNumber: r.incidentNumber,
        cameraName: r.cameraName,
        type: r.type,
        severity: r.severity,
        summary: r.description,
      }));

      const answer = `Based on forensic search across active surveillance logs for "${query}": Found ${sources.length} matching incidents. Primary incident ${sources[0].incidentNumber} occurred at ${sources[0].cameraName} with severity ${sources[0].severity}. Grounded in camera telemetry and ByteTrack identity traces.`;

      return { success: true, answer, sources, query } as unknown as T;
    }

    if (url === '/ai/copilot' && method === 'POST') {
      const { message } = body;
      const lower = (message || '').toLowerCase();
      const incidents = this.getIncidents();

      let target = incidents[0];
      if (lower.includes('1843') || lower.includes('parking') || lower.includes('loitering')) {
        target = incidents[1] || target;
      } else if (lower.includes('1844') || lower.includes('bag') || lower.includes('backpack')) {
        target = incidents[2] || target;
      }

      const sources = [
        {
          id: target.id,
          incidentNumber: target.incidentNumber,
          cameraName: target.cameraName,
          type: target.type,
          severity: target.severity,
          summary: target.description,
        },
      ];

      let response = `I've analyzed the operations log. Incident ${target.incidentNumber} (${target.type}) was recorded on ${target.cameraName}. The rule triggered because the subject breached designated parameters. Recommended action: verify physical badge records and maintain camera focus.`;
      if (lower.includes('why') || lower.includes('reason')) {
        response = `Incident ${target.incidentNumber} was flagged because the subject violated the active zone configuration. ${target.aiAnalysis?.whyFlagged || 'Continuous dwell or perimeter threshold exceeded.'}`;
      }

      return { success: true, response, sources } as unknown as T;
    }

    // 5. ANALYTICS ENDPOINTS
    if (url === '/analytics' && method === 'GET') {
      const cameras = this.getCameras();
      const incidents = this.getIncidents();

      const data: AnalyticsData = {
        totalCameras: cameras.length,
        activeCameras: cameras.filter((c) => c.status === 'online').length,
        peopleDetectedNow: 54,
        activeIncidentsCount: incidents.filter((i) => i.status !== 'resolved').length,
        highRiskAlertsCount: incidents.filter((i) => i.severity === 'HIGH' || i.severity === 'CRITICAL').length,
        incidentsOverTime: [
          { date: 'Mon', total: 4, highRisk: 1 },
          { date: 'Tue', total: 6, highRisk: 2 },
          { date: 'Wed', total: 5, highRisk: 1 },
          { date: 'Thu', total: 9, highRisk: 3 },
          { date: 'Fri', total: 7, highRisk: 2 },
          { date: 'Sat', total: 11, highRisk: 4 },
          { date: 'Sun', total: 8, highRisk: 2 },
        ],
        threatDistribution: [
          { severity: 'LOW', count: 4 },
          { severity: 'MEDIUM', count: 6 },
          { severity: 'HIGH', count: 5 },
          { severity: 'CRITICAL', count: 1 },
        ],
        cameraActivity: cameras.map((c) => ({
          cameraId: c.id,
          name: c.name,
          location: c.location,
          detections: c.activeObjectsCount * 12 + 10,
          incidents: c.id === 'CAM-04' ? 3 : c.id === 'CAM-02' ? 2 : 1,
          uptime: 99.4,
        })),
        anomalyTypeBreakdown: [
          { type: 'restricted_zone_entry', label: 'Restricted Zone Breach', count: 5 },
          { type: 'loitering', label: 'Loitering Violations', count: 4 },
          { type: 'abandoned_object', label: 'Unattended Packages', count: 3 },
          { type: 'unusual_crowd', label: 'Unusual Crowd Density', count: 2 },
        ],
        recentIncidents: incidents.slice(0, 5),
        averageResponseTimeMinutes: 2.4,
      };

      return { success: true, analytics: data } as unknown as T;
    }

    // 6. NOTIFICATIONS ENDPOINTS
    if (url.startsWith('/notifications') && method === 'GET') {
      const notifications = this.getNotifications();
      return { success: true, count: notifications.length, notifications } as unknown as T;
    }

    if (url.includes('/read-all') && method === 'POST') {
      const notifs = this.getNotifications().map((n) => ({ ...n, read: true }));
      this.setStorage('vg_notifications', notifs);
      return { success: true } as unknown as T;
    }

    if (url.includes('/read') && method === 'PUT') {
      const id = url.split('/')[2];
      const notifs = this.getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
      this.setStorage('vg_notifications', notifs);
      return { success: true } as unknown as T;
    }

    // 7. DEMO MODE
    if (url === '/demo/status') {
      return { success: true, isRunning: true, mode: 'client-simulation' } as unknown as T;
    }

    if (url === '/demo/start' || url === '/demo/stop') {
      return { success: true, message: 'Simulation toggled', isRunning: url.includes('start') } as unknown as T;
    }

    if (url === '/demo/trigger-incident' && method === 'POST') {
      const newInc: Incident = {
        id: `inc-demo-${Date.now()}`,
        incidentNumber: `VG-${Math.floor(1000 + Math.random() * 9000)}`,
        cameraId: 'CAM-04',
        cameraName: 'Server Room Vault',
        location: 'Sub-Level 2 - Data Center',
        type: 'restricted_zone_entry',
        severity: 'HIGH',
        status: 'new',
        timestamp: new Date().toISOString(),
        duration: 12,
        description: 'Live simulated zone intrusion triggered: Person #27 entered restricted server perimeter.',
        detectedObjects: [
          {
            id: `det-p27-${Date.now()}`,
            trackId: 27,
            class: 'person',
            confidence: 0.96,
            bbox: [0.38, 0.45, 0.55, 0.9],
            firstSeen: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            duration: 12,
            currentZoneId: 'zone-cam4-restricted',
          },
        ],
        evidenceFrames: [
          {
            id: `ev-frame-${Date.now()}`,
            timestamp: new Date().toISOString(),
            imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
            label: 'Instant Perimeter Breach Capture',
            objects: [],
          },
        ],
        aiAnalysis: {
          summary: 'Simulated breach: Unauthenticated perimeter crossing detected in real-time.',
          whatHappened: 'Intrusion simulated at high-density server rack line during operations test.',
          whyFlagged: 'Restricted 24/7 security protocol active on CAM-04.',
          relevantObjects: ['Person #27', 'Server Perimeter Zone'],
          timeline: [{ time: 'NOW', event: 'Live zone boundary breach simulation event dispatched' }],
          possibleExplanation: 'Demonstration scenario executed by security auditor.',
          recommendedSteps: ['Dispatch guard patrol to inspect physical rack.'],
          confidence: 0.98,
          generatedAt: new Date().toISOString(),
          modelUsed: 'gemini-3.8-flash',
        },
        analystNotes: [],
      };

      const current = this.getIncidents();
      this.setStorage('vg_incidents', [newInc, ...current]);

      // Emit event to any active listeners
      try {
        window.dispatchEvent(new CustomEvent('vg:incident:alert', { detail: newInc }));
      } catch (e) {
        // Safe fallback
      }

      return { success: true, message: 'Breach simulated', incident: newInc } as unknown as T;
    }

    // 8. VISION LAB (PyTorch CNN & OpenCV)
    if (url === '/vision/classify' && method === 'POST') {
      const hint = (body.scenarioHint || '').toLowerCase();
      let topClass = 'SECURE_BASELINE';
      let topLabel = 'Secure Facility / Normal Baseline';
      let severity = 'LOW';
      let confidence = 95.4;

      if (hint.includes('vault') || hint.includes('breach') || hint.includes('person') || hint.includes('server')) {
        topClass = 'PERIMETER_BREACH';
        topLabel = 'Perimeter Breach / Unauthorized Person';
        severity = 'HIGH';
        confidence = 94.2;
      } else if (hint.includes('bag') || hint.includes('pack') || hint.includes('abandon') || hint.includes('luggage')) {
        topClass = 'ABANDONED_OBJECT';
        topLabel = 'Unattended Baggage / Suspicious Object';
        severity = 'HIGH';
        confidence = 91.8;
      } else if (hint.includes('crowd') || hint.includes('surge') || hint.includes('parking')) {
        topClass = 'CROWD_SURGE';
        topLabel = 'Crowd Surge / Unusual Gathering';
        severity = 'MEDIUM';
        confidence = 88.5;
      } else if (hint.includes('barrier') || hint.includes('gate') || hint.includes('vehicle')) {
        topClass = 'BARRIER_VIOLATION';
        topLabel = 'Vehicular Barrier / Turnstile Violation';
        severity = 'HIGH';
        confidence = 92.1;
      }

      return {
        success: true,
        model: 'VisionGuard-ResNetThreat-CNN-v2',
        framework: 'PyTorch 2.2 (Neural Inference Engine)',
        topClass,
        topLabel,
        severity,
        confidence,
        inferenceTimeMs: 14.2,
        architecture: '3x (Conv2d + BatchNorm + ReLU + MaxPool2d) -> AdaptiveAvgPool -> Linear(128, 64) -> Linear(64, 5)',
        predictions: [
          {
            classId: 'PERIMETER_BREACH',
            label: 'Perimeter Breach / Unauthorized Person',
            severity: 'HIGH',
            description: 'Human silhouette identified in restricted zone without clearance beacon.',
            probability: topClass === 'PERIMETER_BREACH' ? 0.942 : 0.015,
            isTop: topClass === 'PERIMETER_BREACH',
          },
          {
            classId: 'ABANDONED_OBJECT',
            label: 'Unattended Baggage / Suspicious Object',
            severity: 'HIGH',
            description: 'Stationary baggage or unattended package isolated without owner proximity.',
            probability: topClass === 'ABANDONED_OBJECT' ? 0.918 : 0.021,
            isTop: topClass === 'ABANDONED_OBJECT',
          },
          {
            classId: 'CROWD_SURGE',
            label: 'Crowd Surge / Unusual Gathering',
            severity: 'MEDIUM',
            description: 'Elevated human cluster density exceeding normal egress threshold.',
            probability: topClass === 'CROWD_SURGE' ? 0.885 : 0.025,
            isTop: topClass === 'CROWD_SURGE',
          },
          {
            classId: 'BARRIER_VIOLATION',
            label: 'Vehicular Barrier / Turnstile Violation',
            severity: 'HIGH',
            description: 'Vehicle or individual crossing active perimeter barrier in wrong direction.',
            probability: topClass === 'BARRIER_VIOLATION' ? 0.921 : 0.018,
            isTop: topClass === 'BARRIER_VIOLATION',
          },
          {
            classId: 'SECURE_BASELINE',
            label: 'Secure Facility / Normal Baseline',
            severity: 'LOW',
            description: 'No perimeter violations detected. Standard operational safety conditions.',
            probability: topClass === 'SECURE_BASELINE' ? 0.954 : 0.008,
            isTop: topClass === 'SECURE_BASELINE',
          },
        ],
        featureActivations: [
          { layer: 'Conv2d_Block_1 (Low-level Edges)', channels: 32, meanActivation: 0.78, sparsity: 0.22 },
          { layer: 'Conv2d_Block_2 (Shapes & Textures)', channels: 64, meanActivation: 0.64, sparsity: 0.36 },
          { layer: 'Conv2d_Block_3 (Semantic Threat Primitives)', channels: 128, meanActivation: 0.89, sparsity: 0.11 },
          { layer: 'Global_Avg_Pool (128-D Vector)', channels: 128, meanActivation: 0.92, sparsity: 0.08 },
        ],
        timestamp: new Date().toISOString(),
      } as unknown as T;
    }

    if (url === '/vision/detect-opencv' && method === 'POST') {
      const hint = (body.scenarioHint || '').toLowerCase();
      let objects = [
        {
          id: 'cv-obj-1',
          label: 'person',
          confidence: 0.94,
          bbox: [0.35, 0.42, 0.52, 0.88] as [number, number, number, number],
          centroid: [0.435, 0.65] as [number, number],
          areaPct: 7.82,
          aspectRatio: 0.37,
          contourPoints: 142,
          inRestrictedZone: true,
          status: 'VIOLATION',
        },
        {
          id: 'cv-obj-2',
          label: 'server_rack_boundary',
          confidence: 0.99,
          bbox: [0.15, 0.25, 0.85, 0.85] as [number, number, number, number],
          centroid: [0.5, 0.55] as [number, number],
          areaPct: 42.0,
          aspectRatio: 1.16,
          contourPoints: 4,
          inRestrictedZone: false,
          status: 'MONITORED_PERIMETER',
        },
      ];

      if (hint.includes('bag') || hint.includes('pack') || hint.includes('abandon')) {
        objects = [
          {
            id: 'cv-obj-1',
            label: 'backpack',
            confidence: 0.91,
            bbox: [0.52, 0.65, 0.61, 0.76] as [number, number, number, number],
            centroid: [0.565, 0.705] as [number, number],
            areaPct: 0.99,
            aspectRatio: 0.82,
            contourPoints: 68,
            inRestrictedZone: true,
            status: 'UNATTENDED (>300s)',
          },
          {
            id: 'cv-obj-2',
            label: 'stone_bench',
            confidence: 0.95,
            bbox: [0.35, 0.6, 0.75, 0.82] as [number, number, number, number],
            centroid: [0.55, 0.71] as [number, number],
            areaPct: 8.8,
            aspectRatio: 1.81,
            contourPoints: 84,
            inRestrictedZone: false,
            status: 'STATIONARY_STRUCTURE',
          },
        ];
      } else if (hint.includes('crowd') || hint.includes('surge') || hint.includes('parking')) {
        objects = [
          {
            id: 'cv-obj-1',
            label: 'person',
            confidence: 0.92,
            bbox: [0.15, 0.45, 0.28, 0.85] as [number, number, number, number],
            centroid: [0.215, 0.65] as [number, number],
            areaPct: 5.2,
            aspectRatio: 0.32,
            contourPoints: 112,
            inRestrictedZone: true,
            status: 'LOITERING (>85s)',
          },
          {
            id: 'cv-obj-2',
            label: 'crowd_cluster',
            confidence: 0.87,
            bbox: [0.45, 0.38, 0.78, 0.82] as [number, number, number, number],
            centroid: [0.615, 0.6] as [number, number],
            areaPct: 14.5,
            aspectRatio: 0.75,
            contourPoints: 265,
            inRestrictedZone: false,
            status: 'ELEVATED_DENSITY',
          },
        ];
      }

      return {
        success: true,
        engine: 'OpenCV-SpatialCV-Pipeline',
        openCvVersion: '4.9.0',
        pipeline: [
          '1. cv2.cvtColor(BGR2GRAY) - Monochromatic conversion',
          '2. cv2.GaussianBlur(ksize=(5,5)) - Spatial noise filtering',
          '3. cv2.Canny(50, 150) - Dual-threshold edge gradients',
          '4. cv2.findContours(cv2.RETR_EXTERNAL) - Topological tracking',
          '5. cv2.boundingRect & Spatial Centroids - Geometric region bounding',
        ],
        totalDetected: objects.length,
        inferenceTimeMs: 9.8,
        objects,
        timestamp: new Date().toISOString(),
      } as unknown as T;
    }

    // Default fallback
    return { success: true } as unknown as T;
  }
}

export const mockDataService = new MockDataService();
