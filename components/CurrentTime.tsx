"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatTime } from "@/utils/date-helpers";

interface CurrentTimeProps {
  locale?: string;
}

export const CurrentTime = React.memo(function CurrentTime({ locale }: CurrentTimeProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="w-full max-w-2xl mb-6">
      <CardContent className="pt-6 text-center">
        <div className="text-2xl font-bold mb-2">{formatTime(currentTime, locale)}</div>
        <div className="text-muted-foreground">{formatDate(currentTime, locale)}</div>
      </CardContent>
    </Card>
  );
});