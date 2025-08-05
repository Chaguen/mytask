import { useRef, useEffect } from 'react';

/**
 * Hook to monitor component render counts in development
 * Helps identify performance issues with excessive re-renders
 */
export function useRenderCount(componentName: string, threshold = 10) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      // Warn if rendering too frequently
      if (timeSinceLastRender < 16) { // Less than 1 frame (60fps)
        console.warn(
          `[Performance] ${componentName} rendered twice within 16ms`,
          { renderCount: renderCount.current, timeSinceLastRender }
        );
      }
      
      // Warn if total render count is high
      if (renderCount.current > threshold && renderCount.current % threshold === 0) {
        console.warn(
          `[Performance] ${componentName} has rendered ${renderCount.current} times`,
          'Consider optimizing with React.memo or useMemo'
        );
      }
    }
    
    lastRenderTime.current = now;
  });

  return renderCount.current;
}