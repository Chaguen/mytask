"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TimerSession, ActiveTimer } from '@/types/timer';
import { Todo } from '@/types/todo';
import { TodoPath } from '@/types/todo-tree';
import { generateSessionId, getTodayDateString } from '@/utils/timer-utils';

interface TimerContextType {
  activeTimer: ActiveTimer | null;
  todaySessions: TimerSession[];
  startTimer: (todoId: number, todoText: string, todoPath?: string[]) => void;
  stopTimer: () => void;
  deleteSession: (sessionId: string) => Promise<void>;
  getElapsedTime: () => number;
  getTodoTimeSpent: (todoId: number) => number;
  loadTodaySessions: () => Promise<void>;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [todaySessions, setTodaySessions] = useState<TimerSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Load today's sessions on mount
  useEffect(() => {
    loadTodaySessions();
  }, []);

  const loadTodaySessions = useCallback(async () => {
    try {
      const today = getTodayDateString();
      const response = await fetch(`/api/timer-sessions?date=${today}`);
      if (response.ok) {
        const sessions = await response.json();
        setTodaySessions(sessions);
      }
    } catch (error) {
      console.error('Failed to load timer sessions:', error);
    }
  }, []);

  const startTimer = useCallback(async (todoId: number, todoText: string, todoPath?: string[]) => {
    // Stop any active timer first
    if (activeTimer) {
      await stopTimer();
    }

    const now = new Date().toISOString();
    const sessionId = generateSessionId();
    
    setActiveTimer({
      todoId,
      todoText,
      todoPath,
      startedAt: now,
    });
    setCurrentSessionId(sessionId);

    // Create initial session record
    const newSession: TimerSession = {
      id: sessionId,
      todoId,
      todoText,
      todoPath,
      startedAt: now,
      duration: 0,
      date: getTodayDateString(),
    };

    try {
      await fetch('/api/timer-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession),
      });
      
      setTodaySessions(prev => [newSession, ...prev]);
    } catch (error) {
      console.error('Failed to save timer session:', error);
    }
  }, [activeTimer]);

  const stopTimer = useCallback(async () => {
    if (!activeTimer || !currentSessionId) return;

    const now = new Date().toISOString();
    const duration = new Date(now).getTime() - new Date(activeTimer.startedAt).getTime();

    // Update session with end time and duration
    const updates = {
      endedAt: now,
      duration,
    };

    try {
      await fetch('/api/timer-sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentSessionId, updates }),
      });

      // Update local state
      setTodaySessions(prev => 
        prev.map(s => 
          s.id === currentSessionId 
            ? { ...s, ...updates }
            : s
        )
      );
    } catch (error) {
      console.error('Failed to update timer session:', error);
    }

    setActiveTimer(null);
    setCurrentSessionId(null);
  }, [activeTimer, currentSessionId]);

  const getElapsedTime = useCallback(() => {
    if (!activeTimer) return 0;
    return Date.now() - new Date(activeTimer.startedAt).getTime();
  }, [activeTimer]);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/timer-sessions?id=${sessionId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Update local state
        setTodaySessions(prev => prev.filter(s => s.id !== sessionId));
      }
    } catch (error) {
      console.error('Failed to delete timer session:', error);
    }
  }, []);

  const getTodoTimeSpent = useCallback((todoId: number) => {
    return todaySessions
      .filter(s => s.todoId === todoId && s.duration)
      .reduce((total, s) => total + s.duration, 0);
  }, [todaySessions]);

  return (
    <TimerContext.Provider value={{
      activeTimer,
      todaySessions,
      startTimer,
      stopTimer,
      deleteSession,
      getElapsedTime,
      getTodoTimeSpent,
      loadTodaySessions,
    }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimerContext() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  return context;
}