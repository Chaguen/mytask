"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Clock, TrendingUp, BarChart3, Trash2, Check } from "lucide-react";
import { TimerSession } from "@/types/timer";
import { formatDuration, formatElapsedTime, getTodayDateString } from "@/utils/timer-utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { useTimerContext } from "@/contexts/TimerContext";

interface TimerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: TimerSession[];
  activeTimer: {
    todoId: number;
    todoText: string;
    startedAt: string;
  } | null;
}

export function TimerSidebar({ isOpen, onClose, sessions, activeTimer }: TimerSidebarProps) {
  const { deleteSession } = useTimerContext();
  const [totalTime, setTotalTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Calculate total time including active timer
    let total = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    
    if (activeTimer) {
      const activeElapsed = Date.now() - new Date(activeTimer.startedAt).getTime();
      total += activeElapsed;
    }
    
    setTotalTime(total);
  }, [sessions, activeTimer, currentTime]);

  // Group sessions by todo
  const todoStats = sessions.reduce((acc, session) => {
    const key = session.todoId;
    if (!acc[key]) {
      acc[key] = {
        todoText: session.todoText,
        totalDuration: 0,
        sessionCount: 0,
        lastSession: session.startedAt,
      };
    }
    acc[key].totalDuration += session.duration || 0;
    acc[key].sessionCount += 1;
    if (session.startedAt > acc[key].lastSession) {
      acc[key].lastSession = session.startedAt;
    }
    return acc;
  }, {} as Record<number, { todoText: string; totalDuration: number; sessionCount: number; lastSession: string }>);

  // Add active timer to stats
  if (activeTimer) {
    const key = activeTimer.todoId;
    const activeElapsed = Date.now() - new Date(activeTimer.startedAt).getTime();
    if (!todoStats[key]) {
      todoStats[key] = {
        todoText: activeTimer.todoText,
        totalDuration: activeElapsed,
        sessionCount: 1,
        lastSession: activeTimer.startedAt,
      };
    } else {
      todoStats[key].totalDuration += activeElapsed;
    }
  }

  // Sort by total duration
  const sortedTodos = Object.entries(todoStats)
    .sort(([, a], [, b]) => b.totalDuration - a.totalDuration)
    .slice(0, 5);

  const timelineData = sessions.map(session => ({
    todoId: session.todoId,
    todoText: session.todoText,
    startHour: new Date(session.startedAt).getHours() + new Date(session.startedAt).getMinutes() / 60,
    duration: (session.duration || 0) / (1000 * 60 * 60), // Convert to hours
    isActive: false,
  }));

  if (activeTimer) {
    const startTime = new Date(activeTimer.startedAt);
    const duration = (Date.now() - startTime.getTime()) / (1000 * 60 * 60);
    timelineData.push({
      todoId: activeTimer.todoId,
      todoText: activeTimer.todoText,
      startHour: startTime.getHours() + startTime.getMinutes() / 60,
      duration,
      isActive: true,
    });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-xl z-40"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <h2 className="text-lg font-semibold">타이머 통계</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Today's Summary */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">오늘 총 작업 시간</span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-3xl font-bold">{formatElapsedTime(totalTime)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {sessions.length + (activeTimer ? 1 : 0)}개 세션
                </div>
              </Card>

              {/* Top Tasks */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  작업별 시간
                </h3>
                <div className="space-y-2">
                  {sortedTodos.map(([todoId, stats]) => (
                    <Card key={todoId} className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {stats.todoText}
                            {activeTimer?.todoId === Number(todoId) && (
                              <span className="ml-2 text-xs text-red-500">● 실행 중</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {stats.sessionCount}개 세션
                          </div>
                        </div>
                        <div className="text-sm font-semibold">
                          {formatDuration(stats.totalDuration)}
                        </div>
                      </div>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${(stats.totalDuration / totalTime) * 100}%` }}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">작업 시간 분포</h3>
                <Card className="p-3">
                  {timelineData.length > 0 ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <div className="h-12 bg-muted/30 rounded relative overflow-hidden">
                          {[6, 12, 18].map(hour => (
                            <div
                              key={hour}
                              className="absolute top-0 bottom-0 w-px bg-border"
                              style={{ left: `${(hour / 24) * 100}%` }}
                            />
                          ))}
                          
                          {timelineData.map((session, idx) => {
                            const left = (session.startHour / 24) * 100;
                            const width = (session.duration / 24) * 100;
                            
                            return (
                              <div
                                key={idx}
                                className={`absolute top-2 bottom-2 ${
                                  session.isActive ? 'bg-green-500 animate-pulse' : 'bg-green-500'
                                } rounded-sm`}
                                style={{
                                  left: `${left}%`,
                                  width: `${Math.max(0.5, width)}%`,
                                }}
                                title={`${session.todoText} (${formatDuration(session.duration * 60 * 60 * 1000)})`}
                              />
                            );
                          })}
                        </div>
                        
                        <div className="flex justify-between mt-1">
                          <span className="text-[10px] text-muted-foreground">0시</span>
                          <span className="text-[10px] text-muted-foreground">6시</span>
                          <span className="text-[10px] text-muted-foreground">12시</span>
                          <span className="text-[10px] text-muted-foreground">18시</span>
                          <span className="text-[10px] text-muted-foreground">24시</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>세션: {timelineData.length}개</span>
                        <span>총 {Math.floor(totalTime / (1000 * 60 * 60))}시간 {Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60))}분</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      아직 기록된 작업이 없습니다
                    </div>
                  )}
                </Card>
              </div>

              {/* Recent Sessions */}
              <div>
                <h3 className="text-sm font-medium mb-3">최근 세션</h3>
                <div className="space-y-2">
                  {sessions.slice(0, 10).map((session) => (
                    <Card key={session.id} className="p-3 group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate">{session.todoText}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {format(new Date(session.startedAt), 'HH:mm', { locale: ko })}
                            {session.endedAt && (
                              <> - {format(new Date(session.endedAt), 'HH:mm', { locale: ko })}</>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="text-sm font-medium">
                            {formatDuration(session.duration || 0)}
                          </div>
                          {confirmDelete === session.id ? (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-6 w-6"
                                onClick={async () => {
                                  await deleteSession(session.id);
                                  setConfirmDelete(null);
                                }}
                                title="삭제 확인"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => setConfirmDelete(null)}
                                title="취소"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setConfirmDelete(session.id)}
                              title="세션 삭제"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}