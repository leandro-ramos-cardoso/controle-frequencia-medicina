'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { ChartPoint } from '@/lib/queries/reports';

export function SimpleBarChart({ data, color = '#1d4ed8' }: { data: ChartPoint[]; color?: string }) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-400">Sem dados para o período selecionado.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
