'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export type TopPrediction = { disease: string; probability: number }

export function ProbabilityBarChart({ data }: { data: TopPrediction[] }) {
  const items = [...data].reverse()
  return (
    <div className="w-full h-80">
      <ResponsiveContainer>
        <BarChart layout="vertical" data={items} margin={{ left: 24, right: 18, top: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
          <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
          <YAxis type="category" dataKey="disease" width={160} />
          <Tooltip
            formatter={(v: unknown) => {
              const n = typeof v === 'number' ? v : Number(v ?? 0)
              return `${(n * 100).toFixed(2)}%`
            }}
          />
          <Bar
            dataKey="probability"
            fill="#4b7bea"
            radius={[6, 6, 6, 6]}
            animationBegin={0}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
