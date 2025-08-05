import { useCallback, useEffect, useRef } from 'react';
import { useTodoContext } from '@/contexts/TodoContext';

export function useCompletionSound() {
  const { isMuted } = useTodoContext();
  const audioContextRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    // Create audio context on mount
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  const playCompletionSound = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed' || isPlayingRef.current || isMuted) return;

    isPlayingRef.current = true;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // Create multiple oscillators for a rich sound
    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    // Main completion sound - ascending arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, now + index * 0.05);
      
      // Envelope
      gain.gain.setValueAtTime(0, now + index * 0.05);
      gain.gain.linearRampToValueAtTime(0.3, now + index * 0.05 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.05 + 0.5);
      
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      
      oscillator.start(now + index * 0.05);
      oscillator.stop(now + index * 0.05 + 0.5);
      
      oscillators.push(oscillator);
      gains.push(gain);
    });

    // Add a subtle bell-like sound
    const bell = ctx.createOscillator();
    const bellGain = ctx.createGain();
    const bellFilter = ctx.createBiquadFilter();
    
    bell.type = 'triangle';
    bell.frequency.setValueAtTime(2093, now); // C7
    
    bellFilter.type = 'highpass';
    bellFilter.frequency.setValueAtTime(1000, now);
    
    bellGain.gain.setValueAtTime(0.1, now);
    bellGain.gain.exponentialRampToValueAtTime(0.01, now + 1);
    
    bell.connect(bellFilter);
    bellFilter.connect(bellGain);
    bellGain.connect(ctx.destination);
    
    bell.start(now);
    bell.stop(now + 1);

    // Success chord at the end
    setTimeout(() => {
      const chordFreqs = [523.25, 659.25, 783.99]; // C major chord
      chordFreqs.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * 2, ctx.currentTime);
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.8);
      });
    }, 200);

    // Reset playing flag
    setTimeout(() => {
      isPlayingRef.current = false;
    }, 1000);
  }, [isMuted]);

  const playCheckSound = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed' || isMuted) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // Simple click sound
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.1);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    
    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }, [isMuted]);

  return { playCompletionSound, playCheckSound };
}