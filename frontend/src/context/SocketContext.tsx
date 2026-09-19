import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { socketClient } from '../services/socket';
import { Incident, LiveNotification, CameraTelemetry } from '@visionguard/shared';
import { api } from '../services/api';

interface SocketContextType {
  isConnected: boolean;
  notifications: LiveNotification[];
  unreadCount: number;
  activeAlert: Incident | null;
  dismissAlert: () => void;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  latestTelemetry: Record<string, CameraTelemetry>;
  audioEnabled: boolean;
  setAudioEnabled: (val: boolean) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Web Audio API synth beep for zero external assets dependency
function playAlertBeep(severity: string) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = severity === 'CRITICAL' || severity === 'HIGH' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(severity === 'CRITICAL' ? 880 : 587, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(severity === 'CRITICAL' ? 440 : 293, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // AudioContext might be blocked until first user interaction
  }
}

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);
  const [activeAlert, setActiveAlert] = useState<Incident | null>(null);
  const [latestTelemetry, setLatestTelemetry] = useState<Record<string, CameraTelemetry>>({});
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  // Load initial notifications
  useEffect(() => {
    api.notifications
      .list()
      .then((res) => {
        if (res.notifications) setNotifications(res.notifications);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const socket = socketClient.connect();

    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }

    function onIncidentAlert(incident: Incident) {
      console.log('🚨 Received Real-Time Incident Alert:', incident);
      setActiveAlert(incident);
      if (audioEnabled) {
        playAlertBeep(incident.severity);
      }
    }

    function onNewNotification(notification: LiveNotification) {
      setNotifications((prev) => [notification, ...prev]);
    }

    function onTelemetry(telemetry: CameraTelemetry) {
      setLatestTelemetry((prev) => ({
        ...prev,
        [telemetry.cameraId]: telemetry,
      }));
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('incident:alert', onIncidentAlert);
    socket.on('notification:new', onNewNotification);
    socket.on('camera:telemetry', onTelemetry);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('incident:alert', onIncidentAlert);
      socket.off('notification:new', onNewNotification);
      socket.off('camera:telemetry', onTelemetry);
    };
  }, [audioEnabled]);

  const dismissAlert = useCallback(() => {
    setActiveAlert(null);
  }, []);

  const markNotificationRead = async (id: string) => {
    await api.notifications.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = async () => {
    await api.notifications.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        notifications,
        unreadCount,
        activeAlert,
        dismissAlert,
        markNotificationRead,
        markAllNotificationsRead,
        latestTelemetry,
        audioEnabled,
        setAudioEnabled,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export function useSocket(): SocketContextType {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
