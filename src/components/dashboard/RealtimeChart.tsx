import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TimeSeriesPoint } from '../../hooks/useRealtimeSimulation';

interface RealtimeChartProps {
  data: TimeSeriesPoint[];
  title: string;
  color?: string;
  format?: 'currency' | 'number';
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
}

export default function RealtimeChart({ data, title, color = '#1e3a5f', format = 'currency' }: RealtimeChartProps) {
  const chartData = data.map(d => ({ time: formatTime(d.timestamp), value: Math.round(d.value) }));

  const formatter = (v: number) =>
    format === 'currency' ? `₦${v.toLocaleString()}` : v.toLocaleString();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <span className="flex items-center gap-1.5 text-xs text-emerald-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          LIVE
        </span>
      </div>
      <div className="h-64 w-full" style={{ minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#9ca3af" interval="preserveStartEnd" />
            <YAxis tickFormatter={formatter} tick={{ fontSize: 11 }} stroke="#9ca3af" width={90} />
            <Tooltip formatter={(v: any) => [formatter(v), title]} labelStyle={{ fontSize: 12 }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={`url(#gradient-${color.replace('#', '')})`}
              strokeWidth={2}
              dot={false}
              animationDuration={300}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
