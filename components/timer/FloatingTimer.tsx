"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pause, X, Minimize2, Maximize2 } from "lucide-react";
import { formatElapsedTime } from "@/utils/timer-utils";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingTimerProps {
  activeTimer: {
    todoId: number;
    todoText: string;
    startedAt: string;
  } | null;
  onStop: () => void;
}

export function FloatingTimer({ activeTimer, onStop }: FloatingTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!activeTimer) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - new Date(activeTimer.startedAt).getTime();
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer]);

  if (!activeTimer) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Card className={`${isMinimized ? 'w-auto' : 'w-80'} bg-background/95 backdrop-blur border-2 border-red-500/50 shadow-lg`}>
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-red-500">타이머 실행 중</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-6 w-6"
                >
                  {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onStop}
                  className="h-6 w-6"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {!isMinimized && (
              <>
                <div className="mb-3">
                  <div className="text-sm text-muted-foreground mb-1">작업 중:</div>
                  <div className="text-sm font-medium truncate">{activeTimer.todoText}</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-mono font-bold">
                    {formatElapsedTime(elapsedTime)}
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={onStop}
                    className="h-8"
                  >
                    <Pause className="h-4 w-4 mr-1" />
                    정지
                  </Button>
                </div>
              </>
            )}
            
            {isMinimized && (
              <div className="text-lg font-mono font-bold">
                {formatElapsedTime(elapsedTime)}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}