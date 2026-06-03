import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#1e3a5f', '#0d9488', '#d97706', '#dc2626', '#7c3aed', '#0891b2']

interface ChartDataPoint {
  name: string
  value: number
  color?: string
}

interface TaxChartProps {
  data: ChartDataPoint[]
}

export default function TaxChart({ data }: TaxChartProps) {
  const colored = data.map((d, i) => ({ ...d, color: COLORS[i % COLORS.length] }))

  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={colored}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {colored.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v: any) => `₦${Number(v).toLocaleString()}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function formatNaira(amount: number): string {
  return `₦${Math.round(amount).toLocaleString()}`
}
