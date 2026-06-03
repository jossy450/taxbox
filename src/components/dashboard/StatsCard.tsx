import { useEffect, useState } from 'react';

interface StatsCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  format?: 'number' | 'currency' | 'percent';
  trend?: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
}

function animateValue(target: number, duration: number, setter: (v: number) => void) {
  const start = performance.now();
  function step(now: number) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    setter(Math.round(target * eased));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

export default function StatsCard({ title, value, prefix, suffix, format, trend, icon, color }: StatsCardProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    animateValue(value, 800, setDisplay);
  }, [value]);

  function formattedValue(): string {
    switch (format) {
      case 'currency': return `₦${display.toLocaleString()}`;
      case 'percent': return `${(display / 100).toFixed(2)}%`;
      case 'number':
      default: return display.toLocaleString();
    }
  }

  const trendColors = { up: 'text-emerald-600', down: 'text-red-600', neutral: 'text-gray-400' };
  const trendArrows = { up: '↑', down: '↓', neutral: '→' };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1" style={{ color }}>
            {prefix}{formattedValue()}{suffix}
          </p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
      {trend && (
        <p className={`text-xs mt-2 flex items-center gap-1 ${trendColors[trend]}`}>
          <span>{trendArrows[trend]}</span>
          <span>Live update</span>
        </p>
      )}
    </div>
  );
}
