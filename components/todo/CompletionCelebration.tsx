"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompletionCelebrationProps {
  show: boolean;
  onComplete?: () => void;
}

export function CompletionCelebration({ show, onComplete }: CompletionCelebrationProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (show) {
      // Generate random particles
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
      }));
      setParticles(newParticles);

      // Clear particles after animation
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {/* Central burst effect */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="w-32 h-32 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur-xl" />
          </motion.div>

          {/* Success checkmark */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              duration: 0.5 
            }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
              <svg 
                className="w-12 h-12 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <motion.path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                />
              </svg>
            </div>
          </motion.div>

          {/* Confetti particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute top-1/2 left-1/2"
              initial={{ 
                x: 0, 
                y: 0, 
                scale: 0,
                rotate: 0
              }}
              animate={{ 
                x: particle.x * 4, 
                y: particle.y * 4 - 100,
                scale: [0, 1.5, 0],
                rotate: Math.random() * 360
              }}
              transition={{ 
                duration: 1.2,
                ease: "easeOut"
              }}
            >
              <div 
                className={`w-3 h-3 ${
                  Math.random() > 0.5 
                    ? 'bg-yellow-400' 
                    : Math.random() > 0.5 
                      ? 'bg-pink-400' 
                      : 'bg-blue-400'
                } rounded-full`} 
              />
            </motion.div>
          ))}

          {/* Success text */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{ marginTop: '100px' }}
          >
            <p className="text-2xl font-bold text-green-500 drop-shadow-lg whitespace-nowrap">
              완료! 🎉
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}