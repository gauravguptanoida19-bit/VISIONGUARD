import {
  Camera,
  Incident,
  AnalyticsData,
  LiveNotification,
  User,
  UserRole,
  CameraZone,
  AIAnalysisReport,
} from '@visionguard/shared';
import { mockDataService } from './mockDataService';

const API_BASE = '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('vg_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Request failed with status ${res.status}`);
      }
      return data;
    }

    // If the response is HTML (e.g., GitHub Pages 404) or non-JSON, delegate to client mock engine
    return await mockDataService.handleRequest<T>(endpoint, options);
  } catch (err: any) {
    // If the error was a real backend rejection with specific business message, keep it
    if (
      err &&
      err.message &&
      !err.message.includes('fetch') &&
      !err.message.includes('JSON') &&
      !err.message.includes('status 404') &&
      !err.message.includes('NetworkError')
    ) {
      throw err;
    }

    // Otherwise, seamlessly fulfill using client-side mock service
    return await mockDataService.handleRequest<T>(endpoint, options);
  }
}

export const api = {
  // AUTH
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ success: boolean; token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData: { name: string; email: string; password: string; role: UserRole }) =>
      request<{ success: boolean; token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    me: () => request<{ success: boolean; user: User }>('/auth/me'),
    listUsers: () => request<{ success: boolean; users: User[] }>('/auth/users'),
    updateRole: (userId: string, role: UserRole) =>
      request<{ success: boolean; user: User }>(`/auth/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      }),
  },

  // CAMERAS
  cameras: {
    list: () => request<{ success: boolean; cameras: Camera[] }>('/cameras'),
    getById: (id: string) => request<{ success: boolean; camera: Camera }>(`/cameras/${id}`),
    create: (camera: Partial<Camera>) =>
      request<{ success: boolean; camera: Camera }>('/cameras', {
        method: 'POST',
        body: JSON.stringify(camera),
      }),
    update: (id: string, camera: Partial<Camera>) =>
      request<{ success: boolean; camera: Camera }>(`/cameras/${id}`, {
        method: 'PUT',
        body: JSON.stringify(camera),
      }),
    delete: (id: string) => request<{ success: boolean; message: string }>(`/cameras/${id}`, { method: 'DELETE' }),
    updateZones: (id: string, zones: CameraZone[]) =>
      request<{ success: boolean; camera: Camera }>(`/cameras/${id}/zones`, {
        method: 'PUT',
        body: JSON.stringify({ zones }),
      }),
    getTelemetry: (id: string) => request<{ success: boolean; telemetry: any }>(`/cameras/${id}/telemetry`),
  },

  // INCIDENTS
  incidents: {
    list: (params?: { severity?: string; status?: string; cameraId?: string; type?: string; search?: string }) => {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      return request<{ success: boolean; count: number; incidents: Incident[] }>(`/incidents${query ? `?${query}` : ''}`);
    },
    getById: (id: string) => request<{ success: boolean; incident: Incident }>(`/incidents/${id}`),
    updateStatus: (id: string, status: string, note?: string) =>
      request<{ success: boolean; incident: Incident }>(`/incidents/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, note }),
      }),
    addNote: (id: string, note: string) =>
      request<{ success: boolean; incident: Incident }>(`/incidents/${id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ note }),
      }),
    analyze: (id: string) =>
      request<{ success: boolean; aiAnalysis: AIAnalysisReport; incident: Incident }>(`/incidents/${id}/analyze`, {
        method: 'POST',
      }),
  },

  // AI & COPILOT
  ai: {
    analyze: (data: { incidentId?: string; incidentData?: any }) =>
      request<{ success: boolean; analysis: AIAnalysisReport }>('/ai/analyze', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    search: (query: string) =>
      request<{ success: boolean; answer: string; sources: any[]; query: string }>('/ai/search', {
        method: 'POST',
        body: JSON.stringify({ query }),
      }),
    copilot: (message: string, conversationHistory?: any[]) =>
      request<{ success: boolean; response: string; sources: any[] }>('/ai/copilot', {
        method: 'POST',
        body: JSON.stringify({ message, conversationHistory }),
      }),
  },

  // ANALYTICS
  analytics: {
    getSummary: () => request<{ success: boolean; analytics: AnalyticsData }>('/analytics'),
    getAuditLogs: () => request<{ success: boolean; count: number; logs: any[] }>('/analytics/audit-logs'),
  },

  // NOTIFICATIONS
  notifications: {
    list: (unreadOnly = false) =>
      request<{ success: boolean; count: number; notifications: LiveNotification[] }>(
        `/notifications?unreadOnly=${unreadOnly}`
      ),
    markRead: (id: string) => request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: () => request<{ success: boolean }>('/notifications/read-all', { method: 'POST' }),
  },

  // DEMO MODE
  demo: {
    status: () => request<{ success: boolean; isRunning: boolean; mode: string }>('/demo/status'),
    start: () => request<{ success: boolean; message: string; isRunning: boolean }>('/demo/start', { method: 'POST' }),
    stop: () => request<{ success: boolean; message: string; isRunning: boolean }>('/demo/stop', { method: 'POST' }),
    triggerIncident: () =>
      request<{ success: boolean; message: string; incident: Incident }>('/demo/trigger-incident', { method: 'POST' }),
  },
};
