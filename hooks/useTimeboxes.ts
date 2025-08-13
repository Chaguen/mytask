import { useState, useEffect, useCallback, useRef } from 'react';
import { TimeboxItem } from '@/types/timebox';
import { format } from 'date-fns';

export function useTimeboxes() {
  const [timeboxItems, setTimeboxItems] = useState<TimeboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defaultDuration, setDefaultDuration] = useState<number>(30); // Default 30 minutes
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Load timeboxes on mount
  useEffect(() => {
    loadTimeboxes();
  }, []);

  const loadTimeboxes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/timeboxes');
      if (!response.ok) {
        throw new Error('Failed to load timeboxes');
      }
      const data = await response.json();
      setTimeboxItems(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load timeboxes:', err);
      setError('Failed to load timeboxes');
      setTimeboxItems([]);
    } finally {
      setLoading(false);
    }
  };

  const saveTimeboxes = async (items: TimeboxItem[]) => {
    try {
      const response = await fetch('/api/timeboxes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(items),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save timeboxes');
      }
      
      setError(null);
    } catch (err) {
      console.error('Failed to save timeboxes:', err);
      setError('Failed to save timeboxes');
    }
  };

  // Debounced save
  const debouncedSave = useCallback((items: TimeboxItem[]) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveTimeboxes(items);
    }, 500);
  }, []);

  const updateTimeboxItems = useCallback((updater: (prev: TimeboxItem[]) => TimeboxItem[]) => {
    setTimeboxItems(prev => {
      const updated = updater(prev);
      debouncedSave(updated);
      return updated;
    });
  }, [debouncedSave]);

  const addTimeboxItem = useCallback((todoId: number, startTime: string, duration?: number, date?: string) => {
    const newItem: TimeboxItem = {
      id: `${Date.now()}-${Math.random()}`,
      todoId,
      startTime,
      duration: duration || defaultDuration,
      date: date || format(new Date(), 'yyyy-MM-dd')
    };

    updateTimeboxItems(prev => [...prev, newItem]);
    return newItem;
  }, [defaultDuration, updateTimeboxItems]);

  const updateTimeboxItem = useCallback((id: string, updates: Partial<TimeboxItem>) => {
    updateTimeboxItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  }, [updateTimeboxItems]);

  const removeTimeboxItem = useCallback((id: string) => {
    updateTimeboxItems(prev => prev.filter(item => item.id !== id));
  }, [updateTimeboxItems]);

  const moveTimeboxItem = useCallback((id: string, newStartTime: string) => {
    updateTimeboxItem(id, { startTime: newStartTime });
  }, [updateTimeboxItem]);

  const resizeTimeboxItem = useCallback((id: string, newDuration: number) => {
    updateTimeboxItem(id, { duration: newDuration });
  }, [updateTimeboxItem]);

  const getItemsForDate = useCallback((date: string) => {
    return timeboxItems.filter(item => item.date === date);
  }, [timeboxItems]);

  const clearDate = useCallback((date: string) => {
    updateTimeboxItems(prev => prev.filter(item => item.date !== date));
  }, [updateTimeboxItems]);

  return {
    timeboxItems,
    loading,
    error,
    defaultDuration,
    setDefaultDuration,
    addTimeboxItem,
    updateTimeboxItem,
    removeTimeboxItem,
    moveTimeboxItem,
    resizeTimeboxItem,
    getItemsForDate,
    clearDate,
    reloadTimeboxes: loadTimeboxes,
  };
}