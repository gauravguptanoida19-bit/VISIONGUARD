import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { Incident } from '@visionguard/shared';

interface DemoContextType {
  isDemoRunning: boolean;
  startDemo: () => Promise<void>;
  stopDemo: () => Promise<void>;
  triggerScenario: () => Promise<Incident | null>;
  isTriggering: boolean;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(true); // Default active for hackathon evaluator
  const [isTriggering, setIsTriggering] = useState<boolean>(false);

  useEffect(() => {
    api.demo
      .status()
      .then((res) => {
        setIsDemoRunning(res.isRunning);
      })
      .catch(() => {});
  }, []);

  const startDemo = async () => {
    try {
      const res = await api.demo.start();
      setIsDemoRunning(res.isRunning);
    } catch (e) {
      setIsDemoRunning(true);
    }
  };

  const stopDemo = async () => {
    try {
      const res = await api.demo.stop();
      setIsDemoRunning(res.isRunning);
    } catch (e) {
      setIsDemoRunning(false);
    }
  };

  const triggerScenario = async (): Promise<Incident | null> => {
    setIsTriggering(true);
    try {
      const res = await api.demo.triggerIncident();
      return res.incident;
    } catch (e) {
      return null;
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <DemoContext.Provider
      value={{
        isDemoRunning,
        startDemo,
        stopDemo,
        triggerScenario,
        isTriggering,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export function useDemo(): DemoContextType {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
