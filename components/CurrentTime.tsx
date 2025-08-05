"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatTime } from "@/utils/date-helpers";
import { CheckCircle2 } from "lucide-react";

interface CurrentTimeProps {
  locale?: string;
  todayCompleted?: number;
}

export const CurrentTime = React.memo(function CurrentTime({ locale, todayCompleted = 0 }: CurrentTimeProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="w-full max-w-2xl mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">{formatTime(currentTime, locale)}</div>
            <div className="text-muted-foreground">{formatDate(currentTime, locale)}</div>
          </div>
          {todayCompleted > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <div className="text-sm font-semibold text-green-700 dark:text-green-300">
                  오늘 {todayCompleted}개 완료
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  Great job! 🎉
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});