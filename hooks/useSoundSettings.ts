import { useState, useEffect, useCallback } from 'react';

export function useSoundSettings() {
  const [isMuted, setIsMuted] = useState(false);

  // Load mute setting from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('soundMuted');
    if (saved !== null) {
      setIsMuted(JSON.parse(saved));
    }
  }, []);

  // Save mute setting to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundMuted', JSON.stringify(isMuted));
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return {
    isMuted,
    toggleMute,
  };
}