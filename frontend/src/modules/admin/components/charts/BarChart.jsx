import React from 'react';
import { 
  BarChart as RechartBar, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

export const BarChart = ({ data, dataKey, color = "#e4e4e7" }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartBar data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-admin)" strokeOpacity={0.5} />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: 'var(--color-text-muted-admin)', fontSize: 10, fontWeight: 'bold' }}
          dy={10}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: 'var(--color-text-muted-admin)', fontSize: 10, fontWeight: 'bold' }}
        />
        <Tooltip 
          cursor={{ fill: 'rgba(161, 161, 170, 0.1)' }}
          contentStyle={{ 
            backgroundColor: 'var(--color-surface-admin)', 
            border: '1px solid var(--color-border-admin)', 
            borderRadius: '8px',
            fontSize: '10px',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}
          itemStyle={{ color: 'var(--color-text-admin)' }}
        />
        <Bar 
          dataKey={dataKey} 
          fill={color} 
          radius={[6, 6, 0, 0]} 
          barSize={20}
          animationDuration={1500}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? color : `${color}dd`} />
          ))}
        </Bar>
      </RechartBar>
    </ResponsiveContainer>
  );
};
