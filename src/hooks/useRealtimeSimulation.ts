import { useState, useEffect } from 'react';

export interface TimeSeriesPoint {
  timestamp: number;
  value: number;
}

export function useRealtimeSimulation(
  baseValue: number,
  variance: number,
  intervalMs: number = 3000,
): number {
  const [value, setValue] = useState(baseValue);

  useEffect(() => {
    const id = setInterval(() => {
      const delta = (Math.random() - 0.5) * variance;
      setValue(prev => Math.max(0, prev + delta));
    }, intervalMs);
    return () => clearInterval(id);
  }, [baseValue, variance, intervalMs]);

  return value;
}

export function useTimeSeriesHistory(
  baseValue: number,
  variance: number,
  maxPoints: number = 20,
  intervalMs: number = 3000,
): TimeSeriesPoint[] {
  const [history, setHistory] = useState<TimeSeriesPoint[]>(() => {
    const now = Date.now();
    return Array.from({ length: maxPoints }, (_, i) => ({
      timestamp: now - (maxPoints - i) * intervalMs,
      value: baseValue + (Math.random() - 0.5) * variance,
    }));
  });

  useEffect(() => {
    const id = setInterval(() => {
      const delta = (Math.random() - 0.5) * variance;
      setHistory(prev => {
        const next = [...prev, { timestamp: Date.now(), value: Math.max(0, prev[prev.length - 1].value + delta) }];
        return next.length > maxPoints ? next.slice(next.length - maxPoints) : next;
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [baseValue, variance, maxPoints, intervalMs]);

  return history;
}
