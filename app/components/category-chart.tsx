
'use client';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface CategoryChartProps {
  data: Record<string, number>;
}

export function CategoryChart({ data }: CategoryChartProps) {
  const chartData = Object.entries(data)
    .map(([category, count]) => ({
      name: category.length > 20 ? category.substring(0, 20) + '...' : category,
      value: count,
      fullName: category
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Show top 8 categories

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No category data available
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
            tick={{ fontSize: 10 }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 10 }}
            tickLine={false}
          />
          <Tooltip 
            formatter={(value: number) => [value, 'Risks']}
            labelFormatter={(label: string) => {
              const item = chartData.find(d => d.name === label);
              return item?.fullName || label;
            }}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '11px'
            }}
          />
          <Bar 
            dataKey="value" 
            fill="#60B5FF"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
