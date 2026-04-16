import React from 'react';
import { 
  LineChart as RechartLine, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

export const LineChart = ({ data, dataKey, color = "#52525b" }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
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
        <Area 
          type="monotone" 
          dataKey={dataKey} 
          stroke={color} 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorLeads)" 
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
